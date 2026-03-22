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

function mapPhase(
  stage: string
): "group" | "round_of_32" | "round_of_16" | "quarter" | "semi" | "third_place" | "final" {
  switch (stage) {
    case "ROUND_OF_32": return "round_of_32";
    case "ROUND_OF_16": return "round_of_16";
    case "QUARTER_FINALS": return "quarter";
    case "SEMI_FINALS": return "semi";
    case "THIRD_PLACE": return "third_place";
    case "FINAL": return "final";
    default: return "group";
  }
}

// GET handler — used by cron-job.org and manual "Sync Now"
export async function GET(request: NextRequest) {
  // Verify cron secret
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Resolve competition from query param (defaults to wc2026)
  const { searchParams } = new URL(request.url);
  const competitionSlug = searchParams.get("competition") ?? "wc2026";
  const triggeredBy = (searchParams.get("triggered_by") ?? "cron") as "cron" | "manual";

  const { data: competitionRow, error: compError } = await supabase
    .from("competitions")
    .select("id, api_competition_code")
    .eq("slug", competitionSlug)
    .maybeSingle();

  if (compError || !competitionRow) {
    return NextResponse.json(
      { error: `Competition '${competitionSlug}' not found` },
      { status: 404 }
    );
  }

  const competitionId: string = competitionRow.id;
  const apiCode: string = competitionRow.api_competition_code;

  // Insert sync_log row (status: running)
  const { data: syncLog } = await supabase
    .from("sync_logs")
    .insert({
      competition_id: competitionId,
      started_at: new Date().toISOString(),
      status: "running",
      triggered_by: triggeredBy,
    })
    .select("id")
    .single();

  const syncLogId: string | null = syncLog?.id ?? null;

  const errors: string[] = [];
  let synced = 0;

  try {
    const matches = await fetchMatches(apiCode);

    for (const match of matches) {
      const homeScore = match.score?.fullTime?.home ?? null;
      const awayScore = match.score?.fullTime?.away ?? null;
      const status = mapStatus(match.status);
      const phase = mapPhase(match.stage ?? "");

      let homeTeamId: string | null = null;
      let awayTeamId: string | null = null;

      const { data: homeTeamRaw } = await supabase
        .from("teams")
        .select("id")
        .eq("api_id", match.homeTeam.id)
        .eq("competition_id", competitionId)
        .maybeSingle();
      if (homeTeamRaw) homeTeamId = (homeTeamRaw as { id: string }).id;

      const { data: awayTeamRaw } = await supabase
        .from("teams")
        .select("id")
        .eq("api_id", match.awayTeam.id)
        .eq("competition_id", competitionId)
        .maybeSingle();
      if (awayTeamRaw) awayTeamId = (awayTeamRaw as { id: string }).id;

      const record = {
        api_id: match.id,
        competition_id: competitionId,
        home_team_id: homeTeamId,
        away_team_id: awayTeamId,
        home_score: homeScore,
        away_score: awayScore,
        status,
        match_date: match.utcDate,
        phase,
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

    // Update sync_log: success
    if (syncLogId) {
      await supabase
        .from("sync_logs")
        .update({
          finished_at: new Date().toISOString(),
          status: "success",
          matches_updated: synced,
        })
        .eq("id", syncLogId);
    }

    return NextResponse.json({
      competition: competitionSlug,
      synced,
      total: matches.length,
      errors,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";

    if (syncLogId) {
      await supabase
        .from("sync_logs")
        .update({
          finished_at: new Date().toISOString(),
          status: "error",
          matches_updated: synced,
          error_message: message,
        })
        .eq("id", syncLogId);
    }

    return NextResponse.json({ error: message, synced, errors }, { status: 500 });
  }
}
