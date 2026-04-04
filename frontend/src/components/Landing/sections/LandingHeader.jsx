"use client";

import { motion } from "framer-motion";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "About", href: "#about" },
];

const LandingHeader = ({ onLogin, onSignup }) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="sticky top-0 z-40 border-b border-[#1a2b4d]/70 bg-[#020b1f]/55 backdrop-blur-xl"
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a
          href="#top"
          className="text-sm font-bold tracking-[0.2em] text-[#1fc8ff] sm:text-base"
          aria-label="Quick Split home"
        >
          Quick Split
        </a>

        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-[#8ba6cc] transition hover:text-[#d6e4ff]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onLogin}
            className="cursor-pointer rounded-md px-4 py-2 text-xs font-semibold tracking-wide text-[#a6bcde] transition hover:text-white sm:text-sm"
          >
            Login
          </button>
          <button
            onClick={onSignup}
            className="cursor-pointer rounded-md bg-[#17c8ff] px-4 py-2 text-xs font-bold tracking-wide text-[#032039] shadow-[0_8px_24px_rgba(23,200,255,0.32)] transition hover:bg-[#67e0ff] sm:text-sm"
          >
            SIGN UP
          </button>
        </div>
      </div>
    </motion.header>
  );
};

export default LandingHeader;
