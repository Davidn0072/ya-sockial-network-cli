import config from '../config';
import { authService } from './authService';

const API_URL = config.API_URL;

export type Post = {
  _id: string;
  userId: {
    _id: string;
    name: string;
  };
  content: string;
  images?: string[];
  createdAt: string;
  updatedAt?: string;
  commentsCount?: number;
  filesCount?: number;
  likesStats?: {
    total: number;
    like: number;
    love: number;
    celebrate: number;
    insightful: number;
  };
  hasMore?: boolean;
};

const postService = {
  async getPosts(cursor: string | null = null, limit: number = 10): Promise<{ posts: Post[]; nextCursor: string | null }> {
    const token = authService.getToken();
    let url = `${API_URL}/posts?limit=${limit}`;
    if (cursor) {
      url += `&cursor=${cursor}`;
    }

    console.log('🔗 Calling endpoint:', url);
    console.log('📦 Token:', token ? '✓ Token exists' : '❌ No token');

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token || '',
      },
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      throw new Error(`Failed to fetch posts (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Posts data:', data);
    const posts = Array.isArray(data) ? data : data.posts || [];
    const nextCursor = data.nextCursor || null;
    return { posts, nextCursor };
  },

  async getPostsByUser(userId: string): Promise<Post[]> {
    const token = authService.getToken();

    const response = await fetch(`${API_URL}/posts/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token || '',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user posts');
    }

    const data = await response.json();
    return Array.isArray(data) ? data : data.posts || [];
  },

  async getPostById(postId: string): Promise<Post> {
    const token = authService.getToken();

    const response = await fetch(`${API_URL}/posts/${postId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token || '',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch post');
    }

    return response.json();
  },
};

export default postService;
