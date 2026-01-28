"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";
import { useSession } from "next-auth/react";

export default function DashboardLayout({ children }) {
  const { data: session } = useSession();

  const [backedSynced, setBackedSynced] = useState(false);

  useEffect(() => {
    if (!session || backedSynced) return;

    const syncBackendAuth = async () => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;

      try {
        const res = await fetch(`${baseUrl}/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: session.user.name,
            email: session.user.email,
            image: session.user.image,
          }),
          credentials: "include",
        });

        if (!res.ok) {
          console.error("Backend auth sync failed");
          return;
        }

        setBackedSynced(true)
      } catch (error) {
        console.log("Something went wrong. Try again later.", error);
      }
    };

    syncBackendAuth()
  }, [session, backedSynced]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen flex bg-[#0f0f0f]">
      <Sidebar isOpen={isSidebarOpen} />

      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 p-6 py-24 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
