import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="text-6xl font-bold text-gray-900 mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-gray-600 mb-8 max-w-md">
          Sorry, the page you're looking for doesn't exist. It might have been moved or deleted.
        </p>
        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center gap-2 mx-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
        >
          <Home className="w-5 h-5" />
          Go Home
        </button>
      </div>
    </div>
  );
};
