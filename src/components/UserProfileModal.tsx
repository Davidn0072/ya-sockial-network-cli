import { useState, useEffect } from 'react';
import { userService } from '../services/userService';

interface UserProfileModalProps {
  isOpen: boolean;
  userId: string;
  userName: string;
  onClose: () => void;
}

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  domainofinterest: string[];
  createdAt?: string;
}

export function UserProfileModal({ isOpen, userId, userName, onClose }: UserProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      loadUserProfile();
    }
  }, [isOpen, userId]);

  const loadUserProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getUserProfile(userId);
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const colors = [
    'from-blue-400 to-blue-600',
    'from-pink-400 to-pink-600',
    'from-green-400 to-green-600',
    'from-purple-400 to-purple-600',
    'from-red-400 to-red-600',
    'from-yellow-400 to-yellow-600',
    'from-indigo-400 to-indigo-600',
    'from-orange-400 to-orange-600',
  ];

  const getColorIndex = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash) + id.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash) % colors.length;
  };

  const colorIndex = getColorIndex(userId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">User Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading profile...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
            </div>
          ) : profile ? (
            <div className="space-y-6">
              {/* Avatar and Name */}
              <div className="flex items-center gap-4">
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${colors[colorIndex]} rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0`}
                >
                  {getInitial(profile.name)}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{profile.name}</h3>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-semibold text-gray-600">Email</label>
                <p className="text-gray-800 mt-1">{profile.email}</p>
              </div>

              {/* Interests/Domains */}
              <div>
                <label className="text-sm font-semibold text-gray-600">Domains of Interest</label>
                {profile.domainofinterest && profile.domainofinterest.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.domainofinterest.map((domain, idx) => (
                      <span
                        key={idx}
                        className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full"
                      >
                        {domain}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 mt-1">No domains of interest specified</p>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Close Button */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
