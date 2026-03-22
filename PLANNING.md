# mundIAl26 — Planning Document

> Complete planning document for the World Cup 2026 prediction pool app.
> This file is the single source of truth for design (Stitch) and development (Claude Code).

---

## 1. Overview

Web app for coworkers to participate in football prediction pools. Supports **multiple competitions simultaneously** (World Cup 2026, Champions League, etc.). Each participant joins one or more competitions, fills in their predictions before each tournament starts (no changes allowed afterwards), and competes on a per-competition leaderboard. The app automatically calculates points as real results come in via API.

**Target users:** 20–100 coworkers
**UI language:** Spanish — all labels, copy, and user-facing text are in Spanish
**Code language:** English — all routes, endpoints, variable names, function names, database columns, env vars, and file names must be in English
**Style:** Football-themed, bold & fun (energetic, strong typography, stadium colors)
**Platforms:** Responsive — desktop for filling in predictions, mobile for checking the leaderboard
**Multi-competition:** Users can belong to multiple competitions and switch between them via a competition picker in the navbar

---

## 2. World Cup 2026 Format

Key data the data model must reflect:

- **48 teams** qualified
- **Group stage:** 16 groups of 3 teams (48 matches)
  - Top 2 from each group + best 8 third-placed teams advance
  - Total advancing: 32 teams
- **Knockout stage:**
  - Round of 32 — 16 matches
  - Round of 16 — 8 matches
  - Quarter-finals — 4 matches
  - Semi-finals — 2 matches
  - Third-place match — 1 match
  - **Final** — 1 match
- **Tournament start:** June 11, 2026
- **Final:** ~July 19, 2026
- **Host countries:** USA, Canada, and Mexico

---

## 3. Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | **Next.js 15** (App Router) | React, SSR/SSG, built-in API routes, free on Vercel |
| Database | **Supabase** (PostgreSQL) | Free tier, Auth included, real-time subscriptions |
| Authentication | **Supabase Auth** | Email/password, session management, easy to integrate |
| Hosting | **Vercel** (free tier) | Automatic deploy from GitHub, free domain |
| Football API | **football-data.org** (free tier) | Free, covers FIFA tournaments, real-time results |
| Styling | **Tailwind CSS** | Utility-first, mobile-first, fast iteration |
| UI Components | **shadcn/ui** | Accessible components on top of Tailwind, easy to customize |
| Global state | **React Context + SWR** | Lightweight, no over-engineering |

---

## 4. Views / Pages

### 4.1 `/login` and `/register`
- Registration form: first name, last name, email, password, profile photo (optional)
- Login with email + password
- Redirect based on role: regular user → predictions / admin → dashboard
- Design: full-screen with stadium background image, centered card

### 4.2 `/predictions` — Fill in predictions
- **Only accessible before the tournament starts** (deadline: June 11, 2026, configurable by admin)
- After the deadline: read-only view of the user's predictions
- The user fills in:
  - **All group stage matches** (exact result: scoreline)
  - **Group standings** (order of the 3 teams in each group)
  - **Knockout bracket** (who advances in each round)
  - **Tournament winner**
  - **Tournament MVP** (player selector)
  - **Top scorer** (player selector)
  - **Best goalkeeper** (player selector)
- Progressive saving (no need to fill everything at once)
- Progress indicator (% completed)
- Validation: cannot submit until everything is filled in

### 4.3 `/results` — Real results
- Shows World Cup matches with real results (fetched from the API)
- Grouped by phase (Groups, Round of 32, Round of 16…)
- Match status: Scheduled / Live / Finished
- Clean, mobile-friendly layout

### 4.4 `/ranking` — Leaderboard
- Standings table for all participants
- Columns: Position, Avatar + Name, Total Points, (optional breakdown)
- Automatically updates when new results come in
- Highlights the logged-in user
- Visual podium for top 3 (eye-catching design)
- On mobile: stacked cards instead of table

### 4.5 `/admin` — Admin panel
Only accessible to users with `admin` role.

#### `/admin/users`
- List all users (name, email, role, status)
- Create user manually
- Edit user data and role
- Delete user (with confirmation)
- Activate/deactivate user (to block access without deleting)

#### `/admin/scoring`
- Configure points per competition for each type of correct prediction:
  - Exact match result (scoreline)
  - Correct winner/draw
  - Correct group position (exact position)
  - Correct team advancing in knockout round
  - Correct tournament winner
  - Correct MVP
  - Correct top scorer
  - Correct best goalkeeper
- Simple form with numeric fields and save button
- Changes trigger a full recalculation of all points

#### `/admin/tournament`
- Manage competitions: create, edit, enable/disable
- Per-competition: set predictions deadline, view API sync status, force manual sync
- Competition selector at the top of the page

#### `/admin/logs`
- Activity log: API syncs (timestamp, competition, matches updated, duration, status)
- Error log: failed syncs, API errors, scoring errors
- User activity log: registrations, logins, prediction submissions
- Filterable by type, competition, date range
- Auto-refreshes every 30 seconds

#### `/admin/database`
- Table row counts (users, predictions, matches, scores, etc.)
- DB health indicator (connection status, response time)
- Last migration applied
- Quick read-only SQL query runner (for admins only)

#### `/admin/api`
- Football API status: current plan, rate limit, remaining requests today
- Per-competition sync status: last sync time, next scheduled, matches synced / total
- Manual sync button per competition
- API response preview (last raw response)

---

## 5. Data Model (Supabase / PostgreSQL)

### `competitions`
```
id (uuid, PK)
name (text)                        -- "World Cup 2026", "Champions League 2025/26"
slug (text, unique)                -- "wc2026", "cl2526"
api_competition_code (text)        -- "WC", "CL" — football-data.org competition code
status (enum: 'upcoming' | 'active' | 'finished')
season (text)                      -- "2026", "2025/26"
logo_url (text, nullable)
predictions_deadline (timestamptz) -- moved from settings to per-competition
created_at (timestamptz)
```

### `user_competitions` (junction — which users are in which competition)
```
user_id (uuid, FK → users)
competition_id (uuid, FK → competitions)
joined_at (timestamptz)
PRIMARY KEY (user_id, competition_id)
```

### `sync_logs`
```
id (uuid, PK)
competition_id (uuid, FK → competitions)
started_at (timestamptz)
finished_at (timestamptz, nullable)
status (enum: 'running' | 'success' | 'error')
matches_updated (integer, default 0)
error_message (text, nullable)
triggered_by (enum: 'cron' | 'manual')
```

### `users`
```
id (uuid, PK)
email (text, unique)
name (text)
avatar_url (text, nullable)
role (enum: 'user' | 'admin')
is_active (boolean, default true)
created_at (timestamp)
```

### `teams`
```
id (uuid, PK)
name (text)
short_name (text)          -- e.g. "ESP"
flag_url (text)
group_id (uuid, FK → groups)
competition_id (uuid, FK → competitions)
api_id (integer)           -- ID in football-data.org
```

### `groups`
```
id (uuid, PK)
name (text)                -- "Group A", "Group B"...
competition_id (uuid, FK → competitions)
```

### `matches`
```
id (uuid, PK)
api_id (integer, unique)   -- ID in football-data.org
competition_id (uuid, FK → competitions)
phase (enum: 'group' | 'round_of_32' | 'round_of_16' | 'quarter' | 'semi' | 'third_place' | 'final')
group_id (uuid, FK → groups, nullable)
home_team_id (uuid, FK → teams, nullable)
away_team_id (uuid, FK → teams, nullable)
home_score (integer, nullable)  -- real result
away_score (integer, nullable)
status (enum: 'scheduled' | 'live' | 'finished')
match_date (timestamp)
```

### `players` (real players, for MVP/top scorer/goalkeeper)
```
id (uuid, PK)
name (text)
team_id (uuid, FK → teams)
competition_id (uuid, FK → competitions)
position (enum: 'goalkeeper' | 'defender' | 'midfielder' | 'forward')
api_id (integer, nullable)
```

### `predictions` (one prediction entry per user per competition)
```
id (uuid, PK)
user_id (uuid, FK → users)
competition_id (uuid, FK → competitions)
UNIQUE (user_id, competition_id)
submitted_at (timestamp, nullable)  -- null if not yet submitted
is_complete (boolean, default false)
tournament_winner_team_id (uuid, FK → teams, nullable)
mvp_player_id (uuid, FK → players, nullable)
top_scorer_player_id (uuid, FK → players, nullable)
best_goalkeeper_player_id (uuid, FK → players, nullable)
```

### `match_predictions` (user's predicted result for each match)
```
id (uuid, PK)
prediction_id (uuid, FK → predictions)
match_id (uuid, FK → matches)
home_score (integer)
away_score (integer)
```

### `group_predictions` (user's predicted group standings)
```
id (uuid, PK)
prediction_id (uuid, FK → predictions)
group_id (uuid, FK → groups)
first_team_id (uuid, FK → teams)
second_team_id (uuid, FK → teams)
third_team_id (uuid, FK → teams)
```

### `scoring_rules`
```
id (uuid, PK)
competition_id (uuid, FK → competitions)
rule_key (text)    -- e.g. "exact_score", "correct_winner", "group_classification"...
points (integer)
label (text)       -- human-readable description for the admin
UNIQUE (competition_id, rule_key)
```

### `scores` (cached calculated points per user per competition, recalculable)
```
id (uuid, PK)
user_id (uuid, FK → users)
competition_id (uuid, FK → competitions)
UNIQUE (user_id, competition_id)
total_points (integer)
breakdown (jsonb)  -- breakdown by category
last_calculated_at (timestamp)
```

### `settings`
```
key (text, PK)
value (text)
-- global settings: e.g. key='registration_open', value='true'
-- competition-specific settings moved to competitions table
```

---

## 6. Scoring System (default values)

| Rule (`rule_key`) | Description | Default Points |
|---|---|---|
| `exact_score` | Correct exact scoreline for a match | 3 pts |
| `correct_winner` | Correct winner or draw (without exact score) | 1 pt |
| `group_position_exact` | Correct exact group position (1st, 2nd, or 3rd) | 2 pts |
| `knockout_qualifier` | Correct team advancing in a knockout round | 2 pts |
| `tournament_winner` | Correct World Cup champion | 5 pts |
| `mvp` | Correct tournament MVP | 3 pts |
| `top_scorer` | Correct top scorer | 3 pts |
| `best_goalkeeper` | Correct best goalkeeper | 3 pts |

> All values are configurable by the admin from `/admin/scoring`.

---

## 7. Football API Integration

**API:** [football-data.org](https://www.football-data.org)
**Plan:** Free tier (sufficient for this scale)
**Auth:** API key in environment variable (`FOOTBALL_DATA_API_KEY`)

### Endpoints to use
- `GET /v4/competitions/{code}/matches` — all matches for a competition
- `GET /v4/competitions/{code}/teams` — all teams
- `GET /v4/competitions/{code}/standings` — group standings

Competition codes: `WC` (World Cup), `CL` (Champions League), `PD` (La Liga), etc.

### Sync strategy
- **Next.js API Route** (`/api/sync-results?competition=wc2026`) — accepts competition slug
- External cron (cron-job.org) calls the endpoint every 15 minutes (Vercel Hobby plan limitation)
- The endpoint:
  1. Looks up `competitions` table by slug to get `api_competition_code`
  2. Fetches from football-data.org
  3. Upserts `matches` by `api_id`
  4. Recalculates points in `scores`
  5. Writes a row to `sync_logs`
- Admins can also force a manual sync per competition from `/admin/api`
- One cron-job.org job per active competition

---

## 8. User Flow

```
Register → Join competition(s) → Fill predictions (before deadline) → View results → Check leaderboard
                                                                                            ↑
                                              [Cron every 15min] Football API → Sync results → Recalculate points

Multi-competition user:
  Navbar competition picker → switch active competition → all pages scope to that competition
```

---

## 9. Design & UX

### Visual Identity
- **Style:** Bold, energetic, football-themed
- **Suggested color palette:**
  - Pitch green: `#1a7a3e`
  - White: `#ffffff`
  - Black/graphite: `#1a1a2e`
  - Gold (podium/highlights): `#f5a623`
  - Red accent: `#e63946`
- **Typography:** Bold display font for headings (e.g. Bebas Neue or Black Han Sans), clean sans-serif for body
- **Iconography:** Footballs, trophies, national flags

### UX Principles
- **Mobile-first:** The leaderboard must be perfect on mobile (most frequently viewed)
- **Predictions on desktop:** The prediction form is complex, prioritize large-screen experience
- **Immediate feedback:** Progressive saving, show % completed
- **Visible competition:** The leaderboard should be visually impactful (podium for top 3)

### Mobile navigation
- Bottom navigation bar on mobile: Home / Results / Leaderboard / My Predictions / Profile
- On desktop: sidebar or top nav

---

## 10. Authentication & Roles

- **Open registration:** anyone with the link can register (or admin can disable it and only create users manually)
- **Roles:** `user` (default) and `admin`
- **The first registered user can be admin**, or admin role is assigned manually in Supabase
- **Protected routes:** `/admin/*` for `admin` only, the rest for authenticated users

---

## 11. Deployment

| Service | Cost | Purpose |
|---|---|---|
| **Vercel** | Free | Frontend hosting + API routes |
| **Supabase** | Free (up to 500MB, 50,000 MAU) | Database + Auth |
| **football-data.org** | Free | Results API (up to 10 req/min) |
| **Domain** | Optional (~€10/year) | Custom URL; defaults to something.vercel.app |

**Required environment variables:**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
FOOTBALL_DATA_API_KEY=
```

---

## 12. Folder Structure (Next.js App Router)

```
mundIAl26/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (app)/
│   │   ├── predictions/page.tsx
│   │   ├── results/page.tsx
│   │   ├── ranking/page.tsx
│   │   └── admin/
│   │       ├── users/page.tsx
│   │       ├── scoring/page.tsx
│   │       └── tournament/page.tsx
│   ├── api/
│   │   ├── sync-results/route.ts
│   │   └── recalculate-scores/route.ts
│   └── layout.tsx
├── components/
│   ├── ui/          (shadcn components)
│   ├── ranking/
│   ├── predictions/
│   └── admin/
├── lib/
│   ├── supabase.ts
│   ├── football-api.ts
│   └── scoring.ts
└── types/
    └── database.ts
```

---

## 13. Future Features (Backlog)

- Comments/reactions on the leaderboard (lightweight chat)
- Push notifications when new results arrive
- Share result on social media
- Additional individual stat predictions (yellow cards, etc.)
- Ranking evolution chart over the course of the tournament
- Export leaderboard to PDF/image for sharing
- Cross-competition global ranking (who's best across all pools)

---

*Document created: March 2026 | Last updated: 2026-03-22*
