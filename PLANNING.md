# mundIAl26 — Planning Document

> Complete planning document for the World Cup 2026 prediction pool app.
> This file is the single source of truth for design (Stitch) and development (Claude Code).

---

## 1. Overview

Web app for coworkers to participate in a World Cup 2026 prediction pool. Each participant fills in their predictions **before the tournament starts** (no changes allowed afterwards). The app automatically calculates points as real results come in via API. A real-time leaderboard keeps the competition alive.

**Target users:** 20–100 coworkers
**UI language:** Spanish — all labels, copy, and user-facing text are in Spanish
**Code language:** English — all routes, endpoints, variable names, function names, database columns, env vars, and file names must be in English
**Style:** Football-themed, bold & fun (energetic, strong typography, stadium colors)
**Platforms:** Responsive — desktop for filling in predictions, mobile for checking the leaderboard

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
- Configure points for each type of correct prediction:
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
- Set the deadline for submitting predictions
- View API sync status
- Force manual results sync

---

## 5. Data Model (Supabase / PostgreSQL)

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
short_name (text)  -- e.g. "ESP"
flag_url (text)
group_id (uuid, FK → groups)
api_id (integer)   -- ID in football-data.org
```

### `groups`
```
id (uuid, PK)
name (text)   -- "Group A", "Group B"...
```

### `matches`
```
id (uuid, PK)
api_id (integer, unique)   -- ID in football-data.org
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
position (enum: 'goalkeeper' | 'defender' | 'midfielder' | 'forward')
api_id (integer, nullable)
```

### `predictions` (one prediction entry per user)
```
id (uuid, PK)
user_id (uuid, FK → users, unique)
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
rule_key (text, unique)  -- e.g. "exact_score", "correct_winner", "group_classification"...
points (integer)
label (text)   -- human-readable description for the admin
```

### `scores` (cached calculated points, recalculable)
```
id (uuid, PK)
user_id (uuid, FK → users)
total_points (integer)
breakdown (jsonb)  -- breakdown by category
last_calculated_at (timestamp)
```

### `settings`
```
key (text, PK)
value (text)
-- e.g. key='predictions_deadline', value='2026-06-10T23:59:59Z'
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
- `GET /v4/competitions/WC/matches` — all World Cup matches
- `GET /v4/competitions/WC/teams` — all teams
- `GET /v4/competitions/WC/standings` — group standings

### Sync strategy
- **Next.js API Route** (`/api/sync-results`) called periodically
- Vercel Cron Jobs (free on free tier) to call this endpoint every 15 minutes during the tournament
- The endpoint updates the `matches` table with real results
- After updating results, recalculates points in the `scores` table
- Admins can also force a manual sync from `/admin/tournament`

---

## 8. User Flow

```
Register → Fill predictions (before Jun 10, 2026) → View results → Check leaderboard
                                                                           ↑
                                       [Cron every 15min] Football API → Sync results → Recalculate points
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
- Private groups (different "leagues" within the same app)
- Additional individual stat predictions (yellow cards, etc.)
- Ranking evolution chart over the course of the tournament
- Export leaderboard to PDF/image for sharing

---

*Document created: March 2026 | Last updated: 2026-03-19*
