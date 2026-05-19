import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/userService';
import { friendService } from '../services/friendService';
import { TopNavbar } from '../components/TopNavbar';

interface UserProfile {
  _id: string;
  name: string;
  email?: string;
  domainofinterest?: string[];
  createdAt?: string;
}

interface FriendRequest {
  _id: string;
  name: string;
  email?: string;
}

interface Friend {
  _id: string;
  name: string;
  email?: string;
}

export function ViewProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [showFriends, setShowFriends] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadProfile();
    }
  }, [user?.id]);

  const loadProfile = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);
    try {
      const data = await userService.getUserProfile(user.id);
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate('/profile/edit');
  };

  const loadFriendsData = async () => {
    setFriendsLoading(true);
    try {
      const [requestsData, friendsData] = await Promise.all([
        friendService.getFriendRequests(),
        friendService.getFriends()
      ]);
      setFriendRequests(Array.isArray(requestsData) ? requestsData : requestsData.requests || []);
      setFriends(Array.isArray(friendsData) ? friendsData : friendsData.friends || []);
    } catch (err) {
      console.error('Failed to load friends data:', err);
    } finally {
      setFriendsLoading(false);
    }
  };

  const handleShowFriends = () => {
    setShowFriends(true);
    loadFriendsData();
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await friendService.acceptRequest(requestId);
      loadFriendsData();
    } catch (err) {
      console.error('Failed to accept request:', err);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await friendService.rejectRequest(requestId);
      loadFriendsData();
    } catch (err) {
      console.error('Failed to reject request:', err);
    }
  };

  const handleUnfriend = async (friendId: string) => {
    try {
      await friendService.unfriend(friendId);
      loadFriendsData();
    } catch (err) {
      console.error('Failed to unfriend:', err);
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
            <div className="mb-6 flex gap-4">
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                ← Back
              </button>
              <button
                onClick={handleEdit}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                ✏️ Edit Profile
              </button>
              <button
                onClick={handleShowFriends}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                👥 FRIEND
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-56 bg-gradient-to-r from-blue-400 to-purple-600 rounded-t-lg relative flex items-end p-8">
                <div
                  className={`w-32 h-32 bg-gradient-to-br ${colors[colorIndex]} rounded-full flex items-center justify-center text-white text-5xl font-bold border-4 border-white shadow-lg`}
                >
                  {getInitial(profile.name)}
                </div>

                <div className="flex-1 ml-8 text-white mb-2">
                  <h1 className="text-4xl font-bold mb-2">{profile.name}</h1>
                  <p className="text-blue-100 text-lg">{profile.email}</p>
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

                  {profile.domainofinterest && profile.domainofinterest.length > 0 && (
                    <div>
                      <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                        Domains of Interest
                      </label>
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
                </div>
              </div>
            </div>

            {/* Friends Management Modal */}
            {showFriends && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold">👥 Friend Management</h2>
                    <button
                      onClick={() => setShowFriends(false)}
                      className="text-gray-500 hover:text-gray-700 font-bold text-2xl"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="p-6">
                    {friendsLoading ? (
                      <div className="text-center py-8">
                        <div className="text-gray-600">Loading...</div>
                      </div>
                    ) : (
                      <>
                        {/* Friend Requests Section */}
                        <div className="mb-8">
                          <h3 className="text-xl font-bold mb-4 text-gray-800">📩 Incoming Requests</h3>
                          {friendRequests.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No pending requests</p>
                          ) : (
                            <div className="space-y-2">
                              {friendRequests.map((req) => (
                                <div
                                  key={req._id}
                                  className="flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-200"
                                >
                                  <div>
                                    <p className="font-semibold text-gray-800">{req.name}</p>
                                    <p className="text-sm text-gray-600">{req.email}</p>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleAcceptRequest(req._id)}
                                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                    >
                                      ✓ Accept
                                    </button>
                                    <button
                                      onClick={() => handleRejectRequest(req._id)}
                                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                    >
                                      ✕ Reject
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Friends List Section */}
                        <div>
                          <h3 className="text-xl font-bold mb-4 text-gray-800">👫 My Friends ({friends.length})</h3>
                          {friends.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No friends yet</p>
                          ) : (
                            <div className="space-y-2">
                              {friends.map((friend) => (
                                <div
                                  key={friend._id}
                                  className="flex items-center justify-between bg-green-50 p-4 rounded-lg border border-green-200"
                                >
                                  <div>
                                    <p className="font-semibold text-gray-800">{friend.name}</p>
                                    <p className="text-sm text-gray-600">{friend.email}</p>
                                  </div>
                                  <button
                                    onClick={() => handleUnfriend(friend._id)}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                                  >
                                    💔 Unfriend
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
