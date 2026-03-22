# mundIAl26 — Task List

> Executable task list ordered by dependency. Updated 2026-03-22.
> Designs live in `designs/public/` and `designs/admin/` — always read the matching `code.html` before implementing a page.
> Status: ✅ Done | 🔄 Needs update | ⬜ Not started

---

## Design Token Reference (from HTML prototypes)

All pages use Material Design 3 color tokens. These must be configured in Tailwind:

```js
colors: {
  "primary": "#42f183",
  "primary-container": "#00d46a",
  "primary-fixed": "#63ff94",
  "primary-fixed-dim": "#2ce377",
  "on-primary": "#003918",
  "on-primary-fixed": "#00210b",
  "background": "#131313",
  "surface": "#131313",
  "surface-dim": "#131313",
  "surface-container-lowest": "#0e0e0e",
  "surface-container-low": "#1c1b1b",
  "surface-container": "#201f1f",
  "surface-container-high": "#2a2a2a",
  "surface-container-highest": "#353534",
  "surface-bright": "#3a3939",
  "surface-variant": "#353534",
  "on-surface": "#e5e2e1",
  "on-surface-variant": "#bbcbb9",
  "on-background": "#e5e2e1",
  "outline": "#859585",
  "outline-variant": "#3c4a3d",
  "secondary": "#ffb955",
  "secondary-container": "#dc9100",
  "on-secondary": "#452b00",
  "error": "#ffb4ab",
  "error-container": "#93000a",
  "on-error": "#690005",
  "tertiary": "#ced5e1",
  "inverse-surface": "#e5e2e1",
  "inverse-on-surface": "#313030",
  "inverse-primary": "#006d33",
}
fontFamily: {
  "headline": ["Epilogue", "sans-serif"],   // admin pages
  "body": ["Inter", "sans-serif"],
  "label": ["Inter", "sans-serif"],
  "bebas": ["Bebas Neue", "cursive"],        // scores, logo, big numbers
}
```

Custom CSS classes needed:
- `.pitch-black-bg` → `background-color: #050505`
- `.editorial-gradient` → `background: linear-gradient(135deg, #42f183 0%, #00d46a 100%)`
- `.glass-panel` → `background: rgba(28,27,27,0.6); backdrop-filter: blur(24px)`
- `.text-glow` → `text-shadow: 0 0 20px rgba(66,241,131,0.3)`
- `.hide-scrollbar` → removes scrollbar

Icons: use **Material Symbols Outlined** (Google Font), loaded via `<link>` in layout.
Icon usage: `<span class="material-symbols-outlined">icon_name</span>`

---

## Phase 1 — Foundation

### Task 1.1 — Update Tailwind config & globals.css ✅
`app/globals.css` + `tailwind.config.ts` (or CSS-based config for Tailwind v4):
- Replace existing color tokens with the full MD3 palette above
- Add `font-bebas`, `font-headline`, `font-body`, `font-label` families
- Import Epilogue font (already has Bebas Neue + Inter)
- Add `.pitch-black-bg`, `.editorial-gradient`, `.glass-panel`, `.text-glow`, `.hide-scrollbar` CSS classes
- Add Material Symbols Outlined link to `app/layout.tsx`

### Task 1.2 — DB migration: multi-competition architecture ✅
Create `supabase/migrations/004_multi_competition.sql`:
- Add `competitions` table (id, name, slug unique, api_competition_code, status enum upcoming|active|finished, season, logo_url, predictions_deadline timestamptz, created_at)
- Add `user_competitions` junction (user_id, competition_id, joined_at, PK composite)
- Add `sync_logs` table (id, competition_id FK, started_at, finished_at nullable, status enum running|success|error, matches_updated int default 0, error_message text nullable, triggered_by enum cron|manual)
- Add `competition_id` column to: `groups`, `teams`, `players`, `matches`, `predictions`, `scores`, `scoring_rules`
- Change `predictions` unique from `(user_id)` to `(user_id, competition_id)`
- Change `scores` unique from `(user_id)` to `(user_id, competition_id)`
- Change `scoring_rules` unique from `(rule_key)` to `(competition_id, rule_key)`
- Seed one competition: World Cup 2026 (slug: `wc2026`, api_competition_code: `WC`, status: `upcoming`)
- Update RLS policies for competition-scoped access
- Add indexes on all new competition_id columns

### Task 1.3 — Update TypeScript types ✅
`types/database.ts`:
- Add `competitions`, `user_competitions`, `sync_logs` table types
- Add `competition_id` fields to `groups`, `teams`, `players`, `matches`, `predictions`, `scores`, `scoring_rules`
- Add new enums: `CompetitionStatus`, `SyncLogStatus`, `SyncTrigger`

---

## Phase 2 — Competition Context

### Task 2.1 — Competition context provider ✅
`lib/context/competition-context.tsx`:
- `CompetitionProvider`: fetches user's competitions on mount from `/api/competitions`
- Stores `activeCompetition` in state + `localStorage` (persist between sessions)
- `useCompetition()` hook: returns `{ activeCompetition, setActiveCompetition, competitions, loading }`
- Wrap `app/(app)/layout.tsx` with `<CompetitionProvider>`

### Task 2.2 — Competitions API route ✅
`app/api/competitions/route.ts`:
- GET: returns competitions user belongs to (via `user_competitions` join)
- For now, if user has no competitions, auto-join them to WC 2026
- Returns `{ id, name, slug, status, logo_url, predictions_deadline }`

### Task 2.3 — Competition switcher component ✅
`components/layout/competition-switcher.tsx`:
- Pill dropdown: small trophy icon + competition name + ChevronDown (or Material Symbol `expand_more`)
- Dropdown list items: logo + name + status badge
- Active competition: green left border on dropdown item
- On select: `setActiveCompetition()` + close dropdown
- Used in Navbar (desktop) and as banner (mobile, above page content)

---

## Phase 3 — Auth Pages Redesign

Reference: `designs/public/public_login/code.html` + `designs/public/public_register/code.html`

### Task 3.1 — Login page ✅→🔄
`app/(auth)/login/page.tsx` — needs visual update to match design:
- `pitch-black-bg` body
- Logo: `mundIAl26` Bebas Neue 6xl + "Editorial Admin Console" tagline
- Card: `surface-container-low` bg, `rounded-xl`, left green bar ornament (`editorial-gradient w-1`)
- Inputs: `surface-container-lowest` bg, no border, `focus:ring-1 focus:ring-primary/50`
- Button: `editorial-gradient`, Bebas Neue xl, `shadow-[0px_10px_30px_rgba(0,212,106,0.2)]`
- Footer: 3 decorative grayscale images (football/stadium) + copyright
- Noise texture overlay (SVG fixed background)

### Task 3.2 — Register page ✅→🔄
`app/(auth)/register/page.tsx` — update to match design:
- "YOU'VE BEEN SUMMONED" headline (Bebas Neue)
- Invite code display (if applicable) or standard registration
- Same input/button style as login
- Profile photo upload with dashed border area

---

## Phase 4 — Public Pages Redesign

### Task 4.1 — Update Navbar & Bottom Nav ✅→🔄
`components/layout/navbar.tsx`:
- Keep existing links but add `CompetitionSwitcher` between logo and nav links
- Update active link style: green left border (`border-l-4 border-[#00D46A]`)
- Use `font-bebas` for logo, Inter for nav links
- Material Symbols icons for avatar/notification

`components/layout/bottom-nav.tsx`:
- 5 tabs: Inicio, Resultados, Ranking, Quiniela, Perfil
- Active: `text-primary-container`, inactive: `text-gray-400`

### Task 4.2 — Ranking page ✅→🔄
Reference: `designs/public/public_ranking/code.html`
`app/(app)/ranking/page.tsx`:
- Filter by `activeCompetition.id`
- Podium: top 3 with border-b-4 (gold/silver/bronze), avatar 128px, Bebas Neue points
- Table: accuracy bars (`bg-primary w-[X%]`), position, avatar, name, points
- Competition name in subtitle

### Task 4.3 — Results page ✅→🔄
Reference: `designs/public/public_results/code.html`
`app/(app)/results/page.tsx`:
- Filter by `activeCompetition.id`
- Phase tabs: GRUPOS | OCTAVOS | CUARTOS | SEMIS | FINAL
- Featured live match card (large, full-width)
- Match grid: 2-col desktop, 1-col mobile
- Live badge: `animate-ping` red dot

### Task 4.4 — Predictions page ✅→🔄
Reference: `designs/public/public_guessings/code.html`
`app/(app)/predictions/page.tsx`:
- Filter by `activeCompetition.id`
- Progress bar: "12/48 PREDICTIONS" green fill
- Score inputs: Bebas Neue 32px, 72px wide, `surface-container-lowest` bg
- Sticky FAB: "SAVE ALL PREDICTIONS" button bottom-right

---

## Phase 5 — Admin Pages

### Task 5.1 — Admin layout update ✅→🔄
`app/(app)/admin/layout.tsx` + new `components/layout/admin-sidebar.tsx`:
- Fixed sidebar 256px, `bg-[#1c1b1b]`, `border-r border-white/5`
- Nav items: Home, Users, Games, Scoring, System
- Active item: `bg-[#2a2a2a] text-[#00D46A] border-l-4 border-[#00D46A]`
- Top header: `bg-[#131313]/70 backdrop-blur-xl`
- Main content: `lg:ml-64 pt-24 pb-12 px-6`

### Task 5.2 — Admin Users page ✅→🔄
Reference: `designs/admin/admin_users_management/code.html`
`app/(app)/admin/users/page.tsx`:
- Search + filter bar
- Table: avatar | name/email | games count | role badge | status | actions
- Invite modal (hidden by default)
- "Invite New User" button → modal open

### Task 5.3 — Admin Scoring page ✅→🔄
Reference: `designs/admin/admin_scoring_config/code.html`
`app/(app)/admin/scoring/page.tsx`:
- Bento grid layout
- "Match Day Rewards" card: exact score, outcome, goal difference inputs
- "Tournament Meta" card: group position, golden boot bonuses
- "The Multiplier Logic" full-width card
- Competition selector at top (scoped to active competition)

### Task 5.4 — Admin Games page ✅ (NEW — replaces `/admin/tournament`)
Reference: `designs/admin/admin_games_config/code.html`
`app/(app)/admin/games/page.tsx`:
- Header: "GAMES MANAGEMENT" + "CREATE NEW GAME" button
- Asymmetric bento grid (12 cols):
  - Featured active game card (8 cols): name, participants, pools, logo, edit/delete buttons
  - Network overview card (4 cols): total games, active, retention %
  - Smaller game cards (4 cols each): status badge, logo, name, participants, action buttons
  - Empty state card (12 cols): dashed border, "Draft New Tournament Ecosystem"
- Create/Edit game modal: name, slug, api_competition_code, season, deadline, logo URL
- Data: CRUD on `competitions` table

### Task 5.5 — Admin System Dashboard ✅ (NEW)
Reference: `designs/admin/admin_system_dashboard/code.html`
`app/(app)/admin/system/page.tsx`:
- Header: "System Monitoring" + "All Systems Operational" badge + Refresh button
- Stats bento (4 cols):
  - API Response time card (2 cols): Bebas Neue ms, mini bar chart
  - Active Syncs card (1 col): count + `border-l-2 border-primary`
  - Sync Failures card (1 col): count + `border-l-2 border-secondary`
- Competition Health grid (3 cols): per-competition card with last sync, success rate, progress bar
- Real-time logs table: timestamp | category badge | source | event | status | view action
- Pagination: "Showing X of Y logs"
- Data: reads from `sync_logs` + Supabase auth events

### Task 5.6 — Admin system API routes ✅
- `app/api/admin/competitions/route.ts` — GET (list all), POST (create), PATCH (update), DELETE
- `app/api/admin/system/logs/route.ts` — GET sync_logs with pagination + filters
- `app/api/admin/system/health/route.ts` — DB ping (count query), API latency ping

---

## Phase 6 — Backend Updates

### Task 6.1 — Update sync-results route ✅
`app/api/sync-results/route.ts`:
- Accept `?competition=wc2026` query param
- Look up competition by slug → get `api_competition_code`
- Insert sync_log row (status: running)
- Fetch from football-data.org using code
- Upsert matches scoped to `competition_id`
- Update sync_log: status success/error, `matches_updated`, `finished_at`

### Task 6.2 — Update scoring engine ✅
`lib/scoring.ts`:
- `calculateUserScore(userId, competitionId, supabase)` — add competition scope
- `recalculateAllScores(competitionId, supabase)` — filter by competition

### Task 6.3 — Update all API routes ✅
Add `competition_id` filter to:
- `app/api/ranking/route.ts`
- `app/api/results/route.ts`
- `app/api/predictions/route.ts`
- `app/api/recalculate-scores/route.ts`
- `app/api/admin/scoring/route.ts`

Each route reads `competition_id` from query param or request body.

---

## Phase 7 — QA & Deploy

### Task 7.1 — Run DB migration ⬜
`npx supabase db push` after creating migration 004

### Task 7.2 — Route audit ✅
- `/admin/tournament` → redirect to `/admin/games` (handled in proxy.ts)
- All admin routes protected: redirect to `/ranking` if not admin
- Competition context always has a fallback (default to first available)

### Task 7.3 — Responsive QA ⬜
- 375px, 768px, 1280px
- Admin sidebar hidden mobile, shown desktop
- Bottom nav mobile only
- Competition switcher banner on mobile

---

## Design Assets Reference

| Screen | Folder |
|---|---|
| Login | `designs/public/public_login/` |
| Register | `designs/public/public_register/` |
| Ranking | `designs/public/public_ranking/` |
| Results | `designs/public/public_results/` |
| Predictions | `designs/public/public_guessings/` |
| Admin — Users | `designs/admin/admin_users_management/` |
| Admin — Scoring | `designs/admin/admin_scoring_config/` |
| Admin — Games | `designs/admin/admin_games_config/` |
| Admin — System | `designs/admin/admin_system_dashboard/` |

Always read `code.html` before implementing each page.

---

*Generated: 2026-03-19 | Last updated: 2026-03-22*
