import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Zap, Lock, TrendingUp, Users } from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-blue-600">⚡ AgentPay</div>
          <div className="flex gap-4">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => navigate('/marketplace')}
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium"
                >
                  Marketplace
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium"
                >
                  Dashboard
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Find The Perfect Service Provider
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Connect with vetted service providers in your area. Book appointments, manage payments, and build reputation—all on one platform.
        </p>
        {!isAuthenticated && (
          <button
            onClick={() => navigate('/signup')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition duration-200"
          >
            Start Browsing
          </button>
        )}
      </section>

      {/* Features */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose AgentPay?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-blue-600" />}
              title="Lightning Fast"
              description="Find and book services in minutes, not hours"
            />
            <FeatureCard
              icon={<Lock className="w-8 h-8 text-blue-600" />}
              title="Secure Payments"
              description="Protected transactions with smart escrow"
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8 text-blue-600" />}
              title="Transparent Pricing"
              description="No hidden fees, fair rates for everyone"
            />
            <FeatureCard
              icon={<Users className="w-8 h-8 text-blue-600" />}
              title="Community Trusted"
              description="Verified providers with real reviews"
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatCard number="5,000+" label="Service Providers" />
            <StatCard number="50,000+" label="Active Users" />
            <StatCard number="$2M+" label="Transactions" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to find your service provider?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Join thousands of satisfied customers today
          </p>
          {!isAuthenticated && (
            <button
              onClick={() => navigate('/signup')}
              className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg text-lg transition duration-200"
            >
              Create Free Account
            </button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-white font-bold mb-4">⚡ AgentPay</div>
              <p className="text-sm">Your trusted marketplace for services</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="text-sm space-y-2">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="text-sm space-y-2">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="text-sm space-y-2">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 AgentPay. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition duration-200">
    <div className="mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

interface StatCardProps {
  number: string;
  label: string;
}

const StatCard: React.FC<StatCardProps> = ({ number, label }) => (
  <div className="text-center">
    <div className="text-4xl font-bold text-blue-600 mb-2">{number}</div>
    <div className="text-gray-600 font-medium">{label}</div>
  </div>
);
