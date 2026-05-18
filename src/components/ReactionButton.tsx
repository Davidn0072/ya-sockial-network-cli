import { useState } from 'react';

interface ReactionButtonProps {
  targetId: string;
  targetType: 'post' | 'comment';
  onReactionSuccess?: () => void;
  onViewReactions?: () => void;
}

const REACTION_TYPES = [
  { type: 'like', label: '👍', name: 'Like' },
  { type: 'love', label: '❤️', name: 'Love' },
  { type: 'celebrate', label: '🎉', name: 'Celebrate' },
  { type: 'insightful', label: '💡', name: 'Insightful' },
  { type: 'funny', label: '😄', name: 'Funny' }
];

export function ReactionButton({
  targetId,
  targetType,
  onReactionSuccess,
  onViewReactions
}: ReactionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleReactionClick = async (reactionType: string) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token || '',
        },
        body: JSON.stringify({
          targetId,
          targetType,
          type: reactionType,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to add reaction'}`);
        return;
      }

      console.log(`✓ Reaction ${reactionType} added to ${targetType} ${targetId}`);
      setIsOpen(false);

      if (onReactionSuccess) {
        onReactionSuccess();
      }
    } catch (error) {
      alert(`Error adding reaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Reaction error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Emoji Button */}
      <button
        onClick={() => setIsOpen(true)}
        disabled={isLoading}
        className="text-xl hover:scale-125 transition-transform disabled:opacity-50 cursor-pointer"
        title="React"
      >
        👍
      </button>

      {/* Popup Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Popup Container */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            <div className="bg-white rounded-lg shadow-2xl p-4 border border-gray-200">
              {/* Emojis Row */}
              <div className="flex gap-4 pb-3 border-b border-gray-200 justify-center">
                {REACTION_TYPES.map((reaction) => (
                  <button
                    key={reaction.type}
                    onClick={() => handleReactionClick(reaction.type)}
                    disabled={isLoading}
                    title={reaction.name}
                    className="text-3xl hover:scale-150 transition-transform disabled:opacity-50 cursor-pointer"
                  >
                    {reaction.label}
                  </button>
                ))}
              </div>

              {/* Who Reacted Button */}
              {onViewReactions && (
                <button
                  onClick={() => {
                    onViewReactions();
                    setIsOpen(false);
                  }}
                  className="w-full text-center px-3 py-2 text-sm text-blue-600 hover:bg-gray-50 transition-colors font-medium"
                >
                  👥 Who Reacted
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
