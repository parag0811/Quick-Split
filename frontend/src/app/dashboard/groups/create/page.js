'use client';

export default function GroupForm() {
  return (
    <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Create a New Group
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Fill in the details below to create your group
            </p>
          </div>

          <form className="space-y-6">
            {/* Group Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Group Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition placeholder-gray-500"
                placeholder="Enter group name"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows="4"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none placeholder-gray-500"
                placeholder="Describe your group (optional)"
              ></textarea>
              <p className="mt-1 text-xs text-gray-500">
                Help others understand what this group is about
              </p>
            </div>

            {/* Privacy Setting */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Privacy Settings
              </label>
              <div className="space-y-3">
                <div className="flex items-start">
                  <input
                    type="radio"
                    id="private"
                    name="isPrivate"
                    value="true"
                    defaultChecked
                    className="mt-1 h-4 w-4 text-blue-500 focus:ring-blue-500 bg-gray-800 border-gray-600 cursor-pointer"
                  />
                  <div className="ml-3">
                    <label
                      htmlFor="private"
                      className="block text-sm font-medium text-white cursor-pointer"
                    >
                      Private Group
                    </label>
                    <p className="text-xs text-gray-500">
                      Only invited members can join this group
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <input
                    type="radio"
                    id="public"
                    name="isPrivate"
                    value="false"
                    className="mt-1 h-4 w-4 text-blue-500 focus:ring-blue-500 bg-gray-800 border-gray-600 cursor-pointer"
                  />
                  <div className="ml-3">
                    <label
                      htmlFor="public"
                      className="block text-sm font-medium text-white cursor-pointer"
                    >
                      Public Group
                    </label>
                    <p className="text-xs text-gray-500">
                      Anyone can discover and join this group
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Invite Token Option */}
            <div className="border-t border-gray-800 pt-6">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="inviteToken"
                  name="inviteToken"
                  defaultChecked
                  className="mt-1 h-4 w-4 text-blue-500 focus:ring-blue-500 bg-gray-800 border-gray-600 rounded cursor-pointer"
                />
                <div className="ml-3">
                  <label
                    htmlFor="inviteToken"
                    className="block text-sm font-medium text-white cursor-pointer"
                  >
                    Generate Invite Link
                  </label>
                  <p className="text-xs text-gray-500">
                    Create a shareable invite link for this group
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-800">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition cursor-pointer"
              >
                Create Group
              </button>
              <button
                type="button"
                className="w-full sm:w-auto px-6 py-2.5 bg-gray-800 text-gray-300 font-medium rounded-lg border border-gray-700 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-900 transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}