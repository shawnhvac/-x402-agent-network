import axios from 'axios';
import type { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  signup: (email: string, password: string, name: string) =>
    apiClient.post('/auth/signup', { email, password, name }),
  
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
  
  logout: () => {
    localStorage.removeItem('authToken');
    return Promise.resolve();
  },
  
  profile: () => apiClient.get('/auth/profile'),
};

// Provider/Agent APIs
export const agentAPI = {
  search: (params: {
    serviceType?: string;
    location?: string;
    maxDistance?: number;
    budget?: number;
    sortBy?: 'rating' | 'price' | 'distance';
  }) => apiClient.get('/agents/search', { params }),
  
  nearby: (latitude: number, longitude: number, radius: number = 50) =>
    apiClient.get('/agents/nearby', { params: { latitude, longitude, radius } }),
  
  getById: (id: string) => apiClient.get(`/agents/${id}`),
  
  list: (params?: { limit?: number; offset?: number }) =>
    apiClient.get('/agents', { params }),
  
  reviews: (agentId: string) => apiClient.get(`/agents/${agentId}/reviews`),
};

// Booking APIs
export const bookingAPI = {
  create: (data: {
    agentId: string;
    serviceType: string;
    scheduledDate: string;
    notes?: string;
  }) => apiClient.post('/bookings', data),
  
  list: (params?: { limit?: number; offset?: number; status?: string }) =>
    apiClient.get('/bookings', { params }),
  
  getById: (id: string) => apiClient.get(`/bookings/${id}`),
  
  cancel: (id: string) => apiClient.post(`/bookings/${id}/cancel`, {}),
  
  complete: (id: string, rating: number, review?: string) =>
    apiClient.post(`/bookings/${id}/complete`, { rating, review }),
};

// Payment APIs
export const paymentAPI = {
  createPayment: (data: {
    bookingId: string;
    amount: number;
    paymentMethod: 'stripe' | 'openapi';
    cardToken?: string;
  }) => apiClient.post('/payments', data),
  
  getStatus: (bookingId: string) => apiClient.get(`/payments/${bookingId}`),
};

export default apiClient;
