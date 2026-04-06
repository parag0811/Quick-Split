"use client";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Header = ({ toggleSidebar, title }) => {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Groups", href: "/dashboard/groups" },
    { label: "Activity", href: "/dashboard/groups" },
  ];

  const isActive = (href, label) => {
    if (label === "Activity") return pathname.includes("/settlement") || pathname.includes("/expense");
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-[#16305f] bg-[#041236]/90 backdrop-blur-xl xl:left-70">
      <div className="mx-auto flex h-16 w-full max-w-350 items-center justify-between px-4 sm:px-6 xl:px-8">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold tracking-tight text-[#00CDFF] xl:hidden">Quick Split</span>
        <button
          onClick={toggleSidebar}
            className="cursor-pointer rounded-lg border border-[#203f73] p-2 text-[#94a3b8] transition hover:border-[#00CDFF]/40 hover:text-[#00CDFF] xl:hidden"
          aria-label="Toggle sidebar"
        >
            <Menu size={18} strokeWidth={2.2} />
        </button>

          <nav className="hidden items-center gap-2 xl:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                  isActive(item.href, item.label)
                    ? "bg-[#00CDFF]/10 text-[#00CDFF]"
                    : "text-[#8da4cf] hover:text-white"
                } cursor-pointer`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
      </div>

        <div className="flex items-center gap-2">
          {title && <span className="hidden text-xs uppercase tracking-[0.2em] text-[#6f86b2] lg:block">{title}</span>}
        </div>
      </div>
    </header>
  );
};

export default Header;
