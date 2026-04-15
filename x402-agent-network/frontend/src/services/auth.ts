import { authAPI } from './api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'provider';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  setToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  clearToken(): void {
    localStorage.removeItem('authToken');
  }

  async signup(email: string, password: string, name: string): Promise<User> {
    try {
      const response = await authAPI.signup(email, password, name);
      const { token, user } = response.data;
      this.setToken(token);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async login(email: string, password: string): Promise<User> {
    try {
      const response = await authAPI.login(email, password);
      const { token, user } = response.data;
      this.setToken(token);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    await authAPI.logout();
    this.clearToken();
  }

  async getProfile(): Promise<User> {
    const response = await authAPI.profile();
    return response.data;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export default AuthService.getInstance();
