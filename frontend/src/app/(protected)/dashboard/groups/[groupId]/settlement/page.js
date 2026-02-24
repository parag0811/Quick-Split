"use client";
import { useEffect, useState, useCallback } from "react";
import {
  ArrowRight,
  Receipt,
  Plus,
  CheckCircle2,
  RefreshCw,
  RotateCcw,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toastSuccess, toastError } from "@/lib/toast";
import GroupSocketListener from "@/components/socket/GroupSocketListener";
import {  useSelector } from "react-redux";

const STATUS_TABS = [
  { key: "pending", label: "Pending", icon: Clock },
  { key: "completed", label: "Completed", icon: CheckCircle2 },
];

const LIMIT = 10;

export default function SettlementPage() {
  const [activeTab, setActiveTab] = useState("pending");
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [settlements, setSettlements] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [markingPaidId, setMarkingPaidId] = useState(null);

  const { groupId } = useParams();
  
  const refreshKey = useSelector((state) => state.group.refreshKey)
  
  const fetchSettlements = useCallback(async (status, page = 1) => {
    try {
      setLoading(true);
      setFetchError("");
      const response = await apiFetch(
        `/group/${groupId}/settlements?status=${status}&page=${page}&limit=${LIMIT}`
      );
      setSettlements(response.settlements || []);
      setTotalCount(response.totalCount || 0);
      setCurrentPage(response.currentPage || 1);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      setFetchError(
        error?.message || "Failed to load settlements. Please try again."
      );
      setSettlements([]);
    } finally {
      setLoading(false);
    }
  }, [groupId]);
  
  useEffect(() => {
    fetchSettlements(activeTab, currentPage);
  }, [activeTab, fetchSettlements, refreshKey, currentPage]);
  
  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setCurrentPage(1);
    setSettlements([]);
  };
  
  const handlePageChange = (page) => {
    if (page === currentPage || page < 1 || page > totalPages) return;
    setCurrentPage(page);
    fetchSettlements(activeTab, page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  

  const handleGenerateSettlement = async () => {
    setIsGenerating(true);
    try {
      const response = await apiFetch(`/group/${groupId}/settlement`, {
        method: "POST",
      });
      toastSuccess(response?.message || "Settlement generated successfully!");
      setCurrentPage(1);
    } catch (error) {
      toastError(error?.message || "Failed to generate settlement.");
    } finally {
      setIsGenerating(false);
    }
  };

  const markAsPaid = async (settlementId) => {
    setMarkingPaidId(settlementId);
    try {
      const response = await apiFetch(
        `/group/settlement/${settlementId}/mark-paid`,
        { method: "POST" }
      );
      toastSuccess(response?.message || "Settlement marked as paid!");
    } catch (error) {
      toastError(error?.message || "Failed to mark as paid.");
    } finally {
      setMarkingPaidId(null);
    }
  };

  const renderAvatar = (person, colorClass) => {
    if (person?.image) {
      return (
        <img
          src={person.image}
          alt={person.name}
          className="w-12 h-12 rounded-full object-cover border-2 border-[#1a1a1a] shadow-lg"
        />
      );
    }
    return (
      <div
        className={`w-12 h-12 ${colorClass} rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg`}
      >
        {person?.name?.substring(0, 2).toUpperCase() || "??"}
      </div>
    );
  };

  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = new Set([1, totalPages, currentPage]);
    if (currentPage > 1) pages.add(currentPage - 1);
    if (currentPage < totalPages) pages.add(currentPage + 1);
    return Array.from(pages).sort((a, b) => a - b);
  };

  return (
    <>
    <GroupSocketListener groupId={groupId} />
    <div className="w-full min-h-screen bg-[#0f0f0f] p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">

        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-white">Settlement</h1>
            <motion.button
              onClick={handleGenerateSettlement}
              disabled={isGenerating}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-cyan-600/50 disabled:to-blue-600/50 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-cyan-900/30 disabled:cursor-not-allowed"
            >
              <RefreshCw size={14} className={isGenerating ? "animate-spin" : ""} />
              {isGenerating ? "Generating..." : "Generate Settlement"}
            </motion.button>
          </div>
          <p className="text-gray-400 text-sm">Settle balances for this group</p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
          className="flex items-center gap-2 mb-6 p-1 bg-[#1a1a1a] border border-gray-800 rounded-xl w-fit"
        >
          {STATUS_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive ? "text-white" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className={`absolute inset-0 rounded-lg ${
                      tab.key === "pending"
                        ? "bg-amber-600/20 border border-amber-600/40"
                        : "bg-emerald-600/20 border border-emerald-600/40"
                    }`}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon
                  size={15}
                  className={`relative z-10 ${
                    isActive
                      ? tab.key === "pending"
                        ? "text-amber-400"
                        : "text-emerald-400"
                      : "text-gray-600"
                  }`}
                />
                <span className="relative z-10">{tab.label}</span>
                {isActive && !loading && totalCount > 0 && (
                  <span
                    className={`relative z-10 text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                      tab.key === "pending"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-emerald-500/20 text-emerald-400"
                    }`}
                  >
                    {totalCount}
                  </span>
                )}
              </button>
            );
          })}
        </motion.div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4 animate-pulse"
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 h-40" />
              ))}
            </motion.div>
          ) : fetchError ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 px-4"
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-2xl border border-red-500/20 flex items-center justify-center mb-6">
                <AlertCircle className="w-9 h-9 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Couldn't load settlements
              </h2>
              <p className="text-gray-400 text-sm text-center max-w-sm mb-8">
                {fetchError}
              </p>
              <button
                onClick={() => fetchSettlements(activeTab, currentPage)}
                className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/20 text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                Retry
              </button>
            </motion.div>
          ) : settlements.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-[#1a1a1a] border border-gray-800 rounded-xl"
            >
              <div className="flex flex-col items-center justify-center py-28 px-4">
                <motion.div
                  className="w-20 h-20 bg-[#252525] rounded-full flex items-center justify-center mb-6"
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  {activeTab === "pending" ? (
                    <Clock size={36} className="text-gray-600" />
                  ) : (
                    <CheckCircle2 size={36} className="text-gray-600" />
                  )}
                </motion.div>
                <motion.h3
                  className="text-xl font-semibold text-gray-300 mb-2"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {activeTab === "pending"
                    ? "No pending settlements"
                    : "No completed settlements"}
                </motion.h3>
                <motion.p
                  className="text-gray-500 text-center max-w-sm text-sm mb-6"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  {activeTab === "pending"
                    ? "Everyone is settled up! Generate a new settlement plan if new expenses were added."
                    : "No settlements have been marked as paid yet."}
                </motion.p>
                {activeTab === "pending" && (
                  <motion.button
                    onClick={handleGenerateSettlement}
                    disabled={isGenerating}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-cyan-900/30 disabled:cursor-not-allowed"
                  >
                    <Plus size={16} />
                    {isGenerating ? "Generating..." : "Generate Settlement"}
                  </motion.button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`${activeTab}-${currentPage}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {settlements.map((settlement, index) => (
                <motion.div
                  key={settlement._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06, duration: 0.3 }}
                  className={`bg-[#1a1a1a] border rounded-xl p-6 transition-all duration-200 ${
                    activeTab === "completed"
                      ? "border-emerald-900/30 opacity-80"
                      : "border-gray-800 hover:border-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      {renderAvatar(
                        settlement.from,
                        activeTab === "completed"
                          ? "bg-gradient-to-br from-gray-600 to-gray-700"
                          : "bg-gradient-to-br from-rose-600 to-red-600"
                      )}
                      <div>
                        <div className="text-xs text-gray-500 mb-0.5">
                          {activeTab === "completed" ? "Paid" : "Pays"}
                        </div>
                        <div className="text-base font-semibold text-white">
                          {settlement.from?.name || "Unknown"}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-1 px-4">
                      <div
                        className={`text-2xl font-bold ${
                          activeTab === "completed"
                            ? "text-gray-400 line-through"
                            : "text-white"
                        }`}
                      >
                        ₹{settlement.amount?.toFixed(2) || "0.00"}
                      </div>
                      {activeTab === "completed" ? (
                        <div className="flex items-center gap-1">
                          <CheckCircle2 size={13} className="text-emerald-500" />
                          <span className="text-xs text-emerald-400 font-medium">Settled</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-500">
                          <div className="h-px w-8 bg-gray-700" />
                          <ArrowRight size={18} className="text-cyan-500" />
                          <div className="h-px w-8 bg-gray-700" />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 flex-1 justify-end">
                      <div className="text-right">
                        <div className="text-xs text-gray-500 mb-0.5">
                          {activeTab === "completed" ? "Received" : "Receives"}
                        </div>
                        <div className="text-base font-semibold text-white">
                          {settlement.to?.name || "Unknown"}
                        </div>
                      </div>
                      {renderAvatar(
                        settlement.to,
                        activeTab === "completed"
                          ? "bg-gradient-to-br from-gray-600 to-gray-700"
                          : "bg-gradient-to-br from-emerald-600 to-green-600"
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-800">
                    {activeTab === "completed" ? (
                      <p className="text-center text-xs text-gray-600">
                        {settlement.createdAt &&
                          new Date(settlement.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                      </p>
                    ) : (
                      <p className="text-center text-gray-400 text-sm">
                        <span className="text-rose-400 font-medium">
                          {settlement.from?.name || "Unknown"}
                        </span>
                        {" pays "}
                        <span className="text-emerald-400 font-medium">
                          {settlement.to?.name || "Unknown"}
                        </span>{" "}
                        <span className="text-white font-semibold">
                          ₹{settlement.amount?.toFixed(2) || "0.00"}
                        </span>
                      </p>
                    )}
                  </div>

                  {activeTab === "pending" && (
                    <div className="mt-4">
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => markAsPaid(settlement._id)}
                        disabled={markingPaidId === settlement._id}
                        className="cursor-pointer w-full py-2.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed text-gray-300 hover:text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        {markingPaidId === settlement._id ? (
                          <>
                            <RefreshCw size={14} className="animate-spin" />
                            <span>Marking as paid...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={14} />
                            <span>Mark as Paid</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              ))}

              {activeTab === "pending" && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: settlements.length * 0.06 + 0.1 }}
                  className="bg-gradient-to-br from-cyan-950/20 to-blue-950/20 border border-cyan-800/30 rounded-xl p-5"
                >
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-cyan-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 size={18} className="text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-cyan-300 mb-1">
                        Settlement Instructions
                      </h3>
                      <p className="text-xs text-cyan-400/70 leading-relaxed">
                        Complete all payments listed above to settle this group.
                        Use "Generate Settlement" if new expenses were added.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Pagination — only renders when totalPages > 1 */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center justify-between pt-2"
                >
                  <p className="text-xs text-gray-500">
                    Showing{" "}
                    <span className="text-gray-300 font-medium">
                      {(currentPage - 1) * LIMIT + 1}–
                      {Math.min(currentPage * LIMIT, totalCount)}
                    </span>{" "}
                    of{" "}
                    <span className="text-gray-300 font-medium">{totalCount}</span>
                  </p>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1a1a1a] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft size={15} />
                    </button>

                    {getPageNumbers().map((page, idx, arr) => (
                      <span key={page} className="flex items-center gap-1">
                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                          <span className="text-gray-600 text-xs px-1">…</span>
                        )}
                        <button
                          onClick={() => handlePageChange(page)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                            currentPage === page
                              ? activeTab === "pending"
                                ? "bg-amber-600/20 border border-amber-600/50 text-amber-400"
                                : "bg-emerald-600/20 border border-emerald-600/50 text-emerald-400"
                              : "bg-[#1a1a1a] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600"
                          }`}
                        >
                          {page}
                        </button>
                      </span>
                    ))}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1a1a1a] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    </>
  );
}