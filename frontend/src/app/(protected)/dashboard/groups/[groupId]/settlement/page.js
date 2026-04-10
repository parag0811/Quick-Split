"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Banknote,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import GroupSocketListener from "@/components/socket/GroupSocketListener";
import { useSelector } from "react-redux";

const PAGE_SIZE = 6;

export default function SettlementPage() {
  const { groupId } = useParams();
  const refreshKey = useSelector((state) => state.group.refreshKey);
  const currentUserId = useSelector((state) => state.auth.user?._id);

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [allSettlements, setAllSettlements] = useState([]);
  const [balanceData, setBalanceData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Header cards are driven by group balances api.
  const fetchBalance = useCallback(async () => {
    try {
      const response = await apiFetch(`/group/${groupId}/balances`);
      setBalanceData(response);
    } catch {
      setBalanceData(null);
    }
  }, [groupId]);

  // This page only reads actual settlement transactions.
  const fetchSettlements = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError("");
      const response = await apiFetch(`/group/${groupId}/settlements`);
      setAllSettlements(response.settlements || []);
    } catch (error) {
      setFetchError(error?.message || "Failed to load settlements.");
      setAllSettlements([]);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    if (groupId) {
      fetchBalance();
      fetchSettlements();
    }
  }, [groupId, refreshKey, fetchBalance, fetchSettlements]);

  const totalCount = allSettlements.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedSettlements = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return allSettlements.slice(start, end);
  }, [currentPage, allSettlements]);

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="mx-auto w-full max-w-345 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <section className="rounded-2xl border border-cyan-400/20 bg-slate-950/70 p-6 backdrop-blur-sm">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-slate-100">Settlements</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
                Settlement history of recorded payments between group members.
            </p>
          </div>

          {balanceData && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Net Balance</p>
                <p className="mt-2 text-3xl font-bold text-cyan-300">
                  ₹{Number(balanceData.balance?.[currentUserId] || 0).toFixed(2)}
                </p>
                <p className="mt-2 text-xs text-cyan-200/80">Current position in this group</p>
              </div>

              <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Total To Pay</p>
                <p className="mt-2 text-3xl font-bold text-rose-300">
                  ₹{Math.max(0, -Number(balanceData.balance?.[currentUserId] || 0)).toFixed(2)}
                </p>
                <p className="mt-2 text-xs text-rose-200/80">Outstanding amount you owe</p>
              </div>

              <div className="rounded-xl border border-violet-400/30 bg-violet-500/10 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Total To Receive</p>
                <p className="mt-2 text-3xl font-bold text-violet-300">
                  ₹{Math.max(0, Number(balanceData.balance?.[currentUserId] || 0)).toFixed(2)}
                </p>
                <p className="mt-2 text-xs text-violet-200/80">Amount expected from others</p>
              </div>
            </div>
          )}
        </section>

        <div className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={`settlement-skeleton-${idx}`}
                  className="animate-pulse rounded-xl border border-slate-700 bg-slate-900/70 p-5"
                >
                  <div className="mb-4 h-4 w-2/3 rounded bg-slate-700" />
                  <div className="mb-3 h-6 w-1/3 rounded bg-slate-700" />
                  <div className="h-3 w-1/2 rounded bg-slate-800" />
                </div>
              ))}
            </div>
          ) : fetchError ? (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-6 text-center">
              <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-300" />
              <p className="font-medium text-red-200">{fetchError}</p>
              <button
                onClick={fetchSettlements}
                className="mt-4 inline-flex items-center rounded-lg border border-red-400/40 bg-red-500/15 px-3 py-1.5 text-sm font-medium text-red-200"
              >
                Retry
              </button>
            </div>
          ) : paginatedSettlements.length === 0 ? (
            <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-10 text-center">
              <Banknote className="mx-auto mb-3 h-10 w-10 text-slate-500" />
              <p className="text-slate-300">No settlements recorded yet.</p>
              <p className="mt-1 text-sm text-slate-500">
                Transactions recorded from the Balance page will appear here.
              </p>
            </div>
          ) : (
            <>
              <AnimatePresence>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {paginatedSettlements.map((settlement, idx) => {
                    const fromYou = settlement.from?._id === currentUserId;
                    const toYou = settlement.to?._id === currentUserId;
                    const headline = fromYou
                      ? `You paid ${settlement.to?.name || "Member"}`
                      : toYou
                        ? `${settlement.from?.name || "Member"} paid you`
                        : `${settlement.from?.name || "Member"} paid ${settlement.to?.name || "Member"}`;

                    return (
                      <motion.article
                        key={settlement._id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="rounded-xl border border-cyan-400/30 bg-slate-950/70 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-slate-100">{headline}</h3>
                            <p className="mt-1 text-xs text-slate-500">
                              {settlement.method ? `Method: ${settlement.method.toUpperCase()}` : "Method: NA"}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-2xl font-bold text-emerald-300">
                              ₹{Number(settlement.amount || 0).toFixed(2)}
                            </p>
                            <span className="mt-1 inline-block rounded border border-emerald-400/30 bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
                              Recorded
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-400">
                          <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-2">
                            <p className="text-slate-500">From</p>
                            <p className="mt-1 truncate text-slate-200">{settlement.from?.name || "Unknown"}</p>
                          </div>
                          <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-2">
                            <p className="text-slate-500">To</p>
                            <p className="mt-1 truncate text-slate-200">{settlement.to?.name || "Unknown"}</p>
                          </div>
                        </div>

                        {settlement.notes ? (
                          <p className="mt-3 truncate text-xs italic text-slate-500">"{settlement.notes}"</p>
                        ) : null}
                      </motion.article>
                    );
                  })}
                </div>

                {totalPages > 1 ? (
                  <div className="mt-6 flex flex-col gap-3 border-t border-slate-700 pt-5 md:flex-row md:items-center md:justify-between">
                    <p className="text-sm text-slate-400">
                      Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount}
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 disabled:opacity-40"
                      >
                        <ArrowLeft size={14} />
                        Prev
                      </button>

                      <span className="rounded-md bg-slate-900 px-2.5 py-1 text-sm text-slate-300">
                        {currentPage}/{totalPages}
                      </span>

                      <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 disabled:opacity-40"
                      >
                        Next
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                ) : null}
              </AnimatePresence>
            </>
          )}
        </div>
      </motion.div>

      <GroupSocketListener groupId={groupId} />
    </div>
  );
}