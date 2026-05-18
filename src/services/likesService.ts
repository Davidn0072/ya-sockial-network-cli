const LIKES_API_URL = 'http://localhost:3000/likes';

export const REACTION_TYPES = [
  { type: 'like', label: '👍', name: 'Like' },
  { type: 'love', label: '❤️', name: 'Love' },
  { type: 'celebrate', label: '🎉', name: 'Celebrate' },
  { type: 'insightful', label: '💡', name: 'Insightful' },
  { type: 'funny', label: '😄', name: 'Funny' }
];

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

function getAuthHeaders() {
  return {
    'x-access-token': localStorage.getItem('token') || '',
    'Content-Type': 'application/json'
  };
}

export async function fetchLikesStats(targetId: string, targetType: string = 'post'): Promise<LikesStats | null> {
  try {
    const url = `${LIKES_API_URL}/${encodeURIComponent(targetId)}/stats?targetType=${targetType}`;
    const res = await fetch(url, { headers: getAuthHeaders() });

    if (!res.ok) {
      console.error(`Failed to fetch likes stats: ${res.status}`);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error('Error fetching likes stats:', error);
    return null;
  }
}

export async function fetchLikesUsers(
  targetId: string,
  reactionType: string = 'all',
  cursor: string | null = null
): Promise<{ users: User[]; nextCursor: string | null }> {
  try {
    const params = new URLSearchParams({ limit: '10' });
    if (cursor) params.set('cursor', cursor);

    const url = reactionType === 'all'
      ? `${LIKES_API_URL}/by-type/${encodeURIComponent(targetId)}?${params.toString()}`
      : `${LIKES_API_URL}/by-type/${encodeURIComponent(targetId)}/${encodeURIComponent(reactionType)}?${params.toString()}`;

    const res = await fetch(url, { headers: getAuthHeaders() });

    if (!res.ok) {
      throw new Error(`Failed to fetch users: ${res.status}`);
    }

    const response = await res.json();
    const users = response.users || (Array.isArray(response) ? response : []);
    const nextCursor = response.nextCursor || null;

    return { users, nextCursor };
  } catch (error) {
    console.error('Error fetching likes users:', error);
    return { users: [], nextCursor: null };
  }
}
