import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Query user's competitions via join
    const { data: userComps, error } = await supabase
      .from('user_competitions')
      .select(
        `
        joined_at,
        competitions (
          id,
          name,
          slug,
          status,
          logo_url,
          predictions_deadline,
          season,
          created_at
        )
      `
      )
      .eq('user_id', user.id)
      .order('joined_at', { ascending: false })

    if (error) {
      console.error('Error fetching user competitions:', error)
      return NextResponse.json({ error: 'Error al obtener competiciones' }, { status: 500 })
    }

    let competitions = (userComps ?? [])
      .map((row) => row.competitions)
      .filter(Boolean) as Array<{
      id: string
      name: string
      slug: string
      status: string
      logo_url: string | null
      predictions_deadline: string
      season: string
      created_at: string
    }>

    // New user — auto-enroll them in World Cup 2026
    if (competitions.length === 0) {
      // Find the World Cup 2026 competition
      const { data: wc2026, error: wcError } = await supabase
        .from('competitions')
        .select('id, name, slug, status, logo_url, predictions_deadline, season, created_at')
        .eq('slug', 'world-cup-2026')
        .single()

      if (wcError || !wc2026) {
        // Fallback: grab the first available competition
        const { data: firstComp, error: firstError } = await supabase
          .from('competitions')
          .select('id, name, slug, status, logo_url, predictions_deadline, season, created_at')
          .order('created_at', { ascending: true })
          .limit(1)
          .single()

        if (firstError || !firstComp) {
          // No competitions exist yet
          return NextResponse.json([])
        }

        await supabase
          .from('user_competitions')
          .insert({ user_id: user.id, competition_id: firstComp.id })

        competitions = [firstComp]
      } else {
        await supabase
          .from('user_competitions')
          .insert({ user_id: user.id, competition_id: wc2026.id })

        competitions = [wc2026]
      }
    }

    // Sort by created_at DESC
    competitions.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    const result = competitions.map(({ created_at: _created_at, ...rest }) => rest)

    return NextResponse.json(result)
  } catch (err) {
    console.error('Unexpected error in /api/competitions:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
