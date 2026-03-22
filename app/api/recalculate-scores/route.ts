import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { recalculateAllScores } from "@/lib/scoring";

export async function POST(request: NextRequest) {
  // Require admin session
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profileRaw } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  const profile = profileRaw as { role: string } | null;

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get competition_id from request body
  let competitionId: string | null = null;
  try {
    const body = await request.json();
    competitionId = body.competition_id ?? null;
  } catch {
    // body may be empty
  }

  if (!competitionId) {
    // Default to wc2026 competition
    const { data: comp } = await supabase
      .from("competitions")
      .select("id")
      .eq("slug", "wc2026")
      .maybeSingle();
    competitionId = comp?.id ?? null;
  }

  if (!competitionId) {
    return NextResponse.json({ error: "No competition found" }, { status: 400 });
  }

  // Use service role client for full access during recalculation
  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const start = Date.now();
  const recalculated = await recalculateAllScores(competitionId, serviceClient);
  const durationMs = Date.now() - start;

  return NextResponse.json({ recalculated, durationMs });
}
