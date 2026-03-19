import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fetchMatches } from "@/lib/football-api";

function mapStatus(apiStatus: string): "scheduled" | "live" | "finished" {
  switch (apiStatus) {
    case "FINISHED":
      return "finished";
    case "IN_PLAY":
    case "PAUSED":
      return "live";
    default:
      return "scheduled";
  }
}

// GET handler — used by Vercel Cron and manual "Sync Now"
export async function GET(request: NextRequest) {
  // Verify cron secret
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Create service role client inside the handler (not at module level)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const errors: string[] = [];
  let synced = 0;
  let updated = 0;

  try {
    const matches = await fetchMatches();

    for (const match of matches) {
      const homeScore = match.score?.fullTime?.home ?? null;
      const awayScore = match.score?.fullTime?.away ?? null;
      const status = mapStatus(match.status);

      // Attempt to look up team IDs in our DB by short_name/api_id
      let homeTeamId: string | null = null;
      let awayTeamId: string | null = null;

      const { data: homeTeamRaw } = await supabase
        .from("teams")
        .select("id")
        .eq("api_id", match.homeTeam.id)
        .maybeSingle();
      const homeTeam = homeTeamRaw as { id: string } | null;
      if (homeTeam) homeTeamId = homeTeam.id;

      const { data: awayTeamRaw } = await supabase
        .from("teams")
        .select("id")
        .eq("api_id", match.awayTeam.id)
        .maybeSingle();
      const awayTeam = awayTeamRaw as { id: string } | null;
      if (awayTeam) awayTeamId = awayTeam.id;

      const record = {
        api_id: match.id,
        home_team_id: homeTeamId,
        away_team_id: awayTeamId,
        home_score: homeScore,
        away_score: awayScore,
        status,
        match_date: match.utcDate,
        phase: "group" as const,
      };

      const { error } = await supabase
        .from("matches")
        .upsert(record, { onConflict: "api_id" });

      if (error) {
        errors.push(`Match ${match.id}: ${error.message}`);
      } else {
        synced++;
      }
    }

    updated = synced;

    // Update last_sync_at in settings
    await supabase
      .from("settings")
      .upsert({ key: "last_sync_at", value: new Date().toISOString() }, { onConflict: "key" });

    return NextResponse.json({
      synced,
      updated,
      total: matches.length,
      errors,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message, synced, updated, errors }, { status: 500 });
  }
}
