import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { friendService } from '../services/friendService';
import { userService } from '../services/userService';
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

interface User {
  _id: string;
  name: string;
  email?: string;
}

export function FriendsPage() {
  const navigate = useNavigate();
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [rejectedFriends, setRejectedFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [sendMessage, setSendMessage] = useState<string | null>(null);

  useEffect(() => {
    loadFriendsData();
  }, []);

  const loadFriendsData = async () => {
    setLoading(true);
    try {
      const [requestsData, friendsData, rejectedData] = await Promise.all([
        friendService.getFriendRequests(),
        friendService.getFriends(),
        friendService.getRejectedFriends()
      ]);
      setFriendRequests(Array.isArray(requestsData) ? requestsData : requestsData.requests || []);
      setFriends(Array.isArray(friendsData) ? friendsData : friendsData.friends || []);
      setRejectedFriends(Array.isArray(rejectedData) ? rejectedData : rejectedData.friends || []);
    } catch (err) {
      console.error('Failed to load friends data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const result = await userService.searchUsers(query);
      setSearchResults(result.users || []);
    } catch (err) {
      console.error('Failed to search users:', err);
      setSearchResults([]);
    }
  };

  const handleSendFriendRequest = async () => {
    if (!selectedUser) {
      setSendMessage('Please select a user');
      return;
    }

    setSendingRequest(true);
    setSendMessage(null);
    try {
      await friendService.sendFriendRequest(selectedUser._id);
      setSendMessage('✓ Friend request sent!');
      setSelectedUser(null);
      setSearchQuery('');
      setSearchResults([]);
      setTimeout(() => setSendMessage(null), 3000);
    } catch (err) {
      setSendMessage(err instanceof Error ? err.message : 'Failed to send friend request');
    } finally {
      setSendingRequest(false);
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
      <TopNavbar activeTab="profile" onTabChange={() => {}} />

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

        {/* Send Friend Request Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">📤 Send Friend Request</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search User</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Type name or email..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <div className="max-h-48 overflow-y-auto">
                  {searchResults.map((user) => (
                    <button
                      key={user._id}
                      onClick={() => {
                        setSelectedUser(user);
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                      className={`w-full px-4 py-3 text-left border-b last:border-b-0 transition-colors ${
                        selectedUser?._id === user._id
                          ? 'bg-blue-500 text-white'
                          : 'bg-white hover:bg-gray-100'
                      }`}
                    >
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm opacity-75">{user.email}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selected User Display */}
            {selectedUser && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Selected User:</p>
                <p className="font-semibold text-gray-800">{selectedUser.name}</p>
                <p className="text-sm text-gray-600">{selectedUser.email}</p>
              </div>
            )}

            {/* Send Button */}
            <button
              onClick={handleSendFriendRequest}
              disabled={!selectedUser || sendingRequest}
              className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                selectedUser && !sendingRequest
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-300 text-gray-600 cursor-not-allowed'
              }`}
            >
              {sendingRequest ? 'Sending...' : '📤 SEND'}
            </button>

            {/* Message */}
            {sendMessage && (
              <div className={`p-3 rounded-lg text-center ${
                sendMessage.includes('✓')
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {sendMessage}
              </div>
            )}
          </div>
        </div>

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
            <div className="bg-white rounded-lg shadow-md overflow-hidden p-8 mb-8">
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

            {/* Rejected Friends Section */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">❌ Rejected Friends ({rejectedFriends.length})</h2>
              {rejectedFriends.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No rejected friends</p>
              ) : (
                <div className="space-y-3">
                  {rejectedFriends.map((friend) => (
                    <div
                      key={friend._id}
                      className="flex items-center justify-between bg-red-50 p-4 rounded-lg border border-red-200"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">{friend.name}</p>
                        <p className="text-sm text-gray-600">{friend.email}</p>
                      </div>
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
