const TZ = 'Europe/Madrid'

function toDateKey(kickoffAt: string | null): string {
  if (!kickoffAt) return '9999-99-99'
  return new Date(kickoffAt).toLocaleDateString('en-CA', { timeZone: TZ })
}

function formatDateLabel(dateKey: string): string {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: TZ })
  const tomorrow = new Date(Date.now() + 864e5).toLocaleDateString('en-CA', { timeZone: TZ })
  if (dateKey === today) return 'Hoy'
  if (dateKey === tomorrow) return 'Mañana'
  const [y, m, d] = dateKey.split('-').map(Number)
  return new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
    .format(new Date(y!, m! - 1, d!))
}

export function useGroupStageView<T extends { kickoff_at: string | null }>(getMatches: () => T[]) {
  const view = ref<'dates' | 'groups'>('dates')

  const byDate = computed(() => {
    const map = new Map<string, T[]>()
    for (const m of getMatches()) {
      const key = toDateKey(m.kickoff_at)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(m)
    }
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, items]) => ({
        key,
        label: formatDateLabel(key),
        matches: [...items].sort((a, b) =>
          new Date(a.kickoff_at ?? 0).getTime() - new Date(b.kickoff_at ?? 0).getTime()
        ),
      }))
  })

  return { view, byDate }
}
