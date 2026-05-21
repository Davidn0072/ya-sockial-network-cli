import { useState, useEffect, useRef } from 'react';
import commentService, { type Comment } from '../services/commentService';
import { CommentItem } from './CommentItem';
import { CommentInput } from './CommentInput';

interface CommentsSectionProps {
  postId: string;
  focusInput?: boolean;
  onFocusHandled?: () => void;
  onCommentAdded?: () => void;
  pageSize?: number;
  prefetched?: { comments: Comment[]; nextCursor: string | null };
}

export function CommentsSection({
  postId,
  focusInput = false,
  onFocusHandled,
  onCommentAdded,
  pageSize = 4,
  prefetched,
}: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>(prefetched?.comments ?? []);
  const [nextCursor, setNextCursor] = useState<string | null>(prefetched?.nextCursor ?? null);
  const [isLoading, setIsLoading] = useState(!prefetched);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (prefetched) return;
    loadComments();
  }, [postId, prefetched]);

  useEffect(() => {
    if (focusInput && inputRef.current) {
      inputRef.current.focus();
      onFocusHandled?.();
    }
  }, [focusInput, onFocusHandled]);

  const loadComments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await commentService.getCommentsByPostId(postId, pageSize, null);
      setComments(response.comments);
      setNextCursor(response.nextCursor);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load comments';
      setError(errorMessage);
      console.error('Error loading comments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowMore = async () => {
    if (!nextCursor) return;

    try {
      const response = await commentService.getCommentsByPostId(postId, pageSize, nextCursor);
      setComments([...comments, ...response.comments]);
      setNextCursor(response.nextCursor);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load more comments';
      setError(errorMessage);
      console.error('Error loading more comments:', err);
    }
  };

  const handleCommentSuccess = (newComment: Comment) => {
    setComments([newComment, ...comments]);
    onCommentAdded?.();
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 mt-6 border border-blue-100">
        <div className="text-center text-gray-500 text-sm font-medium">Loading comments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg p-6 mt-6 border border-red-200">
        <div className="text-red-600 text-sm font-medium">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 mt-6 border border-blue-100 shadow-sm">
      <h3 className="text-sm font-bold mb-4 text-gray-800 flex items-center gap-2">
        <span>💬 Comments</span>
        <span className="bg-blue-600 text-white rounded-full px-2.5 py-0.5 text-xs font-bold">{comments.length}</span>
      </h3>

      {/* Comment Input */}
      <CommentInput postId={postId} onCommentSuccess={handleCommentSuccess} inputRef={inputRef} />

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center text-gray-500 text-sm py-6 font-medium">No comments yet. Be the first!</div>
      ) : (
        <div className="space-y-1 mt-4">
          {comments.map((comment) => (
            <CommentItem key={comment._id} comment={comment} />
          ))}
        </div>
      )}

      {/* Show More Button */}
      {nextCursor && (
        <button
          onClick={handleShowMore}
          className="mt-4 w-full text-center text-blue-600 hover:text-blue-700 text-sm font-bold py-2.5 hover:bg-blue-100 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-300"
        >
          ⬇️ Show More Comments
        </button>
      )}
    </div>
  );
}
