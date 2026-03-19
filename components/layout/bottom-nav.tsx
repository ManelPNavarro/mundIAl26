"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Flag, ClipboardList, User } from "lucide-react";

const TABS = [
  { href: "/ranking", label: "Ranking", icon: Trophy },
  { href: "/results", label: "Resultados", icon: Flag },
  { href: "/predictions", label: "Quiniela", icon: ClipboardList },
  { href: "/profile", label: "Perfil", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-dark-card border-t border-dark-border z-50 flex items-stretch">
      {TABS.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors"
          >
            <Icon
              className={`w-5 h-5 ${
                isActive ? "text-green-primary" : "text-gray-muted"
              }`}
            />
            <span
              className={`text-[11px] font-medium ${
                isActive ? "text-green-primary" : "text-gray-muted"
              }`}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
