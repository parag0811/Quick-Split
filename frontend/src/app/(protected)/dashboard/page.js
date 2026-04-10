"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Plus, Users, WalletCards, TrendingUp, Sparkles, ChevronRight } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentSettlements, setRecentSettlements] = useState([]);
  const [latestGroups, setLatestGroups] = useState([]);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const data = await apiFetch("/dashboard/user/summary");
        setUserData(data.user);
        setStats(data.stats);
        setRecentSettlements(data.recentSettlements || []);
        setLatestGroups(data.latestGroups || []);
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
          <div className="h-8 w-56 rounded-lg bg-[#0f2a57]" />
          <div className="h-4 w-40 rounded bg-[#0f2a57]" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 rounded-xl border border-[#1b3b74] bg-[#071b46]/90 p-6"
              />
            ))}
          </div>
          <div className="h-64 rounded-xl border border-[#1b3b74] bg-[#071b46]/90 p-6" />
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
          className="cursor-pointer rounded-lg bg-linear-to-r from-cyan-500 to-blue-500 px-5 py-2.5 font-semibold text-white transition-all hover:from-cyan-600 hover:to-blue-600"
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
  const netBalance = youAreOwed - youOwe;

  const weeklyValues = [
    Math.max(Math.round(totalSpent * 0.08), 150),
    Math.max(Math.round(totalSpent * 0.13), 220),
    Math.max(Math.round(totalSpent * 0.06), 120),
    Math.max(Math.round(totalSpent * 0.17), 290),
    Math.max(Math.round(totalSpent * 0.1), 180),
    Math.max(Math.round(totalSpent * 0.12), 210),
    Math.max(Math.round(totalSpent * 0.09), 160),
  ];
  const maxValue = Math.max(...weeklyValues, 1);

  return (
    <div className="mx-auto w-full max-w-345">
      <motion.section initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <p className="text-[11px] uppercase tracking-[0.24em] text-[#7e98c9]">Total managed balance</p>
        <div className="mt-1 flex flex-wrap items-end gap-x-3 gap-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-[#d9e6ff] sm:text-5xl">₹{Math.abs(netBalance).toLocaleString()}.00</h1>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              netBalance >= 0
                ? "bg-[#00CDFF]/15 text-[#78e9ff]"
                : "bg-[#FF2D65]/15 text-[#ff91ae]"
            }`}
          >
            {netBalance >= 0 ? "You are in credit" : "You owe more"}
          </span>
        </div>
      </motion.section>

      {!hasGroups ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-[#00CDFF]/30 to-[#A855F7]/25">
            <Users className="h-12 w-12 text-[#00CDFF]" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-white">No groups yet</h2>
          <p className="mb-8 max-w-md text-center text-[#9eb2d7]">
            Create your first group to start splitting expenses with friends
          </p>
          <Link
            href="/dashboard/groups/create"
            className="flex cursor-pointer items-center space-x-2 rounded-xl bg-[#00CDFF] px-6 py-3 font-semibold text-[#03203f] transition hover:bg-[#2dd7ff]"
          >
            <Plus className="h-5 w-5" />
            <span>Create Your First Group</span>
          </Link>
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mt-7 grid grid-cols-1 gap-6 xl:grid-cols-12"
        >
          <motion.div variants={item} className="space-y-6 xl:col-span-8">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-[#1b3b74] bg-[#071b46]/90 p-5">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#7c95c3]">Spent this month</p>
                  <WalletCards size={16} className="text-[#00CDFF]" />
                </div>
                <p className="text-3xl font-bold text-[#d8e6ff]">₹{totalSpent.toLocaleString()}.00</p>
              </div>

              <div className="rounded-2xl border border-[#1b3b74] bg-[#071b46]/90 p-5">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#7c95c3]">You are owed</p>
                  <ArrowUpRight size={16} className="text-[#00CDFF]" />
                </div>
                <p className="text-3xl font-bold text-[#00CDFF]">₹{youAreOwed.toLocaleString()}.00</p>
              </div>

              <div className="rounded-2xl border border-[#1b3b74] bg-[#071b46]/90 p-5">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#7c95c3]">You owe</p>
                  <ArrowUpRight size={16} className="rotate-180 text-[#FF2D65]" />
                </div>
                <p className="text-3xl font-bold text-[#FF2D65]">₹{youOwe.toLocaleString()}.00</p>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-5">
              <div className="rounded-2xl border border-[#163465] bg-[#06173f]/90 p-5 xl:col-span-3">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-[#dce8ff]">Spending Velocity</h2>
                  <TrendingUp className="text-[#A855F7]" size={20} />
                </div>

                <div className="mt-6 grid grid-cols-7 items-end gap-3 rounded-xl bg-[#051334] p-4">
                  {weeklyValues.map((value, index) => {
                    const isPeak = value === maxValue;
                    const heightPercent = Math.max(Math.round((value / maxValue) * 100), 18);

                    return (
                      <div key={`${value}-${index}`} className="flex flex-col items-center gap-2">
                        <div className="flex h-32 items-end">
                          <div
                            className={`w-8 rounded-t-md ${
                              isPeak ? "bg-[#A855F7]" : "bg-[#1f376d]"
                            }`}
                            style={{ height: `${heightPercent}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-semibold uppercase text-[#617eaF]">
                          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4 xl:col-span-2">
                <div className="rounded-2xl border border-[#163465] bg-[#06173f]/90 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[#dce8ff]">Recent Settlements</h2>
                    <Link href="/dashboard/groups" className="cursor-pointer text-xs font-semibold uppercase tracking-[0.12em] text-[#7f97c3] hover:text-[#00CDFF]">
                      View all
                    </Link>
                  </div>

                  {recentSettlements.length === 0 ? (
                    <p className="py-5 text-center text-sm text-[#6f86b2]">No recent settlements to show.</p>
                  ) : (
                    <div className="space-y-2.5">
                      <AnimatePresence initial={false}>
                        {recentSettlements.slice(0, 4).map((settlement, index) => {
                          const isPositive = settlement.direction !== "you_paid";
                          const amountColor = isPositive ? "text-[#00CDFF]" : "text-[#FF2D65]";

                          return (
                            <motion.div
                              key={settlement.id}
                              initial={{ opacity: 0, x: -14 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -14 }}
                              transition={{ delay: index * 0.05 }}
                              className="rounded-xl border border-[#19386c] bg-[#081a43] p-3"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-[#d9e6ff]">
                                    {isPositive ? settlement.from : settlement.to}
                                  </p>
                                  <p className="text-[10px] uppercase tracking-[0.14em] text-[#6f88b7]">
                                    Recorded
                                  </p>
                                </div>
                                <p className={`text-sm font-bold ${amountColor}`}>
                                  {isPositive ? "+" : "-"}₹{settlement.amount.toLocaleString()}
                                </p>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl bg-linear-to-br from-[#A855F7] to-[#d26cff] p-5 text-[#1d0f33] shadow-[0_12px_30px_rgba(168,85,247,0.35)]">
                  <div className="mb-2 flex items-center gap-2 text-sm font-bold">
                    <Sparkles size={16} />
                    Smart Insight
                  </div>
                  <p className="text-sm font-medium leading-relaxed">
                    You have settled a major share of dues this week, {userName}. Keep this pace to improve your trust score in group settlements.
                  </p>
                </div>
              </div>
            </div>

            {latestGroups.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2">
                {latestGroups.slice(0, 2).map((group, index) => {
                  const accent = index % 2 === 0 ? "#00CDFF" : "#A855F7";
                  return (
                    <Link
                      key={group.groupId}
                      href={`/dashboard/groups/${group.groupId}`}
                      className="rounded-2xl border border-[#173462] bg-[#081a43]/80 p-5 transition hover:border-[#2a5d97]"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div
                          className="rounded-md p-2"
                          style={{ backgroundColor: `${accent}1f` }}
                        >
                          <Users size={17} style={{ color: accent }} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7f97c3]">
                          {group.memberCount} members
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-[#dce8ff]">
                        {group.name}
                      </h3>
                      <p className="mt-1 truncate text-sm text-[#87a0cb]">
                        {group.description}
                      </p>
                    </Link>
                  );
                })}
              </div>
            )}
          </motion.div>

          <motion.aside variants={item} className="space-y-4 xl:col-span-4">
            <div className="rounded-2xl border border-[#163465] bg-[#06173f]/90 p-5">
              <h2 className="text-lg font-bold text-[#dce8ff]">Overview</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#081a43] p-3">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[#7f97c3]">Groups</p>
                  <p className="mt-1 text-2xl font-bold text-[#dce8ff]">{stats?.totalGroups ?? 0}</p>
                </div>
                <div className="rounded-xl bg-[#081a43] p-3">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[#7f97c3]">Spent</p>
                  <p className="mt-1 text-2xl font-bold text-[#00CDFF]">₹{totalSpent.toLocaleString()}</p>
                </div>
                <div className="rounded-xl bg-[#081a43] p-3">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[#7f97c3]">Owed</p>
                  <p className="mt-1 text-2xl font-bold text-[#00CDFF]">₹{youAreOwed.toLocaleString()}</p>
                </div>
                <div className="rounded-xl bg-[#081a43] p-3">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[#7f97c3]">You Owe</p>
                  <p className="mt-1 text-2xl font-bold text-[#FF2D65]">₹{youOwe.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <Link
              href="/dashboard/groups/create"
              className="flex cursor-pointer items-center justify-between rounded-2xl bg-[#00CDFF] px-5 py-4 text-[#03203f] shadow-[0_10px_24px_rgba(0,205,255,0.35)] transition hover:bg-[#2fd8ff]"
            >
              <div>
                <p className="text-base font-bold">Create Group</p>
                <p className="text-xs font-semibold text-[#08417a]">Split expenses with friends easily</p>
              </div>
              <ChevronRight size={20} />
            </Link>

            <Link
              href="/dashboard/groups/create"
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#1b3e71] bg-[#081a43] px-5 py-3 text-sm font-semibold text-[#9eb2d7] transition hover:border-[#00CDFF]/45 hover:text-[#00CDFF]"
            >
              <Plus className="h-4 w-4" />
              Add another group
            </Link>
          </motion.aside>
        </motion.div>
      )}
    </div>
  );
}
