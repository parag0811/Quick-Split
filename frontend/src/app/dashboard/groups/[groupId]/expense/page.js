"use client";
import { apiFetch } from "@/lib/api";
import {
  Plus,
  ChevronDown,
  ChevronUp,
  Users,
  UserCheck,
  Split,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ExpensePage() {

  const router =  useRouter()

  const [expandedExpense, setExpandedExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const { groupId } = useParams();

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await apiFetch(`/group/${groupId}/expense`);
        setData(response);
      } catch (error) {
        console.log("Error while api fetching", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [groupId]);

  const formatDate = (dateString) => {
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
    const count = expense.splitBetween.length;
    return expense.splitType === "equal"
      ? `Split equally among ${count} member${count > 1 ? "s" : ""}`
      : `Split unequally among ${count} member${count > 1 ? "s" : ""}`;
  };

  const toggleExpand = (id) => {
    setExpandedExpense(expandedExpense === id ? null : id);
  };

  if (loading) {
    return <div className="text-gray-400 p-6">Loading expenses...</div>;
  }

  if (!data) return null;

  const { expenses, message, count } = data;

  return (
    <div className="w-full min-h-screen bg-[#0f0f0f] p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Expenses</h1>
            <p className="text-gray-400">
              {message} · {count} expense{count !== 1 ? "s" : ""}
            </p>
          </div>
          <button onClick={() =>  router.push(`/dashboard/groups/${groupId}/expense/create`)} className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-pink-900/30 hover:shadow-pink-900/50">
            <Plus size={20} />
            <span>Add Expense</span>
          </button>
        </div>

        {/* Expense List */}
        {expenses.length > 0 ? (
          <div className="space-y-3">
            {expenses.map((expense) => {
              const isExpanded = expandedExpense === expense._id;

              return (
                <div
                  key={expense._id}
                  className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-all duration-200"
                >
                  {/* Main Card */}
                  <div
                    onClick={() => toggleExpand(expense._id)}
                    className="p-5 cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between mb-3">
                          <h3 className="text-lg font-semibold text-white">
                            {expense.title}
                          </h3>
                          <div className="text-2xl font-bold text-white">
                            €{expense.amount.toFixed(2)}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-sm mb-3">
                          <span className="text-gray-500">
                            {formatDate(expense.date)}
                          </span>
                          <span className="text-gray-700">•</span>
                          <span className="text-gray-400">
                            Paid by{" "}
                            <span className="text-cyan-400 font-medium">
                              {expense.paidBy.name}
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
                            {isExpanded ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded */}
                  {isExpanded && (
                    <div className="border-t border-gray-800 bg-[#151515] p-5">
                      <div className="mb-4 space-y-2">
                        <div className="flex gap-2">
                          <span className="text-xs text-gray-500">
                            Category:
                          </span>
                          <span className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded text-xs">
                            {expense.category}
                          </span>
                        </div>
                        {expense.notes && (
                          <p className="text-sm text-gray-400">
                            {expense.notes}
                          </p>
                        )}
                      </div>

                      <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                        <UserCheck size={14} />
                        Split Breakdown
                      </h4>

                      <div className="space-y-2">
                        {expense.splitBetween.map((member) => (
                          <div
                            key={member.userId}
                            className="flex items-center justify-between py-2 px-3 bg-[#1a1a1a] rounded-lg"
                          >
                            <span className="text-sm text-gray-300">
                              {member.name}
                            </span>
                            <span className="text-sm font-semibold text-white">
                              €{member.amount.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl">
            <div className="flex flex-col items-center justify-center py-32 px-4">
              <Users size={56} className="text-gray-600 mb-6" />
              <h3 className="text-2xl font-semibold text-gray-300 mb-3">
                No expenses added yet
              </h3>
              <p className="text-gray-500 mb-10 text-center max-w-md">
                Start tracking by adding your first expense to this group
              </p>
              <button className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg font-medium">
                <Plus size={22} />
                <span>Add your first expense</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
