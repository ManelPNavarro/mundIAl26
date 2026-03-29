"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin/juegos", label: "Juegos", icon: "sports_soccer" },
  { href: "/admin/usuarios", label: "Usuarios", icon: "group" },
  { href: "/admin/configuracion", label: "Configuración", icon: "settings" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-60 bg-[#1c1b1b] border-r border-white/5 flex flex-col py-6 z-40">
      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 py-3 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-[#2a2a2a] text-[#00D46A] border-l-4 border-[#00D46A] px-5"
                  : "text-gray-400 px-6 hover:bg-[#2a2a2a]/50 hover:text-white border-l-4 border-transparent"
              }`}
            >
              <span className="material-symbols-outlined text-xl leading-none">{icon}</span>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
