export function FeedContent() {
  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      {/* Post 1 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full"></div>
          <div>
            <div className="font-bold">John Doe</div>
            <div className="text-sm text-gray-500">2 hours ago</div>
          </div>
        </div>

        <p className="text-gray-800 mb-4">
          Just finished an amazing project! Feeling excited about what's coming next 🚀
        </p>

        <div className="bg-gray-200 h-48 rounded-lg mb-4 flex items-center justify-center">
          <span className="text-gray-600">[Post Image]</span>
        </div>

        <div className="flex justify-between text-gray-600 pt-4 border-t">
          <button className="hover:text-blue-500 transition">👍 Like</button>
          <button className="hover:text-blue-500 transition">💬 Comment</button>
          <button className="hover:text-blue-500 transition">↗️ Share</button>
        </div>
      </div>

      {/* Post 2 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full"></div>
          <div>
            <div className="font-bold">Jane Smith</div>
            <div className="text-sm text-gray-500">5 hours ago</div>
          </div>
        </div>

        <p className="text-gray-800 mb-4">
          Love connecting with people on this platform! 💙
        </p>

        <div className="flex justify-between text-gray-600 pt-4 border-t">
          <button className="hover:text-blue-500 transition">👍 Like</button>
          <button className="hover:text-blue-500 transition">💬 Comment</button>
          <button className="hover:text-blue-500 transition">↗️ Share</button>
        </div>
      </div>

      {/* Post 3 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full"></div>
          <div>
            <div className="font-bold">Mike Johnson</div>
            <div className="text-sm text-gray-500">1 day ago</div>
          </div>
        </div>

        <p className="text-gray-800 mb-4">
          Check out this awesome technology stack I've been working with!
        </p>

        <div className="flex justify-between text-gray-600 pt-4 border-t">
          <button className="hover:text-blue-500 transition">👍 Like</button>
          <button className="hover:text-blue-500 transition">💬 Comment</button>
          <button className="hover:text-blue-500 transition">↗️ Share</button>
        </div>
      </div>
    </div>
  );
}
