/**
 * Location-Based Agent Discovery
 * Integrates Google Maps with AgentRegistry for local commerce
 * Enables worldwide agent-to-business discovery with distance weighting
 */
import { Agent, AgentRegistry } from './agent-registry';
interface LocalAgent extends Agent {
    distance: number;
    latitude: number;
    longitude: number;
}
interface LocalServiceRequest {
    serviceType: string;
    latitude: number;
    longitude: number;
    radiusKm: number;
    minRating?: number;
    budget?: number;
    urgency?: 'low' | 'medium' | 'high';
    maxWaitTime?: number;
}
interface LocalServiceMatch {
    agent: LocalAgent;
    matchScore: number;
    scoreBreakdown: {
        reputation: number;
        price: number;
        distance: number;
        availability: number;
    };
    estimatedCost: number;
    estimatedTime: number;
    reasoning: string;
}
export declare class LocationDiscoveryService {
    private mapsService;
    private agentRegistry;
    private readonly GOOGLE_MAPS_API_KEY;
    constructor(googleMapsApiKey: string, agentRegistry: AgentRegistry);
    /**
     * Discover local agents by service type and geographic location
     * Returns agents within radius, sorted by match score
     */
    discoverLocalAgents(request: LocalServiceRequest): Promise<LocalServiceMatch[]>;
    /**
     * Find nearby businesses and match with registered agents
     * Useful for "find a mechanic near me" type queries
     */
    findNearbyAgentsAsBusinesses(request: LocalServiceRequest): Promise<LocalServiceMatch[]>;
    /**
     * Get optimal route for agent to serve multiple locations
     * Useful for fleet management or multi-stop service
     */
    optimizeServiceRoute(agentLocation: {
        lat: number;
        lng: number;
    }, customerLocations: {
        lat: number;
        lng: number;
    }[]): Promise<{
        route: {
            lat: number;
            lng: number;
        }[];
        totalDistance: number;
        totalDuration: number;
        costEstimate: number;
    }>;
    /**
     * Get directions from agent to customer
     */
    getDirections(from: {
        lat: number;
        lng: number;
    }, to: {
        lat: number;
        lng: number;
    }): Promise<{
        distance: number;
        duration: number;
        directions: string;
    }>;
    /**
     * Validate agent is available in area
     */
    validateAgentAvailability(agentId: string, latitude: number, longitude: number, radiusKm: number): Promise<boolean>;
    private _filterByLocation;
    private _scoreAgents;
    private _matchBusinessesToAgents;
    private _calculateMatchScore;
    private _getScoreBreakdown;
    private _estimateServiceCost;
    private _estimateServiceTime;
    private _generateReasoning;
    private _haversineDistance;
    private _priceToGoogleLevel;
}
export { LocalServiceRequest, LocalServiceMatch, LocalAgent };
