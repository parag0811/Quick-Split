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
  ChevronDown,
  ChevronUp,
  Users,
  Trash2,
  UserMinus,
  X,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function GroupOverview() {
  const { groupId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAllMembers, setShowAllMembers] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

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

  const handleDeleteGroup = async () => {
    if (deleteConfirmation !== data.group.name) return;

    setDeleting(true);
    try {
      const response = await apiFetch(`/groups/${groupId}/delete`, {
        method: "DELETE",
      });
      console.log(response);
      setError(response.error);
      console.log(error)
      router.push("/dashboard/groups");
    } catch (error) {
      console.log("Error deleting", error);
    } finally {
      setDeleting(false);
      setDeleteConfirmation("");
      setShowDeleteModal(false);
    }
  };

  // const handleRemoveMember = (memberId, memberName) => {

  // };

  if (loading || !data) {
    return (
      <div className="w-full min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-gray-400"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  const isPositiveBalance = data.yourBalance > 0;
  const isZeroBalance = data.yourBalance === 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full min-h-screen bg-[#0f0f0f] p-4 sm:p-6 lg:p-8"
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-start gap-4">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.2,
                }}
                className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-2xl shadow-lg"
              >
                🏔️
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h1 className="text-3xl font-bold text-white mb-2">
                  {data.group.name}
                </h1>
                <p className="text-gray-400">{data.group.description}</p>
              </motion.div>
            </div>

            {/* Delete Group Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDeleteModal(true)}
              className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-600/50 hover:border-rose-600 text-rose-400 rounded-lg font-medium transition-all duration-200"
            >
              <Trash2 size={18} />
              <span className="hidden sm:inline">Delete Group</span>
            </motion.button>
          </div>

          {/* Members Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center"
                >
                  <Users size={20} className="text-blue-400" />
                </motion.div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Members</h3>
                  <p className="text-xs text-gray-400">
                    {data.members.length} member
                    {data.members.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAllMembers(!showAllMembers)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm text-gray-300 cursor-pointer"
              >
                <motion.div
                  animate={{ rotate: showAllMembers ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {showAllMembers ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </motion.div>
                {showAllMembers ? "Hide" : "Show All"}
              </motion.button>
            </div>

            {/* Member Avatars Preview */}
            <AnimatePresence mode="wait">
              {!showAllMembers && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex items-center">
                    {data.members.slice(0, 5).map((member, index) => (
                      <motion.div
                        key={member._id}
                        initial={{ opacity: 0, scale: 0, x: -20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        transition={{
                          delay: index * 0.05,
                          type: "spring",
                          stiffness: 200,
                        }}
                        whileHover={{ scale: 1.2, zIndex: 999 }}
                        className="w-9 h-9 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-[#1a1a1a] -ml-2 first:ml-0 overflow-hidden"
                        style={{ zIndex: data.members.length - index }}
                        title={member.name}
                      >
                        {member.name.charAt(0).toUpperCase()}
                      </motion.div>
                    ))}
                    {data.members.length > 5 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.25, type: "spring" }}
                        className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center text-xs font-bold text-gray-400 border-2 border-[#1a1a1a] -ml-2"
                      >
                        +{data.members.length - 5}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Full Members List */}
              {showAllMembers && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2 mt-2"
                >
                  {data.members.map((member, index) => (
                    <motion.div
                      key={member._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      className="flex items-center justify-between gap-3 p-3 bg-[#151515] rounded-lg border border-gray-800 hover:border-gray-700 transition-colors group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center text-sm font-bold text-white overflow-hidden flex-shrink-0">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {member.name}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {member.email}
                          </p>
                        </div>
                      </div>

                      {/* Remove Member Button */}
                      <motion.button
                        className="group-hover:opacity-100 transition-opacity flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-600/50 hover:border-rose-600 text-rose-400 rounded-lg text-xs font-medium cursor-pointer"
                        onClick={() =>
                          handleRemoveMember(member._id, member.name)
                        }
                      >
                        <UserMinus size={14} />
                        <span>Remove</span>
                      </motion.button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Total Expenses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            whileHover={{ scale: 1.03, y: -5 }}
            className="bg-gradient-to-br from-[#1a1a1a] to-[#151515] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-gray-400">
                Total Expenses
              </div>
              <motion.div
                whileHover={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center"
              >
                <Receipt size={20} className="text-purple-400" />
              </motion.div>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
              className="text-3xl font-bold text-white mb-1"
            >
              €{data.totalExpenses.toFixed(2)}
            </motion.div>
            <div className="text-xs text-gray-500">
              {data.expenseCount} expense{data.expenseCount !== 1 ? "s" : ""}{" "}
              recorded
            </div>
          </motion.div>

          {/* Your Balance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            whileHover={{ scale: 1.03, y: -5 }}
            className="bg-gradient-to-br from-[#1a1a1a] to-[#151515] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-gray-400">
                Your Balance
              </div>
              <motion.div
                whileHover={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.5 }}
                className={`w-10 h-10 ${isPositiveBalance ? "bg-emerald-600/20" : isZeroBalance ? "bg-gray-600/20" : "bg-rose-600/20"} rounded-lg flex items-center justify-center`}
              >
                {isPositiveBalance ? (
                  <TrendingUp size={20} className="text-emerald-400" />
                ) : isZeroBalance ? (
                  <CheckCircle2 size={20} className="text-gray-400" />
                ) : (
                  <TrendingDown size={20} className="text-rose-400" />
                )}
              </motion.div>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
              className={`text-3xl font-bold mb-1 ${isPositiveBalance ? "text-emerald-400" : isZeroBalance ? "text-gray-400" : "text-rose-400"}`}
            >
              {isPositiveBalance ? "+" : ""}€
              {Math.abs(data.yourBalance).toFixed(2)}
            </motion.div>
            <div className="text-xs text-gray-500">
              {isPositiveBalance
                ? "You get back"
                : isZeroBalance
                  ? "All settled"
                  : "You owe"}
            </div>
          </motion.div>

          {/* Pending Settlements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            whileHover={{ scale: 1.03, y: -5 }}
            className="bg-gradient-to-br from-[#1a1a1a] to-[#151515] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-gray-400">
                Settlement Status
              </div>
              <motion.div
                whileHover={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.5 }}
                className={`w-10 h-10 ${data.isSettled ? "bg-emerald-600/20" : "bg-amber-600/20"} rounded-lg flex items-center justify-center`}
              >
                {data.isSettled ? (
                  <CheckCircle2 size={20} className="text-emerald-400" />
                ) : (
                  <AlertCircle size={20} className="text-amber-400" />
                )}
              </motion.div>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
              className={`text-3xl font-bold mb-1 ${data.isSettled ? "text-emerald-400" : "text-amber-400"}`}
            >
              {data.isSettled
                ? "Settled"
                : `${data.youOwe.length + data.youGet.length}`}
            </motion.div>
            <div className="text-xs text-gray-500">
              {data.isSettled
                ? "All balanced"
                : `Pending payment${data.youOwe.length + data.youGet.length !== 1 ? "s" : ""}`}
            </div>
          </motion.div>
        </div>

        {/* Settlement Details */}
        <AnimatePresence>
          {!data.isSettled &&
            (data.youOwe.length > 0 || data.youGet.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="mb-8 space-y-4"
              >
                {/* You Owe */}
                {data.youOwe.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.9 }}
                    className="bg-gradient-to-br from-[#1a1a1a] to-[#151515] border border-rose-800/30 rounded-xl p-5"
                  >
                    <h3 className="text-sm font-semibold text-rose-400 mb-3 flex items-center gap-2">
                      <TrendingDown size={16} />
                      You Owe
                    </h3>
                    <div className="space-y-2">
                      {data.youOwe.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.9 + index * 0.1 }}
                          whileHover={{ scale: 1.02, x: 5 }}
                          className="flex items-center justify-between p-3 bg-[#0f0f0f] rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <motion.div
                              whileHover={{ scale: 1.2, rotate: 5 }}
                              className="w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center text-xs font-bold text-white overflow-hidden"
                            >
                              {item.to.name.charAt(0).toUpperCase()}
                            </motion.div>
                            <div>
                              <p className="text-sm font-medium text-white">
                                {item.to.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                {item.to.email}
                              </p>
                            </div>
                          </div>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              delay: 1 + index * 0.1,
                              type: "spring",
                            }}
                            className="text-right"
                          >
                            <p className="text-lg font-bold text-rose-400">
                              €{item.amount.toFixed(2)}
                            </p>
                          </motion.div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* You Get */}
                {data.youGet.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 1 }}
                    className="bg-gradient-to-br from-[#1a1a1a] to-[#151515] border border-emerald-800/30 rounded-xl p-5"
                  >
                    <h3 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                      <TrendingUp size={16} />
                      You Get Back
                    </h3>
                    <div className="space-y-2">
                      {data.youGet.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1 + index * 0.1 }}
                          whileHover={{ scale: 1.02, x: 5 }}
                          className="flex items-center justify-between p-3 bg-[#0f0f0f] rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <motion.div
                              whileHover={{ scale: 1.2, rotate: 5 }}
                              className="w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center text-xs font-bold text-white overflow-hidden"
                            >
                              {item.from.name.charAt(0).toUpperCase()}
                            </motion.div>
                            <div>
                              <p className="text-sm font-medium text-white">
                                {item.from.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                {item.from.email}
                              </p>
                            </div>
                          </div>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              delay: 1.1 + index * 0.1,
                              type: "spring",
                            }}
                            className="text-right"
                          >
                            <p className="text-lg font-bold text-emerald-400">
                              €{item.amount.toFixed(2)}
                            </p>
                          </motion.div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
        </AnimatePresence>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() =>
              router.push(`/dashboard/groups/${data.group.id}/expense`)
            }
            className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 hover:border-cyan-700 hover:bg-[#1f1f1f] transition-all duration-200 text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <motion.div
                whileHover={{ scale: 1.2, rotate: 10 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-12 h-12 bg-cyan-600/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
              >
                <Receipt size={24} className="text-cyan-400" />
              </motion.div>
              <motion.div
                initial={{ x: -10, opacity: 0 }}
                whileHover={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="text-cyan-400"
              >
                →
              </motion.div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-cyan-400 transition-colors">
              Expenses
            </h3>
            <p className="text-sm text-gray-400">View all recorded expenses</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() =>
              router.push(`/dashboard/groups/${data.group.id}/settlement`)
            }
            className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 hover:border-emerald-700 hover:bg-[#1f1f1f] transition-all duration-200 text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <motion.div
                whileHover={{ scale: 1.2, rotate: 10 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-12 h-12 bg-emerald-600/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
              >
                <ArrowRightLeft size={24} className="text-emerald-400" />
              </motion.div>
              <motion.div
                initial={{ x: -10, opacity: 0 }}
                whileHover={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="text-emerald-400"
              >
                →
              </motion.div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-emerald-400 transition-colors">
              Settlement
            </h3>
            <p className="text-sm text-gray-400">See who owes whom</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 hover:border-purple-700 hover:bg-[#1f1f1f] transition-all duration-200 text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <motion.div
                whileHover={{ scale: 1.2, rotate: 10 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
              >
                <BarChart3 size={24} className="text-purple-400" />
              </motion.div>
              <motion.div
                initial={{ x: -10, opacity: 0 }}
                whileHover={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="text-purple-400"
              >
                →
              </motion.div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-purple-400 transition-colors">
              Analytics
            </h3>
            <p className="text-sm text-gray-400">View spending insights</p>
          </motion.button>
        </motion.div>
      </div>

      {/* Delete Group Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => {
              setShowDeleteModal(false);
              setDeleteConfirmation("");
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1a1a1a] border border-rose-800/30 rounded-xl p-6 w-full max-w-md shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-rose-600/20 rounded-lg flex items-center justify-center border border-rose-600/50">
                    <Trash2 size={24} className="text-rose-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      Delete Group
                    </h2>
                    <p className="text-sm text-gray-400">
                      This action cannot be undone
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmation("");
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-rose-600/10 border border-rose-600/30 rounded-lg">
                  <p className="text-sm text-rose-300">
                    <strong>Warning:</strong> Deleting this group will
                    permanently remove all expenses, settlements, and member
                    data. This action cannot be undone.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Type{" "}
                    <span className="font-bold text-white">
                      {data.group.name}
                    </span>{" "}
                    to confirm
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="Enter group name"
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-rose-600 focus:ring-2 focus:ring-rose-600/20 transition-all"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmation("");
                  }}
                  className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-all duration-200 border border-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteGroup}
                  disabled={deleteConfirmation !== data.group.name || deleting}
                  className="flex-1 px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-rose-600"
                >
                  {deleting ? "Deleting..." : "Delete Group"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
