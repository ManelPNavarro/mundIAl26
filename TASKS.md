# mundIAl26 — AI Agent Task List

> Executable task list ordered by dependency. Work phase by phase. Each task is self-contained and can be handed to an AI agent with the context below.
>
> **Before implementing any page**, read the corresponding `designs/<section>/code.html` for the exact HTML/CSS structure.

---

## Phase 1 — Project Bootstrap

### Task 1.1 — Initialize Next.js project
```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir=false --import-alias="@/*"
```
Verify `app/`, `tailwind.config.ts`, `tsconfig.json` exist.

### Task 1.2 — Install dependencies
```bash
npm install @supabase/supabase-js @supabase/ssr swr lucide-react clsx tailwind-merge
npx shadcn@latest init  # select dark theme, slate base
npx shadcn@latest add button input label card table badge avatar toggle dialog sheet tabs progress select sonner
npm install @fontsource/bebas-neue @fontsource-variable/inter
```

### Task 1.3 — Configure Tailwind with design tokens
Edit `tailwind.config.ts` — add custom colors:
- `green-primary: #00D46A`, `green-dim: #00a854`
- `gold: #f5a623`, `silver: #9ca3af`, `bronze: #b45309`
- `red-accent: #e63946`
- `dark-bg: #0d0d0d`, `dark-card: #161616`, `dark-card-hover: #1e1e1e`, `dark-border: #2a2a2a`
- `white: #ffffff`, `gray-muted: #888888`, `gray-dim: #555555`

Add Bebas Neue and Inter to font family. Set `darkMode: 'class'` (always dark).

### Task 1.4 — Environment variables
Create `.env.local` and `.env.example`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
FOOTBALL_DATA_API_KEY=
CRON_SECRET=
```

### Task 1.5 — Global layout and fonts
- `app/layout.tsx`: `<html lang="es" className="dark">`, Inter default font, Bebas Neue via CSS variable, dark-bg background
- `app/globals.css`: import fonts, CSS variables for design tokens, `.font-display` utility for Bebas Neue, shimmer keyframe animation for skeletons

**Status:** [ ] Not started

---

## Phase 2 — Supabase Setup

### Task 2.1 — Supabase client helpers
- `lib/supabase/client.ts` — browser client (`createBrowserClient`)
- `lib/supabase/server.ts` — server client (`createServerClient`, reads cookies)
- `middleware.ts` (root) — refresh session on every request; protect `/admin/*` (admin role only) and `/(app)/*` (auth required); redirect authenticated users away from `/login`/`/register`

### Task 2.2 — Database schema
Create `supabase/migrations/001_initial_schema.sql` with:
- Enums: `user_role` (user|admin), `match_phase` (group|round_of_32|round_of_16|quarter|semi|third_place|final), `match_status` (scheduled|live|finished), `player_position` (goalkeeper|defender|midfielder|forward)
- Tables: `users`, `groups`, `teams`, `matches`, `players`, `predictions`, `match_predictions`, `group_predictions`, `scoring_rules`, `scores`, `settings`
- Full schema as per `PLANNING.md §5`
- RLS policies: users own their predictions; public read for teams/groups/matches/players/scoring_rules/scores/settings; admin write for scoring_rules/settings
- Indexes on all FK columns

### Task 2.3 — Seed scoring rules
`supabase/migrations/002_seed_scoring_rules.sql`:
```sql
INSERT INTO scoring_rules (rule_key, points, label) VALUES
  ('exact_score', 3, 'Marcador exacto'),
  ('correct_winner', 1, 'Ganador / empate'),
  ('group_position_exact', 2, 'Posición exacta en grupo'),
  ('knockout_qualifier', 2, 'Clasificado eliminatoria'),
  ('tournament_winner', 5, 'Campeón del mundial'),
  ('mvp', 3, 'MVP del torneo'),
  ('top_scorer', 3, 'Máximo goleador'),
  ('best_goalkeeper', 3, 'Mejor portero');
```

### Task 2.4 — Seed default settings
```sql
INSERT INTO settings (key, value) VALUES
  ('predictions_deadline', '2026-06-10T23:59:59Z'),
  ('registration_open', 'true');
```

### Task 2.5 — TypeScript database types
`types/database.ts` — full TypeScript types matching the schema. Include `Database`, `Tables<T>`, `Enums<T>` helpers.

**Status:** [ ] Not started

---

## Phase 3 — Authentication Pages

### Task 3.1 — Auth layout
`app/(auth)/layout.tsx` — full-screen dark bg, vertically centered.

### Task 3.2 — Register page (`/register`)
Reference: `designs/Public/register_login/screen.png` + `code.html`

- Two-panel layout: left = stadium image + "LA QUINIELA DEFINITIVA" tagline (desktop only), right = form card
- Fields: Nombre + Apellido (side by side), Correo Electrónico, Contraseña, Confirmar contraseña
- Profile photo: dashed upload area, camera icon, "Foto de Perfil — Opcional • JPG PNG GIF • 5MB"
- Terms checkbox
- Button "CREAR CUENTA" (full width, primary green)
- Link: "¿YA TIENES CUENTA? INICIAR SESIÓN"
- Logic: Supabase `signUp()`, insert row in `users`, upload avatar to `avatars` storage bucket, redirect to `/predictions`
- Validation: required fields, password match, file < 5MB

### Task 3.3 — Login page (`/login`)
Reference: same design file

- Same two-panel layout
- Fields: Correo Electrónico, Contraseña
- Button "ENTRAR" (full width)
- Error: "Email o contraseña incorrectos"
- Logic: Supabase `signInWithPassword()`, redirect admin → `/admin/tournament`, user → `/ranking`

**Status:** [ ] Not started

---

## Phase 4 — Global Navigation Components

### Task 4.1 — Top navbar (desktop)
`components/layout/navbar.tsx`
- Height 60px, bg dark-bg, 1px bottom border dark-border
- Left: Logo "Mund**IA**l 26" — "IA" in green-primary (#00D46A), rest white, Bebas Neue 28px
- Right: nav links (Ranking, Resultados, Mi Quiniela, Admin if role=admin), Inter 500 14px, gray-muted inactive / white+green underline active
- Far right: Avatar 32px with dropdown (Perfil, Cerrar sesión)

### Task 4.2 — Bottom nav bar (mobile)
`components/layout/bottom-nav.tsx`
- Fixed bottom, 64px, bg dark-card, top border dark-border
- 5 tabs: Inicio (Home), Resultados (Flag), Ranking (Trophy), Quiniela (ClipboardList), Perfil (User)
- Active: green-primary; inactive: gray-muted; label Inter 11px

### Task 4.3 — App layout
`app/(app)/layout.tsx`
- Top navbar on `lg:`, bottom nav on mobile
- Auth check → redirect to `/login` if unauthenticated
- max-width 1200px centered, px-8 / px-4

**Status:** [ ] Not started

---

## Phase 5 — Ranking Page

Reference: `designs/Public/user_ranking/screen.png` + `code.html`

### Task 5.1 — Ranking page
`app/(app)/ranking/page.tsx`
- Header: "CLASIFICACIÓN" Bebas Neue 40px + subtitle "MUNDIAL 2026 · ACTUALIZADO HACE X MINUTOS"
- Podium (top 3): 2nd (left, silver border) | 1st (center, elevated, gold border + glow, star icon, "LÍDER GLOBAL" badge) | 3rd (right, bronze border)
  - Each: avatar 80px, name Inter 700 18px, points Bebas Neue 36px (green for 1st), rank badge
- Table (positions 4+): # | avatar 32px + name | points (Bebas Neue)
  - Current user row: green bg 10%, left green accent border, "Tú (Name)" + "↑ X POSICIONES HOY"
  - Row 56px, subtle alternating bg
- "VER CLASIFICACIÓN COMPLETA" button at bottom
- Loading: 5 skeleton rows; Empty state: "Aún no hay puntuaciones"
- Data: `scores` joined with `users`, ordered DESC by `total_points`
- SWR, revalidate every 60s

### Task 5.2 — Ranking API + hook
- `app/api/ranking/route.ts` — scores joined users, sorted
- `lib/hooks/useRanking.ts` — SWR hook

**Status:** [ ] Not started

---

## Phase 6 — Results Page

Reference: `designs/Public/user_results/screen.png` + `code.html`

### Task 6.1 — Results page
`app/(app)/results/page.tsx`
- Header: "TEMPORADA 2026" (green-primary small) + "RESULTADOS" Bebas Neue 64px
- Phase filter tabs: GRUPOS | OCTAVOS | CUARTOS | SEMIFINAL | FINAL (green-primary underline when active)
- Featured live match card (full-width, large flags, Bebas Neue score, "EN JUEGO" badge, "X' MINUTO")
- Match grid (2-col desktop, 1-col mobile): flag + name | score | name + flag + status badge
- Football quote footer (italics, gray-muted)
- SWR, revalidate every 60s

### Task 6.2 — Match card component
`components/results/match-card.tsx`
- States: scheduled (date/time, "vs"), live (score + minute + red pulse), finished (score + FINALIZADO green badge)

**Status:** [ ] Not started

---

## Phase 7 — Predictions Page

Reference: `designs/Public/user_guess/screen.png` + `code.html`

### Task 7.1 — Predictions page shell
`app/(app)/predictions/page.tsx`
- Header: "MI QUINIELA" Bebas Neue 40px
- Progress bar: "PROGRESO DE PREDICCIONES" / "12 / 48", green fill, 8px height
- 4 tabs: PARTIDOS DE GRUPOS | CLASIFICACIÓN DE GRUPOS | FASE ELIMINATORIA | PREMIOS ESPECIALES
- Sticky "GUARDAR QUINIELA" button
- Deadline check: past deadline → read-only banner + all inputs static

### Task 7.2 — Tab 1: Group match predictions
`components/predictions/group-matches-tab.tsx`
- Groups as sections with green header "GRUPO A", etc.
- Match card: circular flag + name | number input — number input | name + flag
- Score input: Bebas Neue 32px, 72px wide, 0–99 integer, dark-bg, green focus border
- Debounced auto-save to `match_predictions`

### Task 7.3 — Tab 2: Group standings predictions
`components/predictions/group-standings-tab.tsx`
- 16 group cards, each with 1º / 2º / 3º team selectors (dropdown or draggable)
- Teams pre-populated per group
- Saves to `group_predictions`

### Task 7.4 — Tab 3: Knockout bracket predictions
`components/predictions/knockout-tab.tsx`
- Rounds: Round of 32 → Final
- Each slot: team selector "¿Quién pasa?" (all 48 teams)
- Grouped by round with round labels

### Task 7.5 — Tab 4: Special awards
`components/predictions/awards-tab.tsx`
- Campeón del Mundial — team selector
- MVP del torneo — searchable player selector
- Máximo goleador — searchable player selector
- Mejor portero — searchable player selector (filtered: position=goalkeeper)
- Saves to `predictions` table

### Task 7.6 — Predictions data layer
- `app/api/predictions/route.ts` — GET (load user's predictions), POST (save/update)
- `lib/hooks/usePredictions.ts` — SWR hook
- Progress calculation: filled fields / total expected (48 matches + 16 group standings + knockout slots + 4 awards)

**Status:** [ ] Not started

---

## Phase 8 — Admin Pages

### Task 8.1 — Admin layout
`app/(app)/admin/layout.tsx`
- Check role === 'admin'; redirect to `/ranking` if not
- Sidebar nav or extend top navbar (Users, Scoring, Tournament)

### Task 8.2 — Admin Users page
Reference: `designs/Admin/admin_users/screen.png` + `code.html`

`app/(app)/admin/users/page.tsx`
- Header: "GESTIÓN DE USUARIOS" (USUARIOS in green-primary) + "NUEVO USUARIO" button
- Table: Avatar | Nombre | Email | Rol (ADMIN gold badge / USER gray) | Estado (toggle) | Acciones (edit + delete)
- Pagination: "Mostrando X de Y usuarios"
- Footer stats: Total Usuarios | Activos Hoy | Admins
- Delete: confirmation dialog
- Edit/Create: sheet/modal with Nombre, Apellido, Email, Rol, Contraseña (create only)
- Toggle: updates `is_active`

### Task 8.3 — Admin Scoring page
Reference: `designs/Admin/admin_scoring_settings/screen.png` + `code.html`

`app/(app)/admin/scoring/page.tsx`
- Header: "REGLAS DE PUNTUACIÓN" + subtitle
- Unsaved changes banner (amber)
- Grid of scoring rule cards with icon, title, description, large green number input
- "DESCARTAR CAMBIOS" + "GUARDAR CAMBIOS" buttons
- On save: update `scoring_rules`; show "RECALCULAR PUNTUACIONES" button
- On recalculate: POST `/api/recalculate-scores`

### Task 8.4 — Admin Tournament page
Reference: `designs/Admin/admin_dashboard/screen.png` + `code.html`

`app/(app)/admin/tournament/page.tsx`
- Large two-line header "TOURNAMENT / CONFIGURATION" (second line green)
- Registration Deadline: date + time pickers, Save button
- API Sync section: "SYNC NOW" button, status cards (CURRENT STATUS | LAST SYNC | NEXT SCHEDULED)
- Stats panel (right): TOTAL PARTICIPANTS | COMPLETIONS | MATCHES SYNCED (X/104) with progress bars
- Bottom: ACCESS CONTROL + DB HEALTH cards

**Status:** [ ] Not started

---

## Phase 9 — Backend Logic & API Routes

### Task 9.1 — Football API client
`lib/football-api.ts`
- `fetchMatches()`, `fetchTeams()`, `fetchStandings()`
- Base: `https://api.football-data.org/v4`, header `X-Auth-Token`
- Competition: `WC`

### Task 9.2 — Sync results route
`app/api/sync-results/route.ts`
- GET handler (Vercel Cron)
- Fetch from football-data.org → upsert `matches` by `api_id`
- Trigger score recalculation after sync
- Update `settings.last_sync_at`
- Auth: verify `Authorization: Bearer ${CRON_SECRET}`

### Task 9.3 — Scoring engine
`lib/scoring.ts`
- `calculateUserScore(userId)` — loads predictions + results + rules, returns breakdown
- Point categories: exact score (3pts), correct winner (1pt), group position (2pts), knockout qualifier (2pts), tournament winner (5pts), MVP (3pts), top scorer (3pts), best goalkeeper (3pts)
- `recalculateAllScores()` — runs for all users, upserts `scores` table

### Task 9.4 — Recalculate scores route
`app/api/recalculate-scores/route.ts`
- POST, admin-only (verify session role)
- Calls `recalculateAllScores()`
- Returns `{ recalculated: N, durationMs: X }`

### Task 9.5 — Vercel Cron
`vercel.json`:
```json
{
  "crons": [{ "path": "/api/sync-results", "schedule": "*/15 * * * *" }]
}
```

**Status:** [ ] Not started

---

## Phase 10 — Shared Components & Polish

### Task 10.1 — Avatar with fallback
`components/ui/avatar-with-fallback.tsx`
- Sizes: sm (32px), md (48px), lg (80px), xl (120px)
- Fallback: colored circle with initials, color from name (6 preset brand colors)

### Task 10.2 — Skeleton loading states
- `components/ui/skeleton-rows.tsx` — table row skeletons with shimmer
- `components/ui/skeleton-match-card.tsx`

### Task 10.3 — Status badge component
`components/ui/status-badge.tsx`
Variants: scheduled, live (pulse dot), finished, admin, active, inactive

### Task 10.4 — Empty state component
`components/ui/empty-state.tsx` — icon + title + subtitle + optional action button

**Status:** [ ] Not started

---

## Phase 11 — Data Seeding

### Task 11.1 — Seed teams and groups
`supabase/seed.sql` or `scripts/seed-teams.ts`
- 16 groups (A–P), 48 WC 2026 teams with short names
- Flag URLs: `https://flagcdn.com/w40/{country_code}.png`

### Task 11.2 — Seed group stage matches
48 matches with correct team pairings and scheduled dates (starting June 11, 2026)

### Task 11.3 — Seed players
Key players per team (min 1–3 per team) with positions. Prioritize well-known names for player selectors.

**Status:** [ ] Not started

---

## Phase 12 — QA & Deployment

### Task 12.1 — Route protection audit
Verify middleware redirects:
- Unauthenticated → `/login`
- Non-admin accessing `/admin/*` → `/ranking`
- Authenticated user accessing `/login` or `/register` → `/ranking`

### Task 12.2 — Responsive QA
Test at 375px, 768px, 1280px:
- Bottom nav mobile / top nav desktop
- Predictions tabs scrollable on mobile
- Admin tables scroll horizontally on mobile

### Task 12.3 — Dark theme consistency
- All pages: dark-bg (#0d0d0d) background
- Cards: dark-card (#161616)
- shadcn components overridden to match design tokens

### Task 12.4 — Deployment
1. Push to GitHub
2. Connect to Vercel, set all env vars
3. Connect Supabase project, run migrations
4. Test `/api/sync-results` endpoint manually
5. Verify RLS policies for user/admin roles

**Status:** [ ] Not started

---

## Design Assets

Each page has a pixel-accurate prototype to reference:

| Screen | Folder |
|---|---|
| Register / Login | `designs/Public/register_login/` |
| Mi Quiniela (predictions) | `designs/Public/user_guess/` |
| Resultados | `designs/Public/user_results/` |
| Clasificación (ranking) | `designs/Public/user_ranking/` |
| Admin — Usuarios | `designs/Admin/admin_users/` |
| Admin — Puntuación | `designs/Admin/admin_scoring_settings/` |
| Admin — Tournament | `designs/Admin/admin_dashboard/` |

Always read `code.html` before implementing each page.

---

*Generated: 2026-03-19*