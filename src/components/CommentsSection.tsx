import { useState, useEffect } from 'react';
import commentService, { type Comment, type CommentsResponse } from '../services/commentService';
import { CommentItem } from './CommentItem';

interface CommentsSectionProps {
  postId: string;
}

export function CommentsSection({ postId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await commentService.getCommentsByPostId(postId, 4, null);
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
      const response = await commentService.getCommentsByPostId(postId, 4, nextCursor);
      setComments([...comments, ...response.comments]);
      setNextCursor(response.nextCursor);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load more comments';
      setError(errorMessage);
      console.error('Error loading more comments:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 mt-4">
        <div className="text-center text-gray-500 text-sm">Loading comments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg p-4 mt-4">
        <div className="text-red-600 text-sm">{error}</div>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 mt-4">
        <div className="text-center text-gray-500 text-sm">No comments yet</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 mt-4">
      <h3 className="text-sm font-semibold mb-3 text-gray-700">Comments ({comments.length})</h3>

      {/* Comments List */}
      <div className="space-y-0">
        {comments.map((comment) => (
          <CommentItem key={comment._id} comment={comment} />
        ))}
      </div>

      {/* Show More Button */}
      {nextCursor && (
        <button
          onClick={handleShowMore}
          className="mt-3 w-full text-center text-blue-500 hover:text-blue-700 text-sm font-semibold py-2 hover:bg-white rounded transition-colors"
        >
          Show More
        </button>
      )}
    </div>
  );
}
