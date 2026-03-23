import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

// Use service role for admin user management
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

// GET /api/admin/users?page=1&limit=20
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));
  const offset = (page - 1) * limit;

  const service = getServiceClient();

  const { data: users, error, count } = await service
    .from("users")
    .select("id, username, email, role, is_active, avatar_url", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Stats
  const { count: total } = await service
    .from("users")
    .select("*", { count: "exact", head: true });

  const { count: admins } = await service
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("role", "admin");

  // Active today: last_sign_in within last 24h (from auth.users)
  // Approximation: users with is_active = true (or use a last_seen column if available)
  const { count: activeToday } = await service
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  return NextResponse.json({
    users: users ?? [],
    total: total ?? 0,
    page,
    limit,
    stats: {
      total: total ?? 0,
      active_today: activeToday ?? 0,
      admins: admins ?? 0,
    },
  });
}

// POST /api/admin/users — create user
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const { username, email, role } = body;

  if (!email) {
    return NextResponse.json({ error: "Email es requerido" }, { status: 400 });
  }

  const service = getServiceClient();

  // Create auth user with a random password (they'll reset it)
  const tempPassword = Math.random().toString(36).slice(-12) + "A1!";
  const { data: authUser, error: authError } = await service.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  // Insert into public users table
  const { data: newUser, error: userError } = await service
    .from("users")
    .insert({
      id: authUser.user.id,
      email,
      username: username || email.split("@")[0],
      role: role ?? "user",
      is_active: true,
    })
    .select()
    .single();

  if (userError) {
    // Rollback auth user
    await service.auth.admin.deleteUser(authUser.user.id);
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }

  return NextResponse.json({ user: newUser }, { status: 201 });
}

// PATCH /api/admin/users — update user
export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const { id, username, role, is_active } = body;

  if (!id) {
    return NextResponse.json({ error: "ID de usuario requerido" }, { status: 400 });
  }

  const service = getServiceClient();

  // Build update payload (only include provided fields)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: Record<string, any> = {};
  if (username !== undefined) updates.username = username;
  if (role !== undefined) updates.role = role;
  if (is_active !== undefined) updates.is_active = is_active;

  const { data: updated, error } = await service
    .from("users")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ user: updated });
}

// DELETE /api/admin/users?id=uuid
export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID de usuario requerido" }, { status: 400 });
  }

  // Prevent self-deletion
  if (id === auth.userId) {
    return NextResponse.json({ error: "No puedes eliminarte a ti mismo" }, { status: 400 });
  }

  const service = getServiceClient();

  // Delete from public users table first (cascade should handle the rest)
  const { error: userError } = await service.from("users").delete().eq("id", id);

  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }

  // Delete auth user
  const { error: authError } = await service.auth.admin.deleteUser(id);
  if (authError) {
    console.error("Error deleting auth user:", authError);
    // Non-fatal: user row already deleted
  }

  return NextResponse.json({ success: true });
}
