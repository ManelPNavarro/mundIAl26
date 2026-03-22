import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const start = Date.now();

  try {
    const supabase = await createClient();

    // DB ping — simple count query
    const { error: dbError } = await supabase
      .from("competitions")
      .select("id", { count: "exact", head: true });

    const dbLatencyMs = Date.now() - start;

    // Football API ping
    let apiLatencyMs: number | null = null;
    let apiOk = false;
    try {
      const apiStart = Date.now();
      const res = await fetch("https://api.football-data.org/v4/competitions", {
        headers: { "X-Auth-Token": process.env.FOOTBALL_DATA_API_KEY ?? "" },
        signal: AbortSignal.timeout(5000),
      });
      apiLatencyMs = Date.now() - apiStart;
      apiOk = res.ok;
    } catch {
      apiOk = false;
    }

    return NextResponse.json({
      db: {
        ok: !dbError,
        latency_ms: dbLatencyMs,
        error: dbError?.message ?? null,
      },
      api: {
        ok: apiOk,
        latency_ms: apiLatencyMs,
      },
      checked_at: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
