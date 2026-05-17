import { useState, useEffect } from 'react';
import type { Post } from '../services/postService';
import postService from '../services/postService';

interface UsePostReturn {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function usePost(): UsePostReturn {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 10;

  const fetchPosts = async (cursor: string | null = null, append: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log(`Fetching posts... cursor=${cursor}, limit=${LIMIT}`);
      const { posts: newPosts, nextCursor: newNextCursor } = await postService.getPosts(cursor, LIMIT);
      console.log('Posts received:', newPosts, 'nextCursor:', newNextCursor);

      if (append) {
        setPosts((prev) => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }

      setNextCursor(newNextCursor);
      setHasMore(newNextCursor !== null);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load posts');
      if (!append) {
        setPosts([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(null, false);
  }, []);

  const loadMore = async () => {
    await fetchPosts(nextCursor, true);
  };

  const refetch = async () => {
    await fetchPosts(null, false);
  };

  return { posts, isLoading, error, hasMore, loadMore, refetch };
}
