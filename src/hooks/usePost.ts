import { useState, useEffect } from 'react';
import type { Post } from '../services/postService';
import postService from '../services/postService';

interface UsePostReturn {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePost(): UsePostReturn {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching posts...');
      const data = await postService.getPosts();
      console.log('Posts received:', data);
      setPosts(data);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load posts');
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const refetch = async () => {
    await fetchPosts();
  };

  return { posts, isLoading, error, refetch };
}
