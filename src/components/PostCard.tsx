import type { Post } from '../services/postService';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getInitial = (name?: string) => {
    return (name || 'U').charAt(0).toUpperCase();
  };

  const colors = ['from-blue-400 to-blue-600', 'from-pink-400 to-pink-600', 'from-green-400 to-green-600', 'from-purple-400 to-purple-600'];
  const userIdString = typeof post.userId === 'object' ? post.userId._id : String(post.userId || '');
  const colorIndex = (userIdString?.charCodeAt(0) || 0) % colors.length;

  const userName = typeof post.userId === 'object' ? post.userId.name : 'Unknown User';

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Post Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${colors[colorIndex]} rounded-full flex items-center justify-center text-white font-bold`}>
          {getInitial(userName)}
        </div>
        <div>
          <div className="font-bold">{userName}</div>
          <div className="text-sm text-gray-500">{formatDate(post.createdAt)}</div>
        </div>
      </div>

      {/* Post Content */}
      <p className="text-gray-800 mb-4">{post.content}</p>

      {/* Post Images */}
      {post.images && post.images.length > 0 && (
        <div className="mb-4">
          {post.images.length === 1 ? (
            <img src={`${window.location.protocol}//${window.location.hostname}:3000/uploads/${post.images[0]}`} alt="post" className="w-full rounded-lg max-h-96 object-cover" />
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {post.images.slice(0, 4).map((img, idx) => (
                <img key={idx} src={`${window.location.protocol}//${window.location.hostname}:3000/uploads/${img}`} alt={`post-${idx}`} className="w-full rounded-lg h-48 object-cover" />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
