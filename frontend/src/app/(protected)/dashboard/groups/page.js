"use client";
import { Plus, Users, RotateCcw, Crown } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function GroupList() {
  const router = useRouter();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiFetch("/groups/my-groups");
      if (data?.groups && Array.isArray(data.groups)) {
        setGroups(data.groups);
      } else {
        setError("We couldn't load your groups. Please try again.");
        setGroups([]);
      }
    } catch (err) {
      setError(err?.message || "Failed to load groups. Please try again.");
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="mx-auto w-full max-w-350">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-3xl font-bold tracking-tight text-[#e8f1ff]">Groups</h1>
            <p className="mt-1 text-sm text-[#7f97c3]">All your active groups and ownership status</p>
          </motion.div>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/dashboard/groups/create")}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#00CDFF] px-5 py-2.5 text-sm font-semibold text-[#022342] shadow-[0_10px_25px_rgba(0,205,255,0.2)] transition hover:bg-[#35dcff]"
          >
            <Plus size={16} />
            <span>New Group</span>
          </motion.button>
        </motion.div>

        <AnimatePresence mode="wait">
          {!loading && error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col items-center justify-center rounded-xl border border-[#2a3f6d] bg-[#09183f]/70 px-4 py-20"
            >
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
                <span className="text-red-400 text-3xl">!</span>
              </div>
              <h2 className="mb-2 text-xl font-bold text-[#dbe9ff]">
                Couldn't load groups
              </h2>
              <p className="mb-8 max-w-sm text-center text-sm text-[#8aa0c9]">
                {error}
              </p>
              <button
                onClick={fetchGroups}
                className="flex items-center gap-2 rounded-lg bg-[#00CDFF] px-5 py-2.5 text-sm font-semibold text-[#03203f] transition hover:bg-[#32d9ff]"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry</span>
              </button>
            </motion.div>
          )}

          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
            >
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-xl border border-[#1b3563] bg-[#09183f]/70 p-5"
                >
                  <div className="mb-4 h-5 w-2/3 rounded bg-[#12306a]" />
                  <div className="mb-2 h-3 w-full rounded bg-[#12306a]" />
                  <div className="mb-4 h-3 w-3/4 rounded bg-[#12306a]" />
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-1/3 rounded bg-[#12306a]" />
                    <div className="h-3 w-1/4 rounded bg-[#12306a]" />
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {!loading && !error && groups.length > 0 && (
            <motion.div
              key="groups"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
            >
              {groups.map((group, index) => {
                return (
                  <motion.div
                    key={group.groupId}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.05 + index * 0.05,
                      type: "spring",
                      stiffness: 200,
                      damping: 20,
                    }}
                    whileHover={{ scale: 1.03, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push(`/dashboard/groups/${group.groupId}`)}
                    className="group relative cursor-pointer overflow-hidden rounded-xl border border-[#17345f] bg-[#06173f]/80 p-5 transition-all duration-200 hover:border-[#2a5ea3] hover:shadow-[0_12px_28px_rgba(2,8,23,0.5)]"
                  >
                    <span
                      className={`absolute left-0 top-4 h-14 w-0.75 rounded-r-full ${
                        group.isOwner ? "bg-[#00CDFF]" : "bg-[#FF2D65]"
                      }`}
                    />

                    <h3 className="pr-8 text-lg font-semibold tracking-tight text-[#d8e6ff] transition-colors group-hover:text-white">
                      {group.name}
                    </h3>

                    <p className="mt-2 line-clamp-2 min-h-10 text-sm text-[#86a0cb]">
                      {group.description || "No description provided."}
                    </p>

                    <div className="mt-5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.13em] text-[#6f88b7]">
                        <Users size={13} />
                        <span>
                          {group.memberCount} member{group.memberCount !== 1 ? "s" : ""}
                        </span>
                      </div>

                      {group.isOwner ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#00CDFF]/40 bg-[#00CDFF]/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6de6ff]">
                          <Crown size={11} />
                          Group Owner
                        </span>
                      ) : null}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {!loading && !error && groups.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="rounded-xl border border-[#17345f] bg-[#06173f]/70"
            >
              <div className="flex flex-col items-center justify-center px-4 py-24">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: 0.2,
                  }}
                  className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#0a2255]"
                >
                  <Users size={50} className="text-[#4e73aa]" />
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mb-3 text-2xl font-semibold text-[#d8e6ff]"
                >
                  You're not part of any group yet
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="mb-10 max-w-md text-center text-base text-[#7f97c3]"
                >
                  Create your first group to start splitting expenses with friends,
                  family, or colleagues
                </motion.p>
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5, type: "spring" }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push("/dashboard/groups/create")}
                  className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#00CDFF] px-7 py-3 text-base font-semibold text-[#022342] transition hover:bg-[#35dcff]"
                >
                  <Plus size={20} />
                  <span className="text-base">Create your first group</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}