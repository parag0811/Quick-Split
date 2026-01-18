"use client";
import { Plus, ChevronDown, ChevronUp, Users, UserCheck, Split } from "lucide-react";
import { useState } from "react";

export default function ExpensePage() {
  const [expandedExpense, setExpandedExpense] = useState(null);

  const expenses = [
    {
      _id: "1",
      title: "Dinner at Italian Restaurant",
      amount: 156.75,
      date: "2026-01-15",
      paidBy: {
        _id: "user1",
        name: "Sneha Kumar",
        avatar: "SK"
      },
      category: "Food",
      notes: "Team dinner after project completion",
      splitType: "equal",
      splitBetween: [
        { userId: "user1", name: "Sneha Kumar", amount: 39.19 },
        { userId: "user2", name: "Riya Sharma", amount: 39.19 },
        { userId: "user3", name: "Nirika Patel", amount: 39.19 },
        { userId: "user4", name: "Arjun Singh", amount: 39.19 }
      ]
    },
    {
      _id: "2",
      title: "Cab to Airport",
      amount: 45.00,
      date: "2026-01-14",
      paidBy: {
        _id: "user2",
        name: "Riya Sharma",
        avatar: "RS"
      },
      category: "Travel",
      notes: "",
      splitType: "equal",
      splitBetween: [
        { userId: "user1", name: "Sneha Kumar", amount: 15.00 },
        { userId: "user2", name: "Riya Sharma", amount: 15.00 },
        { userId: "user3", name: "Nirika Patel", amount: 15.00 }
      ]
    },
    {
      _id: "3",
      title: "Hotel Booking",
      amount: 320.00,
      date: "2026-01-13",
      paidBy: {
        _id: "user3",
        name: "Nirika Patel",
        avatar: "NP"
      },
      category: "Accommodation",
      notes: "Beach resort - 2 nights",
      splitType: "unequal",
      splitBetween: [
        { userId: "user1", name: "Sneha Kumar", amount: 80.00 },
        { userId: "user2", name: "Riya Sharma", amount: 80.00 },
        { userId: "user3", name: "Nirika Patel", amount: 120.00 },
        { userId: "user4", name: "Arjun Singh", amount: 40.00 }
      ]
    },
    {
      _id: "4",
      title: "Grocery Shopping",
      amount: 89.50,
      date: "2026-01-12",
      paidBy: {
        _id: "user1",
        name: "Sneha Kumar",
        avatar: "SK"
      },
      category: "Food",
      notes: "Weekly groceries for apartment",
      splitType: "equal",
      splitBetween: [
        { userId: "user1", name: "Sneha Kumar", amount: 44.75 },
        { userId: "user2", name: "Riya Sharma", amount: 44.75 }
      ]
    },
    {
      _id: "5",
      title: "Movie Tickets",
      amount: 52.00,
      date: "2026-01-11",
      paidBy: {
        _id: "user4",
        name: "Arjun Singh",
        avatar: "AS"
      },
      category: "Entertainment",
      notes: "",
      splitType: "equal",
      splitBetween: [
        { userId: "user1", name: "Sneha Kumar", amount: 13.00 },
        { userId: "user2", name: "Riya Sharma", amount: 13.00 },
        { userId: "user3", name: "Nirika Patel", amount: 13.00 },
        { userId: "user4", name: "Arjun Singh", amount: 13.00 }
      ]
    }
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }
  };

  const getSplitDescription = (expense) => {
    const count = expense.splitBetween.length;
    if (expense.splitType === "equal") {
      return `Split equally among ${count} member${count > 1 ? "s" : ""}`;
    } else {
      return `Split unequally among ${count} member${count > 1 ? "s" : ""}`;
    }
  };

  const toggleExpand = (id) => {
    setExpandedExpense(expandedExpense === id ? null : id);
  };

  return (
    <div className="w-full min-h-screen bg-[#0f0f0f] p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Expenses</h1>
            <p className="text-gray-400">All expenses recorded for this group</p>
          </div>
          <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-pink-900/30 hover:shadow-pink-900/50">
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
                  {/* Main Expense Card - Clickable */}
                  <div
                    onClick={() => toggleExpand(expense._id)}
                    className="p-5 cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Left Section */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-semibold text-white">
                            {expense.title}
                          </h3>
                          <div className="text-right ml-4">
                            <div className="text-2xl font-bold text-white">
                              €{expense.amount.toFixed(2)}
                            </div>
                          </div>
                        </div>

                        {/* Metadata Row */}
                        <div className="flex flex-wrap items-center gap-3 text-sm mb-3">
                          <span className="text-gray-500">{formatDate(expense.date)}</span>
                          <span className="text-gray-700">•</span>
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-full flex items-center justify-center text-[9px] font-bold text-white">
                              {expense.paidBy.avatar}
                            </div>
                            <span className="text-gray-400">
                              Paid by <span className="text-cyan-400 font-medium">{expense.paidBy.name}</span>
                            </span>
                          </div>
                        </div>

                        {/* Distribution Summary */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            {expense.splitType === "equal" ? (
                              <Users size={16} className="text-emerald-500" />
                            ) : (
                              <Split size={16} className="text-amber-500" />
                            )}
                            <span>{getSplitDescription(expense)}</span>
                          </div>
                          
                          {/* Expand Indicator */}
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

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-800 bg-[#151515] p-5">
                      {/* Category & Notes */}
                      <div className="mb-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Category:</span>
                          <span className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded text-xs font-medium">
                            {expense.category}
                          </span>
                        </div>
                        {expense.notes && (
                          <div className="flex gap-2">
                            <span className="text-xs text-gray-500">Notes:</span>
                            <span className="text-sm text-gray-400">{expense.notes}</span>
                          </div>
                        )}
                      </div>

                      {/* Split Breakdown */}
                      <div>
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
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center text-[9px] font-bold text-white">
                                  {member.name.split(" ").map(n => n[0]).join("")}
                                </div>
                                <span className="text-sm text-gray-300">{member.name}</span>
                              </div>
                              <span className="text-sm font-semibold text-white">
                                €{member.amount.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
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
              <div className="w-28 h-28 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center mb-6 shadow-xl">
                <Users size={56} className="text-gray-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-300 mb-3">
                No expenses added yet
              </h3>
              <p className="text-gray-500 mb-10 text-center max-w-md text-base">
                Start tracking by adding your first expense to this group
              </p>
              <button className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-pink-900/30 hover:shadow-pink-900/50 hover:scale-105">
                <Plus size={22} />
                <span className="text-base">Add your first expense</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}