"use client";
import { motion } from "framer-motion";
import { Plus, TrendingUp, ArrowRight, Users, Receipt } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const summary = {
    youOwe: 1200,
    youAreOwed: 3500,
    netBalance: 2300,
  };

  const recentActivity = [
    {
      id: 1,
      text: "You paid ₹500 in Goa Trip",
      time: "2 hours ago",
      type: "payment",
    },
    {
      id: 2,
      text: "Rahul added Dinner expense",
      time: "5 hours ago",
      type: "expense",
    },
    {
      id: 3,
      text: "Settlement completed in Flatmates",
      time: "1 day ago",
      type: "settlement",
    },
    {
      id: 4,
      text: "You added Groceries in Flatmates",
      time: "2 days ago",
      type: "expense",
    },
    {
      id: 5,
      text: "New member joined Office Lunch",
      time: "3 days ago",
      type: "member",
    },
  ];

  const yourGroups = [
    {
      id: 1,
      name: "Goa Trip",
      balance: -800,
      color: "from-purple-500 to-pink-500",
    },
    {
      id: 2,
      name: "Flatmates",
      balance: 1200,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: 3,
      name: "Office Lunch",
      balance: 0,
      color: "from-green-500 to-emerald-500",
    },
  ];

  const hasGroups = yourGroups.length > 0;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, Janice
        </h1>
        <p className="text-gray-400 mb-8">Here's your expense overview</p>
      </motion.div>

      {!hasGroups ? (
        // Empty State
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
          {/* Summary Cards */}
          <motion.div
            variants={item}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {/* You Owe */}
            <div className="bg-[#1a1b1b] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm font-medium">You owe</p>
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
              </div>
              <p className="text-3xl font-bold text-red-400">
                ₹{summary.youOwe.toLocaleString()}
              </p>
            </div>

            {/* You Are Owed */}
            <div className="bg-[#1a1b1b] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm font-medium">
                  You are owed
                </p>
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
              </div>
              <p className="text-3xl font-bold text-green-400">
                ₹{summary.youAreOwed.toLocaleString()}
              </p>
            </div>

            {/* Net Balance */}
            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-500/30 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm font-medium">Net balance</p>
                <TrendingUp className="w-4 h-4 text-cyan-400" />
              </div>
              <p className="text-3xl font-bold text-cyan-400">
                {summary.netBalance >= 0 ? "+" : ""}₹
                {summary.netBalance.toLocaleString()}
              </p>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={item}>
            <div className="bg-[#1a1b1b] border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">
                  Recent Activity
                </h2>
                <Link
                  href="/dashboard/activity"
                  className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors"
                >
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer group"
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        activity.type === "payment"
                          ? "bg-blue-500"
                          : activity.type === "settlement"
                            ? "bg-green-500"
                            : activity.type === "expense"
                              ? "bg-yellow-500"
                              : "bg-purple-500"
                      }`}
                    ></div>
                    <div className="flex-1">
                      <p className="text-gray-200 text-sm group-hover:text-white transition-colors">
                        {activity.text}
                      </p>
                      <p className="text-gray-500 text-xs">{activity.time}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors" />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Your Groups */}
          <motion.div variants={item}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Your Groups</h2>
              <Link
                href="/dashboard/groups"
                className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors flex items-center space-x-1"
              >
                <span>View all</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {yourGroups.map((group, index) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href={`/dashboard/groups/${group.id}`}
                    className="block bg-[#1a1b1b] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`w-12 h-12 rounded-lg bg-gradient-to-br ${group.color} flex items-center justify-center`}
                      >
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-cyan-400 transition-colors" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                      {group.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {group.balance === 0 ? (
                        <span className="text-gray-400 text-sm font-medium">
                          Settled
                        </span>
                      ) : group.balance > 0 ? (
                        <>
                          <span className="text-green-400 text-sm font-medium">
                            You get
                          </span>
                          <span className="text-green-400 font-bold">
                            ₹{Math.abs(group.balance).toLocaleString()}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-red-400 text-sm font-medium">
                            You owe
                          </span>
                          <span className="text-red-400 font-bold">
                            ₹{Math.abs(group.balance).toLocaleString()}
                          </span>
                        </>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Primary Actions */}
          <motion.div variants={item} className="flex flex-wrap gap-4">
            <Link
              href="/dashboard/groups/create"
              className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 shadow-lg shadow-cyan-500/20"
            >
              <Plus className="w-5 h-5" />
              <span>Create Group</span>
            </Link>
            <Link
              href="/dashboard/expenses/add"
              className="flex items-center space-x-2 bg-[#1a1b1b] border border-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 hover:border-gray-600 transition-all duration-200"
            >
              <Receipt className="w-5 h-5" />
              <span>Add Expense</span>
            </Link>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
