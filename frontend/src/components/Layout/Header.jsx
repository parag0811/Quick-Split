"use client";
import { PanelLeft, LogOut, ChevronDown } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";

const Header = ({ toggleSidebar, title }) => {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-[#1a1b1b] border-b border-gray-800 h-16 flex justify-between items-center px-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="cursor-pointer text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
          aria-label="Toggle sidebar"
        >
          <PanelLeft size={24} strokeWidth={2} />
        </button>

        {title && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="hidden sm:block border-l border-gray-700 pl-4"
          >
            <h1 className="text-lg font-semibold text-white">{title}</h1>
          </motion.div>
        )}
      </div>

      {session?.user && (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-white">
                {session.user.name || "User"}
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-semibold text-sm">
                  {session.user.name?.charAt(0).toUpperCase() || "U"}
                </span>
              )}
            </div>
            <ChevronDown
              size={16}
              className={`text-gray-400 transition-transform duration-200 cursor-pointer${
                isDropdownOpen ? "rotate-180 cursor-pointer" : ""
              }`}
            />
          </button>
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-56 bg-[#1a1b1b] border border-gray-800 rounded-lg shadow-xl overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-gray-800">
                  <p className="text-sm font-semibold text-white">
                    {session.user.name || "User"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {session.user.email}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={18} />
                  <span className="text-sm font-medium cursor-pointer">Logout</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </header>
  );
};

export default Header;