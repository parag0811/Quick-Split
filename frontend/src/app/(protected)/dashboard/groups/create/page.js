"use client";

import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, UserPlus, Clock, Loader2, Mail } from "lucide-react";
import { toastSuccess, toastError } from "@/lib/toast";

export default function GroupForm() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [inviteData, setInviteData] = useState(null);
  const [errors, setErrors] = useState({});
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  const getInviteDisplayText = (inviteLink) => {
    try {
      const parsed = new URL(inviteLink);
      return `${parsed.host}${parsed.pathname}`;
    } catch {
      return inviteLink;
    }
  };

  const formatExpiryTime = (expiryDate) => {
    const date = new Date(expiryDate);
    const now = new Date();
    const diffMs = date - now;

    if (diffMs <= 0) {
      return "Link expired";
    }

    const hoursLeft = Math.floor(diffMs / (1000 * 60 * 60));
    const minutesLeft = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hoursLeft > 0) {
      return `Expires in ${hoursLeft}h ${minutesLeft}m`;
    }

    return `Expires in ${minutesLeft}m`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteData.inviteLink);
      setCopied(true);
      toastSuccess("Invite link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toastError("Failed to copy link. Please copy it manually.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!formData.name.trim()) {
      setErrors({ name: "Group name is required" });
      return;
    }

    try {
      setSubmitting(true);

      const data = await apiFetch("/create-group", {
        method: "POST",
        body: formData,
      });

      toastSuccess(data?.message || "Group created successfully!");

      setInviteData({
        groupId: data.groupId,
        inviteLink: data.inviteLink,
        inviteTokenExpiresAt: data.inviteTokenExpiresAt,
      });
    } catch (error) {
      if (error.validation && Array.isArray(error.validation)) {
        const fieldErrors = {};

        error.validation.forEach((entry) => {
          fieldErrors[entry.path] = entry.msg;
        });

        setErrors(fieldErrors);
      } else {
        toastError(error?.message || "Failed to create group. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const closeCreateModal = () => {
    router.push("/dashboard/groups");
  };

  const closeInviteModal = () => {
    setInviteData(null);
    router.push("/dashboard/groups");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#020811]/85 px-4 py-6 backdrop-blur-sm"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(0,205,255,0.2),transparent_38%)]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative z-10 flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-[#204078] bg-[#0f2148] shadow-[0_25px_80px_rgba(0,8,25,0.75)]"
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-start justify-between px-5 pb-3 pt-5 sm:px-7 sm:pt-6"
        >
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#d9e6ff]">
              New Collective
            </h2>
            <p className="mt-1 text-sm text-[#8ca5d4]">
              Initialize a shared ledger for your next venture.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={closeCreateModal}
            className="cursor-pointer rounded-lg p-2 text-[#7f95be] transition hover:bg-[#1a315f] hover:text-[#d4e2ff]"
            aria-label="Close create group modal"
          >
            <X size={20} />
          </motion.button>
        </motion.div>

        <form onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto">
          <div className="space-y-6 px-5 py-4 sm:px-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <label
                htmlFor="name"
                className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-[#3cb9de]"
              >
                Group Name
              </label>
              <motion.input
                whileFocus={{ scale: 1.005 }}
                transition={{ type: "spring", stiffness: 300 }}
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={submitting}
                placeholder="Enter group identity..."
                className="w-full rounded-lg border border-[#2a4372] bg-[#1a2e59] px-4 py-3 text-[#d9e7ff] placeholder:text-[#7087b3] outline-none transition focus:border-[#41d6ff] focus:ring-2 focus:ring-[#00CDFF]/35 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <AnimatePresence>
                {errors.name && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="mt-1 text-sm text-[#ff8fb1]"
                  >
                    {errors.name}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label
                htmlFor="description"
                className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-[#8ca5d4]"
              >
                Group Description
              </label>
              <motion.textarea
                whileFocus={{ scale: 1.005 }}
                transition={{ type: "spring", stiffness: 300 }}
                id="description"
                name="description"
                rows="5"
                value={formData.description}
                onChange={handleChange}
                disabled={submitting}
                placeholder="Define the purpose of this group..."
                className="w-full resize-none rounded-lg border border-[#2a4372] bg-[#1a2e59] px-4 py-3 text-[#d9e7ff] placeholder:text-[#7087b3] outline-none transition focus:border-[#41d6ff] focus:ring-2 focus:ring-[#00CDFF]/35 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <AnimatePresence>
                {errors.description && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="mt-1 text-sm text-[#ff8fb1]"
                  >
                    {errors.description}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="px-5 pb-6 pt-2 sm:px-7"
          >
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: submitting ? 1 : 1.02 }}
                whileTap={{ scale: submitting ? 1 : 0.98 }}
                type="submit"
                disabled={submitting}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#00CDFF] px-4 py-3 text-base font-semibold text-[#043056] shadow-[0_10px_25px_rgba(0,205,255,0.25)] transition hover:bg-[#35dcff] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  "Create Group"
                )}
              </motion.button>

              <button
                type="button"
                onClick={closeCreateModal}
                disabled={submitting}
                className="w-full cursor-pointer py-2 text-center text-sm font-semibold text-[#8ea6d2] transition hover:text-[#d1def8] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Discard Draft
              </button>
            </div>
          </motion.div>
        </form>

        <AnimatePresence>
          {inviteData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-[#020811]/85 px-4 py-6 backdrop-blur-sm"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  closeInviteModal();
                }
              }}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(0,205,255,0.2),transparent_38%)]" />

              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-[#204078] bg-[#0f2148] shadow-[0_25px_80px_rgba(0,8,25,0.75)]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-5 sm:p-6">
                  <div className="mb-2 flex items-start justify-between">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#183b73] text-[#65dcff]"
                    >
                      <UserPlus size={20} />
                    </motion.div>

                    <button
                      onClick={closeInviteModal}
                      className="cursor-pointer rounded-md p-1.5 text-[#8ba3cd] transition hover:bg-[#1a315f] hover:text-[#d4e2ff]"
                      aria-label="Close invite modal"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <motion.h3
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-3xl font-bold tracking-tight text-[#dce8ff]"
                  >
                    Invite Members
                  </motion.h3>

                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-2 text-sm text-[#8ea6d2]"
                  >
                    Group created successfully. Share this link with your friends to start splitting expenses.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="mt-6"
                  >
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-[#8ca5d4]">
                      Magic Invite Link
                    </label>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <div className="flex min-w-0 flex-1 items-center rounded-lg border border-[#2a4372] bg-[#1a2e59] px-4 py-3 text-sm text-[#87b5da]">
                        <span className="truncate">
                          {getInviteDisplayText(inviteData.inviteLink)}
                        </span>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCopy}
                        className="flex min-w-28 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#00CDFF] px-4 py-3 text-sm font-semibold text-[#043056] transition hover:bg-[#35dcff]"
                      >
                        {copied ? (
                          <>
                            <Check size={16} />
                            <span>COPIED</span>
                          </>
                        ) : (
                          <>
                            <Copy size={16} />
                            <span>COPY</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-4 flex items-center gap-2 rounded-lg border border-[#5f2c44] bg-[#3f2032]/45 px-3 py-3"
                  >
                    <Clock size={16} className="shrink-0 text-[#ff7f9e]" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#ff8eaa]">
                        Link is active for 24hrs only
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-[#f7acc0]">
                        {formatExpiryTime(inviteData.inviteTokenExpiresAt)}
                      </p>
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="border-t border-[#1b376a] bg-[#0c1c42] px-6 py-4"
                >
                  <button
                    onClick={closeInviteModal}
                    className="w-full cursor-pointer text-right text-sm font-semibold text-[#8ea6d2] transition hover:text-[#d4e2ff]"
                  >
                    Done
                  </button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
