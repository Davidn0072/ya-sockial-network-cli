import config from '../config';
import { authService } from './authService';

const API_URL = config.API_URL;

interface User {
  _id: string;
  name: string;
  email?: string;
  domainofinterest?: string[];
  user?: string;
}

interface SearchResult {
  users: User[];
  nextCursor: string | null;
}

export const userService = {
  async searchUsers(query: string, cursor: string | null = null): Promise<SearchResult> {
    if (!query.trim()) return { users: [], nextCursor: null };

    const token = authService.getToken();
    const searchParams = new URLSearchParams({ q: query, limit: '10' });
    if (cursor) {
      searchParams.set('cursor', cursor);
    }

    try {
      const response = await fetch(`${API_URL}/users/search?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token || '',
        },
      });

      if (!response.ok) {
        console.error('Failed to search users');
        return { users: [], nextCursor: null };
      }

      const data = await response.json();
      const users = Array.isArray(data) ? data : data.users || [];
      const nextCursor = (!Array.isArray(data) && data.nextCursor) || null;
      return { users, nextCursor };
    } catch (error) {
      console.error('Error searching users:', error);
      return { users: [], nextCursor: null };
    }
  },

  async resolveUserIdFromUsername(username: string): Promise<string | null> {
    const result = await this.searchUsers(username);
    if (!result.users.length) return null;

    const exact = result.users.find(u =>
      (u.user || u.name).toLowerCase() === username.toLowerCase()
    );
    return (exact || result.users[0])._id;
  },

  async getUserProfile(userId: string): Promise<User> {
    const token = authService.getToken();

    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token || '',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    return response.json();
  },

  async updateUserProfile(userId: string, data: any): Promise<any> {
    const token = authService.getToken();

    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token || '',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update user profile');
    }

    return response.json();
  },
};
