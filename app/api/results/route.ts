import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import type { MatchPhase } from "@/types/database";

const VALID_PHASES: MatchPhase[] = [
  "group",
  "round_of_32",
  "round_of_16",
  "quarter",
  "semi",
  "third_place",
  "final",
];

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const phaseParam = searchParams.get("phase");

    let query = supabase
      .from("matches")
      .select(
        `
        id,
        phase,
        group_id,
        home_score,
        away_score,
        status,
        match_date,
        groups (
          name
        ),
        home_team:teams!matches_home_team_id_fkey (
          id,
          name,
          short_name,
          flag_url
        ),
        away_team:teams!matches_away_team_id_fkey (
          id,
          name,
          short_name,
          flag_url
        )
      `
      )
      .order("match_date", { ascending: true });

    if (phaseParam && VALID_PHASES.includes(phaseParam as MatchPhase)) {
      query = query.eq("phase", phaseParam as MatchPhase);
    }

    const { data: matches, error } = await query;

    if (error) {
      console.error("Error fetching results:", error);
      return NextResponse.json(
        { error: "Error al obtener los resultados" },
        { status: 500 }
      );
    }

    const results = (matches ?? []).map((match) => ({
      id: match.id,
      phase: match.phase,
      group_name: match.groups?.name ?? null,
      home_team: {
        id: (match.home_team as { id: string } | null)?.id ?? null,
        name: (match.home_team as { name: string } | null)?.name ?? "Por determinar",
        short_name:
          (match.home_team as { short_name: string } | null)?.short_name ?? "TBD",
        flag_url:
          (match.home_team as { flag_url: string | null } | null)?.flag_url ?? null,
      },
      away_team: {
        id: (match.away_team as { id: string } | null)?.id ?? null,
        name: (match.away_team as { name: string } | null)?.name ?? "Por determinar",
        short_name:
          (match.away_team as { short_name: string } | null)?.short_name ?? "TBD",
        flag_url:
          (match.away_team as { flag_url: string | null } | null)?.flag_url ?? null,
      },
      home_score: match.home_score,
      away_score: match.away_score,
      status: match.status,
      match_date: match.match_date,
    }));

    return NextResponse.json({ results });
  } catch (err) {
    console.error("Unexpected error in /api/results:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
