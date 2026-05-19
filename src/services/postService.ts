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
  async getPosts(
    cursor: string | null = null,
    limit: number = 10,
    search: string = '',
    authorId: string | null = null
  ): Promise<{ posts: Post[]; nextCursor: string | null }> {
    const token = authService.getToken();
    let url = `${API_URL}/posts?limit=${limit}`;
    if (cursor) {
      url += `&cursor=${cursor}`;
    }
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    if (authorId) {
      url += `&userId=${encodeURIComponent(authorId)}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token || '',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to fetch posts (${response.status}): ${errorText}`);
    }

    const data = await response.json();
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

  async getRecommendedPosts(): Promise<Post[]> {
    const token = authService.getToken();

    const response = await fetch(`${API_URL}/posts/recommended`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token || '',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch AI recommendations');
    }

    const data = await response.json();
    return Array.isArray(data) ? data : data.posts || [];
  },

  async createPost(content: string): Promise<Post> {
    const token = authService.getToken();

    const response = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token || '',
      },
      body: JSON.stringify({ content }),
    });

    const data = await response.json();

    if (!response.ok) {
      let errorMessage = 'Failed to create post';
      if (typeof data === 'string') {
        errorMessage = data;
      } else if (data && data.message) {
        errorMessage = data.message;
      } else if (data && data.error) {
        errorMessage = data.error;
      }
      throw new Error(errorMessage);
    }

    if (data && data.success === false) {
      const errorMessage = data.message || 'Failed to create post';
      throw new Error(errorMessage);
    }

    return data;
  },

  async updatePost(postId: string, content: string): Promise<Post> {
    const token = authService.getToken();

    const response = await fetch(`${API_URL}/posts/${postId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token || '',
      },
      body: JSON.stringify({ content }),
    });

    const data = await response.json();

    if (!response.ok) {
      let errorMessage = 'Failed to update post';
      if (typeof data === 'string') {
        errorMessage = data;
      } else if (data && data.message) {
        errorMessage = data.message;
      } else if (data && data.error) {
        errorMessage = data.error;
      }
      throw new Error(errorMessage);
    }

    if (data && data.success === false) {
      const errorMessage = data.message || 'Failed to update post';
      throw new Error(errorMessage);
    }

    return data;
  },

  async deletePost(postId: string): Promise<void> {
    const token = authService.getToken();

    const response = await fetch(`${API_URL}/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token || '',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      let errorMessage = 'Failed to delete post';
      if (typeof data === 'string') {
        errorMessage = data;
      } else if (data && data.message) {
        errorMessage = data.message;
      } else if (data && data.error) {
        errorMessage = data.error;
      }
      throw new Error(errorMessage);
    }
  },
};

export default postService;
