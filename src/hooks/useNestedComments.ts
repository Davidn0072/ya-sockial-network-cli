import { useState, useCallback } from 'react';
import commentService from '../services/commentService';
import type { Comment, CommentsResponse } from '../services/commentService';

interface NestedCommentsState {
  replies: Comment[];
  isLoading: boolean;
  error: string | null;
  nextCursor: string | null;
  isVisible: boolean;
}

export function useNestedComments(postId: string, parentCommentId: string) {
  const [state, setState] = useState<NestedCommentsState>({
    replies: [],
    isLoading: false,
    error: null,
    nextCursor: null,
    isVisible: false,
  });

  const fetchReplies = useCallback(
    async (cursor: string | null = null) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response: CommentsResponse = await commentService.getNestedComments(
          postId,
          parentCommentId,
          5,
          cursor
        );

        setState((prev) => ({
          ...prev,
          replies: cursor ? [...prev.replies, ...response.comments] : response.comments,
          nextCursor: response.nextCursor,
          isLoading: false,
        }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : 'Failed to load replies',
          isLoading: false,
        }));
      }
    },
    [postId, parentCommentId]
  );

  const toggleReplies = useCallback(() => {
    setState((prev) => {
      const newIsVisible = !prev.isVisible;
      if (newIsVisible && prev.replies.length === 0) {
        fetchReplies();
      }
      return { ...prev, isVisible: newIsVisible };
    });
  }, [fetchReplies]);

  const loadMore = useCallback(() => {
    if (state.nextCursor) {
      fetchReplies(state.nextCursor);
    }
  }, [state.nextCursor, fetchReplies]);

  return {
    replies: state.replies,
    isLoading: state.isLoading,
    error: state.error,
    isVisible: state.isVisible,
    hasMore: state.nextCursor !== null,
    toggleReplies,
    loadMore,
  };
}
