/**
 * Google Maps Location Service
 * Provides worldwide location discovery for agents
 * Integrates with AgentRegistry for autonomous local commerce
 */

import axios, { AxiosInstance } from 'axios';
import NodeCache from 'node-cache';

interface Business {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  rating?: number;
  reviewCount?: number;
  businessType: string;
  isOpen?: boolean;
  phoneNumber?: string;
  website?: string;
  priceLevel?: number; // 1-4 scale
  distance?: number; // in km from query location
  hours?: {
    open: string;
    close: string;
    day: string;
  }[];
}

interface LocationQuery {
  latitude: number;
  longitude: number;
  radius: number; // in km
  businessType: string;
  minRating?: number;
  maxPrice?: number;
  openNow?: boolean;
}

interface DistanceResult {
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  distanceKm: number;
  durationMinutes: number;
}

interface RouteOptimization {
  waypoints: Business[];
  totalDistance: number;
  totalDuration: number;
  optimizedRoute: string[];
  estimatedCost: number;
}

export class GoogleMapsService {
  private apiKey: string;
  private client: AxiosInstance;
  private cache: NodeCache;
  private readonly CACHE_TTL = 3600; // 1 hour
  private readonly GOOGLE_MAPS_API = 'https://maps.googleapis.com/maps/api';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Google Maps API key required');
    }

    this.apiKey = apiKey;
    this.client = axios.create({
      timeout: 5000,
      headers: {
        'User-Agent': 'AgentPay/1.0'
      }
    });

    // Initialize cache with 1-hour TTL
    this.cache = new NodeCache({ stdTTL: this.CACHE_TTL, checkperiod: 600 });
  }

  /**
   * Find nearby businesses using Google Maps Places API
   * Worldwide coverage, real-time ratings + hours
   */
  async findNearbyBusinesses(query: LocationQuery): Promise<Business[]> {
    const cacheKey = this._getCacheKey('nearby', query);
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached as Business[];
    }

    try {
      // Convert business type to Google Places type
      const placeType = this._mapBusinessTypeToPlacesType(query.businessType);

      // Query Google Maps Places API
      const response = await this.client.get(
        `${this.GOOGLE_MAPS_API}/place/nearbysearch/json`,
        {
          params: {
            location: `${query.latitude},${query.longitude}`,
            radius: query.radius * 1000, // Convert km to meters
            type: placeType,
            key: this.apiKey,
            opennow: query.openNow || false
          }
        }
      );

      if (response.data.status !== 'OK') {
        console.error(`Google Maps API error: ${response.data.status}`);
        return [];
      }

      // Transform results
      let businesses = response.data.results.map((place: any) => ({
        id: place.place_id,
        name: place.name,
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        address: place.vicinity,
        rating: place.rating,
        reviewCount: place.user_ratings_total,
        businessType: query.businessType,
        isOpen: place.opening_hours?.open_now,
        priceLevel: place.price_level || undefined,
        distance: this._calculateDistance(
          query.latitude,
          query.longitude,
          place.geometry.location.lat,
          place.geometry.location.lng
        )
      }));

      // Apply filters
      if (query.minRating) {
        businesses = businesses.filter(b => (b.rating || 0) >= query.minRating!);
      }
      if (query.maxPrice) {
        businesses = businesses.filter(b => (b.priceLevel || 1) <= query.maxPrice!);
      }

      // Sort by distance
      businesses = businesses.sort((a, b) => (a.distance || 0) - (b.distance || 0));

      // Cache results
      this.cache.set(cacheKey, businesses);

      return businesses;
    } catch (error) {
      console.error('Error finding nearby businesses:', error);
      throw error;
    }
  }

  /**
   * Get detailed information for a specific business
   */
  async getBusinessDetails(placeId: string): Promise<Business | null> {
    const cacheKey = this._getCacheKey('details', { placeId });
    
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached as Business;
    }

    try {
      const response = await this.client.get(
        `${this.GOOGLE_MAPS_API}/place/details/json`,
        {
          params: {
            place_id: placeId,
            fields: 'name,geometry,formatted_address,rating,user_ratings_total,opening_hours,formatted_phone_number,website,price_level,photos',
            key: this.apiKey
          }
        }
      );

      if (response.data.status !== 'OK') {
        console.error(`Google Maps API error: ${response.data.status}`);
        return null;
      }

      const result = response.data.result;

      const business: Business = {
        id: placeId,
        name: result.name,
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        address: result.formatted_address,
        rating: result.rating,
        reviewCount: result.user_ratings_total,
        businessType: 'unknown',
        isOpen: result.opening_hours?.open_now,
        phoneNumber: result.formatted_phone_number,
        website: result.website,
        priceLevel: result.price_level,
        hours: this._parseHours(result.opening_hours)
      };

      this.cache.set(cacheKey, business);
      return business;
    } catch (error) {
      console.error('Error getting business details:', error);
      throw error;
    }
  }

  /**
   * Calculate distance between two points
   * Returns distance in km and estimated duration
   */
  async calculateDistance(
    from: { lat: number; lng: number },
    to: { lat: number; lng: number }
  ): Promise<DistanceResult> {
    const cacheKey = this._getCacheKey('distance', { from, to });
    
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached as DistanceResult;
    }

    try {
      const response = await this.client.get(
        `${this.GOOGLE_MAPS_API}/distancematrix/json`,
        {
          params: {
            origins: `${from.lat},${from.lng}`,
            destinations: `${to.lat},${to.lng}`,
            mode: 'driving',
            key: this.apiKey
          }
        }
      );

      if (response.data.status !== 'OK') {
        throw new Error(`Distance calculation failed: ${response.data.status}`);
      }

      const element = response.data.rows[0].elements[0];
      
      const result: DistanceResult = {
        from,
        to,
        distanceKm: element.distance.value / 1000,
        durationMinutes: Math.ceil(element.duration.value / 60)
      };

      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error calculating distance:', error);
      throw error;
    }
  }

  /**
   * Optimize route for multiple waypoints (agent pickup locations, delivery stops)
   */
  async optimizeRoute(waypoints: Business[]): Promise<RouteOptimization> {
    if (waypoints.length < 2) {
      throw new Error('At least 2 waypoints required for route optimization');
    }

    try {
      // Build waypoints string for API
      const waypointStr = waypoints
        .slice(1, -1) // Exclude start and end
        .map(w => `${w.latitude},${w.longitude}`)
        .join('|');

      const response = await this.client.get(
        `${this.GOOGLE_MAPS_API}/directions/json`,
        {
          params: {
            origin: `${waypoints[0].latitude},${waypoints[0].longitude}`,
            destination: `${waypoints[waypoints.length - 1].latitude},${waypoints[waypoints.length - 1].longitude}`,
            waypoints: waypointStr,
            optimize: 'true',
            key: this.apiKey
          }
        }
      );

      if (response.data.status !== 'OK') {
        throw new Error(`Route optimization failed: ${response.data.status}`);
      }

      const route = response.data.routes[0];
      const leg = route.legs;

      let totalDistance = 0;
      let totalDuration = 0;

      leg.forEach((leg: any) => {
        totalDistance += leg.distance.value;
        totalDuration += leg.duration.value;
      });

      // Extract optimized order
      const optimizedRoute = route.waypoint_order.map((i: number) => waypoints[i].id);

      return {
        waypoints,
        totalDistance: totalDistance / 1000, // Convert to km
        totalDuration: Math.ceil(totalDuration / 60), // Convert to minutes
        optimizedRoute,
        estimatedCost: this._estimateCost(totalDistance / 1000) // Cost estimate
      };
    } catch (error) {
      console.error('Error optimizing route:', error);
      throw error;
    }
  }

  /**
   * Search for businesses by text query
   */
  async textSearch(query: string, location?: { lat: number; lng: number }): Promise<Business[]> {
    try {
      const params: any = {
        query,
        key: this.apiKey
      };

      if (location) {
        params.location = `${location.lat},${location.lng}`;
        params.radius = 50000; // 50km default radius
      }

      const response = await this.client.get(
        `${this.GOOGLE_MAPS_API}/textsearch/json`,
        { params }
      );

      if (response.data.status !== 'OK') {
        return [];
      }

      return response.data.results.map((place: any) => ({
        id: place.place_id,
        name: place.name,
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        address: place.formatted_address,
        rating: place.rating,
        businessType: 'unknown',
        priceLevel: place.price_level
      }));
    } catch (error) {
      console.error('Error in text search:', error);
      return [];
    }
  }

  /**
   * Get autocomplete suggestions for location searches
   */
  async getAutocompleteSuggestions(input: string, location?: { lat: number; lng: number }): Promise<string[]> {
    try {
      const params: any = {
        input,
        key: this.apiKey
      };

      if (location) {
        params.location = `${location.lat},${location.lng}`;
        params.radius = 50000;
      }

      const response = await this.client.get(
        `${this.GOOGLE_MAPS_API}/place/autocomplete/json`,
        { params }
      );

      if (response.data.status !== 'OK') {
        return [];
      }

      return response.data.predictions.map((p: any) => p.description);
    } catch (error) {
      console.error('Error in autocomplete:', error);
      return [];
    }
  }

  /**
   * Clear cache (useful for manual refresh)
   */
  clearCache(): void {
    this.cache.flushAll();
  }

  // ===== PRIVATE HELPER METHODS =====

  private _getCacheKey(type: string, params: any): string {
    return `${type}:${JSON.stringify(params)}`;
  }

  private _mapBusinessTypeToPlacesType(businessType: string): string {
    const mapping: { [key: string]: string } = {
      'mechanic': 'car_repair',
      'plumber': 'plumber',
      'electrician': 'electrician',
      'restaurant': 'restaurant',
      'cafe': 'cafe',
      'hotel': 'lodging',
      'hospital': 'hospital',
      'pharmacy': 'pharmacy',
      'grocery': 'grocery_or_supermarket',
      'gas_station': 'gas_station',
      'atm': 'atm',
      'bank': 'bank',
      'salon': 'hair_care',
      'gym': 'gym',
      'dentist': 'dentist'
    };

    return mapping[businessType.toLowerCase()] || businessType;
  }

  private _calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private _parseHours(openingHours: any): any[] {
    if (!openingHours || !openingHours.weekday_text) {
      return [];
    }

    return openingHours.weekday_text.map((text: string) => {
      const [day, hours] = text.split(': ');
      if (hours === 'Closed') {
        return { day, open: 'Closed', close: 'Closed' };
      }
      const [open, close] = hours.split(' – ');
      return { day, open, close };
    });
  }

  private _estimateCost(distanceKm: number): number {
    // Rough estimate: $0.50/km (varies by location)
    return parseFloat((distanceKm * 0.50).toFixed(2));
  }
}

export default GoogleMapsService;
