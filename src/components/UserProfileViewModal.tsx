import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';

interface UserProfileViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

interface UserProfile {
  _id: string;
  name: string;
  email?: string;
  domainofinterest?: string[];
  createdAt?: string;
}

export function UserProfileViewModal({ isOpen, onClose, userId }: UserProfileViewModalProps) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      loadProfile();
    }
  }, [isOpen, userId]);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getUserProfile(userId);
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    onClose();
    navigate('/profile/edit');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between rounded-t-lg">
          <h2 className="text-xl font-bold">פרטי משתמש</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-600">טוען...</div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
              {error}
            </div>
          ) : profile ? (
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-sm font-semibold text-gray-600">שם</label>
                <p className="text-gray-800 text-lg">{profile.name}</p>
              </div>

              {/* Email */}
              {profile.email && (
                <div>
                  <label className="text-sm font-semibold text-gray-600">דוא״ל</label>
                  <p className="text-gray-800">{profile.email}</p>
                </div>
              )}

              {/* Domains of Interest */}
              {profile.domainofinterest && profile.domainofinterest.length > 0 && (
                <div>
                  <label className="text-sm font-semibold text-gray-600">תחומי עניין</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.domainofinterest.map((domain, idx) => (
                      <span
                        key={idx}
                        className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full"
                      >
                        {domain}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Member Since */}
              {profile.createdAt && (
                <div>
                  <label className="text-sm font-semibold text-gray-600">חבר מאז</label>
                  <p className="text-gray-800">
                    {new Date(profile.createdAt).toLocaleDateString('he-IL', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex gap-3 rounded-b-lg border-t">
          <button
            onClick={handleEdit}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            ✏️ עריכה
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition font-medium"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
}
