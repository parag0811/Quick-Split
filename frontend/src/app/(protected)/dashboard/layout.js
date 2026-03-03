"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Layout/Sidebar";
import Header from "@/components/Layout/Header";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathName = usePathname();

  useEffect(() => {
    setIsMounted(true);
    const mql = window.matchMedia("(min-width: 1024px)");
    setIsSidebarOpen(mql.matches);
    const handler = (e) => setIsSidebarOpen(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const getPageTitle = () => {
    if (pathName.includes("/expense")) return "Expense";
    if (pathName.includes("/settlement")) return "Settlement";
    if (pathName.startsWith("/dashboard/groups")) return "Groups";
    if (pathName === "/dashboard") return null;
    return null;
  };

  return (
    <>
      <Toaster
        position="top-center"
        gutter={10}
        toastOptions={{
          style: {
            background: "#1a1a1a",
            color: "#ffffff",
            borderRadius: "16px",
            border: "1px solid #2a2a2a",
            padding: "12px 16px",
            fontSize: "14px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
          },
          success: {
            duration: 2500,
          },
          error: {
            duration: 4000,
          },
        }}
      />
      <div className="min-h-screen flex bg-[#0f0f0f]">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <div
          className={`flex flex-col flex-1 transition-all duration-300 ${
            isSidebarOpen ? "lg:ml-64" : "ml-0"
          }`}
        >
          <Header
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            title={getPageTitle()}
          />
          <main className="flex-1 px-4 sm:px-6 py-24 overflow-y-auto">{children}</main>
        </div>
      </div>
    </>
  );
}
