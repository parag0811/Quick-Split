"use client";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { toastSuccess } from "@/lib/toast";

export default function GroupForm() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [inviteToken, setInviteToken] = useState(null);
  const [errors, setErrors] = useState({});
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      const data = await apiFetch("/create-group", {
        method: "POST",
        body: formData,
      });
      toastSuccess(`${data.message}`)
      setInviteToken(data.inviteToken);
      console.log(data.inviteToken);
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

        <AnimatePresence>
          {inviteToken && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="bg-[#1a1a1a] p-6 rounded-lg border border-gray-700 w-[90%] max-w-md"
              >
                <motion.h3
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-xl font-semibold text-white mb-3"
                >
                  Invite Link Generated
                </motion.h3>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-2 bg-gray-800 p-2 rounded"
                >
                  <input
                    readOnly
                    value={inviteToken}
                    className="flex-1 bg-transparent text-gray-300 outline-none"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigator.clipboard.writeText(inviteToken)}
                    className="px-3 py-1 bg-blue-600 rounded text-white text-sm cursor-pointer"
                  >
                    Copy
                  </motion.button>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setInviteToken(null);
                    router.push(`/dashboard/groups`);
                  }}
                  className="mt-4 w-full bg-gray-700 py-2 rounded text-gray-300 cursor-pointer"
                >
                  Close
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}