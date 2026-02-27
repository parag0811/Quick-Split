"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Users,
  TrendingUp,
  TrendingDown,
  Wallet,
  Edit2,
  Save,
  X,
  Camera,
  Loader2,
  DollarSign,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentUser } from "../../../../../store/authSlice";

export default function Profile() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    imageFile: null,
  });

  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        imageFile: null,
      });
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await apiFetch("/auth/user/profile");
      setStats(response.stats);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleUpdateProfile = async () => {
    try {
      setSaving(true);

      const data = new FormData();
      data.append("name", formData.name);

      if (formData.imageFile) {
        data.append("image", formData.imageFile);
      }

      await apiFetch("/auth/user/update-profile", {
        method: "PUT",
        body: data,
      });

      dispatch(fetchCurrentUser());

      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      imageFile: user.image || "",
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
          <p className="text-zinc-400 font-medium text-sm">
            Loading your profile...
          </p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 max-w-md"
        >
          <p className="text-red-400 font-medium">Error: {error}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-1">My Profile</h1>
          <p className="text-zinc-500 text-sm">
            Manage your account and view your expense statistics
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600/80 to-purple-700/80 h-28" />

              <div className="relative px-6 pb-6">
                <div className="relative -mt-14 mb-4">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    className="relative w-fit mx-auto"
                  >
                    {user?.image ? (
                      <img
                        src={user.image}
                        alt={user.name}
                        className="w-28 h-28 rounded-full border-4 border-[#1a1a1a] shadow-lg object-cover"
                      />
                    ) : (
                      <div className="w-28 h-28 rounded-full border-4 border-[#1a1a1a] shadow-lg bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
                        <User className="w-14 h-14 text-white/80" />
                      </div>
                    )}
                    {isEditing && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-500 transition-colors"
                      >
                        <Camera className="w-3.5 h-3.5" />
                      </motion.button>
                    )}
                  </motion.div>
                </div>

                <div className="text-center space-y-4">
                  <AnimatePresence mode="wait">
                    {isEditing ? (
                      <motion.div
                        key="editing"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-2.5"
                      >
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full px-4 py-2.5 bg-[#252525] border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm placeholder:text-zinc-600"
                          placeholder="Your name"
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              imageFile: e.target.files[0],
                            })
                          }
                          className="w-full px-4 py-2.5 bg-[#252525] border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm placeholder:text-zinc-600"
                          placeholder="Image URL"
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="viewing"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <h2 className="text-xl font-bold text-white">
                          {user?.name}
                        </h2>
                        <div className="flex items-center justify-center gap-2 text-zinc-500 mt-1.5">
                          <Mail className="w-3.5 h-3.5" />
                          <p className="text-xs">{user?.email}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex gap-2 justify-center pt-2">
                    <AnimatePresence mode="wait">
                      {isEditing ? (
                        <>
                          <motion.button
                            key="save"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={handleUpdateProfile}
                            disabled={saving}
                            className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
                          >
                            {saving ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                            Save
                          </motion.button>
                          <motion.button
                            key="cancel"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={handleCancel}
                            disabled={saving}
                            className="flex-1 bg-white/5 text-zinc-300 px-4 py-2.5 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </motion.button>
                        </>
                      ) : (
                        <motion.button
                          key="edit"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          onClick={() => setIsEditing(true)}
                          className="w-full bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit Profile
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Net Balance Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`rounded-2xl border p-6 ${
                stats?.netBalance >= 0
                  ? "bg-emerald-500/10 border-emerald-500/20"
                  : "bg-rose-500/10 border-rose-500/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm font-medium mb-1">
                    Net Balance
                  </p>
                  <div className="flex items-baseline gap-2">
                    <h3
                      className={`text-4xl font-bold ${
                        stats?.netBalance >= 0
                          ? "text-emerald-400"
                          : "text-rose-400"
                      }`}
                    >
                      ${Math.abs(stats?.netBalance || 0).toFixed(2)}
                    </h3>
                    <span
                      className={`text-sm font-medium ${
                        stats?.netBalance >= 0
                          ? "text-emerald-500"
                          : "text-rose-500"
                      }`}
                    >
                      {stats?.netBalance >= 0 ? "You are owed" : "You owe"}
                    </span>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className={`p-4 rounded-full ${
                    stats?.netBalance >= 0
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-rose-500/15 text-rose-400"
                  }`}
                >
                  <Wallet className="w-7 h-7" />
                </motion.div>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ y: -4 }}
                className="bg-[#1a1a1a] rounded-2xl border border-white/5 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 bg-blue-500/15 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                  </div>
                  <DollarSign className="w-4 h-4 text-zinc-600" />
                </div>
                <p className="text-zinc-500 text-xs font-medium mb-1">
                  Total Paid
                </p>
                <h4 className="text-3xl font-bold text-white">
                  ${stats?.totalPaid?.toFixed(2) || "0.00"}
                </h4>
                <p className="text-xs text-zinc-600 mt-2">
                  Amount you've paid for groups
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ y: -4 }}
                className="bg-[#1a1a1a] rounded-2xl border border-white/5 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 bg-orange-500/15 rounded-xl">
                    <TrendingDown className="w-5 h-5 text-orange-400" />
                  </div>
                  <DollarSign className="w-4 h-4 text-zinc-600" />
                </div>
                <p className="text-zinc-500 text-xs font-medium mb-1">
                  Total Owed
                </p>
                <h4 className="text-3xl font-bold text-white">
                  ${stats?.totalOwed?.toFixed(2) || "0.00"}
                </h4>
                <p className="text-xs text-zinc-600 mt-2">
                  Your share of group expenses
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ y: -4 }}
                className="bg-[#1a1a1a] rounded-2xl border border-white/5 p-6 sm:col-span-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-purple-500/15 rounded-xl">
                      <Users className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-zinc-500 text-xs font-medium mb-1">
                        Active Groups
                      </p>
                      <h4 className="text-3xl font-bold text-white">
                        {stats?.totalGroups || 0}
                      </h4>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-600">
                    Groups you're a member of
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Quick Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-6"
            >
              <h3 className="text-base font-semibold text-white mb-4">
                Quick Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 text-sm">Groups</span>
                  <span className="font-semibold text-zinc-200 text-sm">
                    {stats?.totalGroups || 0}
                  </span>
                </div>
                <div className="h-px bg-white/5" />
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 text-sm">
                    You've contributed
                  </span>
                  <span className="font-semibold text-zinc-200 text-sm">
                    ${stats?.totalPaid?.toFixed(2) || "0.00"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 text-sm">Your expenses</span>
                  <span className="font-semibold text-zinc-200 text-sm">
                    ${stats?.totalOwed?.toFixed(2) || "0.00"}
                  </span>
                </div>
                <div className="h-px bg-white/5" />
                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold text-sm">
                    Net Position
                  </span>
                  <span
                    className={`font-bold text-base ${
                      stats?.netBalance >= 0
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }`}
                  >
                    {stats?.netBalance >= 0 ? "+" : "-"}$
                    {Math.abs(stats?.netBalance || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
