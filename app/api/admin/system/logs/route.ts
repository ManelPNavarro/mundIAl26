import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized", status: 401 };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return { error: "Forbidden", status: 403 };
  }

  return { userId: user.id };
}

// GET /api/admin/system/logs?page=1&limit=10&competition_id=uuid
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "10")));
  const competition_id = searchParams.get("competition_id");
  const offset = (page - 1) * limit;

  const service = getServiceClient();

  // Build logs query with competition join
  let logsQuery = service
    .from("sync_logs")
    .select(
      "id, competition_id, started_at, finished_at, status, matches_updated, error_message, triggered_by, competitions(name, api_competition_code)",
      { count: "exact" }
    )
    .order("started_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (competition_id) {
    logsQuery = logsQuery.eq("competition_id", competition_id);
  }

  const { data: logs, error: logsError, count } = await logsQuery;

  if (logsError) {
    return NextResponse.json({ error: logsError.message }, { status: 500 });
  }

  // Active syncs = running status
  const { count: activeSyncs } = await service
    .from("sync_logs")
    .select("*", { count: "exact", head: true })
    .eq("status", "running");

  // Sync failures in last 24h
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: syncFailures } = await service
    .from("sync_logs")
    .select("*", { count: "exact", head: true })
    .eq("status", "error")
    .gte("started_at", since24h);

  // Competition health: latest sync_log per competition
  const { data: competitions } = await service
    .from("competitions")
    .select("id, name, slug, api_competition_code, status");

  // Get latest sync per competition
  const competitionHealth: Array<{
    competition_id: string;
    competition_name: string;
    api_competition_code: string;
    competition_status: string;
    last_sync_at: string | null;
    last_sync_status: string | null;
    last_sync_error: string | null;
    matches_updated: number;
    success_rate: number;
  }> = [];

  if (competitions) {
    for (const comp of competitions) {
      const { data: latestLog } = await service
        .from("sync_logs")
        .select("started_at, status, error_message, matches_updated")
        .eq("competition_id", comp.id)
        .order("started_at", { ascending: false })
        .limit(1)
        .single();

      // Calculate success rate from last 20 syncs
      const { data: recentLogs } = await service
        .from("sync_logs")
        .select("status")
        .eq("competition_id", comp.id)
        .order("started_at", { ascending: false })
        .limit(20);

      let successRate = 100;
      if (recentLogs && recentLogs.length > 0) {
        const successful = recentLogs.filter((l) => l.status === "success").length;
        successRate = Math.round((successful / recentLogs.length) * 100);
      }

      competitionHealth.push({
        competition_id: comp.id,
        competition_name: comp.name,
        api_competition_code: comp.api_competition_code,
        competition_status: comp.status,
        last_sync_at: latestLog?.started_at ?? null,
        last_sync_status: latestLog?.status ?? null,
        last_sync_error: latestLog?.error_message ?? null,
        matches_updated: latestLog?.matches_updated ?? 0,
        success_rate: successRate,
      });
    }
  }

  return NextResponse.json({
    logs: logs ?? [],
    total: count ?? 0,
    page,
    limit,
    active_syncs: activeSyncs ?? 0,
    sync_failures_24h: syncFailures ?? 0,
    competition_health: competitionHealth,
  });
}
