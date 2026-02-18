"use client";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Link2, Clock, ExternalLink } from "lucide-react";
import { toastSuccess } from "@/lib/toast";

export default function GroupForm() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [inviteData, setInviteData] = useState(null);
  const [errors, setErrors] = useState({});
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteData.inviteLink);
      setCopied(true);
      toastSuccess("Invite link copied to clipboard!");
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

    if (hoursLeft > 0) {
      return `Expires in ${hoursLeft}h ${minutesLeft}m`;
    }
    return `Expires in ${minutesLeft}m`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      const data = await apiFetch("/create-group", {
        method: "POST",
        body: formData,
      });
      toastSuccess(data.message);
      setInviteData({
        groupId: data.groupId,
        inviteLink: data.inviteLink,
        inviteTokenExpiresAt: data.inviteTokenExpiresAt,
      });
    } catch (error) {
      if (error.validation) {
        const fieldErrors = {};
        error.validation.forEach((e) => {
          fieldErrors[e.path] = e.msg;
        });
        setErrors(fieldErrors);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="bg-[#1a1a1a] border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between p-6 border-b border-gray-800"
        >
          <div>
            <h2 className="text-2xl font-bold text-white">
              Create a New Group
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Fill in the details below to create your group
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => router.push("/dashboard/groups")}
            className="p-2 hover:bg-[#252525] rounded-lg transition-all text-gray-400 hover:text-white cursor-pointer"
          >
            <X size={20} />
          </motion.button>
        </motion.div>

        <form onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Group Name <span className="text-red-400">*</span>
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
                className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-gray-800 text-white rounded-lg focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all placeholder-gray-500"
                placeholder="Enter group name"
              />
              <AnimatePresence>
                {errors.name && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="text-red-400 text-sm mt-1"
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
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Description
              </label>
              <motion.textarea
                whileFocus={{ scale: 1.005 }}
                transition={{ type: "spring", stiffness: 300 }}
                id="description"
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-gray-800 text-white rounded-lg focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all resize-none placeholder-gray-500"
                placeholder="Describe your group"
              ></motion.textarea>
              <AnimatePresence>
                {errors.description && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="text-red-400 text-sm mt-1"
                  >
                    {errors.description}
                  </motion.p>
                )}
              </AnimatePresence>

              <p className="mt-1 text-xs text-gray-500">
                Help others understand what this group is about
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="p-6 border-t border-gray-800 bg-[#1a1a1a]"
          >
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/dashboard/groups")}
                type="button"
                className="flex-1 px-4 py-2.5 bg-[#0f0f0f] border border-gray-800 hover:bg-[#252525] text-gray-300 hover:text-white rounded-lg text-sm font-medium transition-all cursor-pointer"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-cyan-900/30 hover:shadow-cyan-900/50 cursor-pointer"
              >
                Create Group
              </motion.button>
            </div>
          </motion.div>
        </form>

        {/* Invite Link Modal */}
        <AnimatePresence>
          {inviteData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setInviteData(null);
                  router.push(`/dashboard/groups`);
                }
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="bg-[#1a1a1a] border border-gray-800 rounded-2xl w-full max-w-lg overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-800">
                  <div className="flex items-center gap-3 mb-2">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", delay: 0.1 }}
                      className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center"
                    >
                      <Check size={24} className="text-white" />
                    </motion.div>
                    <div>
                      <motion.h3
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 }}
                        className="text-xl font-bold text-white"
                      >
                        Group Created Successfully!
                      </motion.h3>
                      <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-sm text-gray-400"
                      >
                        Share this invite link with others
                      </motion.p>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                  {/* Invite Link Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Link2 size={16} className="inline mr-2" />
                      Invite Link
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-4 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-gray-300 text-sm font-mono truncate">
                        {inviteData.inviteLink}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCopy}
                        className="px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-cyan-900/30 hover:shadow-cyan-900/50 cursor-pointer flex items-center gap-2"
                      >
                        {copied ? (
                          <>
                            <Check size={18} />
                            <span className="hidden sm:inline">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={18} />
                            <span className="hidden sm:inline">Copy</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>

                  {/* Expiry Time */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-2 p-4 bg-amber-600/10 border border-amber-600/30 rounded-lg"
                  >
                    <Clock size={18} className="text-amber-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-amber-400">
                        {formatExpiryTime(inviteData.inviteTokenExpiresAt)}
                      </p>
                      <p className="text-xs text-amber-300/70 mt-0.5">
                        Link will expire on{" "}
                        {new Date(inviteData.inviteTokenExpiresAt).toLocaleString()}
                      </p>
                    </div>
                  </motion.div>

                  {/* Info Box */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="p-4 bg-blue-600/10 border border-blue-600/30 rounded-lg"
                  >
                    <p className="text-sm text-blue-300">
                      <strong>💡 Tip:</strong> Anyone with this link can join your group.
                      You can regenerate a new invite link from the group settings if needed.
                    </p>
                  </motion.div>
                </div>

                {/* Footer */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="p-6 border-t border-gray-800 flex gap-3"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => window.open(inviteData.inviteLink, "_blank")}
                    className="flex-1 px-4 py-2.5 bg-[#0f0f0f] border border-gray-800 hover:bg-[#252525] text-gray-300 hover:text-white rounded-lg text-sm font-medium transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ExternalLink size={18} />
                    Open Link
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setInviteData(null);
                      router.push(`/dashboard/groups`);
                    }}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-purple-900/30 hover:shadow-purple-900/50 cursor-pointer"
                  >
                    Go to Groups
                  </motion.button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}