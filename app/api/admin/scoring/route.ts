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

// GET /api/admin/scoring
export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const service = getServiceClient();
  const { data: rules, error } = await service
    .from("scoring_rules")
    .select("rule_key, points, label, description")
    .order("rule_key");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ rules: rules ?? [] });
}

// POST /api/admin/scoring — upsert rules
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const { rules } = body as {
    rules: { rule_key: string; points: number }[];
  };

  if (!Array.isArray(rules) || rules.length === 0) {
    return NextResponse.json({ error: "Se requiere un array de reglas" }, { status: 400 });
  }

  // Validate
  for (const rule of rules) {
    if (!rule.rule_key || typeof rule.points !== "number" || rule.points < 0) {
      return NextResponse.json(
        { error: `Regla inválida: ${JSON.stringify(rule)}` },
        { status: 400 }
      );
    }
  }

  const service = getServiceClient();

  const { error } = await service
    .from("scoring_rules")
    .upsert(rules, { onConflict: "rule_key" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, updated: rules.length });
}
