export function ProfileContent() {
  return (
    <div className="max-w-3xl mx-auto py-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        {/* Cover Photo */}
        <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-600"></div>

        {/* Profile Info */}
        <div className="px-6 py-6 relative">
          <div className="flex items-end gap-6 mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full border-4 border-white -mt-12"></div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">David N</h1>
              <p className="text-gray-600">@davidn0072</p>
            </div>
          </div>

          <p className="text-gray-700 mb-4">
            Full Stack Developer | Tech Enthusiast | Coffee Lover ☕
          </p>

          <div className="grid grid-cols-4 gap-4 py-4 border-t border-b border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold">45</div>
              <div className="text-sm text-gray-600">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">328</div>
              <div className="text-sm text-gray-600">Friends</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">1.2K</div>
              <div className="text-sm text-gray-600">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">523</div>
              <div className="text-sm text-gray-600">Likes</div>
            </div>
          </div>
        </div>
      </div>

      {/* User Posts */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-6">My Posts</h2>

        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="border-b pb-4 last:border-b-0">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-400 rounded-full"></div>
                <div>
                  <div className="font-bold">David N</div>
                  <div className="text-xs text-gray-500">Posted 3 days ago</div>
                </div>
              </div>
              <p className="text-gray-700 mb-2">
                This is my post content. I'm sharing my thoughts and experiences with the community!
              </p>
              <div className="flex gap-2 text-sm text-gray-600">
                <span>👍 42 Likes</span>
                <span>💬 12 Comments</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
