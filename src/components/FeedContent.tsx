import { useState } from 'react';
import { usePost } from '../hooks/usePost';
import { PostCard } from './PostCard';

interface FeedContentProps {
  searchText?: string;
  searchAuthor?: string | null;
}

export function FeedContent({ searchText = '', searchAuthor = null }: FeedContentProps) {
  const { posts, isLoading, error, hasMore, loadMore } = usePost(searchText, searchAuthor);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-lg font-medium text-gray-600">Loading posts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error: {error}
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-6">
        <div className="bg-gray-50 border border-gray-200 text-gray-600 px-4 py-3 rounded-lg text-center">
          No posts yet. Be the first to share something! ✨
        </div>
      </div>
    );
  }

  const handleLoadMore = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const scrollPos = window.scrollY;
    document.body.style.overflow = 'hidden';

    setIsLoadingMore(true);
    await loadMore();

    setTimeout(() => {
      document.body.style.overflow = '';
      window.scrollTo({ top: scrollPos, behavior: 'auto' });
      setIsLoadingMore(false);
    }, 0);
  };

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}

      {hasMore && (
        <div className="text-center py-6">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition font-medium"
          >
            {isLoadingMore ? 'Loading...' : '📥 Show More'}
          </button>
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="text-center py-6 text-gray-500">
          No more posts to load
        </div>
      )}
    </div>
  );
}
