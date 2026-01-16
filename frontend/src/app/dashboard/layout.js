"use client";
import { useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar.jsx";
import Header from "@/components/Header/Header.jsx";

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen flex">
      <Sidebar isOpen={isSidebarOpen} />
      <div
        className={`flex flex-col transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Header
          sidebarOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
