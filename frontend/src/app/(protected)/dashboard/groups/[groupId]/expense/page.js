"use client";

import { apiFetch } from "@/lib/api";
import {
  Plus,
  ChevronDown,
  ChevronUp,
  Users,
  UserCheck,
  Split,
  AlertTriangle,
  Pencil,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GroupSocketListener from "@/components/socket/GroupSocketListener";
import { useSelector } from "react-redux";

export default function ExpensePage() {
  const router = useRouter();
  const { groupId } = useParams();

  const [expandedExpense, setExpandedExpense] = useState(null);
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({
    expenses: [],
    message: "",
    count: 0,
  });

  const refreshKey = useSelector((state) => state.group.refreshKey);
  const currentUserId = useSelector((state) => state.auth.user?._id);

  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleteErrorId, setDeleteErrorId] = useState(null);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`/group/${groupId}/expense`);
      setData({
        expenses: response.expenses ?? [],
        message: response.message ?? "",
        count: response.count ?? 0,
      });
    } catch (error) {
      console.error("Error while fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

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
      await apiFetch(`/group/expenses/${expenseId}/deleteExpense`, {
        method: "DELETE",
      });
      fetchExpenses();
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

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-gray-400 p-6 text-center"
      >
        Loading expenses...
      </motion.div>
    );
  }

  const { expenses, message, count } = data;

  return (
    <>
      <GroupSocketListener groupId={groupId} />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full min-h-screen bg-[#0f0f0f] p-4 sm:p-6 lg:p-8"
      >
        <div className="max-w-4xl mx-auto">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => router.push(`/dashboard/groups/${groupId}`)}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-6 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            Back to Group
          </motion.button>

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
              <h1 className="text-3xl font-bold text-white mb-2">Expenses</h1>
              <p className="text-gray-400">
                {message} · {count} expense{count !== 1 ? "s" : ""}
              </p>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                router.push(`/dashboard/groups/${groupId}/expense/create`)
              }
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-pink-900/30"
            >
              <Plus size={20} />
              <span>Add Expense</span>
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="mb-6 flex items-start gap-3 rounded-xl border border-cyan-900/30 bg-cyan-950/15 px-4 py-3"
          >
            <AlertTriangle size={16} className="text-cyan-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-cyan-200/70 leading-relaxed">
              Some expenses may be flagged as unusual based on spending
              patterns. This is only an informational insight and does not
              affect the expense you add.
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {expenses.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                {expenses.map((expense, index) => {
                  const isExpanded = expandedExpense === expense._id;
                  const isAnomalous = shouldShowAnomaly(expense);

                  return (
                    <motion.div
                      key={expense._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.1 + index * 0.05,
                        type: "spring",
                        stiffness: 200,
                      }}
                      className={`bg-[#1a1a1a] border rounded-xl overflow-hidden transition-all ${
                        isAnomalous
                          ? "border-orange-500/40 hover:border-orange-500/60 border-l-4 border-l-orange-500"
                          : "border-gray-800 hover:border-gray-700"
                      }`}
                    >
                      <motion.div
                        onClick={() => toggleExpand(expense._id)}
                        whileHover={{
                          backgroundColor: "rgba(26, 26, 26, 0.8)",
                        }}
                        className="p-5 cursor-pointer"
                      >
                        <div className="flex justify-between mb-3">
                          {/* Title + anomaly badge */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-semibold text-white">
                              {expense.title ?? "Untitled"}
                            </h3>
                            {isAnomalous && (
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-500/15 border border-orange-500/30 text-orange-400 rounded-full text-xs font-medium">
                                <AlertTriangle size={11} />
                                Unusual
                              </span>
                            )}
                          </div>

                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              delay: 0.2 + index * 0.05,
                              type: "spring",
                              stiffness: 200,
                            }}
                            className="text-2xl font-bold text-white"
                          >
                            ₹{expense.amount ?? expense.totalAmount ?? 0}
                          </motion.div>
                        </div>

                        {isAnomalous && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-start gap-2 mb-3 px-3 py-2 bg-orange-500/8 border border-orange-500/15 rounded-lg"
                          >
                            <AlertTriangle
                              size={13}
                              className="text-orange-400 mt-0.5 flex-shrink-0"
                            />
                            <div className="text-xs text-orange-300/80 leading-relaxed">
                              <span className="font-medium text-orange-400">
                                Anomaly Score:{" "}
                                {expense.anomalyScore?.toFixed(2) ?? "N/A"}
                              </span>
                              {expense.anomalyReason && (
                                <span className="ml-1">
                                  — {expense.anomalyReason}
                                </span>
                              )}
                            </div>
                          </motion.div>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-sm mb-3">
                          <span className="text-gray-500">
                            {formatDate(expense.createdAt)}
                          </span>
                          <span className="text-gray-700">•</span>
                          <span className="text-gray-400">
                            Paid by{" "}
                            <span className="text-cyan-400 font-medium">
                              {expense.paidBy?.name ?? "Unknown"}
                            </span>
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            {expense.splitType === "equal" ? (
                              <Users size={16} className="text-emerald-500" />
                            ) : (
                              <Split size={16} className="text-amber-500" />
                            )}
                            <span>{getSplitDescription(expense)}</span>
                          </div>

                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <span>{isExpanded ? "Hide" : "View"} details</span>
                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              {isExpanded ? (
                                <ChevronUp size={16} />
                              ) : (
                                <ChevronDown size={16} />
                              )}
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="border-t border-gray-800 bg-[#151515] overflow-hidden"
                          >
                            <div className="p-5">
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="mb-4 space-y-2"
                              >
                                <div className="flex gap-2">
                                  <span className="text-xs text-gray-500">
                                    Category:
                                  </span>
                                  <span className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded text-xs">
                                    {expense.category ?? "other"}
                                  </span>
                                </div>

                                {expense.notes && (
                                  <p className="text-sm text-gray-400">
                                    {expense.notes}
                                  </p>
                                )}
                              </motion.div>

                              <motion.h4
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2"
                              >
                                <UserCheck size={14} />
                                Split Breakdown
                              </motion.h4>

                              <div className="space-y-2">
                                {expense.splits?.map((member, idx) => (
                                  <motion.div
                                    key={`${expense._id}-${member.user._id}`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + idx * 0.05 }}
                                    whileHover={{ scale: 1.02, x: 5 }}
                                    className="flex items-center justify-between py-2 px-3 bg-[#1a1a1a] rounded-lg"
                                  >
                                    <span className="text-sm text-gray-300">
                                      {member.user.name ?? "Member"}
                                    </span>
                                    <span className="text-sm font-semibold text-white">
                                      ₹{member.amount ?? 0}
                                    </span>
                                  </motion.div>
                                ))}
                              </div>

                              {deleteError && deleteErrorId === expense._id && (
                                <div className="mt-3 flex items-start gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                                  <AlertTriangle
                                    size={14}
                                    className="text-red-400 mt-0.5 flex-shrink-0"
                                  />
                                  <p className="text-xs text-red-300">
                                    {deleteError}
                                  </p>
                                </div>
                              )}

                              {/* Edit & Delete actions */}
                              <motion.div
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="mt-4 pt-4 border-t border-gray-800 flex items-center gap-3"
                              >
                                <button
                                  onClick={() =>
                                    router.push(
                                      `/dashboard/groups/${groupId}/expense/${expense._id}/edit`,
                                    )
                                  }
                                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-400 bg-cyan-600/10 border border-cyan-600/20 hover:bg-cyan-600/20 rounded-lg transition-all cursor-pointer"
                                >
                                  <Pencil size={13} />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(expense._id)}
                                  disabled={deletingId === expense._id}
                                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 bg-red-600/10 border border-red-600/20 hover:bg-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all cursor-pointer"
                                >
                                  {deletingId === expense._id ? (
                                    <span className="w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                                  ) : (
                                    <Trash2 size={13} />
                                  )}
                                  {deletingId === expense._id
                                    ? "Deleting..."
                                    : "Delete"}
                                </button>
                              </motion.div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
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
                  >
                    <Users size={56} className="text-gray-600 mb-6" />
                  </motion.div>
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="text-2xl font-semibold text-gray-300 mb-3"
                  >
                    No expenses added yet
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="text-gray-500 mb-10 text-center max-w-md"
                  >
                    Start tracking by adding your first expense
                  </motion.p>
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5, type: "spring" }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      router.push(`/dashboard/groups/${groupId}/expense/create`)
                    }
                    className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg font-medium"
                  >
                    <Plus size={22} />
                    <span>Add your first expense</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}
