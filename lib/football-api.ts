const BASE_URL = "https://api.football-data.org/v4";
const COMPETITION_CODE = "WC";

// Rate limiting: free tier allows 10 req/min
// We add a small delay between requests to avoid hitting the limit
const RATE_LIMIT_DELAY_MS = 100;

let lastRequestTime = 0;

async function rateLimit(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < RATE_LIMIT_DELAY_MS) {
    await new Promise((resolve) =>
      setTimeout(resolve, RATE_LIMIT_DELAY_MS - elapsed)
    );
  }
  lastRequestTime = Date.now();
}

export interface FootballTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
  area: {
    id: number;
    name: string;
    code: string;
    flag: string | null;
  };
}

export interface FootballScore {
  winner: "HOME_TEAM" | "AWAY_TEAM" | "DRAW" | null;
  duration: string;
  fullTime: { home: number | null; away: number | null };
  halfTime: { home: number | null; away: number | null };
}

export interface FootballMatch {
  id: number;
  utcDate: string;
  status: "SCHEDULED" | "TIMED" | "IN_PLAY" | "PAUSED" | "FINISHED" | "CANCELLED" | "POSTPONED";
  stage: string;
  group: string | null;
  homeTeam: FootballTeam;
  awayTeam: FootballTeam;
  score: FootballScore;
  matchday: number | null;
}

export interface FootballStanding {
  stage: string;
  type: string;
  group: string | null;
  table: Array<{
    position: number;
    team: FootballTeam;
    playedGames: number;
    won: number;
    draw: number;
    lost: number;
    points: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
  }>;
}

async function fetchFromApi(endpoint: string): Promise<unknown> {
  await rateLimit();

  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) {
    throw new Error("FOOTBALL_DATA_API_KEY environment variable is not set");
  }

  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      "X-Auth-Token": apiKey,
    },
    // Next.js: revalidate every 60 seconds for API routes
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Football API error: ${response.status} ${response.statusText} — ${body}`
    );
  }

  return response.json();
}

export async function fetchMatches(): Promise<FootballMatch[]> {
  const data = (await fetchFromApi(
    `/competitions/${COMPETITION_CODE}/matches`
  )) as { matches: FootballMatch[] };
  return data.matches ?? [];
}

export async function fetchTeams(): Promise<FootballTeam[]> {
  const data = (await fetchFromApi(
    `/competitions/${COMPETITION_CODE}/teams`
  )) as { teams: FootballTeam[] };
  return data.teams ?? [];
}

export async function fetchStandings(): Promise<FootballStanding[]> {
  const data = (await fetchFromApi(
    `/competitions/${COMPETITION_CODE}/standings`
  )) as { standings: FootballStanding[] };
  return data.standings ?? [];
}
