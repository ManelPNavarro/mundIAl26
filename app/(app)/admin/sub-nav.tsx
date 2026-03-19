"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/users", label: "Usuarios" },
  { href: "/admin/scoring", label: "Puntuación" },
  { href: "/admin/tournament", label: "Torneo" },
];

export default function AdminSubNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-8 flex items-center gap-1 border-b border-dark-border pb-4 overflow-x-auto">
      {NAV_ITEMS.map(({ href, label, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`font-display text-sm tracking-widest uppercase px-3 py-1 rounded transition-colors whitespace-nowrap ${
              isActive
                ? "text-green-primary border-b-2 border-green-primary"
                : "text-gray-muted hover:text-white hover:bg-dark-card"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
