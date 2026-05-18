import { useState, useEffect, useCallback } from 'react';
import { fetchLikesStats, fetchLikesUsers, REACTION_TYPES } from '../services/likesService';
import styles from './LikesPopup.module.css';

interface LikesStats {
  total: number;
  [key: string]: number;
}

interface User {
  userId: {
    _id: string;
    name: string;
  };
}

interface LikesPopupProps {
  isOpen: boolean;
  targetId: string | null;
  targetType?: string;
  onClose: () => void;
}

export default function LikesPopup({ isOpen, targetId, targetType = 'post', onClose }: LikesPopupProps) {
  const [stats, setStats] = useState<LikesStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedType, setSelectedType] = useState('all');
  const [cursor, setCursor] = useState<string | null>(null);
  const [prevCursors, setPrevCursors] = useState<(string | null)[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  useEffect(() => {
    if (!isOpen || !targetId) return;

    const loadStats = async () => {
      setIsLoadingStats(true);
      const statsData = await fetchLikesStats(targetId, targetType);
      setStats(statsData);
      setIsLoadingStats(false);
    };

    loadStats();
  }, [isOpen, targetId, targetType]);

  const loadUsers = useCallback(async (type: string, currentCursor: string | null = null) => {
    if (!targetId) return;

    setIsLoadingUsers(true);
    const { users: usersData, nextCursor } = await fetchLikesUsers(targetId, type, currentCursor);
    setUsers(usersData);
    setCursor(nextCursor);
    setHasMore(nextCursor !== null && nextCursor !== undefined);
    setIsLoadingUsers(false);
  }, [targetId]);

  useEffect(() => {
    if (!isOpen || !targetId) return;

    loadUsers(selectedType, null);
    setPrevCursors([]);
  }, [isOpen, targetId, selectedType, loadUsers]);

  const handleTypeClick = (type: string) => {
    setSelectedType(type);
    setCursor(null);
    setPrevCursors([]);
  };

  const handleNext = () => {
    if (hasMore && cursor) {
      setPrevCursors([...prevCursors, cursor]);
      loadUsers(selectedType, cursor);
    }
  };

  const handlePrev = () => {
    if (prevCursors.length > 0) {
      const newPrevCursors = [...prevCursors];
      const prevCursor = newPrevCursors.pop();
      setPrevCursors(newPrevCursors);
      loadUsers(selectedType, prevCursor);
    }
  };

  if (!isOpen) return null;

  const total = stats?.total || 0;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <strong className={styles.title}>Reactions</strong>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <hr />

        <div className={styles.summary}>
          {isLoadingStats ? (
            <div className={styles.loading}>Loading stats...</div>
          ) : (
            <>
              <div
                className={`${styles.summaryItem} ${selectedType === 'all' ? styles.selected : ''}`}
                onClick={() => handleTypeClick('all')}
              >
                <strong>All</strong> — {total}
              </div>
              {REACTION_TYPES.map((reaction) => (
                <div
                  key={reaction.type}
                  className={`${styles.summaryItem} ${selectedType === reaction.type ? styles.selected : ''}`}
                  onClick={() => handleTypeClick(reaction.type)}
                >
                  <strong>{reaction.name}</strong> — {stats?.[reaction.type] || 0}
                </div>
              ))}
            </>
          )}
        </div>

        <hr />

        <div className={styles.usersTitle}>
          {selectedType === 'all' ? 'All reactions' : `${selectedType} reactions`}
        </div>

        <div className={styles.usersList}>
          {isLoadingUsers ? (
            <div className={styles.loading}>Loading…</div>
          ) : users.length > 0 ? (
            users.map((user) => (
              <div key={user.userId._id} className={styles.userItem}>
                👤 {user.userId.name || 'User'}
              </div>
            ))
          ) : (
            <div className={styles.emptyMessage}>No reactions yet.</div>
          )}
        </div>

        <div className={styles.pagination}>
          <button
            className={styles.paginationBtn}
            onClick={handlePrev}
            disabled={prevCursors.length === 0}
          >
            Previous
          </button>
          <button
            className={styles.paginationBtn}
            onClick={handleNext}
            disabled={!hasMore}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
