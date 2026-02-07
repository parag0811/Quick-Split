"use client";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const Landing = () => {
  const router = useRouter()
  
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

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-bold mb-6"
        >
          Quick Split
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="text-xl md:text-2xl text-gray-300 mb-12"
        >
          Split expenses with friends. No stress. No confusion.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            className="w-full sm:w-auto cursor-pointer bg-[#222255] text-white px-8 py-3 rounded-lg hover:bg-white hover:text-black transition-all duration-300"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            Get Started
          </button>
          <button
            className="w-full sm:w-auto cursor-pointer bg-white text-black px-8 py-3 rounded-lg hover:bg-[#222255] hover:text-white transition-all duration-300"
            onClick={() => router.push("/how-it-works")}
          >
            See How It Works
          </button>
        </motion.div>
      </div>
    </main>
  );
};

export default Landing;
