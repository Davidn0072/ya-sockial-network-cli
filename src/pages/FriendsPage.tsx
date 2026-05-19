import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { friendService } from '../services/friendService';
import { TopNavbar } from '../components/TopNavbar';

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

export function FriendsPage() {
  const navigate = useNavigate();
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFriendsData();
  }, []);

  const loadFriendsData = async () => {
    setLoading(true);
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
      setLoading(false);
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavbar activeTab="friends" onTabChange={() => {}} />

      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="mb-6">
          <button
            onClick={() => navigate('/profile/view')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            ← Back to Profile
          </button>
        </div>

        <h1 className="text-4xl font-bold mb-8 text-gray-900">FRIENDS</h1>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-600">Loading...</div>
          </div>
        ) : (
          <>
            {/* Friend Requests Section */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">📩 Incoming Requests</h2>
              {friendRequests.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No pending requests</p>
              ) : (
                <div className="space-y-3">
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
            <div className="bg-white rounded-lg shadow-md overflow-hidden p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">👫 My Friends ({friends.length})</h2>
              {friends.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No friends yet</p>
              ) : (
                <div className="space-y-3">
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
  );
}
