"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  ArrowRight,
  Users,
} from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentSettlements, setRecentSettlements] = useState([]);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const data = await apiFetch("/dashboard/user/summary");
        setUserData(data.user);
        setStats(data.stats);
        setRecentSettlements(data.recentSettlements || []);
      } catch (err) {
        setError(err.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-56 bg-gray-800 rounded-lg" />
          <div className="h-4 w-40 bg-gray-800 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-[#1a1b1b] border border-gray-800 rounded-xl p-6 h-28"
              />
            ))}
          </div>
          <div className="bg-[#1a1b1b] border border-gray-800 rounded-xl p-6 h-64" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-24">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <span className="text-red-400 text-3xl">!</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-400 mb-6 text-center max-w-md">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  const hasGroups = stats?.totalGroups > 0;
  const userName = userData?.name?.split(" ")[0] || "there";

  const totalSpent = stats?.totalSpent ?? 0;
  const youOwe = stats?.youOwe ?? 0;
  const youAreOwed = stats?.youAreOwed ?? 0;

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {userName}
        </h1>
        <p className="text-gray-400 mb-8">Here's your expense overview</p>
      </motion.div>

      {!hasGroups ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mb-6">
            <Users className="w-12 h-12 text-cyan-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">No groups yet</h2>
          <p className="text-gray-400 mb-8 text-center max-w-md">
            Create your first group to start splitting expenses with friends
          </p>
          <Link
            href="/dashboard/groups/create"
            className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            <span>Create Your First Group</span>
          </Link>
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          <motion.div
            variants={item}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="bg-[#1a1b1b] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm font-medium">Total Spent</p>
                <div className="w-2 h-2 rounded-full bg-blue-500" />
              </div>
              <p className="text-3xl font-bold text-blue-400">
                ₹{totalSpent.toLocaleString()}
              </p>
            </div>

            <div className="bg-[#1a1b1b] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm font-medium">You Owe</p>
                <div className="w-2 h-2 rounded-full bg-red-500" />
              </div>
              <p className="text-3xl font-bold text-red-400">
                ₹{youOwe.toLocaleString()}
              </p>
            </div>

            <div className="bg-[#1a1b1b] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm font-medium">You Are Owed</p>
                <div className="w-2 h-2 rounded-full bg-green-500" />
              </div>
              <p className="text-3xl font-bold text-green-400">
                ₹{youAreOwed.toLocaleString()}
              </p>
            </div>
          </motion.div>

          {/* Recent Settlements */}
          <motion.div variants={item}>
            <div className="bg-[#1a1b1b] border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">
                  Recent Settlements
                </h2>
              </div>

              {recentSettlements.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-6">
                  No recent settlements to show.
                </p>
              ) : (
                <>
                  <div className="space-y-3">
                    <AnimatePresence initial={false}>
                      {recentSettlements.map((settlement, index) => (
                        <motion.div
                          key={settlement.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: index * 0.04 }}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer group"
                        >
                          <div
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              settlement.isSettled
                                ? "bg-green-500"
                                : settlement.direction === "you_paid"
                                  ? "bg-blue-500"
                                  : "bg-yellow-500"
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-200 text-sm group-hover:text-white transition-colors truncate">
                              {settlement.direction === "you_paid"
                                ? `You paid ${settlement.to}`
                                : `${settlement.from} paid you`}{" "}
                              — ₹{settlement.amount.toLocaleString()}
                              {settlement.isSettled && (
                                <span className="ml-2 text-xs text-green-400 font-medium">
                                  Settled
                                </span>
                              )}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {new Date(
                                settlement.createdAt,
                              ).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* Stats Overview */}
          <motion.div variants={item}>
            <div className="bg-[#1a1b1b] border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {stats?.totalGroups ?? 0}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">Total Groups</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">
                    ₹{totalSpent.toLocaleString()}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">Total Spent</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-400">
                    ₹{youOwe.toLocaleString()}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">You Owe</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">
                    ₹{youAreOwed.toLocaleString()}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">You Are Owed</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={item} className="flex flex-wrap gap-4">
            <Link
              href="/dashboard/groups/create"
              className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 shadow-lg shadow-cyan-500/20"
            >
              <Plus className="w-5 h-5" />
              <span>Create Group</span>
            </Link>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
