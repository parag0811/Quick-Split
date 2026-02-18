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

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    image: "",
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiFetch("/auth/user/profile");

      if (!response.ok) throw new Error("Failed to fetch profile");

      const data = await response.json();
      setProfile(data);
      setFormData({
        name: data.user.name,
        image: data.user.image || "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async () => {
    try {
      setSaving(true);
      const response = await apiFetch("/auth/user/update-profile", {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to update profile");

      const data = await response.json();
      setProfile((prev) => ({
        ...prev,
        user: data.user,
      }));
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile.user.name,
      image: profile.user.image || "",
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
          <p className="text-slate-600 font-medium">Loading your profile...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-md"
        >
          <p className="text-red-600 font-medium">Error: {error}</p>
        </motion.div>
      </div>
    );
  }

  const stats = profile?.stats;
  const user = profile?.user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-slate-800 mb-2">My Profile</h1>
          <p className="text-slate-600">
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
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-32"></div>

              <div className="relative px-6 pb-6">
                <div className="relative -mt-16 mb-4">
                  <motion.div whileHover={{ scale: 1.05 }} className="relative">
                    {user?.image ? (
                      <img
                        src={user.image}
                        alt={user.name}
                        className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover mx-auto"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mx-auto">
                        <User className="w-16 h-16 text-white" />
                      </div>
                    )}
                    {isEditing && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute bottom-0 right-1/2 translate-x-16 bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
                      >
                        <Camera className="w-4 h-4" />
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
                        className="space-y-3"
                      >
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                          placeholder="Your name"
                        />
                        <input
                          type="url"
                          value={formData.image}
                          onChange={(e) =>
                            setFormData({ ...formData, image: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
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
                        <h2 className="text-2xl font-bold text-slate-800">
                          {user?.name}
                        </h2>
                        <div className="flex items-center justify-center gap-2 text-slate-600 mt-2">
                          <Mail className="w-4 h-4" />
                          <p className="text-sm">{user?.email}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex gap-2 justify-center pt-4">
                    <AnimatePresence mode="wait">
                      {isEditing ? (
                        <>
                          <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={handleUpdateProfile}
                            disabled={saving}
                            className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50"
                          >
                            {saving ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                            Save
                          </motion.button>
                          <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={handleCancel}
                            disabled={saving}
                            className="flex-1 bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </motion.button>
                        </>
                      ) : (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          onClick={() => setIsEditing(true)}
                          className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 font-medium"
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
              className={`rounded-2xl shadow-xl border p-6 ${
                stats?.netBalance >= 0
                  ? "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200"
                  : "bg-gradient-to-br from-rose-50 to-red-50 border-rose-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 font-medium mb-1">Net Balance</p>
                  <div className="flex items-baseline gap-2">
                    <h3
                      className={`text-4xl font-bold ${
                        stats?.netBalance >= 0
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }`}
                    >
                      ${Math.abs(stats?.netBalance || 0).toFixed(2)}
                    </h3>
                    {stats?.netBalance >= 0 ? (
                      <span className="text-emerald-600 text-sm font-medium">
                        You are owed
                      </span>
                    ) : (
                      <span className="text-rose-600 text-sm font-medium">
                        You owe
                      </span>
                    )}
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className={`p-4 rounded-full ${
                    stats?.netBalance >= 0
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-rose-100 text-rose-600"
                  }`}
                >
                  <Wallet className="w-8 h-8" />
                </motion.div>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <DollarSign className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-slate-600 text-sm font-medium mb-1">
                  Total Paid
                </p>
                <h4 className="text-3xl font-bold text-slate-800">
                  ${stats?.totalPaid?.toFixed(2) || "0.00"}
                </h4>
                <p className="text-xs text-slate-500 mt-2">
                  Amount you've paid for groups
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <TrendingDown className="w-6 h-6 text-orange-600" />
                  </div>
                  <DollarSign className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-slate-600 text-sm font-medium mb-1">
                  Total Owed
                </p>
                <h4 className="text-3xl font-bold text-slate-800">
                  ${stats?.totalOwed?.toFixed(2) || "0.00"}
                </h4>
                <p className="text-xs text-slate-500 mt-2">
                  Your share of group expenses
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:col-span-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-slate-600 text-sm font-medium mb-1">
                        Active Groups
                      </p>
                      <h4 className="text-3xl font-bold text-slate-800">
                        {stats?.totalGroups || 0}
                      </h4>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
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
              className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-6 text-white"
            >
              <h3 className="text-xl font-bold mb-4">Quick Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-indigo-100">Groups</span>
                  <span className="font-semibold">
                    {stats?.totalGroups || 0}
                  </span>
                </div>
                <div className="h-px bg-indigo-400 opacity-30"></div>
                <div className="flex justify-between items-center">
                  <span className="text-indigo-100">You've contributed</span>
                  <span className="font-semibold">
                    ${stats?.totalPaid?.toFixed(2) || "0.00"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-indigo-100">Your expenses</span>
                  <span className="font-semibold">
                    ${stats?.totalOwed?.toFixed(2) || "0.00"}
                  </span>
                </div>
                <div className="h-px bg-indigo-400 opacity-30"></div>
                <div className="flex justify-between items-center text-lg">
                  <span className="font-semibold">Net Position</span>
                  <span className="font-bold">
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
