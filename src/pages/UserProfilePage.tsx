import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import { TopNavbar } from '../components/TopNavbar';

interface UserProfile {
  _id: string;
  name: string;
  email?: string;
  domainofinterest?: string[];
  createdAt?: string;
}

export function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadUserProfile();
    }
  }, [userId]);

  const loadUserProfile = async () => {
    if (!userId) return;

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

  const colorIndex = profile ? getColorIndex(profile._id) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavbar activeTab="profile" onTabChange={() => {}} />

      <div className="max-w-3xl mx-auto py-8 px-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-600 text-lg">Loading profile...</div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Back to Feed
            </button>
          </div>
        ) : profile ? (
          <>
            {/* Profile Header Card */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              {/* Cover Background with Profile Info */}
              <div className="h-56 bg-gradient-to-r from-blue-400 to-purple-600 rounded-t-lg relative flex items-end p-8">
                {/* Avatar */}
                <div
                  className={`w-32 h-32 bg-gradient-to-br ${colors[colorIndex]} rounded-full flex items-center justify-center text-white text-5xl font-bold border-4 border-white shadow-lg`}
                >
                  {getInitial(profile.name)}
                </div>

                {/* User Info in Blue Area */}
                <div className="flex-1 ml-8 text-white mb-2">
                  <h1 className="text-4xl font-bold mb-2">{profile.name}</h1>
                  <p className="text-blue-100 text-lg">{profile.email}</p>
                </div>
              </div>

              {/* Profile Details Grid */}
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Member Since Section */}
                  {profile.createdAt && (
                    <div>
                      <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                        Member Since
                      </label>
                      <p className="text-lg text-gray-800 mt-2">
                        {new Date(profile.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Interests Section */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Domains of Interest</h2>

              {profile.domainofinterest && profile.domainofinterest.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {profile.domainofinterest.map((domain, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-100 text-blue-800 text-sm font-medium px-4 py-2 rounded-full"
                    >
                      {domain}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No domains of interest specified yet</p>
              )}
            </div>

            {/* Back Button */}
            <div className="mt-8">
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Back to Feed
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
