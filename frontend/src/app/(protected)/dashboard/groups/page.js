"use client";
import { Plus, Users, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function GroupList() {
  const router = useRouter();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiFetch("/groups/my-groups");
      if (data?.groups && Array.isArray(data.groups)) {
        setGroups(data.groups);
      } else {
        setError("We couldn't load your groups. Please try again.");
        setGroups([]);
      }
    } catch (err) {
      setError(err?.message || "Failed to load groups. Please try again.");
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

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
    return colors[name.length % colors.length];
  };

  const getGroupEmoji = (name) => {
    const emojis = ["🎯", "💼", "⚙️", "💰", "💻", "🎨", "🎉", "📚", "🏋️", "🌟"];
    return emojis[name.length % emojis.length];
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full min-h-screen bg-[#0f0f0f] p-4 sm:p-6 lg:p-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-3xl font-bold text-white mb-2">Groups</h1>
            <p className="text-gray-400">Manage and track your group expenses</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/dashboard/groups/create")}
              className="cursor-pointer flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-pink-900/30 hover:shadow-pink-900/50"
            >
              <Plus size={20} />
              <span>Create Group</span>
            </motion.button>
          </motion.div>
        </motion.div>

        <AnimatePresence mode="wait">
          {!loading && error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col items-center justify-center py-28 px-4"
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-2xl border border-red-500/20 flex items-center justify-center mb-6">
                <span className="text-red-400 text-3xl">!</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Couldn't load groups
              </h2>
              <p className="text-gray-400 text-sm text-center max-w-sm mb-8">
                {error}
              </p>
              <button
                onClick={fetchGroups}
                className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 shadow-lg shadow-cyan-500/20 text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry</span>
              </button>
            </motion.div>
          )}

          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5"
            >
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-5 animate-pulse"
                >
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gray-800 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-800 rounded w-3/4" />
                      <div className="h-3 bg-gray-800 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-3 bg-gray-800 rounded w-full mb-2" />
                  <div className="h-3 bg-gray-800 rounded w-2/3" />
                </div>
              ))}
            </motion.div>
          )}

          {!loading && !error && groups.length > 0 && (
            <motion.div
              key="groups"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5"
            >
              {groups.map((group, index) => {
                const color = getGroupColor(group.name);
                const emoji = getGroupEmoji(group.name);

                return (
                  <motion.div
                    key={group.groupId}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.05 + index * 0.05,
                      type: "spring",
                      stiffness: 200,
                      damping: 20,
                    }}
                    whileHover={{ scale: 1.03, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push(`/dashboard/groups/${group.groupId}`)}
                    className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-5 hover:border-gray-700 hover:shadow-lg hover:shadow-black/20 transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-start space-x-3 mb-4">
                      <motion.div
                        whileHover={{ scale: 1.15, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-2xl flex-shrink-0 shadow-lg`}
                      >
                        {emoji}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-white mb-1 truncate group-hover:text-cyan-400 transition-colors">
                          {group.name}
                        </h3>
                        <div className="flex items-center space-x-1.5 text-sm text-gray-400">
                          <Users size={14} />
                          <span>
                            {group.memberCount} member{group.memberCount !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>

                    {group.description && (
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {group.description}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {!loading && !error && groups.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="bg-[#1a1a1a] border border-gray-800 rounded-xl"
            >
              <div className="flex flex-col items-center justify-center py-32 px-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: 0.2,
                  }}
                  className="w-28 h-28 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center mb-6 shadow-xl"
                >
                  <Users size={56} className="text-gray-600" />
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-2xl font-semibold text-gray-300 mb-3"
                >
                  You're not part of any group yet
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="text-gray-500 mb-10 text-center max-w-md text-base"
                >
                  Create your first group to start splitting expenses with friends,
                  family, or colleagues
                </motion.p>
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5, type: "spring" }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push("/dashboard/groups/create")}
                  className="cursor-pointer flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-pink-900/30 hover:shadow-pink-900/50"
                >
                  <Plus size={22} />
                  <span className="text-base">Create your first group</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}