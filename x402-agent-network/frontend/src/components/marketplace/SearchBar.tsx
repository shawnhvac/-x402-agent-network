import React, { useState } from 'react';
import { Search, MapPin, DollarSign, Briefcase } from 'lucide-react';

interface SearchBarProps {
  onSearch: (filters: {
    location?: string;
    serviceType?: string;
    maxBudget?: number;
  }) => void;
}

const SERVICE_TYPES = [
  'All Services',
  'Mechanic',
  'HVAC',
  'Plumber',
  'Carpenter',
  'Electrician',
  'Other',
];

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [location, setLocation] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [maxBudget, setMaxBudget] = useState('');

  const handleSearch = () => {
    onSearch({
      location: location || undefined,
      serviceType: serviceType && serviceType !== 'All Services' ? serviceType : undefined,
      maxBudget: maxBudget ? parseInt(maxBudget) : undefined,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="inline w-4 h-4 mr-2" />
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="City or address"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Service Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Briefcase className="inline w-4 h-4 mr-2" />
            Service Type
          </label>
          <select
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {SERVICE_TYPES.map((type) => (
              <option key={type} value={type === 'All Services' ? '' : type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Budget */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="inline w-4 h-4 mr-2" />
            Max Budget
          </label>
          <input
            type="number"
            value={maxBudget}
            onChange={(e) => setMaxBudget(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., 500"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Search Button */}
        <div className="flex items-end">
          <button
            onClick={handleSearch}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center transition duration-200"
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </button>
        </div>
      </div>
    </div>
  );
};
