/**
 * Google Maps Location Service
 * Provides worldwide location discovery for agents
 * Integrates with AgentRegistry for autonomous local commerce
 */
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
    priceLevel?: number;
    distance?: number;
    hours?: {
        open: string;
        close: string;
        day: string;
    }[];
}
interface LocationQuery {
    latitude: number;
    longitude: number;
    radius: number;
    businessType: string;
    minRating?: number;
    maxPrice?: number;
    openNow?: boolean;
}
interface DistanceResult {
    from: {
        lat: number;
        lng: number;
    };
    to: {
        lat: number;
        lng: number;
    };
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
export declare class GoogleMapsService {
    private apiKey;
    private client;
    private cache;
    private readonly CACHE_TTL;
    private readonly GOOGLE_MAPS_API;
    constructor(apiKey: string);
    /**
     * Find nearby businesses using Google Maps Places API
     * Worldwide coverage, real-time ratings + hours
     */
    findNearbyBusinesses(query: LocationQuery): Promise<Business[]>;
    /**
     * Get detailed information for a specific business
     */
    getBusinessDetails(placeId: string): Promise<Business | null>;
    /**
     * Calculate distance between two points
     * Returns distance in km and estimated duration
     */
    calculateDistance(from: {
        lat: number;
        lng: number;
    }, to: {
        lat: number;
        lng: number;
    }): Promise<DistanceResult>;
    /**
     * Optimize route for multiple waypoints (agent pickup locations, delivery stops)
     */
    optimizeRoute(waypoints: Business[]): Promise<RouteOptimization>;
    /**
     * Search for businesses by text query
     */
    textSearch(query: string, location?: {
        lat: number;
        lng: number;
    }): Promise<Business[]>;
    /**
     * Get autocomplete suggestions for location searches
     */
    getAutocompleteSuggestions(input: string, location?: {
        lat: number;
        lng: number;
    }): Promise<string[]>;
    /**
     * Clear cache (useful for manual refresh)
     */
    clearCache(): void;
    private _getCacheKey;
    private _mapBusinessTypeToPlacesType;
    private _calculateDistance;
    private _parseHours;
    private _estimateCost;
}
export default GoogleMapsService;
