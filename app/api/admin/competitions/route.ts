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

// GET /api/admin/competitions — list all competitions
export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const service = getServiceClient();

  const { data: competitions, error } = await service
    .from("competitions")
    .select("id, name, slug, api_competition_code, status, season, logo_url, predictions_deadline, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ competitions: competitions ?? [] });
}

// POST /api/admin/competitions — create competition
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const { name, slug, api_competition_code, season, status, logo_url, predictions_deadline } = body;

  if (!name || !slug || !api_competition_code || !season) {
    return NextResponse.json(
      { error: "name, slug, api_competition_code, and season are required" },
      { status: 400 }
    );
  }

  const service = getServiceClient();

  const { data: competition, error } = await service
    .from("competitions")
    .insert({
      name,
      slug,
      api_competition_code,
      season,
      status: status ?? "upcoming",
      logo_url: logo_url ?? null,
      predictions_deadline: predictions_deadline ?? new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ competition }, { status: 201 });
}

// PATCH /api/admin/competitions — update competition by id
export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  // Only allow safe fields to be updated
  const allowed = ["name", "slug", "api_competition_code", "season", "status", "logo_url", "predictions_deadline"];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const safeUpdates: Record<string, any> = {};
  for (const key of allowed) {
    if (key in updates) safeUpdates[key] = updates[key];
  }

  if (Object.keys(safeUpdates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const service = getServiceClient();

  const { data: competition, error } = await service
    .from("competitions")
    .update(safeUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ competition });
}

// DELETE /api/admin/competitions?id=uuid
export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const service = getServiceClient();

  const { error } = await service.from("competitions").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
