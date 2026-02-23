"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RotateCcw, LayoutDashboard, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardError({ error, reset }) {
  const router = useRouter();

  useEffect(() => {
    console.error("[Dashboard Error]", error);
  }, [error]);

  return (
    <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[70vh]">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md text-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="flex justify-center mb-6"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500/15 to-orange-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-9 h-9 text-red-400" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-2xl font-bold text-white mb-3"
        >
          Something went wrong
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 text-sm leading-relaxed mb-3"
        >
          We couldn't load this section of your dashboard.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-gray-500 text-xs mb-8"
        >
          Your data is safe. This is likely a temporary issue.
        </motion.p>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="h-px bg-gray-800 mb-8 origin-left"
        />

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <button
            onClick={reset}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 shadow-lg shadow-cyan-500/20 text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try again</span>
          </button>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-[#1a1b1b] border border-gray-700 text-gray-300 px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-800 hover:border-gray-600 hover:text-white transition-all duration-200 text-sm"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard home</span>
          </Link>

          <button
            onClick={() => router.back()}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 text-gray-500 hover:text-gray-300 px-4 py-2.5 rounded-lg transition-colors duration-200 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go back</span>
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}