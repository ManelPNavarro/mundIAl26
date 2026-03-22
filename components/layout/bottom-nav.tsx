'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/ranking', label: 'Home', icon: 'home' },
  { href: '/results', label: 'Live', icon: 'sports_soccer' },
  { href: '/ranking', label: 'Rankings', icon: 'insights' },
  { href: '/predictions', label: 'Quiniela', icon: 'checklist' },
  { href: '/profile', label: 'Perfil', icon: 'account_circle' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 w-full bg-[#131313]/90 backdrop-blur-xl border-t border-white/5 z-50 flex justify-around items-center h-16">
      {TABS.map(({ href, label, icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={`${href}-${label}`}
            href={href}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full"
          >
            <span
              className={`material-symbols-outlined text-xl leading-none ${
                isActive ? 'text-[#00D46A]' : 'text-gray-400'
              }`}
            >
              {icon}
            </span>
            <span
              className={`text-[10px] uppercase font-bold ${
                isActive ? 'text-[#00D46A]' : 'text-gray-400'
              }`}
            >
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
