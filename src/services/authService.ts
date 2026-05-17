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
  user?: { id: string; name: string; email: string };
  token?: string;
}

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    console.log('📝 Registering:', data.email);
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Register error:', error);
      throw new Error(error.message || 'Registration failed');
    }

    const result = await response.json();
    console.log('✅ Register response:', result);
    return result;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    console.log('🔐 Logging in:', data.email);
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Login error:', error);
      throw new Error(error.message || 'Login failed');
    }

    const result = await response.json();
    console.log('✅ Login response:', result);
    return result;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken(): string | null {
    const token = localStorage.getItem('token');
    console.log('🔑 Getting token:', token ? token.substring(0, 20) + '...' : '❌ No token');
    return token;
  },

  setToken(token: string) {
    console.log('💾 Saving token:', token.substring(0, 20) + '...');
    localStorage.setItem('token', token);
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  setUser(user: any) {
    localStorage.setItem('user', JSON.stringify(user));
  },
};
