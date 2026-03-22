'use client'

import { useEffect, useRef, useState } from 'react'
import { useCompetition, type Competition } from '@/lib/context/competition-context'

const STATUS_LABELS: Record<Competition['status'], string> = {
  active: 'Activa',
  upcoming: 'Próxima',
  finished: 'Finalizada',
}

function truncate(str: string, max = 20) {
  return str.length > max ? str.slice(0, max - 1) + '…' : str
}

export default function CompetitionSwitcher() {
  const { activeCompetition, setActiveCompetition, competitions, loading } = useCompetition()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (loading || !activeCompetition) {
    return (
      <div className="h-8 w-36 rounded-lg bg-surface-container-high animate-pulse border border-white/5" />
    )
  }

  return (
    <div className="relative" ref={ref}>
      {/* Pill button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="bg-surface-container-high rounded-lg px-3 py-1.5 border border-white/5 flex items-center gap-2 text-sm font-medium cursor-pointer hover:bg-surface-variant transition-colors"
      >
        <span className="material-symbols-outlined text-primary-container text-lg leading-none">
          sports_soccer
        </span>
        <span className="text-white">{truncate(activeCompetition.name)}</span>
        <span className="material-symbols-outlined text-xs text-gray-500 leading-none">
          expand_more
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-full mt-1 w-56 bg-[#1c1b1b] border border-white/10 rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.5)] overflow-hidden z-50">
          {competitions.map((comp) => {
            const isActive = comp.id === activeCompetition.id
            return (
              <button
                key={comp.id}
                onClick={() => {
                  setActiveCompetition(comp)
                  setOpen(false)
                }}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm text-left transition-colors ${
                  isActive
                    ? 'bg-[#2a2a2a] text-[#00D46A] border-l-2 border-[#00D46A]'
                    : 'text-gray-300 hover:bg-[#2a2a2a]/60 hover:text-white border-l-2 border-transparent'
                }`}
              >
                <span className="truncate">{comp.name}</span>
                <span
                  className={`ml-2 flex-shrink-0 bg-primary/10 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    comp.status === 'active'
                      ? 'text-[#00D46A] bg-[#00D46A]/10'
                      : comp.status === 'upcoming'
                      ? 'text-blue-400 bg-blue-400/10'
                      : 'text-gray-400 bg-gray-400/10'
                  }`}
                >
                  {STATUS_LABELS[comp.status]}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
