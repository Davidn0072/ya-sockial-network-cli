import config from '../config';
import { authService } from './authService';

const API_URL = config.API_URL;

interface User {
  _id: string;
  name: string;
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
    const users = await this.searchUsers(username);
    if (!users.length) return null;

    const exact = users.find(u =>
      (u.user || u.name).toLowerCase() === username.toLowerCase()
    );
    return (exact || users[0])._id;
  },
};
