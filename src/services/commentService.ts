import config from '../config';
import { authService } from './authService';

const API_URL = config.API_URL;

export type Comment = {
  _id: string;
  content: string;
  userId: {
    _id: string;
    name: string;
  };
  postId: string;
  parentCommentId?: string;
  createdAt: string;
  updatedAt?: string;
  likesCount?: number;
};

export type CommentsResponse = {
  comments: Comment[];
  nextCursor: string | null;
};

const commentService = {
  async getCommentsByPostId(
    postId: string,
    limit: number = 4,
    cursor: string | null = null
  ): Promise<CommentsResponse> {
    const token = authService.getToken();

    const params = new URLSearchParams({
      postId,
      limit: String(limit),
    });

    if (cursor) {
      params.append('cursor', cursor);
    }

    const url = `${API_URL}/comments?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token || '',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch comments');
    }

    return response.json();
  },

  async getNestedComments(
    postId: string,
    parentCommentId: string,
    limit: number = 5,
    cursor: string | null = null
  ): Promise<CommentsResponse> {
    const token = authService.getToken();

    const params = new URLSearchParams({
      postId,
      parentCommentId,
      limit: String(limit),
    });

    if (cursor) {
      params.append('cursor', cursor);
    }

    const url = `${API_URL}/comments?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token || '',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch nested comments');
    }

    return response.json();
  },

  async addComment(postId: string, content: string): Promise<Comment> {
    const token = authService.getToken();

    const response = await fetch(`${API_URL}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token || '',
      },
      body: JSON.stringify({ postId, content }),
    });

    if (!response.ok) {
      throw new Error('Failed to add comment');
    }

    return response.json();
  },

  async addReply(postId: string, parentCommentId: string, content: string): Promise<Comment> {
    const token = authService.getToken();

    const response = await fetch(`${API_URL}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token || '',
      },
      body: JSON.stringify({ postId, parentCommentId, content }),
    });

    if (!response.ok) {
      throw new Error('Failed to add reply');
    }

    return response.json();
  },

  async updateComment(commentId: string, content: string): Promise<Comment> {
    const token = authService.getToken();

    const response = await fetch(`${API_URL}/comments/${commentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token || '',
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error('Failed to update comment');
    }

    return response.json();
  },

  async deleteComment(commentId: string): Promise<void> {
    const token = authService.getToken();

    const response = await fetch(`${API_URL}/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token || '',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete comment');
    }
  },
};

export default commentService;
