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
  RotateCcw,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import GroupSocketListener from "@/components/socket/GroupSocketListener";
import { toastSuccess, toastError } from "@/lib/toast";
import { useSelector } from "react-redux";

export default function GroupOverview() {
  const { groupId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [showAllMembers, setShowAllMembers] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [regeneratingInvite, setRegeneratingInvite] = useState(false);
  const [inviteData, setInviteData] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [removingMember, setRemovingMember] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [removeError, setRemoveError] = useState("");

  const router = useRouter();
  const currentUserId = useSelector((state) => state.auth.user?._id);
  const refreshKey = useSelector((state) => state.group.refreshKey);

  const fetchGroupDetails = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError("");
      const response = await apiFetch(`/groups/${groupId}/summary`);
      setData(response);
    } catch (error) {
      setFetchError(
        error?.message || "Failed to load group details. Please try again.",
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    if (groupId) fetchGroupDetails();
  }, [groupId, fetchGroupDetails, refreshKey]);

  const handleDeleteGroup = async () => {
    if (deleteConfirmation !== data.group.name) return;

    setDeleting(true);
    setDeleteError("");
    try {
      await apiFetch(`/groups/${groupId}/delete`, { method: "DELETE" });
      toastSuccess("Group deleted successfully.");
      router.push("/dashboard/groups");
    } catch (error) {
      setDeleteError(
        error?.message || "Failed to delete group. Please try again.",
      );
    } finally {
      setDeleting(false);
      setDeleteConfirmation("");
    }
  };

  const handleRegenerateInvite = async () => {
    setRegeneratingInvite(true);
    try {
      const response = await apiFetch(`/groups/${groupId}/regenerate-invite`, {
        method: "POST",
      });
      toastSuccess(response?.message || "Invite link regenerated!");
      setInviteData({
        inviteLink: response.inviteLink,
        inviteTokenExpiresAt: response.inviteTokenExpiresAt,
      });
      setShowInviteModal(true);
    } catch (error) {
      toastError(error?.message || "Failed to regenerate invite link.");
    } finally {
      setRegeneratingInvite(false);
    }
  };

  const handleCopyInvite = async () => {
    try {
      await navigator.clipboard.writeText(inviteData.inviteLink);
      setCopied(true);
      toastSuccess("Invite link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toastError("Failed to copy link. Please copy it manually.");
    }
  };

  const formatExpiryTime = (expiryDate) => {
    const date = new Date(expiryDate);
    const now = new Date();
    const hoursLeft = Math.floor((date - now) / (1000 * 60 * 60));
    const minutesLeft = Math.floor(
      ((date - now) % (1000 * 60 * 60)) / (1000 * 60),
    );
    if (hoursLeft > 0) return `Expires in ${hoursLeft}h ${minutesLeft}m`;
    return `Expires in ${minutesLeft}m`;
  };

  const handleRemoveMember = (memberId, memberName) => {
    setRemoveTarget({ id: memberId, name: memberName });
    setRemoveError("");
    setShowRemoveModal(true);
  };

  const confirmRemoveMember = async () => {
    if (!removeTarget) return;
    setRemovingMember(true);
    setRemoveError("");
    try {
      const response = await apiFetch(
        `/groups/${groupId}/members/${removeTarget.id}`,
        {
          method: "POST",
        },
      );
      toastSuccess(response?.message || "Member removed successfully.");
      setShowRemoveModal(false);
      setRemoveTarget(null);
      fetchGroupDetails();
    } catch (error) {
      setRemoveError(
        error?.message || "Failed to remove member. Please try again.",
      );
    } finally {
      setRemovingMember(false);
    }
  };

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

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#0f0f0f] p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
          <div className="flex items-start gap-4 mb-8">
            <div className="w-16 h-16 bg-gray-800 rounded-xl shrink-0" />
            <div className="flex-1 space-y-3 pt-1">
              <div className="h-7 bg-gray-800 rounded w-48" />
              <div className="h-4 bg-gray-800 rounded w-72" />
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 h-20" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 h-32"
              />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 h-28"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="w-full min-h-screen bg-[#0f0f0f] p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto flex flex-col items-center justify-center py-28 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center text-center"
          >
            <div className="w-20 h-20 bg-red-500/10 rounded-2xl border border-red-500/20 flex items-center justify-center mb-6">
              <AlertCircle className="w-9 h-9 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Couldn't load group
            </h2>
            <p className="text-gray-400 text-sm text-center max-w-sm mb-8">
              {fetchError}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchGroupDetails}
                className="flex items-center space-x-2 bg-linear-to-r from-cyan-500 to-blue-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 shadow-lg shadow-cyan-500/20 text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry</span>
              </button>
              <button
                onClick={() => router.push("/dashboard/groups")}
                className="flex items-center space-x-2 bg-[#1a1a1a] border border-gray-700 text-gray-300 px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-800 hover:border-gray-600 hover:text-white transition-all duration-200 text-sm"
              >
                Back to Groups
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const isPositiveBalance = data.yourBalance > 0;
  const isZeroBalance = data.yourBalance === 0;

  return (
    <>
      <GroupSocketListener groupId={groupId} />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full min-h-screen bg-[radial-gradient(circle_at_20%_0%,#0d2b73_0%,#07163f_45%,#020817_100%)] p-4 sm:p-6 lg:p-8"
      >
        <div className="mx-auto w-full max-w-345 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl border border-[#17345f] bg-[#06173f]/80 p-4 sm:p-6"
          >
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: 0.2,
                  }}
                  className="w-12 h-12 sm:w-16 sm:h-16 bg-linear-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-xl sm:text-2xl shadow-lg shrink-0"
                >
                  🏔️
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="min-w-0"
                >
                  <p className="text-[10px] uppercase tracking-[0.24em] text-[#7f97c3]">
                    Active Group
                  </p>
                  <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#dce8ff] mb-1 sm:mb-2 truncate">
                    {data.group.name}
                  </h1>
                  {data.group.description && (
                    <p className="text-[#8ea4cd] text-sm sm:text-base truncate">
                      {data.group.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-2 text-xs text-[#8ea4cd]">
                    <div className="flex -space-x-2">
                      {data.members.slice(0, 3).map((member) => (
                        <div
                          key={member._id}
                          className="overflow-hidden rounded-full border-2 border-[#06173f]"
                        >
                          {renderMemberAvatar(member, "small")}
                        </div>
                      ))}
                      {data.members.length > 3 && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#06173f] bg-[#102850] text-[10px] font-bold text-[#dce8ff]">
                          +{data.members.length - 3}
                        </div>
                      )}
                    </div>
                    <span>{data.members.length} members active</span>
                  </div>
                </motion.div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:w-105">
                <div className="rounded-2xl border border-[#17345f] bg-[#081a43] p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#7f97c3]">
                    Total expenses
                  </p>
                  <p className="mt-1 text-3xl font-bold text-[#dce8ff]">
                    ₹{data.totalExpenses.toFixed(2)}
                  </p>
                  <p className="mt-1 text-xs text-[#6f88b7]">
                    {data.expenseCount} recorded items
                  </p>
                </div>
                <div className="rounded-2xl border border-[#17345f] bg-[#081a43] p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#7f97c3]">
                    My balance
                  </p>
                  <p
                    className={`mt-1 text-3xl font-bold ${isPositiveBalance ? "text-[#00CDFF]" : isZeroBalance ? "text-[#8ea4cd]" : "text-[#FF2D65]"}`}
                  >
                    {isPositiveBalance ? "+" : ""}₹
                    {Math.abs(data.yourBalance).toFixed(2)}
                  </p>
                  <p className="mt-1 text-xs text-[#6f88b7]">
                    {isPositiveBalance
                      ? "You get back"
                      : isZeroBalance
                        ? "All settled"
                        : "You owe"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 xl:w-105">
                <div className="rounded-2xl border border-[#17345f] bg-[#081a43] p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#7f97c3]">
                      Invite link
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#1b3e71] bg-[#071634] px-3 py-3 text-xs text-[#8ea4cd] truncate">
                    {inviteData?.inviteLink ||
                      "Generate a link to invite members"}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.35 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowInviteModal(true)}
                    className="cursor-pointer flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#00CDFF]/30 bg-[#00CDFF]/10 px-4 py-2 font-medium text-[#00CDFF] transition-all duration-200 disabled:opacity-50"
                  >
                    <Link2 size={18} />
                    <span>See Link</span>
                  </motion.button>

                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDeleteModal(true)}
                    className="cursor-pointer flex items-center gap-2 rounded-lg border border-[#FF2D65]/30 bg-[#FF2D65]/10 px-4 py-2 font-medium text-[#FF9AB1] transition-all duration-200"
                  >
                    <Trash2 size={18} />
                    <span>Delete Group</span>
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Members Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="rounded-2xl border border-[#17345f] bg-[#06173f]/80 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="w-10 h-10 bg-[#00CDFF]/10 rounded-lg flex items-center justify-center"
                  >
                    <Users size={20} className="text-[#00CDFF]" />
                  </motion.div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#dce8ff]">
                      Members
                    </h3>
                    <p className="text-xs text-[#8ea4cd]">
                      {data.members.length} member
                      {data.members.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAllMembers(!showAllMembers)}
                  className="cursor-pointer flex items-center gap-2 px-3 py-1.5 bg-[#081a43] hover:bg-[#0d234f] rounded-lg transition-colors text-sm text-[#cbd8f0]"
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
                          className="w-9 h-9 bg-[#081a43] rounded-full flex items-center justify-center text-xs font-bold text-[#8ea4cd] border-2 border-[#06173f] -ml-2"
                        >
                          +{data.members.length - 5}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}

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
                        className="flex items-center justify-between gap-3 p-3 bg-[#081a43] rounded-lg border border-[#17345f] hover:border-[#00CDFF]/30 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="shrink-0">
                            {renderMemberAvatar(member, "medium")}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#dce8ff] truncate">
                              {member.name}
                            </p>
                            <p className="text-xs text-[#8ea4cd] truncate">
                              {member.email}
                            </p>
                          </div>
                        </div>
                        {currentUserId === data.group.createdBy && (
                          <motion.button
                            className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 bg-[#FF2D65]/10 hover:bg-[#FF2D65]/15 border border-[#FF2D65]/30 hover:border-[#FF2D65] text-[#FF9AB1] rounded-lg text-xs font-medium transition-colors"
                            onClick={() =>
                              handleRemoveMember(member._id, member.name)
                            }
                          >
                            <UserMinus size={14} />
                            <span>Remove</span>
                          </motion.button>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileHover={{ scale: 1.03, y: -5 }}
              className="bg-linear-to-br from-[#06173f] to-[#081a43] border border-[#17345f] rounded-xl p-6 hover:border-[#00CDFF]/30 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-[#8ea4cd]">
                  Total Expenses
                </div>
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.5 }}
                  className="w-10 h-10 bg-[#A855F7]/10 rounded-lg flex items-center justify-center"
                >
                  <Receipt size={20} className="text-[#A855F7]" />
                </motion.div>
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                className="text-3xl font-bold text-[#dce8ff] mb-1"
              >
                ₹{data.totalExpenses.toFixed(2)}
              </motion.div>
              <div className="text-xs text-[#8ea4cd]">
                {data.expenseCount} expense{data.expenseCount !== 1 ? "s" : ""}{" "}
                recorded
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              whileHover={{ scale: 1.03, y: -5 }}
              className="bg-linear-to-br from-[#06173f] to-[#081a43] border border-[#17345f] rounded-xl p-6 hover:border-[#00CDFF]/30 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-[#8ea4cd]">
                  My Balance
                </div>
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.5 }}
                  className={`w-10 h-10 ${isPositiveBalance ? "bg-[#00CDFF]/10" : isZeroBalance ? "bg-[#7f97c3]/10" : "bg-[#FF2D65]/10"} rounded-lg flex items-center justify-center`}
                >
                  {isPositiveBalance ? (
                    <TrendingUp size={20} className="text-[#00CDFF]" />
                  ) : isZeroBalance ? (
                    <CheckCircle2 size={20} className="text-[#8ea4cd]" />
                  ) : (
                    <TrendingDown size={20} className="text-[#FF2D65]" />
                  )}
                </motion.div>
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                className={`text-3xl font-bold mb-1 ${isPositiveBalance ? "text-[#00CDFF]" : isZeroBalance ? "text-[#8ea4cd]" : "text-[#FF2D65]"}`}
              >
                {isPositiveBalance ? "+" : ""}₹
                {Math.abs(data.yourBalance).toFixed(2)}
              </motion.div>
              <div className="text-xs text-[#8ea4cd]">
                {isPositiveBalance
                  ? "You get back"
                  : isZeroBalance
                    ? "All settled"
                    : "You owe"}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              whileHover={{ scale: 1.03, y: -5 }}
              className="bg-linear-to-br from-[#06173f] to-[#081a43] border border-[#17345f] rounded-xl p-6 hover:border-[#00CDFF]/30 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-[#8ea4cd]">
                  Pending Expenses
                </div>
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.5 }}
                  className={`w-10 h-10 ${data.isSettled ? "bg-[#00CDFF]/10" : "bg-[#A855F7]/10"} rounded-lg flex items-center justify-center`}
                >
                  {data.isSettled ? (
                    <CheckCircle2 size={20} className="text-[#00CDFF]" />
                  ) : (
                    <AlertCircle size={20} className="text-[#A855F7]" />
                  )}
                </motion.div>
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                className={`text-3xl font-bold mb-1 ${data.isSettled ? "text-[#00CDFF]" : "text-[#A855F7]"}`}
              >
                {data.isSettled
                  ? "Settled"
                  : `${data.youOwe.length + data.youGet.length}`}
              </motion.div>
              <div className="text-xs text-[#8ea4cd]">
                {data.isSettled
                  ? "All balanced"
                  : `Pending payment${data.youOwe.length + data.youGet.length !== 1 ? "s" : ""}`}
              </div>
            </motion.div>
          </div>

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
                  {data.youOwe.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.9 }}
                      className="bg-linear-to-br from-[#06173f] to-[#081a43] border border-[#FF2D65]/25 rounded-xl p-5"
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
                              >
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
                              transition={{
                                delay: 1 + index * 0.1,
                                type: "spring",
                              }}
                            >
                              <p className="text-lg font-bold text-rose-400">
                                ₹{item.amount.toFixed(2)}
                              </p>
                            </motion.div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {data.youGet.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 1 }}
                      className="bg-linear-to-br from-[#06173f] to-[#081a43] border border-[#00CDFF]/25 rounded-xl p-5"
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
                              >
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
                              transition={{
                                delay: 1.1 + index * 0.1,
                                type: "spring",
                              }}
                            >
                              <p className="text-lg font-bold text-emerald-400">
                                ₹{item.amount.toFixed(2)}
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
              className="bg-linear-to-br from-[#06173f] to-[#081a43] border border-[#17345f] rounded-xl p-6 hover:border-[#00CDFF]/30 hover:bg-[#0a1c42] transition-all duration-200 text-left group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-12 h-12 bg-[#00CDFF]/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
                >
                  <Receipt size={24} className="text-[#00CDFF]" />
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
              <h3 className="text-lg font-semibold text-[#dce8ff] mb-1 group-hover:text-[#00CDFF] transition-colors">
                Expenses
              </h3>
              <p className="text-sm text-[#8ea4cd]">
                View all recorded expenses
              </p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() =>
                router.push(`/dashboard/groups/${data.group.id}/settlement`)
              }
              className="bg-linear-to-br from-[#06173f] to-[#081a43] border border-[#17345f] rounded-xl p-6 hover:border-[#00CDFF]/30 hover:bg-[#0a1c42] transition-all duration-200 text-left group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-12 h-12 bg-[#00CDFF]/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
                >
                  <ArrowRightLeft size={24} className="text-[#00CDFF]" />
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
              <h3 className="text-lg font-semibold text-[#dce8ff] mb-1 group-hover:text-[#00CDFF] transition-colors">
                Settlement
              </h3>
              <p className="text-sm text-[#8ea4cd]">See who paid whom</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() =>
                router.push(`/dashboard/groups/${data.group.id}/analytics`)
              }
              className="bg-linear-to-br from-[#06173f] to-[#081a43] border border-[#17345f] rounded-xl p-6 hover:border-[#00CDFF]/30 hover:bg-[#0a1c42] transition-all duration-200 text-left group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-12 h-12 bg-[#A855F7]/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
                >
                  <BarChart3 size={24} className="text-[#A855F7]" />
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
              <h3 className="text-lg font-semibold text-[#dce8ff] mb-1 group-hover:text-[#A855F7] transition-colors">
                Analytics
              </h3>
              <p className="text-sm text-[#8ea4cd]">View spending insights</p>
            </motion.button>
          </motion.div>
        </div>

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
                setDeleteError("");
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
                      setDeleteError("");
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="p-4 bg-rose-600/10 border border-rose-600/30 rounded-lg">
                    <p className="text-sm text-rose-300">
                      <strong>Warning:</strong> Deleting this group will
                      permanently remove all expenses, settlements, and member
                      data.
                    </p>
                  </div>
                  <AnimatePresence>
                    {deleteError && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="p-4 bg-red-600/10 border border-red-600/30 rounded-lg flex items-start gap-2"
                      >
                        <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                        <p className="text-sm text-red-300">{deleteError}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

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

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteConfirmation("");
                      setDeleteError("");
                    }}
                    className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-all duration-200 border border-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteGroup}
                    disabled={
                      deleteConfirmation !== data.group.name || deleting
                    }
                    className="flex-1 px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-rose-600 flex items-center justify-center gap-2"
                  >
                    {deleting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <RefreshCw size={16} />
                        </motion.div>
                        <span>Deleting...</span>
                      </>
                    ) : (
                      "Delete Group"
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showRemoveModal && removeTarget && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => {
                setShowRemoveModal(false);
                setRemoveTarget(null);
                setRemoveError("");
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
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-rose-600/20 rounded-lg flex items-center justify-center border border-rose-600/50">
                      <UserMinus size={24} className="text-rose-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white">
                        Remove Member
                      </h2>
                      <p className="text-sm text-gray-400">
                        This action cannot be undone
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowRemoveModal(false);
                      setRemoveTarget(null);
                      setRemoveError("");
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="p-4 bg-rose-600/10 border border-rose-600/30 rounded-lg">
                    <p className="text-sm text-rose-300">
                      <strong>Warning:</strong> You are about to remove{" "}
                      <span className="font-bold text-white">
                        {removeTarget.name}
                      </span>{" "}
                      from this group. If the member has any unsettled balance,
                      the removal will be denied.
                    </p>
                  </div>
                  <AnimatePresence>
                    {removeError && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="p-4 bg-red-600/10 border border-red-600/30 rounded-lg flex items-start gap-2"
                      >
                        <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                        <p className="text-sm text-red-300">{removeError}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowRemoveModal(false);
                      setRemoveTarget(null);
                      setRemoveError("");
                    }}
                    className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-all duration-200 border border-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmRemoveMember}
                    disabled={removingMember}
                    className="flex-1 px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-rose-600 flex items-center justify-center gap-2"
                  >
                    {removingMember ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <RefreshCw size={16} />
                        </motion.div>
                        <span>Removing...</span>
                      </>
                    ) : (
                      "Remove Member"
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showInviteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowInviteModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#1a1a1a] border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
              >
                <div className="p-6 border-b border-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", delay: 0.1 }}
                        className="w-12 h-12 bg-linear-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center"
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
                      onClick={() => setShowInviteModal(false)}
                      className="p-2 hover:bg-[#252525] rounded-lg transition-all text-gray-400 hover:text-white cursor-pointer"
                    >
                      <X size={20} />
                    </motion.button>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300 mb-2">
                      <Link2 size={14} />
                      Invite Link
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-gray-300 text-sm font-mono truncate">
                        {inviteData?.inviteLink ||
                          "Generate or regenerate an invite link to see it here."}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCopyInvite}
                        disabled={!inviteData?.inviteLink}
                        className="shrink-0 px-4 py-3 bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-cyan-900/30 cursor-pointer flex items-center gap-2"
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
                              <span className="hidden sm:inline text-sm">
                                Copied!
                              </span>
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
                              <span className="hidden sm:inline text-sm">
                                Copy
                              </span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-start gap-3 p-4 bg-amber-600/10 border border-amber-600/30 rounded-lg"
                  >
                    <Clock
                      size={18}
                      className="text-amber-400 mt-0.5 shrink-0"
                    />
                    <div>
                      <p className="text-sm font-semibold text-amber-400">
                        {inviteData?.inviteTokenExpiresAt
                          ? formatExpiryTime(inviteData.inviteTokenExpiresAt)
                          : "No active invite yet"}
                      </p>
                      <p className="text-xs text-amber-300/70 mt-0.5">
                        {inviteData?.inviteTokenExpiresAt
                          ? `Expires on ${new Date(inviteData.inviteTokenExpiresAt).toLocaleString()}`
                          : "Generate an invite to set an expiry"}
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="p-4 bg-blue-600/10 border border-blue-600/30 rounded-lg"
                  >
                    <p className="text-sm text-blue-300">
                      <strong>💡 Note:</strong> The old invite link is now
                      invalid. Share this new link with anyone you want to
                      invite.
                    </p>
                  </motion.div>
                </div>

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
                    className="w-full px-4 py-2.5 bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-900/30 cursor-pointer"
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
