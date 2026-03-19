"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown, LogOut, User } from "lucide-react";
import type { Tables } from "@/types/database";

const NAV_LINKS = [
  { href: "/ranking", label: "Ranking" },
  { href: "/results", label: "Resultados" },
  { href: "/predictions", label: "Mi Quiniela" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [userData, setUserData] = useState<Tables<"users"> | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchUser() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: dataRaw } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      const data = dataRaw as unknown as Tables<"users"> | null;
      if (data) setUserData(data);
    }

    fetchUser();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const initials = userData
    ? `${userData.first_name[0]}${userData.last_name[0]}`.toUpperCase()
    : "?";

  return (
    <header className="hidden lg:flex h-[60px] bg-dark-bg border-b border-dark-border items-center px-6 sticky top-0 z-50">
      {/* Logo */}
      <Link href="/ranking" className="mr-10 flex-shrink-0">
        <span className="font-display text-[28px] text-white tracking-widest">
          MUND<span className="text-green-primary">IA</span>L 26
        </span>
      </Link>

      {/* Nav links */}
      <nav className="flex items-center gap-1 flex-1">
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative px-4 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? "text-white"
                  : "text-gray-muted hover:text-white"
              }`}
            >
              {link.label}
              {isActive && (
                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-green-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User dropdown */}
      <div className="relative ml-auto" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-dark-card transition-colors"
        >
          <Avatar size="sm">
            <AvatarImage src={userData?.avatar_url ?? undefined} alt={initials} />
            <AvatarFallback className="bg-green-primary/20 text-green-primary text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-white font-medium max-w-[120px] truncate">
            {userData ? `${userData.first_name} ${userData.last_name}` : "..."}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-gray-muted transition-transform ${
              dropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-dark-card border border-dark-border rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.4)] overflow-hidden z-50">
            <Link
              href="/profile"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2 px-4 py-3 text-sm text-white hover:bg-dark-card-hover transition-colors"
            >
              <User className="w-4 h-4 text-gray-muted" />
              Perfil
            </Link>
            <div className="border-t border-dark-border" />
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-accent hover:bg-dark-card-hover transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
