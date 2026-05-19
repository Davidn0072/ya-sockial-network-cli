import config from '../config';
import { authService } from './authService';

const API_URL = config.API_URL;

export const friendService = {
  async sendFriendRequest(userId: string): Promise<any> {
    const token = authService.getToken();

    const response = await fetch(`${API_URL}/friends/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token || '',
      },
      body: JSON.stringify({ toUserId: userId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send friend request');
    }

    return response.json();
  },

  async getFriendRequests(): Promise<any[]> {
    const token = authService.getToken();

    const response = await fetch(`${API_URL}/friends/requests`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token || '',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch friend requests');
    }

    return response.json();
  },

  async getFriends(): Promise<any[]> {
    const token = authService.getToken();

    const response = await fetch(`${API_URL}/friends/accepted`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token || '',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch friends');
    }

    return response.json();
  },

  async acceptRequest(requestId: string): Promise<any> {
    const token = authService.getToken();

    const response = await fetch(`${API_URL}/friends/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token || '',
      },
      body: JSON.stringify({ requestId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to accept request');
    }

    return response.json();
  },

  async rejectRequest(requestId: string): Promise<any> {
    const token = authService.getToken();

    const response = await fetch(`${API_URL}/friends/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token || '',
      },
      body: JSON.stringify({ requestId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to reject request');
    }

    return response.json();
  },

  async unfriend(friendId: string): Promise<any> {
    const token = authService.getToken();

    const response = await fetch(`${API_URL}/friends/${friendId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token || '',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to unfriend');
    }

    return response.json();
  },
};
