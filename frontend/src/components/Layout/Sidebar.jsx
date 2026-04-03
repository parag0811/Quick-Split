"use client";
import { Home, Users, UserRound, CircleHelp, LogOut, Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSelector } from "react-redux";
import { signOut } from "next-auth/react";

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  const menuItems = [
    { icon: Home, label: "Home", href: "/dashboard" },
    { icon: Users, label: "Groups", href: "/dashboard/groups" },
    { icon: UserRound, label: "Profile", href: "/dashboard/profile" },
  ];

  const { user } = useSelector((state) => state.auth);

  const getIsActive = (href) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const DesktopSidebarContent = () => (
    <>
      <div className="border-b border-[#17335f] px-6 py-5">
        <h2 className="text-2xl font-bold text-[#00CDFF]">Quick Split</h2>
        <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[#6f86b2]">Precision spending</p>
      </div>

      <nav className="px-3 pt-6">
        <ul className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = getIsActive(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-[#0c2758] text-[#00CDFF] shadow-[inset_3px_0_0_0_#00CDFF]"
                      : "text-[#8ea4cd] hover:bg-[#0a1d44] hover:text-white"
                  } cursor-pointer`}
                >
                  <Icon size={18} className={isActive ? "text-[#00CDFF]" : "text-[#7891bc] group-hover:text-[#00CDFF]"} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto px-5 pb-6">
        <Link
          href="/dashboard/groups/create"
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#00CDFF] px-4 py-3 text-sm font-bold text-[#03203f] transition hover:bg-[#36d9ff]"
        >
          <Plus size={18} />
          Add Expense
        </Link>

        <div className="mt-5 space-y-1.5">
          <button className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#7f97c3] hover:bg-[#0a1c42] hover:text-white">
            <CircleHelp size={16} />
            Help
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#7f97c3] hover:bg-[#0a1c42] hover:text-[#ff9db8]"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        {user && (
          <div className="mt-5 rounded-xl border border-[#1e3b70] bg-[#071634] p-3">
            <p className="truncate text-xs font-semibold text-[#a8bbdf]">{user.name || "User"}</p>
            <p className="truncate text-[11px] text-[#6581b2]">{user.email}</p>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 cursor-pointer bg-black/45 backdrop-blur-[2px] xl:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-16 z-50 flex h-[calc(100vh-4rem)] w-70 flex-col border-r border-[#17335f] bg-[#041236] shadow-[16px_0_40px_rgba(0,0,0,0.35)] transition-transform duration-300 xl:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <DesktopSidebarContent />
      </aside>

      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-70 flex-col border-r border-[#17335f] bg-[#041236] xl:flex">
        <DesktopSidebarContent />
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#17335f] bg-[#071838]/95 px-3 pb-2 pt-2 backdrop-blur-xl xl:hidden">
        <ul className="grid grid-cols-3 gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = getIsActive(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] transition ${
                    isActive
                      ? "bg-[#0d2a5f] text-[#00CDFF]"
                      : "text-[#7f98c4] hover:bg-[#0b224f] hover:text-white"
                  } cursor-pointer`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
