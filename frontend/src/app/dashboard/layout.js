"use client";
import { useState } from "react";
import Sidebar from "@/components/Layout/Sidebar";
import Header from "@/components/Layout/Header";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathName = usePathname();

  const getPageTitle = () => {
    if (pathName.includes("/expense")) return "Expense";
    if (pathName.includes("/settlement")) return "Settlement";
    if (pathName.startsWith("/dashboard/groups")) return "Groups";
    if (pathName === "/dashboard") return null;
    return null;
  };

  return (
    <div className="min-h-screen flex bg-[#0f0f0f]">
      <Sidebar isOpen={isSidebarOpen} />

      <div
        className={`flex flex-col flex-1 ml-64 transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Header
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          title={getPageTitle()}
        />
        <main className="flex-1 p-6 py-24 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
