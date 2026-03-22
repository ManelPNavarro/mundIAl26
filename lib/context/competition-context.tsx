'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export interface Competition {
  id: string
  name: string
  slug: string
  status: 'upcoming' | 'active' | 'finished'
  logo_url: string | null
  predictions_deadline: string
  season: string
}

interface CompetitionContextValue {
  activeCompetition: Competition | null
  setActiveCompetition: (c: Competition) => void
  competitions: Competition[]
  loading: boolean
}

const CompetitionContext = createContext<CompetitionContextValue | null>(null)

const STORAGE_KEY = 'mundIAl26-competition'

export function CompetitionProvider({ children }: { children: React.ReactNode }) {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [activeCompetition, setActiveCompetitionState] = useState<Competition | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCompetitions() {
      try {
        const res = await fetch('/api/competitions')
        if (!res.ok) {
          setLoading(false)
          return
        }
        const data: Competition[] = await res.json()
        setCompetitions(data)

        // Restore from localStorage or default to first
        const savedSlug =
          typeof window !== 'undefined'
            ? localStorage.getItem(STORAGE_KEY)
            : null

        const restored = savedSlug ? data.find((c) => c.slug === savedSlug) : null
        setActiveCompetitionState(restored ?? data[0] ?? null)
      } catch {
        // Fetch failed — leave state empty
      } finally {
        setLoading(false)
      }
    }

    fetchCompetitions()
  }, [])

  function setActiveCompetition(c: Competition) {
    setActiveCompetitionState(c)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, c.slug)
    }
  }

  return (
    <CompetitionContext.Provider
      value={{ activeCompetition, setActiveCompetition, competitions, loading }}
    >
      {children}
    </CompetitionContext.Provider>
  )
}

export function useCompetition(): CompetitionContextValue {
  const ctx = useContext(CompetitionContext)
  if (!ctx) {
    throw new Error('useCompetition must be used inside <CompetitionProvider>')
  }
  return ctx
}
