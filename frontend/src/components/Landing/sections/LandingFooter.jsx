"use client";

import { motion } from "framer-motion";

const footerLinks = [
  "Privacy Policy",
  "Terms of Service",
  "Contact",
  "Twitter",
  "GitHub",
];

const LandingFooter = () => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="border-t border-[#17274a] bg-[#020918]"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p className="text-sm font-bold tracking-[0.16em] text-[#14c6ff]">
          Quick Split
        </p>

        <ul className="flex flex-wrap items-center gap-4 text-[11px] uppercase tracking-[0.15em] text-[#6f84aa] sm:gap-6">
          {footerLinks.map((item) => (
            <li key={item}>
              <a href="#" className="transition hover:text-[#c9ddff]">
                {item}
              </a>
            </li>
          ))}
        </ul>

        <p className="text-[11px] uppercase tracking-[0.14em] text-[#52698f]">
          {new Date().getFullYear()} Quick Split. PRECISION IN EVERY SPLIT.
        </p>
      </div>
    </motion.footer>
  );
};

export default LandingFooter;
