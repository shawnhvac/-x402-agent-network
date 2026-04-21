import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Search } from 'lucide-react';

interface Booking {
  id: string;
  providerName: string;
  serviceType: string;
  date: string;
  time: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Mock bookings data
  const [bookings] = useState<Booking[]>([
    {
      id: '1',
      providerName: 'Phoenix Auto Repair',
      serviceType: 'Mechanic',
      date: '2026-04-20',
      time: '14:00',
      amount: 250,
      status: 'confirmed',
    },
    {
      id: '2',
      providerName: 'Cool Air HVAC',
      serviceType: 'HVAC',
      date: '2026-04-25',
      time: '10:00',
      amount: 350,
      status: 'pending',
    },
    {
      id: '3',
      providerName: 'Reliable Plumbing',
      serviceType: 'Plumber',
      date: '2026-04-15',
      time: '09:30',
      amount: 180,
      status: 'completed',
    },
  ]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalSpent = bookings.reduce((sum, b) => sum + b.amount, 0);
  const completedCount = bookings.filter((b) => b.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">⚡ My Dashboard</h1>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium mb-2">Total Spent</p>
            <p className="text-3xl font-bold text-gray-900">${totalSpent}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium mb-2">Bookings</p>
            <p className="text-3xl font-bold text-gray-900">{bookings.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium mb-2">Completed</p>
            <p className="text-3xl font-bold text-gray-900">{completedCount}</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/marketplace')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            <Search className="w-5 h-5" />
            Find Service Provider
          </button>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">My Bookings</h2>
          </div>

          {bookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Provider
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {booking.providerName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {booking.serviceType}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(booking.date).toLocaleDateString()} at {booking.time}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ${booking.amount}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button className="text-blue-600 hover:text-blue-700 font-semibold">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-600 mb-4">No bookings yet</p>
              <button
                onClick={() => navigate('/marketplace')}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Browse Providers
              </button>
            </div>
          )}
        </div>

        {/* Payment Method Section */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
          <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-4">
            <p className="text-gray-700 font-medium">Visa ending in 4242</p>
            <p className="text-sm text-gray-600">Expires 12/26</p>
          </div>
          <button className="text-blue-600 hover:text-blue-700 font-semibold">
            Update Payment Method
          </button>
        </div>
      </main>
    </div>
  );
};
