# Mundial 2026 — Coworker Prediction Pool

A web app where coworkers predict 2026 FIFA World Cup results, and an admin runs the pool. Replaces a shared Excel "porra" with something everyone can use from their phone.

---

## 1. Context & goal

The original game is an Excel sheet ("Excel-Mundial-2026.xlsx" by Miguel Ángel Tejero) where each participant fills predictions and emails the file to an admin, who pastes them into a master sheet that computes scores. We want the same game as a web app:

- Each participant logs in, enters/edits their predictions before deadlines, and watches the leaderboard.
- One admin enters real match results as the tournament progresses; scores recompute automatically.
- It only needs to scale to a single pool of ~5–50 coworkers (one tournament instance is fine — multi-pool support is a nice-to-have, not required).

The tournament data (48 teams, 12 groups, 72 group matches, 32 knockout matches) is already extracted into `seed-data.json` — use that file to seed the database. Do not retype it.

---

## 2. Tournament structure (2026 format)

- **48 teams** in **12 groups** of 4 (groups A through L).
- **Group stage**: 72 matches across 3 matchdays.
- **Round of 32** (16 matches): top 2 from each group (24 teams) + 8 best 3rd-placed teams.
- **Round of 16** (8 matches) → **Quarterfinals** (4) → **Semifinals** (2) → **3rd-place match** + **Final**.
- Total: **104 matches**.

The bracket pairings are fixed by FIFA (see `seed-data.json` → `knockout_matches`). Slot labels follow the original sheet: `1A` = winner of group A, `2A` = runner-up, `3ABCDF` = best 3rd-placed team among groups A/B/C/D/F, `W73` = winner of match 73, `L101` = loser of match 101.

---

## 3. What participants predict

For each participant, store these predictions:

1. **Score of every match** — home goals / away goals, for all 104 matches.
   - Group stage scores are entered up front.
   - Knockout scores are entered before each round starts, once teams resolve.
2. **Final group standings** — order the 4 teams in each group from 1st to 4th (12 groups × 4 positions).
3. **Knockout winner** — derived from the predicted score, but also needs a "who advances on penalties" flag for knockout matches predicted as a draw (so winners chain forward through the bracket).
4. **Side bets** (entered at the start of the tournament):
   - Golden Boot (top scorer) + 2nd + 3rd top scorer (player names, free text).
   - Golden Ball (best player) + 2nd + 3rd (player names, free text).

A participant's prediction is "complete" when all 104 matches + all 12 group orderings + all 6 side-bet slots are filled.

---

## 4. Scoring (proposed defaults — confirm before building)

The original spreadsheet does not state point values in plain text; they're embedded in formulas. **The values below are sensible defaults — please confirm or adjust with the user before implementing.** Build scoring as a configurable JSON block in the `Pool` row so it can be tweaked without code changes.

### Per match (score prediction)
| Outcome | Group stage | R32 | R16 | QF | SF | 3rd-place | Final |
|---|---|---|---|---|---|---|---|
| Exact score | 3 | 5 | 6 | 8 | 10 | 10 | 12 |
| Correct result (W/D/L), wrong score | 1 | 2 | 3 | 4 | 5 | 5 | 6 |
| Wrong | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

For knockout matches drawn in 90 min: a correct "who advances" pick earns the result points even if the score is wrong, since real life it's also decided by penalties.

### Group standings (per group)
- All 4 positions exactly right: **8 points** (group bonus).
- Otherwise: **2 points per team in its correct position**.

### Knockout qualifiers
- **+1 point** for each team correctly predicted to reach R32.
- **+2** for each team correctly reaching R16.
- **+3** for QF.
- **+5** for SF.
- **+8** for the Final.

### Side bets (locked at tournament start)
| Prediction | Points |
|---|---|
| Champion | 25 |
| Runner-up | 12 |
| 3rd place | 8 |
| Golden Boot (top scorer) | 10 |
| 2nd top scorer | 5 |
| 3rd top scorer | 3 |
| Golden Ball (best player) | 5 |
| 2nd best player | 3 |
| 3rd best player | 2 |

Tiebreakers in the leaderboard, applied in order: total points → exact-score hits → champion correct → runner-up correct → earliest submission time.

---

## 5. Users & roles

- **Admin** (1 person): creates the pool, invites participants, sets deadlines, enters real match results, picks the official Golden Boot / Ball / top-3 awards, and can edit anyone's data if needed.
- **Player**: enters and edits their own predictions before deadlines, views the leaderboard and their own scorecard.

A user has a flag `is_admin: boolean`. The first user to sign up is admin; the admin can promote others.

---

## 6. Prediction lock rules

Each prediction locks automatically at its own deadline. Once locked it's read-only for the player (admin can still edit).

- **Per-match score prediction**: locks at kickoff of that match.
- **Group standings**: locks at kickoff of the first matchday-3 game in that group.
- **Knockout-qualifier picks** (R32/R16/QF/SF/Final teams): lock when the previous round's matches all kick off.
- **Side bets** (champion, top scorer, etc.): lock at the kickoff of the very first match of the tournament.

Admin can override locks per-pool (e.g., "lock all group-stage predictions when the tournament starts" — single deadline mode).

---

## 7. Data model

Use PostgreSQL via Prisma. Schema sketch (TypeScript-style):

```
User
  id, email (unique), name, is_admin (bool), created_at

Pool                          // single row for v1, but design for many
  id, name, slug, scoring_config (JSON), lock_mode ('per_match' | 'single_deadline'),
  tournament_start_at, created_at

Team
  id, code (e.g. 'ESP'), name_es, name_en, group_letter (A..L)

Match
  id, match_no (1..104), round ('GROUP'|'R32'|'R16'|'QF'|'SF'|'THIRD_PLACE'|'FINAL'),
  matchday (1..3 for group stage, null otherwise), group_letter (null for knockout),
  home_team_id (nullable for knockout until resolved),
  away_team_id (nullable for knockout until resolved),
  home_slot, away_slot (text — '1A', '3ABCDF', 'W73', etc; null for group stage),
  kickoff_at (datetime),
  home_score, away_score (nullable until played),
  home_advances (bool, nullable — only used if knockout match is drawn after regulation),
  status ('SCHEDULED'|'LIVE'|'FINISHED')

MatchPrediction               // one per (user, match)
  id, user_id, match_id, home_score, away_score,
  home_advances (bool, nullable — knockout-only, for draws),
  created_at, updated_at

GroupStandingPrediction       // one per (user, group_letter)
  id, user_id, group_letter,
  pos1_team_id, pos2_team_id, pos3_team_id, pos4_team_id,
  created_at, updated_at

GroupStanding                 // actual standings entered by admin
  group_letter (PK), pos1_team_id, pos2_team_id, pos3_team_id, pos4_team_id

SideBet                       // one row per user
  id, user_id,
  champion_team_id, runnerup_team_id, third_team_id,
  top_scorer_1, top_scorer_2, top_scorer_3,        // free-text player names
  best_player_1, best_player_2, best_player_3,
  created_at, updated_at

OfficialAwards                // singleton, edited by admin
  champion_team_id, runnerup_team_id, third_team_id,
  top_scorer_1, top_scorer_2, top_scorer_3,
  best_player_1, best_player_2, best_player_3

Score                         // recomputed cache, one row per user
  user_id (PK), total_points, exact_score_hits, last_computed_at,
  breakdown (JSON: { group_stage: 12, r32: 4, side_bets: 25, ... })
```

Scores should be recomputed (a) every time admin saves a new result, and (b) on demand from the leaderboard page. Keep the math in a single `lib/scoring.ts` function so it's easy to test.

---

## 8. Tech stack (recommended)

**Primary recommendation** — single repo, easy to deploy, lots of Claude Code experience:

- **Next.js 15** (App Router) + **TypeScript**
- **Prisma** ORM + **PostgreSQL** (use Neon's free tier in production, Postgres in Docker locally)
- **Auth.js v5** (NextAuth) with **email magic links** — best UX for coworkers (no password to remember)
- **Tailwind CSS** + **shadcn/ui** for components
- **Zod** for input validation
- **date-fns** for time/deadline math
- **Vitest** for the scoring function (it's the only thing complex enough to need tests)
- Deploy to **Vercel** + **Neon** free tier

Alternatives if the user prefers something else:
- SQLite via libSQL/Turso instead of Postgres (fine for ≤50 users).
- Clerk instead of Auth.js (faster setup, paid past free tier).
- Plain Express + React if Next.js is not preferred — same data model still applies.

Locale: build with **Spanish as the primary language** (matches the original spreadsheet and the user's coworker context). English strings can be added later if requested.

---

## 9. Pages / routes

Public:
- `/login` — enter email, receive magic link.

Authenticated player area:
- `/` — dashboard: their current rank, points, next match kickoff, deadline warnings.
- `/predictions/group-stage` — grid of all 72 group matches, editable inline, grouped by matchday and by group. Save-as-you-type.
- `/predictions/groups` — drag/drop or dropdowns to order the 4 teams in each of the 12 groups.
- `/predictions/knockout` — bracket view; once a round resolves, players pick scores + who advances on penalties.
- `/predictions/side-bets` — champion / podium / top scorers / best players.
- `/leaderboard` — ranked list, click a player to see their scorecard.
- `/leaderboard/[userId]` — that player's predictions (read-only, shown only after their own deadlines have passed, to prevent copying).
- `/account` — change display name, sign out.

Admin-only:
- `/admin` — overview: how many predictions filled, recent activity.
- `/admin/results` — same 104-match grid as the player view, but admin enters **real** results here. Saving a result triggers score recompute.
- `/admin/groups` — enter the real final group standings (once group stage is done).
- `/admin/awards` — enter official Golden Boot / Ball / podium.
- `/admin/users` — list, promote to admin, delete, resend invite.
- `/admin/settings` — pool name, scoring config (JSON editor with a "reset to defaults" button), lock mode, tournament start time.

Mobile-first throughout — most coworkers will use phones.

---

## 10. Implementation phases

Phase 1 — Skeleton (no tournament logic yet)
- Next.js + Prisma + Auth.js boilerplate.
- DB schema + initial migration.
- Seed script that reads `seed-data.json` and populates `Team` and `Match`.
- Email magic-link auth working locally with Mailpit (or similar) and on Vercel with Resend.
- `/admin` route gated on `is_admin`. First-signup-becomes-admin logic.

Phase 2 — Predictions UI
- Group-stage prediction grid (read-only first, then editable with autosave).
- Group standings predictions UI.
- Side-bets form.
- Deadlines/locks enforced server-side. Show countdown on the dashboard.

Phase 3 — Results & scoring
- Admin results entry page.
- `lib/scoring.ts` — pure function that takes (predictions, actuals, scoring_config) and returns per-user breakdown. Unit-test it.
- Leaderboard page reading from the `Score` cache.
- Recompute trigger when admin saves a result.

Phase 4 — Knockout flow
- Resolve knockout-match teams once group stage finishes (or as admin enters group standings).
- Bracket UI for knockout predictions, with "advances on penalties" flag for drawn-in-regulation predictions.
- Update scoring to cover knockout points + qualifier bonuses.

Phase 5 — Polish
- Player scorecard at `/leaderboard/[userId]` (only reveal past-deadline picks).
- Mobile responsiveness sweep.
- Empty states, loading states, error toasts.
- Optional: email digest after each matchday with current standings.

Each phase should end with the app deployable and the data integrity tests passing.

---

## 11. Decisions the user needs to confirm

These are not in the original spreadsheet and should be confirmed before Phase 1:

1. **Scoring values** — confirm or adjust the table in §4. The spreadsheet author may have a canonical version; if the user finds it, override.
2. **Lock mode** — per-match locks (default) or single-deadline (everything locks at tournament kickoff)?
3. **Reveal opponents' predictions** — show after their own deadline, or never until tournament ends? (Default: after their deadline.)
4. **Authentication** — magic-link email is the default. If coworkers don't all have email handy, alternative is name + 6-digit PIN sent on signup. Confirm with the user.
5. **Hosting & domain** — Vercel + Neon free tier is recommended. Confirm or specify alternative.
6. **Language** — Spanish only, or also English? (Original sheet supports both via an `Idiomas` tab.)
7. **Multi-pool support** — single pool is enough for v1. If the user wants multiple isolated pools (e.g., one for coworkers and one for family), say so before Phase 1 so the schema is set up correctly.

---

## 12. Seed data

`seed-data.json` (shipped alongside this plan) contains:

- All 48 teams, grouped A through L.
- All 72 group-stage matches with their group, matchday, and home/away teams.
- All 32 knockout matches with their slot labels (`1A`, `2B`, `W73`, etc.) and match numbers (73–104).
- Slot notation reference.

The seeder should:
1. Insert 48 `Team` rows.
2. Insert 72 group `Match` rows with `home_team_id`/`away_team_id` resolved.
3. Insert 32 knockout `Match` rows with `home_slot`/`away_slot` set and team IDs `null` — they get filled in by admin once group standings are entered.

Kickoff datetimes for each match are not in the seed file (the spreadsheet has placeholder times). Admin can fill those in via `/admin/settings` or a CSV import in a later phase.

---

## 13. Out of scope for v1

To keep the build tight, these are explicitly **not** in v1:

- Push notifications.
- Live score scraping from an external API (admin enters results manually).
- Public/anonymous viewing of the leaderboard.
- Mobile app (web is mobile-friendly; that's enough).
- Payments / prize tracking.
- Chat or comments.

If any of these are wanted, list them and plan them as Phase 6+.
