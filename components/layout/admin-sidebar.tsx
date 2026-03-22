"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "dashboard", exact: true },
  { href: "/admin/users", label: "Users", icon: "group" },
  { href: "/admin/games", label: "Games", icon: "sports_soccer" },
  { href: "/admin/scoring", label: "Scoring", icon: "insights" },
  { href: "/admin/system", label: "System", icon: "terminal" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex fixed left-0 h-full w-64 bg-[#1c1b1b] flex-col py-8 z-40 mt-16 border-r border-white/5">
      <div className="px-6 mb-10">
        <span className="text-xs font-bold tracking-[0.2em] text-gray-500 uppercase">
          Management
        </span>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={
                isActive
                  ? "flex items-center gap-3 bg-[#2a2a2a] text-[#00D46A] border-l-4 border-[#00D46A] px-6 py-3 font-medium text-sm transition-all duration-200"
                  : "flex items-center gap-3 text-gray-400 px-6 py-3 hover:bg-[#2a2a2a]/50 transition-all duration-200 font-medium text-sm"
              }
            >
              <span className="material-symbols-outlined">{icon}</span>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-6 mt-auto">
        <div className="bg-surface-container-high p-4 rounded-xl border border-white/5">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold">
            Admin Level
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-bold text-white">Super Administrator</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
