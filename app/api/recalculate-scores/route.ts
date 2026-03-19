import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { recalculateAllScores } from "@/lib/scoring";

export async function POST() {
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

  // Use service role client for full access during recalculation
  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const start = Date.now();
  const recalculated = await recalculateAllScores(serviceClient);
  const durationMs = Date.now() - start;

  return NextResponse.json({ recalculated, durationMs });
}
