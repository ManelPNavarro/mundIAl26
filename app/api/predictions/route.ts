import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Load prediction for the current user
  const { data: predictionRaw, error: predictionError } = await supabase
    .from("predictions")
    .select("*")
    .eq("user_id", session.user.id)
    .single();
  const prediction = predictionRaw as Tables<"predictions"> | null;

  if (predictionError && predictionError.code !== "PGRST116") {
    return NextResponse.json({ error: predictionError.message }, { status: 500 });
  }

  if (!prediction) {
    return NextResponse.json({
      prediction: null,
      match_predictions: {},
      group_predictions: {},
    });
  }

  // Load match predictions
  const { data: matchPredictionsRaw, error: matchError } = await supabase
    .from("match_predictions")
    .select("*")
    .eq("prediction_id", prediction.id);
  const matchPredictions = matchPredictionsRaw as Tables<"match_predictions">[] | null;

  if (matchError) {
    return NextResponse.json({ error: matchError.message }, { status: 500 });
  }

  // Load group predictions
  const { data: groupPredictionsRaw, error: groupError } = await supabase
    .from("group_predictions")
    .select("*")
    .eq("prediction_id", prediction.id);
  const groupPredictions = groupPredictionsRaw as Tables<"group_predictions">[] | null;

  if (groupError) {
    return NextResponse.json({ error: groupError.message }, { status: 500 });
  }

  // Index by match_id / group_id for easy lookup
  const matchPredictionsMap: Record<string, Tables<"match_predictions">> = {};
  for (const mp of matchPredictions ?? []) {
    matchPredictionsMap[mp.match_id] = mp;
  }

  const groupPredictionsMap: Record<string, Tables<"group_predictions">> = {};
  for (const gp of groupPredictions ?? []) {
    groupPredictionsMap[gp.group_id] = gp;
  }

  return NextResponse.json({
    prediction,
    match_predictions: matchPredictionsMap,
    group_predictions: groupPredictionsMap,
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check deadline
  const { data: deadlineSetting } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "predictions_deadline")
    .single();

  if (deadlineSetting?.value) {
    const deadline = new Date(deadlineSetting.value);
    if (new Date() > deadline) {
      return NextResponse.json(
        { error: "El plazo de predicciones ha finalizado." },
        { status: 403 }
      );
    }
  }

  const body = await request.json();
  const { type, data } = body as {
    type: "match" | "group" | "awards";
    data: Record<string, unknown>;
  };

  // Ensure a parent prediction row exists
  let predictionId: string;

  const { data: existingRaw } = await supabase
    .from("predictions")
    .select("id")
    .eq("user_id", session.user.id)
    .single();
  const existing = existingRaw as { id: string } | null;

  if (existing) {
    predictionId = existing.id;
  } else {
    const { data: createdRaw, error: createError } = await supabase
      .from("predictions")
      .insert({ user_id: session.user.id })
      .select("id")
      .single();
    const created = createdRaw as { id: string } | null;

    if (createError || !created) {
      return NextResponse.json(
        { error: createError?.message ?? "Failed to create prediction" },
        { status: 500 }
      );
    }
    predictionId = created.id;
  }

  if (type === "match") {
    const { match_id, home_score, away_score } = data as {
      match_id: string;
      home_score: number;
      away_score: number;
    };

    const { error } = await supabase.from("match_predictions").upsert(
      {
        prediction_id: predictionId,
        match_id,
        home_score,
        away_score,
      },
      { onConflict: "prediction_id,match_id" }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else if (type === "group") {
    const { group_id, first_team_id, second_team_id, third_team_id } = data as {
      group_id: string;
      first_team_id: string;
      second_team_id: string;
      third_team_id: string;
    };

    const { error } = await supabase.from("group_predictions").upsert(
      {
        prediction_id: predictionId,
        group_id,
        first_team_id,
        second_team_id,
        third_team_id,
      },
      { onConflict: "prediction_id,group_id" }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else if (type === "awards") {
    const {
      tournament_winner_team_id,
      mvp_player_id,
      top_scorer_player_id,
      best_goalkeeper_player_id,
    } = data as {
      tournament_winner_team_id?: string | null;
      mvp_player_id?: string | null;
      top_scorer_player_id?: string | null;
      best_goalkeeper_player_id?: string | null;
    };

    const updatePayload: Record<string, string | null> = {};
    if (tournament_winner_team_id !== undefined)
      updatePayload.tournament_winner_team_id = tournament_winner_team_id;
    if (mvp_player_id !== undefined) updatePayload.mvp_player_id = mvp_player_id;
    if (top_scorer_player_id !== undefined)
      updatePayload.top_scorer_player_id = top_scorer_player_id;
    if (best_goalkeeper_player_id !== undefined)
      updatePayload.best_goalkeeper_player_id = best_goalkeeper_player_id;

    const { error } = await supabase
      .from("predictions")
      .update(updatePayload)
      .eq("id", predictionId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  return NextResponse.json({ success: true, prediction_id: predictionId });
}
