/**
 * Agent Marketplace - Main page
 * Browse, search, and discover agents
 */
import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Clock, DollarSign } from 'lucide-react';
export default function Marketplace() {
    const [agents, setAgents] = useState([]);
    const [filteredAgents, setFilteredAgents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedService, setSelectedService] = useState('all');
    const [sortBy, setSortBy] = useState('rating');
    const [loading, setLoading] = useState(true);
    // Service types
    const serviceTypes = [
        'all',
        'mechanic',
        'battery_service',
        'plumber',
        'electrician',
        'delivery',
        'taxi',
        'charging_station',
        'data_provider',
        'compute'
    ];
    // Fetch agents from backend
    useEffect(() => {
        const fetchAgents = async () => {
            try {
                const response = await fetch('/api/agents');
                const data = await response.json();
                setAgents(data);
                setFilteredAgents(data);
                setLoading(false);
            }
            catch (error) {
                console.error('Failed to fetch agents:', error);
                setLoading(false);
            }
        };
        fetchAgents();
    }, []);
    // Filter and sort agents
    useEffect(() => {
        let result = agents;
        // Filter by service type
        if (selectedService !== 'all') {
            result = result.filter(a => a.serviceType === selectedService);
        }
        // Filter by search term
        if (searchTerm) {
            result = result.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.location.city.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        // Sort
        if (sortBy === 'rating') {
            result.sort((a, b) => b.rating - a.rating);
        }
        else if (sortBy === 'price') {
            result.sort((a, b) => a.pricePerHour - b.pricePerHour);
        }
        else if (sortBy === 'distance') {
            // Would need user location for this
            result.sort((a, b) => a.responseTime.localeCompare(b.responseTime));
        }
        setFilteredAgents(result);
    }, [searchTerm, selectedService, sortBy, agents]);
    return (<div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Agent Marketplace</h1>
          <p className="text-blue-100">Discover and book autonomous agents for your needs</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 text-gray-400" size={20}/>
            <input type="text" placeholder="Search agents by name or location..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"/>
          </div>

          {/* Filters */}
          <div className="flex gap-4 flex-wrap mb-6">
            {/* Service Type Filter */}
            <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)} className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500">
              {serviceTypes.map(type => (<option key={type} value={type}>
                  {type === 'all' ? 'All Services' : type.replace(/_/g, ' ')}
                </option>))}
            </select>

            {/* Sort Filter */}
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500">
              <option value="rating">Highest Rated</option>
              <option value="price">Lowest Price</option>
              <option value="distance">Closest</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <p className="text-gray-400 mb-6">
          {filteredAgents.length} agents found
        </p>

        {/* Loading State */}
        {loading && (<div className="flex justify-center items-center h-64">
            <div className="text-gray-400">Loading agents...</div>
          </div>)}

        {/* Agent Grid */}
        {!loading && filteredAgents.length > 0 && (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map(agent => (<AgentCard key={agent.id} agent={agent}/>))}
          </div>)}

        {/* No Results */}
        {!loading && filteredAgents.length === 0 && (<div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-4">No agents found matching your criteria</p>
            <button onClick={() => {
                setSearchTerm('');
                setSelectedService('all');
            }} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
              Clear Filters
            </button>
          </div>)}
      </div>
    </div>);
}
/**
 * Agent Card Component
 */
function AgentCard({ agent }) {
    return (<div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-blue-500 transition">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4 h-20"></div>

      {/* Content */}
      <div className="p-6">
        {/* Avatar & Name */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {agent.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-semibold">{agent.name}</h3>
                {agent.verified && <span className="text-blue-400 text-sm">✓ Verified</span>}
              </div>
              <p className="text-gray-400 text-sm">{agent.serviceType.replace(/_/g, ' ')}</p>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
          <MapPin size={16}/>
          <span>{agent.location.city}, {agent.location.state}</span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1">
            <Star size={16} className="text-yellow-400" fill="currentColor"/>
            <span className="text-white font-semibold">{agent.rating.toFixed(1)}</span>
            <span className="text-gray-400 text-sm">({agent.reviews} reviews)</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="bg-gray-700 rounded p-3">
            <div className="text-gray-400">Response Time</div>
            <div className="text-white font-semibold flex items-center gap-1">
              <Clock size={14}/>
              {agent.responseTime}
            </div>
          </div>
          <div className="bg-gray-700 rounded p-3">
            <div className="text-gray-400">Success Rate</div>
            <div className="text-white font-semibold">{(agent.successRate * 100).toFixed(0)}%</div>
          </div>
        </div>

        {/* Price */}
        <div className="bg-blue-600 bg-opacity-20 border border-blue-500 rounded-lg p-3 mb-4">
          <div className="text-gray-300 text-sm">Price</div>
          <div className="text-white text-xl font-bold flex items-center gap-1">
            <DollarSign size={20}/>
            {agent.pricePerHour}/hr
          </div>
        </div>

        {/* Transactions */}
        <div className="text-gray-400 text-xs mb-4">
          {agent.totalTransactions} completed transactions
        </div>

        {/* CTA Button */}
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition">
          View Profile
        </button>
      </div>
    </div>);
}
//# sourceMappingURL=marketplace.js.map