'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCompetition } from '@/lib/context/competition-context'

const NAV_ITEMS = [
  { href: '/ranking', label: 'Ranking', icon: 'insights' },
  { href: '/results', label: 'Resultados', icon: 'sports_soccer' },
  { href: '/predictions', label: 'Mi Quiniela', icon: 'checklist' },
  { href: '/profile', label: 'Perfil', icon: 'account_circle' },
]

export default function AppSidebar() {
  const pathname = usePathname()
  const { activeCompetition } = useCompetition()

  return (
    <aside className="fixed left-0 h-full w-64 bg-[#1c1b1b] border-r border-white/5 hidden lg:flex flex-col py-8 z-40 mt-16">
      {/* Competition context card */}
      <div className="px-4 mb-6">
        <div className="bg-surface-container-high rounded-xl p-3 border border-white/5 flex items-center gap-3">
          <span className="material-symbols-outlined text-[#00D46A] text-xl leading-none flex-shrink-0">
            sports_soccer
          </span>
          <span className="text-sm text-white font-medium flex-1 truncate">
            {activeCompetition?.name ?? '…'}
          </span>
          <span className="material-symbols-outlined text-gray-500 text-base leading-none flex-shrink-0">
            unfold_more
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col flex-1 gap-0.5">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 py-3 transition-all duration-200 ${
                isActive
                  ? 'bg-[#2a2a2a] text-[#00D46A] border-l-4 border-[#00D46A] px-5'
                  : 'text-gray-400 px-6 hover:bg-[#2a2a2a]/50 hover:text-white border-l-4 border-transparent'
              }`}
            >
              <span className="material-symbols-outlined text-xl leading-none">{icon}</span>
              <span className="text-sm font-medium">{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Upgrade to Pro */}
      <div className="px-4 mt-auto">
        <button className="w-full bg-gradient-to-tr from-primary to-primary-container text-on-primary-fixed font-bold py-3 rounded-xl uppercase tracking-widest text-xs transition-opacity hover:opacity-90">
          Upgrade to Pro
        </button>
      </div>
    </aside>
  )
}
