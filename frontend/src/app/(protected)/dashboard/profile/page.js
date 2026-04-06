"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Edit2,
  Save,
  X,
  Camera,
  Loader2,
  CreditCard,
  Sparkles,
  WalletCards,
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
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

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
    } catch (err) {
      setError(err.message || "Failed to load profile stats.");
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
      setImagePreview(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      imageFile: null,
    });
    setImagePreview(null);
    setIsEditing(false);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, imageFile: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <Loader2 className="h-10 w-10 animate-spin text-[#00CDFF]" />
          <p className="text-sm font-medium text-[#9bb0d6]">
            Loading your profile...
          </p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[420px] items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md rounded-2xl border border-[#FF2D65]/35 bg-[#FF2D65]/10 p-6"
        >
          <p className="font-medium text-[#ff9bb7]">Error: {error}</p>
        </motion.div>
      </div>
    );
  }

  const outstandingBalance = stats?.outstandingBalance || 0;
  const totalSpent = stats?.totalSpent || 0;
  const youPaidFor = stats?.youPaidFor || 0;
  const settlementPaid = stats?.settlementPaid || 0;
  const settlementReceived = stats?.settlementReceived || 0;
  const totalRealTransactions = stats?.totalRealTransactions || 0;
  const totalGroups = stats?.totalGroups || 0;

  return (
    <div className="mx-auto w-full max-w-345 space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />

      <motion.section
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-[#17345f] bg-[#06173f]/80 p-4 sm:p-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative w-fit rounded-2xl border border-[#f5c9b9] bg-[#f6d6c7] p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.32)]">
              {imagePreview || user?.image ? (
                <img
                  src={imagePreview || user.image}
                  alt={user?.name}
                  className="h-20 w-20 rounded-xl object-cover sm:h-24 sm:w-24"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-[#ecd9cf] sm:h-24 sm:w-24">
                  <User className="h-10 w-10 text-[#a28b83]" />
                </div>
              )}

              <button
                onClick={() => {
                  setIsEditing(true);
                  fileInputRef.current?.click();
                }}
                className="absolute -bottom-2 -right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#1a4c86] bg-[#00CDFF] text-[#03203f] shadow-lg transition hover:bg-[#32d9ff]"
                aria-label="Change photo"
              >
                <Camera size={14} />
              </button>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#7f97c3]">Quick Split Member</p>
              <h1 className="text-3xl font-bold tracking-tight text-[#d8e6ff] sm:text-5xl">{user?.name}</h1>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <button
              onClick={() => {
                setIsEditing(true);
                fileInputRef.current?.click();
              }}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#00CDFF] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-[#022342] transition hover:bg-[#35dcff]"
            >
              <Camera size={14} />
              Change photo
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#25497e] bg-transparent px-4 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-[#c8d6f0] transition hover:border-[#00CDFF]/40 hover:text-[#00CDFF]"
            >
              <Edit2 size={14} />
              Edit profile
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-4 grid gap-3 rounded-xl border border-[#1b3c6c] bg-[#071a42] p-4 sm:grid-cols-[1fr_auto_auto]"
            >
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full rounded-lg border border-[#244a82] bg-[#081f4d] px-3 py-2.5 text-sm text-[#d9e7ff] outline-none transition focus:border-[#00CDFF]"
                placeholder="Your name"
              />
              <button
                onClick={handleUpdateProfile}
                disabled={saving}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#00CDFF] px-4 py-2.5 text-sm font-semibold text-[#022342] transition hover:bg-[#31d9ff] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#2a4677] bg-[#081a43] px-4 py-2.5 text-sm font-semibold text-[#c8d7f0] transition hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 gap-3 sm:grid-cols-3"
      >
        <div className="rounded-xl border border-[#17345f] bg-[#06173f]/80 p-4">
          <div className="mb-3 flex items-center justify-between">
            <WalletCards size={16} className="text-[#FF2D65]" />
            <span className="text-[10px] uppercase tracking-[0.16em] text-[#6f88b7]">Expenses</span>
          </div>
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#7d96c6]">Total spent</p>
          <p className="mt-1 text-2xl font-bold text-[#dce8ff]">₹{totalSpent.toFixed(2)}</p>
        </div>

        <div className="rounded-xl border border-[#17345f] bg-[#06173f]/80 p-4">
          <div className="mb-3 flex items-center justify-between">
            <CreditCard size={16} className="text-[#00CDFF]" />
            <span className="text-[10px] uppercase tracking-[0.16em] text-[#6f88b7]">Owed to you</span>
          </div>
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#7d96c6]">Total owed</p>
          <p className="mt-1 text-2xl font-bold text-[#dce8ff]">₹{Math.max(outstandingBalance, 0).toFixed(2)}</p>
        </div>

        <div className="col-span-2 rounded-xl border border-[#17345f] bg-[#06173f]/80 p-4 sm:col-span-1">
          <div className="mb-3 flex items-center justify-between">
            <Sparkles size={16} className="text-[#A855F7]" />
            <span className="text-[10px] uppercase tracking-[0.16em] text-[#6f88b7]">Networks</span>
          </div>
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#7d96c6]">Active groups</p>
          <p className="mt-1 text-2xl font-bold text-[#dce8ff]">{totalGroups}</p>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-[#17345f] bg-[#06173f]/70 p-4"
      >
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-[#8ba3cd]">Ledger Summary</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg bg-[#081a43] px-3 py-2.5">
            <span className="text-sm text-[#8ba3cd]">You paid for</span>
            <span className="text-sm font-bold text-[#dce8ff]">₹{youPaidFor.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-[#081a43] px-3 py-2.5">
            <span className="text-sm text-[#8ba3cd]">Total settled</span>
            <span className="text-sm font-bold text-[#dce8ff]">₹{totalRealTransactions.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-[#081a43] px-3 py-2.5 sm:col-span-2">
            <span className="text-sm text-[#8ba3cd]">Net outstanding</span>
            <span className={`text-sm font-bold ${outstandingBalance >= 0 ? "text-[#00CDFF]" : "text-[#FF2D65]"}`}>
              {outstandingBalance >= 0 ? "+" : "-"}₹{Math.abs(outstandingBalance).toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-[#081a43] px-3 py-2.5">
            <span className="text-sm text-[#8ba3cd]">Settlement paid</span>
            <span className="text-sm font-bold text-[#dce8ff]">₹{settlementPaid.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-[#081a43] px-3 py-2.5">
            <span className="text-sm text-[#8ba3cd]">Settlement received</span>
            <span className="text-sm font-bold text-[#dce8ff]">₹{settlementReceived.toFixed(2)}</span>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
