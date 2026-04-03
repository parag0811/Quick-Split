"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Layout/Sidebar";
import Header from "@/components/Layout/Header";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathName = usePathname();

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1280px)");
    setIsSidebarOpen(false);
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
            background: "#09112b",
            color: "#dbeafe",
            borderRadius: "16px",
            border: "1px solid rgba(0, 205, 255, 0.2)",
            padding: "12px 16px",
            fontSize: "14px",
            boxShadow: "0 10px 25px rgba(0, 14, 35, 0.5)",
          },
          success: {
            duration: 2500,
          },
          error: {
            duration: 4000,
          },
        }}
      />
      <div className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,#0d2b73_0%,#07163f_45%,#020817_100%)] text-slate-100">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <div className="flex min-h-screen flex-col transition-all duration-300 xl:pl-[280px]">
          <Header
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            title={getPageTitle()}
          />
          <main className="flex-1 px-4 pb-28 pt-24 sm:px-6 xl:px-8">{children}</main>
        </div>
      </div>
    </>
  );
}
