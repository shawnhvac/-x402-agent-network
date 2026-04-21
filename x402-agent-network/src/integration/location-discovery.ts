/**
 * Location-Based Agent Discovery
 * Integrates Google Maps with AgentRegistry for local commerce
 * Enables worldwide agent-to-business discovery with distance weighting
 */

import GoogleMapsService, { Business } from '../services/google-maps-service';
import { Agent, AgentRegistry } from './agent-registry';

interface LocalAgent extends Agent {
  distance: number; // km from query location
  latitude: number;
  longitude: number;
}

interface LocalServiceRequest {
  serviceType: string; // 'mechanic', 'plumber', etc.
  latitude: number;
  longitude: number;
  radiusKm: number;
  minRating?: number;
  budget?: number;
  urgency?: 'low' | 'medium' | 'high'; // Affects time weighting
  maxWaitTime?: number; // hours
}

interface LocalServiceMatch {
  agent: LocalAgent;
  matchScore: number; // 0-100
  scoreBreakdown: {
    reputation: number; // 40%
    price: number; // 35%
    distance: number; // 15%
    availability: number; // 10%
  };
  estimatedCost: number;
  estimatedTime: number; // minutes
  reasoning: string;
}

export class LocationDiscoveryService {
  private mapsService: GoogleMapsService;
  private agentRegistry: AgentRegistry;
  private readonly GOOGLE_MAPS_API_KEY: string;

  constructor(googleMapsApiKey: string, agentRegistry: AgentRegistry) {
    this.GOOGLE_MAPS_API_KEY = googleMapsApiKey;
    this.agentRegistry = agentRegistry;
    this.mapsService = new GoogleMapsService(googleMapsApiKey);
  }

  /**
   * Discover local agents by service type and geographic location
   * Returns agents within radius, sorted by match score
   */
  async discoverLocalAgents(
    request: LocalServiceRequest
  ): Promise<LocalServiceMatch[]> {
    try {
      // Step 1: Query AgentRegistry for agents offering this service
      const registryAgents = await this.agentRegistry.findByService(request.serviceType);
      
      if (!registryAgents || registryAgents.length === 0) {
        console.log(`No agents found for service: ${request.serviceType}`);
        return [];
      }

      // Step 2: Filter agents by location (using cached coordinates or Google Maps lookup)
      const localAgents = await this._filterByLocation(
        registryAgents,
        { lat: request.latitude, lng: request.longitude },
        request.radiusKm
      );

      if (localAgents.length === 0) {
        console.log(`No agents within ${request.radiusKm}km`);
        return [];
      }

      // Step 3: Score agents based on comprehensive criteria
      const matches = await this._scoreAgents(localAgents, request);

      // Step 4: Sort by match score (highest first)
      matches.sort((a, b) => b.matchScore - a.matchScore);

      return matches;
    } catch (error) {
      console.error('Error discovering local agents:', error);
      throw error;
    }
  }

  /**
   * Find nearby businesses and match with registered agents
   * Useful for "find a mechanic near me" type queries
   */
  async findNearbyAgentsAsBusinesses(
    request: LocalServiceRequest
  ): Promise<LocalServiceMatch[]> {
    try {
      // Step 1: Query Google Maps for businesses in area
      const businesses = await this.mapsService.findNearbyBusinesses({
        latitude: request.latitude,
        longitude: request.longitude,
        radius: request.radiusKm,
        businessType: request.serviceType,
        minRating: request.minRating,
        maxPrice: request.budget ? this._priceToGoogleLevel(request.budget) : undefined
      });

      if (!businesses || businesses.length === 0) {
        console.log(`No businesses found for service: ${request.serviceType}`);
        return [];
      }

      // Step 2: Try to match businesses with registered agents
      const matches = await this._matchBusinessesToAgents(
        businesses,
        request
      );

      // Step 3: Score matches
      const scored = matches.map(m => ({
        ...m,
        matchScore: this._calculateMatchScore(m, request),
        scoreBreakdown: this._getScoreBreakdown(m, request)
      }));

      // Sort by score
      scored.sort((a, b) => b.matchScore - a.matchScore);

      return scored;
    } catch (error) {
      console.error('Error finding nearby agents:', error);
      throw error;
    }
  }

  /**
   * Get optimal route for agent to serve multiple locations
   * Useful for fleet management or multi-stop service
   */
  async optimizeServiceRoute(
    agentLocation: { lat: number; lng: number },
    customerLocations: { lat: number; lng: number }[]
  ): Promise<{
    route: { lat: number; lng: number }[];
    totalDistance: number;
    totalDuration: number;
    costEstimate: number;
  }> {
    try {
      // Create business objects for route optimization
      const waypoints: Business[] = [
        {
          id: 'agent_start',
          name: 'Agent Start Location',
          latitude: agentLocation.lat,
          longitude: agentLocation.lng,
          address: 'Start',
          businessType: 'agent'
        },
        ...customerLocations.map((loc, i) => ({
          id: `customer_${i}`,
          name: `Customer ${i + 1}`,
          latitude: loc.lat,
          longitude: loc.lng,
          address: `Customer ${i + 1}`,
          businessType: 'customer'
        }))
      ];

      const optimized = await this.mapsService.optimizeRoute(waypoints);

      return {
        route: waypoints.map(w => ({ lat: w.latitude, lng: w.longitude })),
        totalDistance: optimized.totalDistance,
        totalDuration: optimized.totalDuration,
        costEstimate: optimized.estimatedCost
      };
    } catch (error) {
      console.error('Error optimizing route:', error);
      throw error;
    }
  }

  /**
   * Get directions from agent to customer
   */
  async getDirections(
    from: { lat: number; lng: number },
    to: { lat: number; lng: number }
  ): Promise<{
    distance: number;
    duration: number;
    directions: string;
  }> {
    try {
      const result = await this.mapsService.calculateDistance(from, to);
      
      return {
        distance: result.distanceKm,
        duration: result.durationMinutes,
        directions: `${result.distanceKm.toFixed(1)}km away, approximately ${result.durationMinutes} minutes`
      };
    } catch (error) {
      console.error('Error getting directions:', error);
      throw error;
    }
  }

  /**
   * Validate agent is available in area
   */
  async validateAgentAvailability(
    agentId: string,
    latitude: number,
    longitude: number,
    radiusKm: number
  ): Promise<boolean> {
    try {
      const agent = await this.agentRegistry.getAgent(agentId);
      
      if (!agent || !('latitude' in agent) || !('longitude' in agent)) {
        return false;
      }

      const agentLat = (agent as any).latitude;
      const agentLng = (agent as any).longitude;

      const distance = this._haversineDistance(
        latitude,
        longitude,
        agentLat,
        agentLng
      );

      return distance <= radiusKm;
    } catch (error) {
      console.error('Error validating agent availability:', error);
      return false;
    }
  }

  // ===== PRIVATE HELPER METHODS =====

  private async _filterByLocation(
    agents: Agent[],
    queryLocation: { lat: number; lng: number },
    radiusKm: number
  ): Promise<LocalAgent[]> {
    const filtered: LocalAgent[] = [];

    for (const agent of agents) {
      // Try to get agent coordinates from registry
      const agentDetails = await this.agentRegistry.getAgent(agent.id);
      
      if (agentDetails && 'latitude' in agentDetails && 'longitude' in agentDetails) {
        const agentLat = (agentDetails as any).latitude;
        const agentLng = (agentDetails as any).longitude;

        const distance = this._haversineDistance(
          queryLocation.lat,
          queryLocation.lng,
          agentLat,
          agentLng
        );

        if (distance <= radiusKm) {
          filtered.push({
            ...agent,
            distance,
            latitude: agentLat,
            longitude: agentLng
          });
        }
      }
    }

    return filtered;
  }

  private async _scoreAgents(
    agents: LocalAgent[],
    request: LocalServiceRequest
  ): Promise<LocalServiceMatch[]> {
    return agents.map(agent => {
      const matchScore = this._calculateMatchScore(agent, request);
      const scoreBreakdown = this._getScoreBreakdown(agent, request);

      return {
        agent,
        matchScore,
        scoreBreakdown,
        estimatedCost: this._estimateServiceCost(agent.distance),
        estimatedTime: this._estimateServiceTime(agent.distance, request.urgency),
        reasoning: this._generateReasoning(agent, scoreBreakdown)
      };
    });
  }

  private async _matchBusinessesToAgents(
    businesses: Business[],
    request: LocalServiceRequest
  ): Promise<LocalServiceMatch[]> {
    const matches: LocalServiceMatch[] = [];

    // First try to find registered agents matching these businesses
    const registeredAgents = await this.agentRegistry.findByService(request.serviceType);

    for (const business of businesses) {
      // Check if this business is a registered agent
      const matchingAgent = registeredAgents?.find(
        a => (a as any).businessId === business.id || (a as any).name === business.name
      );

      if (matchingAgent) {
        const localAgent: LocalAgent = {
          ...matchingAgent,
          distance: business.distance || 0,
          latitude: business.latitude,
          longitude: business.longitude
        };

        const matchScore = this._calculateMatchScore(localAgent, request);
        const scoreBreakdown = this._getScoreBreakdown(localAgent, request);

        matches.push({
          agent: localAgent,
          matchScore,
          scoreBreakdown,
          estimatedCost: business.priceLevel ? business.priceLevel * 100 : 150, // Rough estimate
          estimatedTime: Math.ceil((business.distance || 0) / 50 * 60), // Assume 50km/h
          reasoning: `Business match: ${business.name} (${business.rating}★, ${business.reviewCount} reviews)`
        });
      } else {
        // Create temporary agent entry for unregistered business
        const tempAgent: LocalAgent = {
          id: `business_${business.id}`,
          name: business.name,
          reputation: Math.floor((business.rating || 3.5) * 20), // Convert to 0-100 scale
          totalTransactions: business.reviewCount || 0,
          successRate: (business.rating || 3.5) / 5,
          distance: business.distance || 0,
          latitude: business.latitude,
          longitude: business.longitude
        };

        const matchScore = this._calculateMatchScore(tempAgent, request);
        const scoreBreakdown = this._getScoreBreakdown(tempAgent, request);

        matches.push({
          agent: tempAgent,
          matchScore,
          scoreBreakdown,
          estimatedCost: business.priceLevel ? business.priceLevel * 100 : 150,
          estimatedTime: Math.ceil((business.distance || 0) / 50 * 60),
          reasoning: `Google Maps business: ${business.name} (${business.rating}★)`
        });
      }
    }

    return matches;
  }

  private _calculateMatchScore(
    agent: LocalAgent,
    request: LocalServiceRequest
  ): number {
    const scoreBreakdown = this._getScoreBreakdown(agent, request);

    return (
      (scoreBreakdown.reputation * 0.40) +
      (scoreBreakdown.price * 0.35) +
      (scoreBreakdown.distance * 0.15) +
      (scoreBreakdown.availability * 0.10)
    );
  }

  private _getScoreBreakdown(
    agent: LocalAgent,
    request: LocalServiceRequest
  ): {
    reputation: number;
    price: number;
    distance: number;
    availability: number;
  } {
    // Reputation (0-100): Higher is better
    const reputationScore = Math.min(100, agent.reputation);

    // Price (0-100): Normalize by budget if provided
    const priceScore = request.budget
      ? Math.max(0, 100 - ((agent.reputation * 50 / 100) - (request.budget / 10)))
      : 75; // Default neutral score

    // Distance (0-100): Closer is better (decay with distance)
    const maxDistance = request.radiusKm;
    const distanceScore = Math.max(0, 100 - ((agent.distance / maxDistance) * 100));

    // Availability (0-100): Based on urgency
    const availabilityScore = request.urgency === 'high' ? 80 : 90; // Can improve with real availability data

    return {
      reputation: reputationScore,
      price: priceScore,
      distance: distanceScore,
      availability: availabilityScore
    };
  }

  private _estimateServiceCost(distanceKm: number): number {
    // Base estimate: $50 + $0.50/km travel cost
    return Math.round(50 + (distanceKm * 0.50));
  }

  private _estimateServiceTime(distanceKm: number, urgency?: string): number {
    // Base: 30 min + 1.2 min per km (assume 50km/h)
    const travelTime = Math.ceil(distanceKm / 50 * 60);
    const serviceTime = 30;

    if (urgency === 'high') {
      return Math.ceil((travelTime + serviceTime) * 0.8); // 20% faster
    }

    return travelTime + serviceTime;
  }

  private _generateReasoning(agent: LocalAgent, scores: any): string {
    const reasons: string[] = [];

    if (scores.reputation > 80) reasons.push('Highly rated');
    if (scores.distance > 80) reasons.push('Very close');
    if (scores.price > 80) reasons.push('Good value');
    if (agent.successRate > 0.95) reasons.push('Excellent track record');

    return reasons.length > 0
      ? reasons.join(', ')
      : 'Good fit for your service request';
  }

  private _haversineDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private _priceToGoogleLevel(budget: number): number {
    // Convert budget to Google price level (1-4)
    if (budget < 50) return 1;
    if (budget < 100) return 2;
    if (budget < 200) return 3;
    return 4;
  }
}

export { LocalServiceRequest, LocalServiceMatch, LocalAgent };
