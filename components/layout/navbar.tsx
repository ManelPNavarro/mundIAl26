'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import CompetitionSwitcher from '@/components/layout/competition-switcher'
import type { Tables } from '@/types/database'

const NAV_LINKS = [
  { href: '/ranking', label: 'Ranking' },
  { href: '/results', label: 'Resultados' },
  { href: '/predictions', label: 'Mi Quiniela' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()

  const [userData, setUserData] = useState<Tables<'users'> | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchUser() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: dataRaw } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      const data = dataRaw as unknown as Tables<'users'> | null
      if (data) setUserData(data)
    }

    fetchUser()
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initials = userData
    ? `${userData.first_name[0]}${userData.last_name[0]}`.toUpperCase()
    : '?'

  const isAdmin = userData?.role === 'admin'

  return (
    <header className="fixed top-0 w-full z-50 bg-[#131313]/70 backdrop-blur-xl border-b border-white/5 h-16 flex items-center px-6">
      {/* Left: Logo + CompetitionSwitcher */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <Link href="/ranking" className="flex-shrink-0">
          <span className="font-bebas text-2xl italic tracking-tight text-white">
            Mund<span className="text-[#00D46A]">IA</span>l 26
          </span>
        </Link>

        {/* Competition switcher — desktop only */}
        <div className="hidden lg:flex">
          <CompetitionSwitcher />
        </div>
      </div>

      {/* Center nav links — desktop only */}
      <nav className="hidden lg:flex items-center gap-1 flex-1 ml-8">
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-1.5 text-sm transition-colors ${
                isActive
                  ? 'text-[#00D46A] font-bold'
                  : 'text-gray-400 font-medium hover:text-[#00D46A]'
              }`}
            >
              {link.label}
            </Link>
          )
        })}

        {isAdmin && (
          <Link
            href="/admin"
            className={`px-4 py-1.5 text-sm transition-colors ${
              pathname.startsWith('/admin')
                ? 'text-[#00D46A] font-bold'
                : 'text-gray-400 font-medium hover:text-[#00D46A]'
            }`}
          >
            Admin
          </Link>
        )}
      </nav>

      {/* Far right: notifications + avatar */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Notifications */}
        <button className="hidden lg:flex items-center justify-center w-9 h-9 rounded-full hover:bg-white/5 transition-colors text-gray-400 hover:text-white">
          <span className="material-symbols-outlined text-xl leading-none">notifications</span>
        </button>

        {/* Avatar dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <Avatar size="sm">
              <AvatarImage src={userData?.avatar_url ?? undefined} alt={initials} />
              <AvatarFallback className="bg-primary-container text-on-primary text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden lg:block text-sm text-white font-medium max-w-[120px] truncate">
              {userData ? `${userData.first_name} ${userData.last_name}` : '…'}
            </span>
            <span className="material-symbols-outlined text-sm text-gray-500 leading-none hidden lg:block">
              expand_more
            </span>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#1c1b1b] border border-white/10 rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.4)] overflow-hidden z-50">
              <Link
                href="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-3 text-sm text-white hover:bg-[#2a2a2a] transition-colors"
              >
                <span className="material-symbols-outlined text-base text-gray-400 leading-none">
                  account_circle
                </span>
                Perfil
              </Link>
              <div className="border-t border-white/5" />
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-[#2a2a2a] transition-colors"
              >
                <span className="material-symbols-outlined text-base leading-none">logout</span>
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
