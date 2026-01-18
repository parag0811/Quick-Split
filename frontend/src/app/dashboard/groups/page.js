"use client";
import { Plus, Users } from "lucide-react";

export default function GroupList() {
  const groups = [
    {
      _id: "1",
      name: "Weekend Trip Planning",
      description: "Planning our upcoming mountain trip expenses",
      members: [
        { user: "user1", joinedAt: new Date() },
        { user: "user2", joinedAt: new Date() },
        { user: "user3", joinedAt: new Date() },
        { user: "user4", joinedAt: new Date() },
        { user: "user5", joinedAt: new Date() },
      ],
      createdBy: "user1",
    },
    {
      _id: "2",
      name: "Apartment Expenses",
      description: "Shared apartment utilities and groceries",
      members: [
        { user: "user1", joinedAt: new Date() },
        { user: "user2", joinedAt: new Date() },
        { user: "user3", joinedAt: new Date() },
      ],
      createdBy: "user1",
    },
    {
      _id: "3",
      name: "Office Lunch Group",
      description: "Daily lunch orders and coffee runs",
      members: [
        { user: "user1", joinedAt: new Date() },
        { user: "user2", joinedAt: new Date() },
        { user: "user3", joinedAt: new Date() },
        { user: "user4", joinedAt: new Date() },
        { user: "user5", joinedAt: new Date() },
        { user: "user6", joinedAt: new Date() },
        { user: "user7", joinedAt: new Date() },
        { user: "user8", joinedAt: new Date() },
      ],
      createdBy: "user2",
    },
    {
      _id: "4",
      name: "Birthday Party",
      description: "Sarah's surprise birthday party planning",
      members: [
        { user: "user1", joinedAt: new Date() },
        { user: "user2", joinedAt: new Date() },
        { user: "user3", joinedAt: new Date() },
        { user: "user4", joinedAt: new Date() },
        { user: "user5", joinedAt: new Date() },
        { user: "user6", joinedAt: new Date() },
      ],
      createdBy: "user3",
    },
    {
      _id: "5",
      name: "Gym Membership",
      description: "Shared gym and fitness expenses",
      members: [
        { user: "user1", joinedAt: new Date() },
        { user: "user2", joinedAt: new Date() },
      ],
      createdBy: "user1",
    },
    {
      _id: "6",
      name: "Study Group",
      description: "Books and study material costs",
      members: [
        { user: "user1", joinedAt: new Date() },
        { user: "user2", joinedAt: new Date() },
        { user: "user3", joinedAt: new Date() },
        { user: "user4", joinedAt: new Date() },
      ],
      createdBy: "user4",
    },
  ];

  const showEmptyState = false;

  const getGroupColor = (name) => {
    const colors = [
      "bg-purple-600",
      "bg-rose-600",
      "bg-pink-600",
      "bg-teal-600",
      "bg-indigo-600",
      "bg-cyan-600",
      "bg-blue-600",
      "bg-emerald-600",
      "bg-amber-600",
      "bg-violet-600",
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  const getGroupEmoji = (name) => {
    const emojis = ["🎯", "💼", "⚙️", "💰", "💻", "🎨", "🎉", "📚", "🏋️", "🌟"];
    const index = name.length % emojis.length;
    return emojis[index];
  };

  return (
    <div className="w-full min-h-screen bg-[#0f0f0f] p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Groups</h1>
            <p className="text-gray-400">
              Manage and track your group expenses
            </p>
          </div>
          <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-pink-900/30 hover:shadow-pink-900/50">
            <Plus size={20} />
            <span className="cursor-pointer">Create Group</span>
          </button>
        </div>

        {!showEmptyState ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {groups.map((group) => {
              const color = getGroupColor(group.name);
              const emoji = getGroupEmoji(group.name);

              return (
                <div
                  key={group._id}
                  className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-5 hover:border-gray-700 hover:shadow-lg hover:shadow-black/20 transition-all duration-200 cursor-pointer group"
                >
                  {/* Group Icon & Name */}
                  <div className="flex items-start space-x-3 mb-4">
                    <div
                      className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition-transform shadow-lg`}
                    >
                      {emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-white mb-1 truncate group-hover:text-cyan-400 transition-colors">
                        {group.name}
                      </h3>
                      <div className="flex items-center space-x-1.5 text-sm text-gray-400">
                        <Users size={14} />
                        <span>
                          {group.members.length} member{group.members.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {group.description && (
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {group.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl">
            <div className="flex flex-col items-center justify-center py-32 px-4">
              <div className="w-28 h-28 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center mb-6 shadow-xl">
                <Users size={56} className="text-gray-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-300 mb-3">
                You're not part of any group yet
              </h3>
              <p className="text-gray-500 mb-10 text-center max-w-md text-base">
                Create your first group to start splitting expenses with friends,
                family, or colleagues
              </p>
              <button className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-pink-900/30 hover:shadow-pink-900/50 hover:scale-105">
                <Plus size={22} />
                <span className="text-base">Create your first group</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}