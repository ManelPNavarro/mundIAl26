import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";
import GamesClient from "./GamesClient";

export const dynamic = "force-dynamic";

export default async function AdminGamesPage() {
  const supabase = await createClient();

  const { data: competitions } = await supabase
    .from("competitions")
    .select("id, name, slug, api_competition_code, status, season, logo_url, predictions_deadline, created_at")
    .order("created_at", { ascending: false });

  return (
    <GamesClient initialCompetitions={(competitions ?? []) as Tables<"competitions">[]} />
  );
}
