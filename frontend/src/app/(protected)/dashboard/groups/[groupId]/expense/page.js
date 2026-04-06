"use client";

import { apiFetch } from "@/lib/api";
import {
  Plus,
  Search,
  SlidersHorizontal,
  BadgeCheck,
  Clock3,
  Receipt,
  Pencil,
  Trash2,
  ArrowLeft,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GroupSocketListener from "@/components/socket/GroupSocketListener";
import { useSelector } from "react-redux";
import { toastError, toastSuccess } from "@/lib/toast";

export default function ExpensePage() {
  const router = useRouter();
  const { groupId } = useParams();

  const [expandedExpense, setExpandedExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const [data, setData] = useState({
    expenses: [],
    message: "",
    count: 0,
  });

  const refreshKey = useSelector((state) => state.group.refreshKey);

  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleteErrorId, setDeleteErrorId] = useState(null);
  const [fetchError, setFetchError] = useState("");

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError("");
      const response = await apiFetch(`/group/${groupId}/expense`);
      setData({
        expenses: response.expenses ?? [],
        message: response.message ?? "",
        count: response.count ?? 0,
      });
    } catch (error) {
      setFetchError(error?.message || "Failed to fetch expenses.");
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    if (groupId) fetchExpenses();
  }, [groupId, refreshKey]);

  const toggleExpand = (id) => {
    setExpandedExpense((prev) => (prev === id ? null : id));
  };

  const handleDelete = async (expenseId) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    try {
      setDeletingId(expenseId);
      setDeleteError("");
      setDeleteErrorId(null);
      await apiFetch(`/group/${groupId}/expenses/${expenseId}/deleteExpense`, {
        method: "DELETE",
      });
      toastSuccess("Expense deleted.");
      await fetchExpenses();
    } catch (error) {
      if (error.statusCode === 409) {
        setDeleteError(
          "Cannot delete — expense belongs to a previous settlement window.",
        );
      } else if (error.statusCode === 403) {
        setDeleteError(
          "Only the expense creator or group creator can delete this.",
        );
      } else if (error.statusCode === 404) {
        setDeleteError("Expense not found. It may already have been deleted.");
      } else {
        setDeleteError(error.message || "Failed to delete expense.");
      }
      setDeleteErrorId(expenseId);
      toastError(error.message || "Failed to delete expense.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";

    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getSplitDescription = (expense) => {
    const count = expense.splits?.length ?? 0;
    return expense.splitType === "equal"
      ? `Split equally among ${count} member${count !== 1 ? "s" : ""}`
      : `${expense.splitType} Split among ${count} member${count !== 1 ? "s" : ""}`;
  };

  const shouldShowAnomaly = (expense) => {
    return expense.isAnomalous === true;
  };

  const { expenses, message, count } = data;

  const filteredExpenses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return expenses.filter((expense) => {
      const title = (expense.title || "").toLowerCase();
      const payer = (expense.paidBy?.name || "").toLowerCase();
      const category = (expense.category || "").toLowerCase();
      const matchesQuery =
        q.length === 0 ||
        title.includes(q) ||
        payer.includes(q) ||
        category.includes(q);

      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "unpaid" && !expense.isPaid) ||
        (activeFilter === "paid" && expense.isPaid) ||
        (activeFilter === "anomaly" && shouldShowAnomaly(expense));

      return matchesQuery && matchesFilter;
    });
  }, [expenses, searchQuery, activeFilter]);

  const totals = useMemo(() => {
    const totalAmount = expenses.reduce(
      (sum, exp) => sum + Number(exp.totalAmount ?? exp.amount ?? 0),
      0,
    );
    const pendingCount = expenses.filter((exp) => !exp.isPaid).length;
    const paidCount = expenses.filter((exp) => exp.isPaid).length;

    return {
      totalAmount,
      pendingCount,
      paidCount,
    };
  }, [expenses]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-[340px] items-center justify-center"
      >
        <div className="flex items-center gap-2 text-[#8aa1cc]">
          <Loader2 className="h-5 w-5 animate-spin text-[#00CDFF]" />
          Loading expenses...
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <GroupSocketListener groupId={groupId} />
      <div className="mx-auto w-full max-w-345 space-y-5">
        <motion.section
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-[#17345f] bg-[#06173f]/80 p-4 sm:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => router.push(`/dashboard/groups/${groupId}`)}
              className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#86a1d1] transition hover:text-[#d9e6ff]"
            >
              <ArrowLeft size={14} />
              Back to Group
            </motion.button>

            <button
              onClick={() => router.push(`/dashboard/groups/${groupId}/expense/create`)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#00CDFF] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-[#03203f] transition hover:bg-[#35dcff]"
            >
              <Plus size={15} />
              Add Expense
            </button>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#6f88b7]">
                Expense Ledger
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#d8e6ff] sm:text-4xl">
                ₹{totals.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h1>
              <p className="mt-2 text-sm text-[#8fa6d2]">
                {message || "Track all group expenses"} · {count} expense
                {count !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="rounded-xl border border-[#21477a] bg-[#081a43] p-4">
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#7f97c3]">
                Action Required
              </p>
              <div className="mt-2 space-y-1.5">
                <p className="text-2xl font-bold text-[#FF2D65]">
                  {totals.pendingCount}
                </p>
                <p className="text-xs text-[#9eb2d7]">Pending expenses</p>
                <p className="text-xs text-[#6f88b7]">
                  {totals.paidCount} already marked paid
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="grid gap-3 sm:grid-cols-[1fr_auto]"
        >
          <label className="flex items-center gap-2 rounded-xl border border-[#1b3c6c] bg-[#071a42] px-3 py-2.5">
            <Search size={15} className="text-[#6f88b7]" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search expenses..."
              className="w-full bg-transparent text-sm text-[#dbe7ff] outline-none placeholder:text-[#5f79a9]"
            />
          </label>

          <div className="flex items-center gap-2 rounded-xl border border-[#1b3c6c] bg-[#071a42] p-1">
            <SlidersHorizontal size={14} className="ml-2 text-[#6f88b7]" />
            {[
              { key: "all", label: "All" },
              { key: "unpaid", label: "Pending" },
              { key: "paid", label: "Paid" },
              { key: "anomaly", label: "Anomaly" },
            ].map((option) => (
              <button
                key={option.key}
                onClick={() => setActiveFilter(option.key)}
                className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] transition ${
                  activeFilter === option.key
                    ? "bg-[#00CDFF] text-[#03203f]"
                    : "text-[#8ea5d1] hover:text-[#dbe7ff]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </motion.section>

        <AnimatePresence mode="wait">
          {fetchError ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border border-[#FF2D65]/35 bg-[#FF2D65]/10 p-5"
            >
              <p className="text-sm text-[#ff9bb7]">{fetchError}</p>
            </motion.div>
          ) : filteredExpenses.length > 0 ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {filteredExpenses.map((expense, index) => {
                const isExpanded = expandedExpense === expense._id;
                const isAnomalous = shouldShowAnomaly(expense);
                const isPaid = Boolean(expense.isPaid);

                return (
                  <motion.article
                    key={expense._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className={`overflow-hidden rounded-2xl border bg-[#06173f]/85 ${
                      isAnomalous
                        ? "border-[#FF2D65]/45"
                        : "border-[#163465]"
                    }`}
                  >
                    <button
                      onClick={() => toggleExpand(expense._id)}
                      className="flex w-full cursor-pointer flex-col gap-3 p-4 text-left sm:p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-base font-semibold text-[#dce8ff] sm:text-lg">
                            {expense.title ?? "Untitled expense"}
                          </p>
                          <p className="mt-1 text-xs text-[#7f97c3]">
                            {formatDate(expense.createdAt)} · Paid by {expense.paidBy?.name ?? "Unknown"}
                          </p>
                        </div>
                        <p className="shrink-0 text-lg font-bold text-[#00CDFF] sm:text-2xl">
                          ₹{Number(expense.totalAmount ?? expense.amount ?? 0).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md border border-[#21477a] bg-[#081a43] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8fa6d2]">
                          {expense.category || "other"}
                        </span>
                        <span className="rounded-md border border-[#21477a] bg-[#081a43] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8fa6d2]">
                          {getSplitDescription(expense)}
                        </span>
                        {isAnomalous && (
                          <span className="inline-flex items-center gap-1 rounded-md border border-[#FF2D65]/35 bg-[#FF2D65]/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#ff9bb7]">
                            <AlertTriangle size={12} />
                            Unusual
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${
                            isPaid
                              ? "border border-[#00CDFF]/40 bg-[#00CDFF]/15 text-[#8ff0ff]"
                              : "border border-[#FF2D65]/40 bg-[#FF2D65]/12 text-[#ff9bb7]"
                          }`}
                        >
                          {isPaid ? <BadgeCheck size={12} /> : <Clock3 size={12} />}
                          {isPaid ? "Paid" : "Pending"}
                        </span>
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden border-t border-[#14315e] bg-[#071a42]"
                        >
                          <div className="space-y-4 p-4 sm:p-5">
                            {expense.notes ? (
                              <p className="text-sm text-[#95add8]">{expense.notes}</p>
                            ) : (
                              <p className="text-sm text-[#6f88b7]">No notes for this expense.</p>
                            )}

                            {isAnomalous && (
                              <div className="rounded-xl border border-[#FF2D65]/35 bg-[#FF2D65]/10 px-3 py-2">
                                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#ff9bb7]">
                                  Anomaly score {expense.anomalyScore?.toFixed(2) ?? "N/A"}
                                </p>
                                {expense.anomalyReason && (
                                  <p className="mt-1 text-xs text-[#ffc2d4]">{expense.anomalyReason}</p>
                                )}
                              </div>
                            )}

                            <div className="space-y-2">
                              {expense.splits?.map((member) => (
                                <div
                                  key={`${expense._id}-${member.user?._id || member.user}`}
                                  className="flex items-center justify-between rounded-lg border border-[#1b3c6c] bg-[#081f4d] px-3 py-2"
                                >
                                  <span className="text-sm text-[#d9e7ff]">
                                    {member.user?.name ?? "Member"}
                                  </span>
                                  <span className="text-sm font-semibold text-[#00CDFF]">
                                    ₹{Number(member.amount ?? 0).toLocaleString("en-IN", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {deleteError && deleteErrorId === expense._id && (
                              <div className="rounded-lg border border-[#FF2D65]/35 bg-[#FF2D65]/10 px-3 py-2 text-xs text-[#ffb0c7]">
                                {deleteError}
                              </div>
                            )}

                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              <button
                                onClick={() =>
                                  router.push(
                                    `/dashboard/groups/${groupId}/expense/${expense._id}/edit`,
                                  )
                                }
                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#25497e] bg-[#081a43] px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#c8d7f0] transition hover:border-[#00CDFF]/40 hover:text-[#00CDFF]"
                              >
                                <Pencil size={13} />
                                Edit
                              </button>

                              <button
                                onClick={() => handleDelete(expense._id)}
                                disabled={deletingId === expense._id}
                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#FF2D65]/40 bg-[#FF2D65]/12 px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#ff9bb7] transition hover:bg-[#FF2D65]/18 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {deletingId === expense._id ? (
                                  <Loader2 size={13} className="animate-spin" />
                                ) : (
                                  <Trash2 size={13} />
                                )}
                                {deletingId === expense._id ? "Deleting" : "Delete"}
                              </button>

                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.article>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border border-[#163465] bg-[#06173f]/80 p-8 text-center"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-[#21477a] bg-[#081a43]">
                <Receipt className="h-7 w-7 text-[#6f88b7]" />
              </div>
              <h3 className="text-lg font-semibold text-[#d9e6ff]">
                {expenses.length === 0
                  ? "No expenses yet"
                  : "No expenses match your filter"}
              </h3>
              <p className="mt-2 text-sm text-[#8ea5d1]">
                {expenses.length === 0
                  ? "Create the first expense to start tracking splits."
                  : "Try changing search or filter to see more results."}
              </p>
              <button
                onClick={() => router.push(`/dashboard/groups/${groupId}/expense/create`)}
                className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#00CDFF] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-[#03203f] transition hover:bg-[#35dcff]"
              >
                <Plus size={15} />
                Add Expense
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
