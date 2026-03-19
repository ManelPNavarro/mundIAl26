# Mund**IA**l 26

> La quiniela definitiva del Mundial 2026 — it's in the game.

A full-stack prediction pool app for the FIFA World Cup 2026. Fill in your picks before the tournament starts, then watch the leaderboard update automatically as real results come in via API.

## Features

- **Predictions** — Predict every group stage scoreline, group standings, knockout bracket, tournament winner, MVP, top scorer, and best goalkeeper
- **Live leaderboard** — Rankings update automatically every 15 minutes during the tournament; podium view for the top 3
- **Real results** — Match cards showing live, scheduled, and finished matches, synced from football-data.org
- **Admin panel** — Manage users, configure scoring rules, force API syncs, and set the submission deadline
- **Dark-first design** — Bebas Neue headings, Inter body, #00D46A green accent, fully responsive with bottom nav on mobile

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Database + Auth | Supabase (PostgreSQL + Supabase Auth) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Data fetching | SWR |
| Football data | football-data.org API |
| Hosting | Vercel |

---

## Local Setup

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier is enough)
- A [football-data.org](https://www.football-data.org) API key (free tier)

### 1. Clone the repo

```bash
git clone git@github.com:ManelPNavarro/mundIAl26.git
cd mundIAl26
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and fill in your credentials:

```bash
cp .env.example .env.local
```

Open `.env.local` and set the values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
FOOTBALL_DATA_API_KEY=<your-api-key>
CRON_SECRET=<any-random-string>   # used to protect the sync endpoint
```

You can find `NEXT_PUBLIC_SUPABASE_URL` and the keys in your Supabase dashboard under **Project Settings → API**.

### 4. Set up the database

Run the migrations in order from the Supabase **SQL Editor** (or with the Supabase CLI):

```bash
# With Supabase CLI (if you have it installed):
supabase db push

# Or paste each file manually in the SQL Editor:
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_seed_scoring_rules.sql
supabase/migrations/003_seed_settings.sql
```

### 5. Seed development data (optional)

Load the 48 teams, 16 groups, 48 matches, and sample players:

```bash
# Paste in the Supabase SQL Editor, or:
supabase db seed
```

The seed file is at `supabase/seed.sql`.

### 6. Create the avatars storage bucket

In the Supabase dashboard go to **Storage → New bucket**, name it `avatars`, and set it to **public**.

### 7. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The first user to register can be promoted to admin manually from the Supabase dashboard: open the `users` table, find the row, and change `role` to `admin`.

---

## Syncing match results

The `/api/sync-results` endpoint fetches live data from football-data.org and recalculates all scores. In production it runs automatically every 15 minutes via Vercel Cron.

To trigger a manual sync locally:

```bash
curl -H "Authorization: Bearer <your-CRON_SECRET>" http://localhost:3000/api/sync-results
```

Or use the **Sync Now** button in the admin panel at `/admin/tournament`.

---

## Project structure

```
app/
├── (auth)/          # /login  /register
├── (app)/           # /ranking  /results  /predictions  /admin/*
└── api/             # /ranking  /results  /predictions  /sync-results  /recalculate-scores
components/
├── layout/          # Navbar, BottomNav
├── predictions/     # 4 tab components
├── results/         # MatchCard
└── ui/              # shadcn + custom (AvatarWithFallback, StatusBadge, …)
lib/
├── supabase/        # Browser + server clients
├── hooks/           # SWR hooks (useRanking, useResults, usePredictions)
├── football-api.ts  # football-data.org client
└── scoring.ts       # Points calculation engine
supabase/
├── migrations/      # SQL schema + seed data
└── seed.sql         # 48 teams, players, sample matches
types/
└── database.ts      # Full TypeScript types for all tables
```
