import { useState } from 'react';

interface PostActionsProps {
  likesStats?: {
    total: number;
    like: number;
    love: number;
    celebrate: number;
    insightful: number;
  };
  commentsCount?: number;
  filesCount?: number;
  onReactionsClick?: () => void;
  onCommentsClick?: () => void;
  onFilesClick?: () => void;
}

export function PostActions({
  likesStats,
  commentsCount = 0,
  filesCount = 0,
  onReactionsClick,
  onCommentsClick,
  onFilesClick,
}: PostActionsProps) {
  const [showReactionsBreakdown, setShowReactionsBreakdown] = useState(false);

  const totalReactions = likesStats?.total || 0;

  const reactions = [
    { emoji: '👍', name: 'Like', count: likesStats?.like || 0 },
    { emoji: '❤️', name: 'Love', count: likesStats?.love || 0 },
    { emoji: '🎉', name: 'Celebrate', count: likesStats?.celebrate || 0 },
    { emoji: '💡', name: 'Insightful', count: likesStats?.insightful || 0 },
  ].filter(r => r.count > 0);

  return (
    <div className="border-t border-gray-200 pt-4 mt-4">
      <div className="flex gap-4 text-sm text-gray-600">
        {/* Reactions */}
        <div className="relative flex-1">
          <button
            onClick={() => {
              setShowReactionsBreakdown(!showReactionsBreakdown);
              onReactionsClick?.();
            }}
            className="flex items-center gap-2 hover:text-blue-500 transition-colors w-full justify-center py-2 hover:bg-gray-50 rounded"
          >
            <span className="text-lg">👍</span>
            <span>{totalReactions}</span>
            {totalReactions > 0 && <span className="text-xs">Reactions</span>}
            {totalReactions === 0 && <span className="text-xs">Reactions</span>}
          </button>

          {/* Reactions Breakdown Tooltip */}
          {showReactionsBreakdown && reactions.length > 0 && (
            <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10 w-max">
              <div className="flex flex-col gap-2">
                {reactions.map(r => (
                  <div key={r.name} className="flex items-center gap-2">
                    <span className="text-lg">{r.emoji}</span>
                    <span className="text-sm">{r.count} {r.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Comments */}
        <button
          onClick={onCommentsClick}
          className="flex items-center gap-2 hover:text-blue-500 transition-colors flex-1 justify-center py-2 hover:bg-gray-50 rounded"
        >
          <span className="text-lg">💬</span>
          <span>{commentsCount}</span>
          <span className="text-xs">Comments</span>
        </button>

        {/* Files */}
        <button
          onClick={onFilesClick}
          className="flex items-center gap-2 hover:text-blue-500 transition-colors flex-1 justify-center py-2 hover:bg-gray-50 rounded"
        >
          <span className="text-lg">📎</span>
          <span>{filesCount}</span>
          <span className="text-xs">Files</span>
        </button>
      </div>
    </div>
  );
}
