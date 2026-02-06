"use client";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  Share2,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useParams } from "next/navigation";

export default function SettlementPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

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
      const response = await apiFetch(
        `/group/${groupId}/settlements/generate`,
        {
          method: "POST",
        },
      );
      setData(response);
    } catch (error) {
      console.log("Error generating settlements", error);
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

  const { message, settlements, pendingSettlements, completedSettlements } =
    data;
  const groupName = data.groupName || "Group";
  const isSettled = pendingSettlements?.length === 0;
  const activePendingSettlements = pendingSettlements || [];

  return (
    <div className="w-full min-h-screen bg-[#0f0f0f] p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-white">Settlement</h1>
            <div className="flex items-center gap-2">
              {!isSettled && (
                <>
                  <button className="p-2 bg-[#1a1a1a] hover:bg-[#252525] border border-gray-800 rounded-lg transition-all text-gray-400 hover:text-white">
                    <Share2 size={18} />
                  </button>
                  <button className="p-2 bg-[#1a1a1a] hover:bg-[#252525] border border-gray-800 rounded-lg transition-all text-gray-400 hover:text-white">
                    <Download size={18} />
                  </button>
                </>
              )}
            </div>
          </div>
          <p className="text-gray-400">Settle balances for {groupName}</p>

          <div className="mt-4 flex items-center gap-3 flex-wrap">
            {isSettled ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-950/30 border border-emerald-800/30 rounded-lg">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-emerald-400">
                  Group is settled
                </span>
              </div>
            ) : (
              <>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-950/30 border border-amber-800/30 rounded-lg">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-amber-400">
                    {activePendingSettlements.length} pending settlement
                    {activePendingSettlements.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <button
                  onClick={handleGenerateSettlement}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-cyan-600/50 disabled:to-blue-600/50 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-lg shadow-cyan-900/30 hover:shadow-cyan-900/50 disabled:cursor-not-allowed"
                >
                  <RefreshCw
                    size={14}
                    className={isGenerating ? "animate-spin" : ""}
                  />
                  {isGenerating ? "Generating..." : "Regenerate Settlement"}
                </button>
              </>
            )}
          </div>

          {/* Show completed settlements count if any */}
          {completedSettlements && completedSettlements.length > 0 && (
            <div className="mt-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-950/20 border border-emerald-800/20 rounded-lg">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span className="text-sm text-emerald-400">
                  {completedSettlements.length} completed settlement
                  {completedSettlements.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Settlement Instructions */}
        {!isSettled ? (
          <div className="space-y-4">
            {activePendingSettlements.map((settlement) => (
              <div
                key={settlement._id}
                className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all duration-200"
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Payer (Left) */}
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-rose-600 to-red-600 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg">
                      {settlement.payer?.avatar ||
                        settlement.payer?.name?.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-0.5">Payer</div>
                      <div className="text-base font-semibold text-white">
                        {settlement.payer?.name || "Unknown"}
                      </div>
                    </div>
                  </div>

                  {/* Amount & Arrow (Center) */}
                  <div className="flex flex-col items-center gap-2 px-4">
                    <div className="text-2xl font-bold text-white">
                      €{settlement.amount?.toFixed(2) || "0.00"}
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <div className="h-px w-8 bg-gray-700"></div>
                      <ArrowRight size={20} className="text-cyan-500" />
                      <div className="h-px w-8 bg-gray-700"></div>
                    </div>
                  </div>

                  {/* Receiver (Right) */}
                  <div className="flex items-center gap-3 flex-1 justify-end">
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-0.5">
                        Receiver
                      </div>
                      <div className="text-base font-semibold text-white">
                        {settlement.receiver?.name || "Unknown"}
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-green-600 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg">
                      {settlement.receiver?.avatar ||
                        settlement.receiver?.name
                          ?.substring(0, 2)
                          .toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Action Text (Responsive) */}
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <p className="text-center text-gray-400 text-sm">
                    <span className="text-rose-400 font-medium">
                      {settlement.payer?.name || "Unknown"}
                    </span>
                    {" pays "}
                    <span className="text-emerald-400 font-medium">
                      {settlement.receiver?.name || "Unknown"}
                    </span>{" "}
                    <span className="text-white font-semibold">
                      €{settlement.amount?.toFixed(2) || "0.00"}
                    </span>
                  </p>
                </div>

                <div className="mt-4">
                  <button className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg text-sm font-medium transition-all duration-200">
                    Mark as Paid
                  </button>
                </div>
              </div>
            ))}

            {/* Info Card */}
            <div className="bg-gradient-to-br from-cyan-950/20 to-blue-950/20 border border-cyan-800/30 rounded-xl p-5">
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
                    Once all payments are marked as paid, the group will be
                    fully settled. Use "Regenerate Settlement" if new expenses
                    were added.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Settled State */
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl">
            <div className="flex flex-col items-center justify-center py-32 px-4">
              <div className="w-28 h-28 bg-gradient-to-br from-emerald-600 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-900/50">
                <CheckCircle2 size={56} className="text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-emerald-400 mb-3">
                All balances are settled! 🎉
              </h3>
              <p className="text-gray-400 text-center max-w-md text-base">
                Everyone in this group is squared up. No pending payments
                required.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
