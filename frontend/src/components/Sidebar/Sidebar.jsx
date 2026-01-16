"use client";
import { Home, Group, ChartColumn, LogOut, Banknote } from "lucide-react";

export default function Sidebar({ isOpen }) {
  const menuItems = [
    { icon: Home, label: "Home", active: true },
    { icon: Group, label: "Groups", active: false },
    { icon: Banknote, label: "Expense", active: false },
    { icon: ChartColumn, label: "Analytics", active: false },
    { icon: LogOut, label: "Log Out", active: false },
  ];

  return (
    <aside
      className={`fixed top-16 left-0 z-40 w-64
  h-[calc(100vh-4rem)]
  bg-[#1a1b1b]
  transition-transform duration-300 ease-in-out
  ${isOpen ? "translate-x-0" : "-translate-x-full"}
  flex flex-col`}
    >
      <div className="p-6">
        <div className="flex flex-col items-center justify-center space-y-4 mt-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-300 overflow-hidden flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop"
              alt="Janice Chandler"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-gray-300 font-semibold text-2xl">
              Janice Chandler
            </h2>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-6 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <li key={index}>
                <button
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg
                      transition-all duration-200 cursor-pointer"
                >
                  <Icon size={24} strokeWidth={3} />
                  <span className="font-semibold text-lg">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-6">
        <div className="flex flex-col items-center space-y-4 mb-4">
          <div className="relative">
            <div className="w-8 h-8 flex items-center justify-center">
              <div className="absolute inset-0 bg-cyan-500 rounded-lg blur-md opacity-25"></div>
              <div className="relative text-cyan-400 font-bold text-xl">⚡</div>
            </div>
          </div>
          <div className="text-2xl font-bold">
            <span className="text-white">Quick</span>
            <span className="text-cyan-400"> Split</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
