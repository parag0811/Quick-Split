"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useParams } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";

export default function GroupAnalyticsPage() {
  const { groupId } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchAnalytics() {
      const response = await apiFetch(`/groups/${groupId}/analytics`);
      setData(response);
    }

    fetchAnalytics();
  }, [groupId]);

  if (!data) {
    return <div className="text-gray-400 p-6">Loading analytics...</div>;
  }

  const { overview, memberContribution, dailyTrend } = data;

  return (
    <div className="p-6 bg-[#0f0f0f] min-h-screen">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6"
          >
            <h2 className="text-gray-400 text-sm">Total Spent</h2>
            <p className="text-3xl font-bold text-white mt-2">
              ₹{overview.totalSpent}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6"
          >
            <h2 className="text-gray-400 text-sm">Total Expenses</h2>
            <p className="text-3xl font-bold text-white mt-2">
              {overview.expenseCount}
            </p>
          </motion.div>
        </div>

        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-6">
            Member Contributions
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={memberContribution}>
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip />
              <Bar dataKey="totalPaid" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-6">
            Daily Spending Trend
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyTrend}>
              <CartesianGrid stroke="#222" />
              <XAxis dataKey="date" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip />
              <Line type="monotone" dataKey="total" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
