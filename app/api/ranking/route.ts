import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: scores, error } = await supabase
      .from("scores")
      .select(
        `
        id,
        user_id,
        total_points,
        breakdown,
        last_calculated_at,
        users (
          first_name,
          last_name,
          avatar_url
        )
      `
      )
      .order("total_points", { ascending: false });

    if (error) {
      console.error("Error fetching ranking:", error);
      return NextResponse.json(
        { error: "Error al obtener el ranking" },
        { status: 500 }
      );
    }

    const ranking = (scores ?? []).map((entry, index) => ({
      rank: index + 1,
      user_id: entry.user_id,
      name: entry.users
        ? `${entry.users.first_name} ${entry.users.last_name}`.trim()
        : "Usuario",
      avatar_url: entry.users?.avatar_url ?? null,
      total_points: entry.total_points,
      breakdown: (entry.breakdown as Record<string, number>) ?? {},
    }));

    const lastCalculated =
      scores && scores.length > 0 ? scores[0].last_calculated_at : null;

    return NextResponse.json({ ranking, last_calculated_at: lastCalculated });
  } catch (err) {
    console.error("Unexpected error in /api/ranking:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
