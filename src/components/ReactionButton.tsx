import { useState, useRef, useEffect } from 'react';
import config from '../config';
import { authService } from '../services/authService';
import { getServerErrorMessage } from '../utils/apiError';

interface ReactionButtonProps {
  targetId: string;
  targetType: 'post' | 'comment';
  onReactionSuccess?: () => void;
  onViewReactions?: () => void;
  action?: 'reactions-list' | 'both'; // 'reactions-list' = thumb only, 'both' = with "Who Reacted" button
  className?: string;
}

interface ReactionCountProps {
  count: number;
  onClick?: () => void;
}

const REACTION_TYPES = [
  { type: 'like', label: '👍', name: 'Like' },
  { type: 'love', label: '❤️', name: 'Love' },
  { type: 'celebrate', label: '🎉', name: 'Celebrate' },
  { type: 'insightful', label: '💡', name: 'Insightful' },
  { type: 'funny', label: '😄', name: 'Funny' }
];

export function ReactionCount({ count, onClick }: ReactionCountProps) {
  return (
    <button
      onClick={onClick}
      className="text-2xl hover:scale-125 transition-all duration-300 cursor-pointer"
      title="View reactions"
    >
      <span className="font-bold">{count}</span>
    </button>
  );
}

export function ReactionButton({
  targetId,
  targetType,
  onReactionSuccess,
  onViewReactions,
  action = 'both',
  className = '',
}: ReactionButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        buttonRef.current?.contains(target) ||
        popupRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    };

    const timer = window.setTimeout(() => {
      document.addEventListener('mousedown', handleOutsideClick);
    }, 0);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const handleReactionClick = async (reactionType: string) => {
    setIsLoading(true);
    const url = `${config.API_URL}/likes`;
    const requestBody = { targetId, targetType, type: reactionType };

    try {
      const token = authService.getToken();
      if (!token) {
        console.error('Reaction failed — missing token', { url, requestBody });
        alert('Please log in');
        return;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const message = await getServerErrorMessage(response, 'Failed to add reaction');
        console.error('Reaction failed:', message, { status: response.status, url, requestBody });
        alert(message);
        return;
      }

      const result = await response.json();
      console.log(`✓ Reaction ${reactionType} added to ${targetType} ${targetId}`, result);
      setIsOpen(false);

      if (onReactionSuccess) {
        onReactionSuccess();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add reaction';
      console.error('Reaction failed:', error, { url, requestBody });
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPopupPosition({
        top: rect.bottom + 10,
        left: rect.left + rect.width / 2,
      });
    }
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleButtonClick}
        disabled={isLoading}
        className={`text-2xl hover:scale-125 transition-all duration-300 disabled:opacity-50 cursor-pointer ${className}`.trim()}
        title="React"
      >
        👍
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" aria-hidden="true" />

          <div
            ref={popupRef}
            className="fixed z-50"
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              top: `${popupPosition.top}px`,
              left: `${popupPosition.left}px`,
              transform: 'translateX(-50%) scale(1)',
              animation: 'popIn 0.3s ease-out',
            }}
          >
            <style>{`
              @keyframes popIn {
                from {
                  opacity: 0;
                  transform: translateX(-50%) scale(0.8);
                }
                to {
                  opacity: 1;
                  transform: translateX(-50%) scale(1);
                }
              }
            `}</style>
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-xl p-5 border border-gray-150">
              {/* Emojis Row */}
              <div className="flex gap-3 pb-4 border-b border-gray-200 justify-center">
                {REACTION_TYPES.map((reaction) => (
                  <button
                    key={reaction.type}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReactionClick(reaction.type);
                    }}
                    disabled={isLoading}
                    title={reaction.name}
                    className="text-4xl hover:scale-150 transition-transform duration-200 disabled:opacity-50 cursor-pointer transform hover:-translate-y-1"
                  >
                    {reaction.label}
                  </button>
                ))}
              </div>

              {/* Who Reacted Button */}
              {action === 'both' && (
                <button
                  onClick={() => {
                    if (onViewReactions) {
                      onViewReactions();
                    }
                    setIsOpen(false);
                  }}
                  className="w-full text-center px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 transition-colors font-semibold rounded-lg mt-2"
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
