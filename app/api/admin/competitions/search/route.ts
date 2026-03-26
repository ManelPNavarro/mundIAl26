import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchCompetitions } from "@/lib/football-api";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized", status: 401 };

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") return { error: "Forbidden", status: 403 };

  return { userId: user.id };
}

// GET /api/admin/competitions/search?q=term
// Returns competitions from football-data.org, optionally filtered by query
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.toLowerCase().trim() ?? "";

  try {
    const competitions = await fetchCompetitions();

    const filtered = q
      ? competitions.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.code?.toLowerCase().includes(q) ||
            c.area?.name?.toLowerCase().includes(q)
        )
      : competitions;

    return NextResponse.json({ competitions: filtered });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
