"use client";
import { apiFetch } from "@/lib/api";
import { useState } from "react";

export default function GroupForm() {
  const [inviteToken, setInviteToken] = useState(null);

  const handleSubmit = async (formData) => {
    const payload = Object.fromEntries(formData.entries());

    const data = await apiFetch("/create-group", {
      method: "POST",
      body: payload,
    });

    setInviteToken(data.inviteToken);
    console.log(data.inviteToken)
  };


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

          <form className="space-y-6" action={handleSubmit}>
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
          {inviteToken && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
              <div className="bg-[#1a1a1a] p-6 rounded-lg border border-gray-700 w-[90%] max-w-md">
                <h3 className="text-xl font-semibold text-white mb-3">
                  Invite Link Generated
                </h3>

                <div className="flex items-center gap-2 bg-gray-800 p-2 rounded">
                  <input
                    readOnly
                    value={inviteToken}
                    className="flex-1 bg-transparent text-gray-300 outline-none"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(inviteToken)}
                    className="px-3 py-1 bg-blue-600 rounded text-white text-sm"
                  >
                    Copy
                  </button>
                </div>

                <button
                  onClick={() => setInviteToken(null)}
                  className="mt-4 w-full bg-gray-700 py-2 rounded text-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
