"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  RotateCcw,
  AlertCircle,
  DollarSign,
  TrendingUp,
  PieChart as PieChartIcon,
  Sparkles,
  ChartNoAxesCombined,
} from "lucide-react";
import GroupSocketListener from "@/components/socket/GroupSocketListener";
import { useSelector } from "react-redux";

const CATEGORY_COLORS = {
  food: "#ff7b00",
  travel: "#38bdf8",
  rent: "#a855f7",
  shopping: "#f472b6",
  other: "#64748b",
};

const CATEGORY_LABELS = {
  food: "Food",
  travel: "Travel",
  rent: "Rent",
  shopping: "Shopping",
  other: "Other",
};

const numberFormatter = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const currency = (value) => `₹${numberFormatter.format(Number(value || 0))}`;

const parseAIInsights = (insights) => {
  if (!insights) return [];

  return insights
    .split(/\n+/)
    .map((line) => line.trim().replace(/^[-•]\s*/, "").replace(/\*+/g, ""))
    .filter(Boolean)
    .map((line) => {
      const cleaned = line.replace(/^Insight:\s*/i, "").replace(/\*+/g, "");
      const match = cleaned.match(/^([^:]+):\s*(.*)$/);

      if (!match) {
        return { label: "Insight", value: cleaned };
      }

      return {
        label: match[1].trim(),
        value: match[2].trim(),
      };
    });
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 shadow-2xl shadow-black/30">
      <p className="mb-1 text-sm font-medium text-white">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm" style={{ color: entry.color || "#ff7b00" }}>
          {entry.name}: {currency(entry.value)}
        </p>
      ))}
    </div>
  );
};

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 shadow-2xl shadow-black/30">
      <p className="text-sm font-medium text-white">{payload[0].name}</p>
      <p className="text-sm text-[#ffb36b]">{currency(payload[0].value)}</p>
      <p className="text-xs text-slate-400">
        {payload[0].payload.count} expense{payload[0].payload.count !== 1 ? "s" : ""}
      </p>
    </div>
  );
};

function MetricCard({ label, value, hint, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-[#173b70] bg-[#081b45] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.25)] transition hover:border-[#3f629e]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#6f88b7]">{label}</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">{value}</h3>
          <p className="mt-1 text-sm text-[#8fa6d2]">{hint}</p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0b2a5f] text-[#7fe9ff] ring-1 ring-[#244a80]">
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

function CardShell({ title, subtitle, icon: Icon, children, className = "" }) {
  return (
    <section className={`rounded-2xl border border-[#1a3c72] bg-[#06173f]/88 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.25)] ${className}`}>
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b2a5f] text-[#7fe9ff] ring-1 ring-[#244a80]">
          <Icon size={18} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export default function GroupAnalyticsPage() {
  const { groupId } = useParams();
  const router = useRouter();
  const refreshKey = useSelector((state) => state.group.refreshKey);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

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

  const regenerateInsights = async () => {
    try {
      setRefreshing(true);
      await fetchAnalytics();
    } finally {
      setRefreshing(false);
    }
  };

  const overview = data?.overview;
  const memberStats = data?.memberStats || [];
  const categoryBreakdown = data?.categoryBreakdown || [];
  const dailyTrend = data?.dailyTrend || [];
  const aiInsights = data?.aiInsights || "";

  const hasData = Boolean(
    overview || memberStats.length || categoryBreakdown.length || dailyTrend.length || aiInsights,
  );

  const totalSpent = Number(overview?.totalSpent || 0);
  const expenseCount = Number(overview?.expenseCount || 0);
  const avgExpense = Number(overview?.avgExpense || 0);
  const maxExpense = Number(overview?.maxExpense || 0);

  const lineData = dailyTrend.map((item) => ({
    date: item.date,
    total: Number(item.total || 0),
  }));

  const pieData = categoryBreakdown.map((item) => ({
    name: CATEGORY_LABELS[item.category] || item.category,
    value: Number(item.total || 0),
    count: item.count || 0,
    color: CATEGORY_COLORS[item.category] || "#64748b",
  }));

  const maxNetBalance = useMemo(() => {
    return Math.max(...memberStats.map((item) => Math.abs(Number(item.netBalance) || 0)), 1);
  }, [memberStats]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_18%_0%,#0e2f75_0%,#081d4f_45%,#030b1d_100%)] px-4 py-5 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6 animate-pulse">
          <div className="h-28 rounded-2xl border border-[#173b70] bg-[#081b45]" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-28 rounded-2xl border border-[#173b70] bg-[#081b45]" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="h-80 rounded-2xl border border-[#173b70] bg-[#081b45]" />
            <div className="h-80 rounded-2xl border border-[#173b70] bg-[#081b45]" />
          </div>
          <div className="h-72 rounded-2xl border border-[#173b70] bg-[#081b45]" />
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_18%_0%,#0e2f75_0%,#081d4f_45%,#030b1d_100%)] px-4 py-5 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-center py-28 text-center">
          <div className="max-w-md rounded-2xl border border-[#1a3c72] bg-[#06173f]/88 p-8">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
              <AlertCircle className="h-9 w-9 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Couldn&apos;t load analytics</h2>
            <p className="mt-2 text-sm text-slate-400">{fetchError}</p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                onClick={fetchAnalytics}
                className="inline-flex items-center gap-2 rounded-xl bg-[#ff7b00] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#ff8a1f]"
              >
                <RotateCcw className="h-4 w-4" />
                Retry
              </button>
              <button
                onClick={() => router.push(`/dashboard/groups/${groupId}`)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/3 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
              >
                Back to Group
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_18%_0%,#0e2f75_0%,#081d4f_45%,#030b1d_100%)] px-4 py-5 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-center py-28 text-center">
          <div className="max-w-md rounded-2xl border border-[#1a3c72] bg-[#06173f]/88 p-8">
            <p className="text-lg font-semibold text-white">No data available</p>
            <p className="mt-2 text-sm text-slate-400">Add some expenses to populate the analytics dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <GroupSocketListener groupId={groupId} />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="min-h-screen bg-[radial-gradient(circle_at_18%_0%,#0e2f75_0%,#081d4f_45%,#030b1d_100%)] px-4 py-5 text-white sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-6xl space-y-6">
          <motion.header
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="rounded-2xl border border-[#1a3c72] bg-[#06173f]/88 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.25)] backdrop-blur"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <button
                  onClick={() => router.push(`/dashboard/groups/${groupId}`)}
                  className="mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#244a80] bg-[#0b2a5f] text-slate-300 transition hover:border-[#3f629e] hover:text-white"
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-[#79a0d8]">Financial Intelligence</p>
                  <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    Spending Pulse
                  </h1>
                  <p className="mt-2 text-sm text-slate-400">Group financial insights</p>
                </div>
              </div>

              <div className="min-w-52 lg:min-w-80">
                <MetricCard
                  label="Total Volume"
                  value={currency(totalSpent)}
                  hint={`${expenseCount} expenses recorded`}
                  icon={DollarSign}
                />
              </div>
            </div>
          </motion.header>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_0.9fr]">
            <CardShell title="Daily Velocity" subtitle="Transaction peaks over the last 30 days" icon={TrendingUp}>
              {lineData.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={lineData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                    <CartesianGrid stroke="rgba(123,225,255,0.08)" strokeDasharray="4 4" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#70809a"
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#70809a"
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `₹${value}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="total"
                      name="Total Spent"
                      stroke="#7be1ff"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#7be1ff", stroke: "#040815", strokeWidth: 2 }}
                      activeDot={{ r: 7, fill: "#d9fbff", stroke: "#040815", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-80 items-center justify-center rounded-xl border border-dashed border-[#173152] text-sm text-slate-500">
                  No data available
                </div>
              )}
            </CardShell>

            <CardShell title="Allocation" subtitle="Expenditure by category" icon={PieChartIcon}>
              {pieData.length > 0 ? (
                <div className="space-y-4">
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={72}
                        outerRadius={105}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`category-cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {pieData.map((entry) => {
                      const percentage = totalSpent > 0 ? (entry.value / totalSpent) * 100 : 0;

                      return (
                        <div key={entry.name} className="rounded-xl border border-[#173152] bg-[#0b1426] px-3 py-2">
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                            <p className="truncate text-sm text-slate-200">{entry.name}</p>
                          </div>
                          <p className="mt-1 text-xs text-slate-400">{percentage.toFixed(1)}%</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex h-80 items-center justify-center rounded-xl border border-dashed border-[#173152] text-sm text-slate-500">
                  No data available
                </div>
              )}
            </CardShell>
          </div>

          <CardShell title="Consensus & Contributions" subtitle="Who is funding the ecosystem" icon={ChartNoAxesCombined}>
            {memberStats.length > 0 ? (
              <div className="space-y-4">
                {memberStats.map((member) => {
                  const netBalance = Number(member.netBalance || 0);
                  const isPositive = netBalance >= 0;
                  const width = Math.max((Math.abs(netBalance) / maxNetBalance) * 100, 8);

                  return (
                    <div key={member.userId} className="rounded-xl border border-[#173152] bg-[#0b1426] p-4 transition hover:border-[#2d5c88]">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-white">{member.name}</p>
                          <p className="mt-1 text-xs text-slate-400">
                            Paid {currency(member.totalPaid)} · Owed {currency(member.totalOwed)}
                          </p>
                        </div>

                        <div className={`text-sm font-semibold ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                          {isPositive ? "+" : "-"}
                          {currency(Math.abs(netBalance))}
                        </div>
                      </div>

                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">
                        <div
                          className={`h-full rounded-full ${isPositive ? "bg-emerald-400" : "bg-red-400"}`}
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#173152] py-16 text-center text-sm text-slate-500">
                No data available
              </div>
            )}
          </CardShell>

          <CardShell title="AI Insights" subtitle="Generated summary for the group" icon={Sparkles}>
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm text-slate-400">Insight summary</p>
                <button
                  type="button"
                  onClick={regenerateInsights}
                  disabled={refreshing}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#2a5b96] bg-[#0b2558] px-4 py-2 text-sm font-semibold text-[#9edfff] transition hover:border-[#3b75bc] hover:bg-[#10306d] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {refreshing ? (
                    <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  ) : (
                    <RotateCcw className="h-4 w-4" />
                  )}
                  Regenerate
                </button>
              </div>

              <div className="rounded-2xl border border-[#173152] bg-[#0b1426] p-5">
                {parseAIInsights(aiInsights).length > 0 ? (
                  <div className="space-y-3">
                    {parseAIInsights(aiInsights).map((item) => (
                      <div key={`${item.label}-${item.value}`} className="rounded-xl border border-[#1b457d] bg-[#081a43] p-4">
                        <p className="text-[10px] uppercase tracking-[0.22em] text-[#7be1ff]">{item.label}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-200">{item.value}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm leading-6 text-slate-300">{aiInsights || "AI insights unavailable"}</p>
                )}
              </div>
            </div>
          </CardShell>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <MetricCard
              label="Expenses"
              value={expenseCount}
              hint="Total transactions in the group"
              icon={ChartNoAxesCombined}
            />
            <MetricCard label="Average" value={currency(avgExpense)} hint="Average expense amount" icon={TrendingUp} />
            <MetricCard label="Highest" value={currency(maxExpense)} hint="Largest single expense" icon={DollarSign} />
          </div>
        </div>
      </motion.div>
    </>
  );
}
