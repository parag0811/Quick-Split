"use client";
import { Receipt, ArrowRightLeft, BarChart3, Users, TrendingUp, TrendingDown, CheckCircle2, AlertCircle } from "lucide-react";

export default function GroupOverview() {
  const group = {
    _id: "group1",
    name: "Weekend Trip Planning",
    description: "Planning our upcoming mountain trip expenses",
    members: [
      { _id: "user1", name: "Sneha Kumar", avatar: "SK" },
      { _id: "user2", name: "Riya Sharma", avatar: "RS" },
      { _id: "user3", name: "Nirika Patel", avatar: "NP" },
      { _id: "user4", name: "Arjun Singh", avatar: "AS" }
    ],
    totalExpenses: 663.25,
    expenseCount: 5,
    isSettled: false,
    yourBalance: 145.50, // Can be + or - 
    pendingSettlements: 3
  };

  const isPositiveBalance = group.yourBalance > 0;
  const isZeroBalance = group.yourBalance === 0;

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
                  {group.name}
                </h1>
                <p className="text-gray-400">{group.description}</p>
              </div>
            </div>
          </div>

          {/* Members */}
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              {group.members.slice(0, 4).map((member, index) => (
                <div
                  key={member._id}
                  className="w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-[#0f0f0f] -ml-2 first:ml-0"
                  style={{ zIndex: group.members.length - index }}
                >
                  {member.avatar}
                </div>
              ))}
              {group.members.length > 4 && (
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-400 border-2 border-[#0f0f0f] -ml-2">
                  +{group.members.length - 4}
                </div>
              )}
            </div>
            <span className="text-sm text-gray-400">
              {group.members.length} member{group.members.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Total Expenses */}
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#151515] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-gray-400">Total Expenses</div>
              <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <Receipt size={20} className="text-purple-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              €{group.totalExpenses.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">
              {group.expenseCount} expense{group.expenseCount !== 1 ? "s" : ""} recorded
            </div>
          </div>

          {/* Your Balance */}
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#151515] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-gray-400">Your Balance</div>
              <div className={`w-10 h-10 ${isPositiveBalance ? 'bg-emerald-600/20' : isZeroBalance ? 'bg-gray-600/20' : 'bg-rose-600/20'} rounded-lg flex items-center justify-center`}>
                {isPositiveBalance ? (
                  <TrendingUp size={20} className="text-emerald-400" />
                ) : isZeroBalance ? (
                  <CheckCircle2 size={20} className="text-gray-400" />
                ) : (
                  <TrendingDown size={20} className="text-rose-400" />
                )}
              </div>
            </div>
            <div className={`text-3xl font-bold mb-1 ${isPositiveBalance ? 'text-emerald-400' : isZeroBalance ? 'text-gray-400' : 'text-rose-400'}`}>
              {isPositiveBalance ? '+' : ''}€{Math.abs(group.yourBalance).toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">
              {isPositiveBalance ? 'You get back' : isZeroBalance ? 'All settled' : 'You owe'}
            </div>
          </div>

          {/* Settlement Status */}
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#151515] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-gray-400">Settlement Status</div>
              <div className={`w-10 h-10 ${group.isSettled ? 'bg-emerald-600/20' : 'bg-amber-600/20'} rounded-lg flex items-center justify-center`}>
                {group.isSettled ? (
                  <CheckCircle2 size={20} className="text-emerald-400" />
                ) : (
                  <AlertCircle size={20} className="text-amber-400" />
                )}
              </div>
            </div>
            <div className={`text-3xl font-bold mb-1 ${group.isSettled ? 'text-emerald-400' : 'text-amber-400'}`}>
              {group.isSettled ? 'Settled' : `${group.pendingSettlements}`}
            </div>
            <div className="text-xs text-gray-500">
              {group.isSettled ? 'All balanced' : `Pending payment${group.pendingSettlements !== 1 ? 's' : ''}`}
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
            <p className="text-sm text-gray-400">
              View all recorded expenses
            </p>
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
            <p className="text-sm text-gray-400">
              See who owes whom
            </p>
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
            <p className="text-sm text-gray-400">
              View spending insights
            </p>
          </button>
        </div>

        {/* (if not settled) */}
        {!group.isSettled && (
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
                  This group has {group.pendingSettlements} pending payment{group.pendingSettlements !== 1 ? 's' : ''}. 
                  Visit the Settlement page to see details and mark payments as complete.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}