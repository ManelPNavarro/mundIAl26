import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { recalculateAllScores } from '@/lib/scoring'

function serviceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  return data?.role === 'admin' ? user : null
}

// PATCH — update a match result (admin only)
// Body: { matchId, homeScore, awayScore, status }
export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { matchId, homeScore, awayScore, status } = await request.json()

  if (!matchId) {
    return NextResponse.json({ error: 'matchId requerido' }, { status: 400 })
  }

  const svc = serviceClient()

  const updates: Record<string, unknown> = {}
  if (homeScore !== undefined) updates.home_score = homeScore === '' ? null : Number(homeScore)
  if (awayScore !== undefined) updates.away_score = awayScore === '' ? null : Number(awayScore)
  if (status !== undefined) updates.status = status

  const { error } = await svc
    .from('matches')
    .update(updates)
    .eq('id', matchId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Recalculate scores when a match is marked finished
  if (status === 'finished') {
    const { data: comp } = await svc
      .from('competitions')
      .select('id')
      .eq('slug', 'wc2026')
      .maybeSingle()

    if (comp?.id) {
      await recalculateAllScores(comp.id, svc)
    }
  }

  return NextResponse.json({ success: true })
}
