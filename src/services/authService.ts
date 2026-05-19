import config from '../config';

const API_URL = config.API_URL;

interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  userId?: string;
  user?: string;
  token?: string;
}

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Register error:', error);
      throw new Error(error.message || 'Registration failed');
    }

    const result = await response.json();
    return result;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }

    const result = await response.json();
    return result;
  },

  logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  },

  getToken(): string | null {
    const token = sessionStorage.getItem('token');
    return token;
  },

  setToken(token: string) {
    sessionStorage.setItem('token', token);
  },

  getUser() {
    const user = sessionStorage.getItem('user');
    if (!user) return null;

    try {
      return JSON.parse(user);
    } catch {
      return user;
    }
  },

  setUser(user: any) {
    if (typeof user === 'string') {
      sessionStorage.setItem('user', user);
    } else if (user?.name) {
      sessionStorage.setItem('user', JSON.stringify(user));
    }
  },
};
