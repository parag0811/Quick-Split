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
  RefreshCw,
  Copy,
  Check,
  Link2,
  Clock,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import GroupSocketListener from "@/components/socket/GroupSocketListener";

export default function GroupOverview() {
  const { groupId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAllMembers, setShowAllMembers] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [regeneratingInvite, setRegeneratingInvite] = useState(false);
  const [inviteData, setInviteData] = useState(null);
  const [copied, setCopied] = useState(false);

  const router = useRouter();

  const fetchGroupDetails = async () => {
    try {
      setLoading(true)
      const response = await apiFetch(`/groups/${groupId}/summary`);
      console.log(response);
      setData(response);
    } catch (error) {
      console.log("Error fetching: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupId) fetchGroupDetails();
  }, [groupId]);

  const handleDeleteGroup = async () => {
    if (deleteConfirmation !== data.group.name) return;

    setDeleting(true);
    try {
      const response = await apiFetch(`/groups/${groupId}/delete`, {
        method: "DELETE",
      });
      console.log(response);
      if (response.error) {
        setError(response.error);
        console.log(error);
      } else {
        router.push("/dashboard/groups");
      }
    } catch (error) {
      console.log("Error deleting", error);
      setError(error.message || "Failed to delete group");
    } finally {
      setDeleting(false);
      setDeleteConfirmation("");
      setShowDeleteModal(false);
    }
  };

  const handleRegenerateInvite = async () => {
    setRegeneratingInvite(true);
    try {
      const response = await apiFetch(`/groups/${groupId}/regenerate-invite`, {
        method: "POST",
      });
      if (response?.message) {
        setError("");
        setInviteData({
          inviteLink: response.inviteLink,
          inviteTokenExpiresAt: response.inviteTokenExpiresAt,
        });
      } else {
        setError(response?.error || "Failed to regenerate invite link");
      }
    } catch (error) {
      setError(error?.message || "Failed to regenerate invite link");
    } finally {
      setRegeneratingInvite(false);
    }
  };

  const handleCopyInvite = async () => {
    try {
      await navigator.clipboard.writeText(inviteData.inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const formatExpiryTime = (expiryDate) => {
    const date = new Date(expiryDate);
    const now = new Date();
    const hoursLeft = Math.floor((date - now) / (1000 * 60 * 60));
    const minutesLeft = Math.floor(((date - now) % (1000 * 60 * 60)) / (1000 * 60));
    if (hoursLeft > 0) return `Expires in ${hoursLeft}h ${minutesLeft}m`;
    return `Expires in ${minutesLeft}m`;
  };

  const handleRemoveMember = async (memberId, memberName) => {
    // TODO: Implement member removal
    console.log("Remove member:", memberId, memberName);
  };

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
 
  const renderMemberAvatar = (member, size = "default") => {
    const sizeClasses = {
      small: "w-8 h-8 text-xs",
      default: "w-9 h-9 text-xs",
      medium: "w-10 h-10 text-sm",
    };

    if (member.image) {
      return (
        <img
          src={member.image}
          alt={member.name}
          className={`${sizeClasses[size]} rounded-full object-cover border-2 border-[#1a1a1a]`}
        />
      );
    }

    return (
      <div
        className={`${sizeClasses[size]} bg-linear-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center font-bold text-white border-2 border-[#1a1a1a]`}
      >
        {member.name.charAt(0).toUpperCase()}
      </div>
    );
  };

  return (
    <>
    <GroupSocketListener groupId={groupId}/>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full min-h-screen bg-[#0f0f0f] p-4 sm:p-6 lg:p-8"
    >
      <div className="max-w-5xl mx-auto">
        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                <span className="text-sm text-red-300">{error}</span>
              </div>
              <button
                onClick={() => setError("")}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

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
                className="w-16 h-16 bg-linear-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-2xl shadow-lg"
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
                {data.group.description && (
                  <p className="text-gray-400">{data.group.description}</p>
                )}
              </motion.div>
            </div>

            {/* Regenerate Invite & Delete Group Buttons */}
            <div className="flex items-center gap-2">
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRegenerateInvite}
                disabled={regeneratingInvite}
                className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/50 hover:border-blue-600 text-blue-400 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
              >
                <motion.div
                  animate={regeneratingInvite ? { rotate: 360 } : { rotate: 0 }}
                  transition={
                    regeneratingInvite
                      ? { duration: 1, repeat: Infinity, ease: "linear" }
                      : { duration: 0.3 }
                  }
                >
                  <RefreshCw size={18} />
                </motion.div>
                <span className="hidden sm:inline">
                  {regeneratingInvite ? "Regenerating..." : "Regenerate Invite"}
                </span>
              </motion.button>

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
                        className="-ml-2 first:ml-0 overflow-hidden"
                        style={{ zIndex: data.members.length - index }}
                        title={member.name}
                      >
                        {renderMemberAvatar(member, "default")}
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
                        <div className="shrink-0">
                          {renderMemberAvatar(member, "medium")}
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
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-600/50 hover:border-rose-600 text-rose-400 rounded-lg text-xs font-medium cursor-pointer"
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
            className="bg-linear-to-br from-[#1a1a1a] to-[#151515] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all"
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
            className="bg-linear-to-br from-[#1a1a1a] to-[#151515] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all"
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
                    className="bg-linear-to-br from-[#1a1a1a] to-[#151515] border border-rose-800/30 rounded-xl p-5"
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
                            <motion.div whileHover={{ scale: 1.2, rotate: 5 }}>
                              {renderMemberAvatar(item.to, "small")}
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
                            transition={{ delay: 1 + index * 0.1, type: "spring" }}
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
                    className="bg-linear-to-br from-[#1a1a1a] to-[#151515] border border-emerald-800/30 rounded-xl p-5"
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
                            <motion.div whileHover={{ scale: 1.2, rotate: 5 }}>
                              {renderMemberAvatar(item.from, "small")}
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
                            transition={{ delay: 1.1 + index * 0.1, type: "spring" }}
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

                {error && (
                  <div className="p-4 bg-red-600/10 border border-red-600/30 rounded-lg">
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                )}

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
                    setError("");
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

      {/* Regenerate Invite Modal */}
      <AnimatePresence>
        {inviteData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setInviteData(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1a1a1a] border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", delay: 0.1 }}
                      className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center"
                    >
                      <RefreshCw size={22} className="text-white" />
                    </motion.div>
                    <div>
                      <motion.h3
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 }}
                        className="text-xl font-bold text-white"
                      >
                        New Invite Link
                      </motion.h3>
                      <motion.p
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-sm text-gray-400"
                      >
                        Your invite has been regenerated
                      </motion.p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setInviteData(null)}
                    className="p-2 hover:bg-[#252525] rounded-lg transition-all text-gray-400 hover:text-white cursor-pointer"
                  >
                    <X size={20} />
                  </motion.button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                {/* Invite Link */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-1.5">
                    <Link2 size={14} />
                    Invite Link
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-gray-300 text-sm font-mono truncate">
                      {inviteData.inviteLink}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCopyInvite}
                      className="shrink-0 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-cyan-900/30 cursor-pointer flex items-center gap-2"
                    >
                      <AnimatePresence mode="wait">
                        {copied ? (
                          <motion.div
                            key="check"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="flex items-center gap-1.5"
                          >
                            <Check size={16} />
                            <span className="hidden sm:inline text-sm">Copied!</span>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="copy"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="flex items-center gap-1.5"
                          >
                            <Copy size={16} />
                            <span className="hidden sm:inline text-sm">Copy</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </div>
                </motion.div>

                {/* Expiry */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-start gap-3 p-4 bg-amber-600/10 border border-amber-600/30 rounded-lg"
                >
                  <Clock size={18} className="text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-amber-400">
                      {formatExpiryTime(inviteData.inviteTokenExpiresAt)}
                    </p>
                    <p className="text-xs text-amber-300/70 mt-0.5">
                      Expires on{" "}
                      {new Date(inviteData.inviteTokenExpiresAt).toLocaleString()}
                    </p>
                  </div>
                </motion.div>

                {/* Info */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="p-4 bg-blue-600/10 border border-blue-600/30 rounded-lg"
                >
                  <p className="text-sm text-blue-300">
                    <strong>💡 Note:</strong> The old invite link is now invalid. Share this new link with anyone you want to invite.
                  </p>
                </motion.div>
              </div>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-6 border-t border-gray-800"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setInviteData(null)}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-900/30 cursor-pointer"
                >
                  Done
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
    </>
  );
}