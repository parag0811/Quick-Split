"use client";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Receipt,
  Plus,
  CheckCircle2,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function SettlementPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null)

  const { groupId } = useParams();

  useEffect(() => {
    const fetchSettlements = async () => {
      try {
        const response = await apiFetch(`/group/${groupId}/settlements`);
        setData(response);
        console.log(response);
      } catch (error) {
        console.log("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettlements();
  }, [groupId]);

  const handleGenerateSettlement = async () => {
    setIsGenerating(true);
    try {
      const response = await apiFetch(`/group/${groupId}/settlement`, {
        method: "POST",
      });
      setData(response);
    } catch (error) {
      console.log("Error generating settlements", error);
      setError(error)
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="text-cyan-500 animate-spin" />
          <p className="text-gray-400">Loading settlements...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg">Failed to load settlements</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { pendingSettlements, completedSettlements } = data;
  const groupName = data.groupName || "Group";
  const pending = pendingSettlements || [];
  const hasSettlements = pending.length > 0;

  return (
    <div className="w-full min-h-screen bg-[#0f0f0f] p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
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
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-cyan-600/50 disabled:to-blue-600/50 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-cyan-900/30 disabled:cursor-not-allowed"
            >
              <RefreshCw size={14} className={isGenerating ? "animate-spin" : ""} />
              {isGenerating ? "Generating..." : "Generate Settlement"}
            </motion.button>
          </div>
          <p className="text-gray-400">Settle balances for {groupName}</p>

          {hasSettlements && (
            <motion.div
              className="mt-4 flex items-center gap-3 flex-wrap"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-950/30 border border-amber-800/30 rounded-lg">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-amber-400">
                  {pending.length} pending settlement{pending.length !== 1 ? "s" : ""}
                </span>
              </div>
              {completedSettlements?.length > 0 && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-950/20 border border-emerald-800/20 rounded-lg">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <span className="text-sm text-emerald-400">
                    {completedSettlements.length} completed
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Empty state */}
        {!hasSettlements ? (
          <motion.div
            className="bg-[#1a1a1a] border border-gray-800 rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <div className="flex flex-col items-center justify-center py-32 px-4">
              <motion.div
                className="w-20 h-20 bg-[#252525] rounded-full flex items-center justify-center mb-6"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.4, type: "spring", stiffness: 200 }}
              >
                <Receipt size={36} className="text-gray-600" />
              </motion.div>
              <motion.h3
                className="text-xl font-semibold text-gray-300 mb-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.3 }}
              >
                No settlements yet
              </motion.h3>
              <motion.p
                className="text-gray-500 text-center max-w-sm text-sm mb-6"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
              >
                Generate a settlement plan to see who owes what and settle all balances in the fewest transactions.
              </motion.p>
              <motion.button
                onClick={handleGenerateSettlement}
                disabled={isGenerating}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.3 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-cyan-600/50 disabled:to-blue-600/50 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-cyan-900/30 disabled:cursor-not-allowed"
              >
                <Plus size={16} />
                {isGenerating ? "Generating..." : "Generate Settlement"}
              </motion.button>
            </div>
          </motion.div>
        ) : (
          /* Settlement list */
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            {pending.map((settlement, index) => (
              <motion.div
                key={settlement._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.08, duration: 0.35 }}
                className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all duration-200"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-rose-600 to-red-600 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg">
                      {settlement.payer?.avatar || settlement.from?.name?.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-0.5">Payer</div>
                      <div className="text-base font-semibold text-white">
                        {settlement.from?.name || "Unknown"}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-2 px-4">
                    <div className="text-2xl font-bold text-white">
                      ₹{settlement.amount?.toFixed(2) || "0.00"}
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <div className="h-px w-8 bg-gray-700" />
                      <ArrowRight size={20} className="text-cyan-500" />
                      <div className="h-px w-8 bg-gray-700" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-1 justify-end">
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-0.5">Receiver</div>
                      <div className="text-base font-semibold text-white">
                        {settlement.to?.name || "Unknown"}
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-green-600 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg">
                      {settlement.to?.avatar || settlement.receiver?.name?.substring(0, 2).toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-800">
                  <p className="text-center text-gray-400 text-sm">
                    <span className="text-rose-400 font-medium">{settlement.from?.name || "Unknown"}</span>
                    {" pays "}
                    <span className="text-emerald-400 font-medium">{settlement.to?.name || "Unknown"}</span>
                    {" "}
                    <span className="text-white font-semibold">₹{settlement.amount?.toFixed(2) || "0.00"}</span>
                  </p>
                </div>

                <div className="mt-4">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    Mark as Paid
                  </motion.button>
                </div>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + pending.length * 0.08, duration: 0.35 }}
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
                    Complete all payments listed above to settle this group. Use "Generate Settlement" if new expenses were added.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}