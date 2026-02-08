"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, Receipt, CheckCircle, PieChart, BarChart3, Zap, RefreshCw } from "lucide-react";

const HowItWorks = () => {
  const router = useRouter();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div
        className="
          absolute inset-0
          bg-[linear-gradient(180deg,rgba(0,0,0,0.5),rgba(0,0,0,0.4),rgba(0,0,0,0.6)),url('/images/q_s_bg.jpg')]
          bg-cover bg-center
        "
      />
      <div
        className="
          absolute inset-0
          bg-[url('/noise.png')]
          opacity-[0.04]
          pointer-events-none
        "
      />

      <div className="relative z-10 min-h-screen px-6 py-12">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors mb-12"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4">How It Works</h1>
          <p className="text-lg md:text-xl text-gray-300">
            Three simple steps to hassle-free expense splitting
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto mb-20"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div variants={itemVariants} className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-6">
                <Users className="w-10 h-10 text-white" />
              </div>
              <div className="w-12 h-1 bg-gradient-to-r from-[#222255] to-purple-500 rounded-full mb-4" />
              <h3 className="text-2xl font-bold mb-3">1. Create a Group</h3>
              <p className="text-gray-300">
                Start by creating a group for your trip, event, or shared expenses
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-6">
                <Receipt className="w-10 h-10 text-white" />
              </div>
              <div className="w-12 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4" />
              <h3 className="text-2xl font-bold mb-3">2. Add Expenses</h3>
              <p className="text-gray-300">
                Log expenses as they happen and choose how to split them
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <div className="w-12 h-1 bg-gradient-to-r from-pink-500 to-[#222255] rounded-full mb-4" />
              <h3 className="text-2xl font-bold mb-3">3. Settle Instantly</h3>
              <p className="text-gray-300">
                See who owes what and settle up with a single tap
              </p>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-12">
            Feature Highlights
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all"
            >
              <PieChart className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Flexible Splitting</h3>
              <p className="text-gray-400">
                Split equally, unequally, or by percentage based on your needs
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all"
            >
              <BarChart3 className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Group Analytics</h3>
              <p className="text-gray-400">
                Visualize spending patterns and track group expenses over time
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all"
            >
              <Zap className="w-12 h-12 text-yellow-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Instant Settlements</h3>
              <p className="text-gray-400">
                Settle balances instantly and keep track of all transactions
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all"
            >
              <RefreshCw className="w-12 h-12 text-green-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Real-Time Updates</h3>
              <p className="text-gray-400">
                Stay synced with your group as expenses are added and settled
              </p>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-center mt-16"
        >
          <button
            onClick={() => router.push("/")}
            className="bg-[#222255] text-white px-10 py-4 rounded-lg hover:bg-white hover:text-black transition-all duration-300 text-lg font-semibold"
          >
            Get Started Now
          </button>
        </motion.div>
      </div>
    </main>
  );
};

export default HowItWorks;