"use client";

import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Receipt,
  DollarSign,
  ArrowLeft,
  AlertCircle,
  RotateCcw,
  PieChart as PieChartIcon,
  Activity,
} from "lucide-react";
import GroupSocketListener from "@/components/socket/GroupSocketListener";
import { useSelector } from "react-redux";

const CATEGORY_COLORS = {
  food: "#f97316",
  travel: "#3b82f6",
  rent: "#8b5cf6",
  shopping: "#ec4899",
  other: "#6b7280",
};

const CATEGORY_LABELS = {
  food: "Food",
  travel: "Travel",
  rent: "Rent",
  shopping: "Shopping",
  other: "Other",
};

const BAR_COLORS = ["#06b6d4", "#8b5cf6", "#f97316", "#ec4899", "#10b981", "#eab308", "#ef4444", "#3b82f6"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 shadow-xl">
        <p className="text-sm font-medium text-white mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color || "#06b6d4" }}>
            {entry.name}: ₹{Number(entry.value).toFixed(2)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 shadow-xl">
        <p className="text-sm font-medium text-white">{payload[0].name}</p>
        <p className="text-sm text-cyan-400">₹{Number(payload[0].value).toFixed(2)}</p>
        <p className="text-xs text-gray-400">{payload[0].payload.count} expense{payload[0].payload.count !== 1 ? "s" : ""}</p>
      </div>
    );
  }
  return null;
};

export default function GroupAnalyticsPage() {
  const { groupId } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const refreshKey = useSelector((state) => state.group.refreshKey);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError("");
      const response = await apiFetch(`/groups/${groupId}/analytics`);
      setData(response);
    } catch (error) {
      setFetchError(error?.message || "Failed to load analytics. Please try again.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    if (groupId) fetchAnalytics();
  }, [groupId, fetchAnalytics, refreshKey]);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#0f0f0f] p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
          <div className="flex items-start gap-4 mb-8">
            <div className="w-10 h-10 bg-gray-800 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-3 pt-1">
              <div className="h-7 bg-gray-800 rounded w-48" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 h-80" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="w-full min-h-screen bg-[#0f0f0f] p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto flex flex-col items-center justify-center py-28 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center text-center"
          >
            <div className="w-20 h-20 bg-red-500/10 rounded-2xl border border-red-500/20 flex items-center justify-center mb-6">
              <AlertCircle className="w-9 h-9 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Couldn&apos;t load analytics</h2>
            <p className="text-gray-400 text-sm text-center max-w-sm mb-8">{fetchError}</p>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchAnalytics}
                className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 shadow-lg shadow-cyan-500/20 text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry</span>
              </button>
              <button
                onClick={() => router.push(`/dashboard/groups/${groupId}`)}
                className="flex items-center space-x-2 bg-[#1a1a1a] border border-gray-700 text-gray-300 px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-800 hover:border-gray-600 hover:text-white transition-all duration-200 text-sm"
              >
                Back to Group
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const { overview, memberContribution, categoryBreakdown, dailyTrend } = data;

  const pieData = (categoryBreakdown || []).map((item) => ({
    name: CATEGORY_LABELS[item.category] || item.category,
    value: item.total,
    count: item.count,
    color: CATEGORY_COLORS[item.category] || "#6b7280",
  }));

  return (
    <>
    <GroupSocketListener groupId={groupId} />
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full min-h-screen bg-[#0f0f0f] p-4 sm:p-6 lg:p-8"
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => router.push(`/dashboard/groups/${groupId}`)}
              className="w-10 h-10 bg-[#1a1a1a] border border-gray-800 rounded-lg flex items-center justify-center hover:border-gray-600 transition-colors cursor-pointer"
            >
              <ArrowLeft size={18} className="text-gray-400" />
            </motion.button>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {data.group.name} — Analytics
              </h1>
              <p className="text-sm text-gray-400 mt-1">Spending insights & breakdown</p>
            </div>
          </div>
        </motion.div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total Spent",
              value: `₹${overview.totalSpent.toFixed(2)}`,
              icon: DollarSign,
              color: "purple",
              delay: 0.2,
            },
            {
              label: "Expenses",
              value: overview.expenseCount,
              icon: Receipt,
              color: "cyan",
              delay: 0.3,
            },
            {
              label: "Average",
              value: `₹${overview.avgExpense.toFixed(2)}`,
              icon: TrendingUp,
              color: "emerald",
              delay: 0.4,
            },
            {
              label: "Highest",
              value: `₹${overview.maxExpense.toFixed(2)}`,
              icon: Activity,
              color: "amber",
              delay: 0.5,
            },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: stat.delay }}
              whileHover={{ scale: 1.03, y: -5 }}
              className="bg-gradient-to-br from-[#1a1a1a] to-[#151515] border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-gray-400">{stat.label}</div>
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.5 }}
                  className={`w-9 h-9 bg-${stat.color}-600/20 rounded-lg flex items-center justify-center`}
                >
                  <stat.icon size={18} className={`text-${stat.color}-400`} />
                </motion.div>
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: stat.delay + 0.1, type: "spring", stiffness: 200 }}
                className="text-2xl font-bold text-white"
              >
                {stat.value}
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Member Contributions Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-gradient-to-br from-[#1a1a1a] to-[#151515] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all"
          >
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-10 h-10 bg-cyan-600/20 rounded-lg flex items-center justify-center"
              >
                <BarChart3 size={20} className="text-cyan-400" />
              </motion.div>
              <div>
                <h3 className="text-sm font-semibold text-white">Member Contributions</h3>
                <p className="text-xs text-gray-400">Amount paid by each member</p>
              </div>
            </div>

            {memberContribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={memberContribution} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#555"
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#555"
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${v}`}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(6, 182, 212, 0.08)" }} />
                  <Bar dataKey="totalPaid" name="Total Paid" radius={[6, 6, 0, 0]}>
                    {memberContribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-gray-500 text-sm">
                No expense data yet
              </div>
            )}
          </motion.div>

          {/* Category Breakdown Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="bg-gradient-to-br from-[#1a1a1a] to-[#151515] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all"
          >
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center"
              >
                <PieChartIcon size={20} className="text-purple-400" />
              </motion.div>
              <div>
                <h3 className="text-sm font-semibold text-white">Category Breakdown</h3>
                <p className="text-xs text-gray-400">Spending distribution by category</p>
              </div>
            </div>

            {pieData.length > 0 ? (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {pieData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-1.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-xs text-gray-400">
                        {entry.name} (₹{entry.value.toFixed(0)})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-gray-500 text-sm">
                No expense data yet
              </div>
            )}
          </motion.div>
        </div>

        {/* Daily Spending Trend - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="bg-gradient-to-br from-[#1a1a1a] to-[#151515] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all"
        >
          <div className="flex items-center gap-3 mb-6">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-10 h-10 bg-emerald-600/20 rounded-lg flex items-center justify-center"
            >
              <TrendingUp size={20} className="text-emerald-400" />
            </motion.div>
            <div>
              <h3 className="text-sm font-semibold text-white">Daily Spending Trend</h3>
              <p className="text-xs text-gray-400">How spending flows over time</p>
            </div>
          </div>

          {dailyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyTrend}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#555"
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#555"
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Total"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                  dot={{ fill: "#10b981", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: "#10b981", stroke: "#0f0f0f", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500 text-sm">
              No expense data yet
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
    </>
  );
}
