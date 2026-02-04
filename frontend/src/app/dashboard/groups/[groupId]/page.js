"use client";
import { apiFetch } from "@/lib/api";
import {
  Receipt,
  ArrowRightLeft,
  BarChart3,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function GroupOverview() {
  const { groupId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const response = await apiFetch(`/groups/${groupId}/summary`);
        console.log(response);
        setData(response);
      } catch (error) {
        console.log("Error fetching: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGroupDetails();
  }, [groupId]);

  if (loading || !data) {
    return (
      <div className="w-full min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  const isPositiveBalance = data.yourBalance > 0;
  const isZeroBalance = data.yourBalance === 0;

  return (
    <div className="w-full min-h-screen bg-[#0f0f0f] p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                🏔️
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {data.group.name}
                </h1>
                <p className="text-gray-400">{data.group.description}</p>
              </div>
            </div>
          </div>

          {/* Members */}
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              {data.members.slice(0, 4).map((member, index) => (
                <div
                  key={member._id}
                  className="w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-[#0f0f0f] -ml-2 first:ml-0 overflow-hidden"
                  style={{ zIndex: data.members.length - index }}
                >
                  {member.image ? (
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    member.name.charAt(0).toUpperCase()
                  )}
                </div>
              ))}
              {data.members.length > 4 && (
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-400 border-2 border-[#0f0f0f] -ml-2">
                  +{data.members.length - 4}
                </div>
              )}
            </div>
            <span className="text-sm text-gray-400">
              {data.members.length} member
              {data.members.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Total Expenses */}
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#151515] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-gray-400">
                Total Expenses
              </div>
              <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <Receipt size={20} className="text-purple-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              €{data.totalExpenses.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">
              {data.expenseCount} expense{data.expenseCount !== 1 ? "s" : ""}{" "}
              recorded
            </div>
          </div>

          {/* Your Balance */}
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#151515] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-gray-400">
                Your Balance
              </div>
              <div
                className={`w-10 h-10 ${isPositiveBalance ? "bg-emerald-600/20" : isZeroBalance ? "bg-gray-600/20" : "bg-rose-600/20"} rounded-lg flex items-center justify-center`}
              >
                {isPositiveBalance ? (
                  <TrendingUp size={20} className="text-emerald-400" />
                ) : isZeroBalance ? (
                  <CheckCircle2 size={20} className="text-gray-400" />
                ) : (
                  <TrendingDown size={20} className="text-rose-400" />
                )}
              </div>
            </div>
            <div
              className={`text-3xl font-bold mb-1 ${isPositiveBalance ? "text-emerald-400" : isZeroBalance ? "text-gray-400" : "text-rose-400"}`}
            >
              {isPositiveBalance ? "+" : ""}€
              {Math.abs(data.yourBalance).toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">
              {isPositiveBalance
                ? "You get back"
                : isZeroBalance
                  ? "All settled"
                  : "You owe"}
            </div>
          </div>

          {/* Settlement Status */}
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#151515] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-gray-400">
                Settlement Status
              </div>
              <div
                className={`w-10 h-10 ${data.isSettled ? "bg-emerald-600/20" : "bg-amber-600/20"} rounded-lg flex items-center justify-center`}
              >
                {data.isSettled ? (
                  <CheckCircle2 size={20} className="text-emerald-400" />
                ) : (
                  <AlertCircle size={20} className="text-amber-400" />
                )}
              </div>
            </div>
            <div
              className={`text-3xl font-bold mb-1 ${data.isSettled ? "text-emerald-400" : "text-amber-400"}`}
            >
              {data.isSettled ? "Settled" : `${data.youOwe.length + data.youGet.length}`}
            </div>
            <div className="text-xs text-gray-500">
              {data.isSettled
                ? "All balanced"
                : `Pending payment${(data.youOwe.length + data.youGet.length) !== 1 ? "s" : ""}`}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Expenses */}
          <button className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 hover:border-cyan-700 hover:bg-[#1f1f1f] transition-all duration-200 text-left group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-cyan-600/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Receipt size={24} className="text-cyan-400" />
              </div>
              <div className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                →
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-cyan-400 transition-colors">
              Expenses
            </h3>
            <p className="text-sm text-gray-400">View all recorded expenses</p>
          </button>

          {/* Settlement */}
          <button className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 hover:border-emerald-700 hover:bg-[#1f1f1f] transition-all duration-200 text-left group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-600/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <ArrowRightLeft size={24} className="text-emerald-400" />
              </div>
              <div className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                →
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-emerald-400 transition-colors">
              Settlement
            </h3>
            <p className="text-sm text-gray-400">See who owes whom</p>
          </button>

          {/* Analytics */}
          <button className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 hover:border-purple-700 hover:bg-[#1f1f1f] transition-all duration-200 text-left group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <BarChart3 size={24} className="text-purple-400" />
              </div>
              <div className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                →
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-purple-400 transition-colors">
              Analytics
            </h3>
            <p className="text-sm text-gray-400">View spending insights</p>
          </button>
        </div>

        {/* Pending Settlements Alert */}
        {!data.isSettled && (
          <div className="mt-6 bg-gradient-to-r from-amber-950/30 to-orange-950/30 border border-amber-800/30 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-amber-600/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertCircle size={18} className="text-amber-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-amber-300 mb-1">
                  Pending Settlements
                </h4>
                <p className="text-sm text-amber-400/80 leading-relaxed">
                  This group has {data.youOwe.length + data.youGet.length} pending payment
                  {(data.youOwe.length + data.youGet.length) !== 1 ? "s" : ""}. Visit the
                  Settlement page to see details and mark payments as complete.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}