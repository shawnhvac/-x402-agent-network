import React from 'react';
import { Star, MapPin, DollarSign, ChevronRight } from 'lucide-react';

export interface Provider {
  id: string;
  name: string;
  serviceType: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  distance: number;
  location: string;
  image?: string;
}

interface ProviderCardProps {
  provider: Provider;
  onSelect: (provider: Provider) => void;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({ provider, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(provider)}
      className="bg-white rounded-lg shadow hover:shadow-lg transition duration-200 p-4 cursor-pointer border border-gray-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{provider.name}</h3>
          <p className="text-sm text-gray-600">{provider.serviceType}</p>
        </div>
        <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="text-sm font-semibold text-gray-900">{provider.rating}</span>
          <span className="text-xs text-gray-600">({provider.reviewCount})</span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
          {provider.location} • {provider.distance.toFixed(1)} miles
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
          ${provider.hourlyRate}/hour
        </div>
      </div>

      <button className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold py-2 rounded-lg transition duration-200">
        Book Now
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
