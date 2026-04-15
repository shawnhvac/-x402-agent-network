import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SearchBar } from '../components/marketplace/SearchBar';
import { ProviderCard } from '../components/marketplace/ProviderCard';
import type { Provider } from '../components/marketplace/ProviderCard';
import { LogOut, ChevronLeft } from 'lucide-react';

export const Marketplace: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Mock data for demo
  const MOCK_PROVIDERS: Provider[] = [
    {
      id: '1',
      name: 'Phoenix Auto Repair',
      serviceType: 'Mechanic',
      rating: 4.8,
      reviewCount: 234,
      hourlyRate: 85,
      distance: 1.2,
      location: 'Phoenix, AZ',
    },
    {
      id: '2',
      name: 'Cool Air HVAC',
      serviceType: 'HVAC',
      rating: 4.6,
      reviewCount: 189,
      hourlyRate: 120,
      distance: 2.5,
      location: 'Phoenix, AZ',
    },
    {
      id: '3',
      name: 'Reliable Plumbing',
      serviceType: 'Plumber',
      rating: 4.7,
      reviewCount: 156,
      hourlyRate: 95,
      distance: 1.8,
      location: 'Phoenix, AZ',
    },
    {
      id: '4',
      name: 'Expert Carpentry',
      serviceType: 'Carpenter',
      rating: 4.9,
      reviewCount: 87,
      hourlyRate: 110,
      distance: 3.1,
      location: 'Phoenix, AZ',
    },
    {
      id: '5',
      name: 'Electric Plus',
      serviceType: 'Electrician',
      rating: 4.5,
      reviewCount: 142,
      hourlyRate: 105,
      distance: 2.8,
      location: 'Phoenix, AZ',
    },
  ];

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    setIsLoading(true);
    setError('');
    try {
      // In production, this would call agentAPI.search(filters)
      // For demo, use mock data
      setProviders(MOCK_PROVIDERS);
    } catch (err) {
      setError('Failed to load providers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (newFilters: any) => {
    setIsLoading(true);
    setError('');

    try {
      // Filter mock data based on filters
      let filtered = MOCK_PROVIDERS;

      if (newFilters.serviceType) {
        filtered = filtered.filter(
          (p) => p.serviceType.toLowerCase() === newFilters.serviceType.toLowerCase()
        );
      }

      if (newFilters.maxBudget) {
        filtered = filtered.filter((p) => p.hourlyRate <= newFilters.maxBudget);
      }

      setProviders(filtered);
    } catch (err) {
      setError('Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectProvider = (provider: Provider) => {
    setSelectedProvider(provider);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (selectedProvider) {
    return (
      <ProviderDetail
        provider={selectedProvider}
        onBack={() => setSelectedProvider(null)}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">⚡ AgentPay Marketplace</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 font-medium transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <SearchBar onSearch={handleSearch} />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : providers.length > 0 ? (
          <>
            <div className="mb-4 text-gray-600">
              Found {providers.length} provider{providers.length !== 1 ? 's' : ''}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  onSelect={handleSelectProvider}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No providers found matching your criteria</p>
          </div>
        )}
      </main>
    </div>
  );
};

interface ProviderDetailProps {
  provider: Provider;
  onBack: () => void;
  onLogout: () => void;
}

const ProviderDetail: React.FC<ProviderDetailProps> = ({ provider, onBack, onLogout }) => {
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // In production: await bookingAPI.create({...})
      // For demo: just show success
      setTimeout(() => {
        alert(`✅ Booking confirmed with ${provider.name}!\nDate: ${bookingDate} at ${bookingTime}`);
        onBack();
      }, 1000);
    } catch (err) {
      alert('Booking failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Results
          </button>
          <button
            onClick={onLogout}
            className="text-gray-700 hover:text-red-600 font-medium"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Provider Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{provider.name}</h1>
              <p className="text-xl text-gray-600 mb-4">{provider.serviceType}</p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center">
                  <span className="text-amber-500">★★★★★</span>
                  <span className="ml-2 text-gray-700">
                    {provider.rating} ({provider.reviewCount} reviews)
                  </span>
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  ${provider.hourlyRate}/hour
                </div>
                <div className="text-gray-600">
                  📍 {provider.location} ({provider.distance} miles away)
                </div>
              </div>

              <button
                onClick={onBack}
                className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition"
              >
                View More Reviews
              </button>
            </div>

            {/* Booking Form */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Book Service</h2>
              <form onSubmit={handleBooking} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Time
                  </label>
                  <input
                    type="time"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe your service needs..."
                  />
                </div>

                <div className="bg-white p-4 rounded border border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Estimated Cost</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${provider.hourlyRate}
                  </p>
                  <p className="text-xs text-gray-500">+ payment processing fee</p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition"
                >
                  {isSubmitting ? 'Processing...' : 'Confirm Booking'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
