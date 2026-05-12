# mundIAl26 — Design Specification

> Design source of truth for UI/UX. Focused on visual identity, page layouts, components, and responsive behavior.
> For technical details (data model, API, deployment) see PLANNING.md.

---

## 1. Visual Identity

### Colors

| Token | Hex | Usage |
|---|---|---|
| `green-primary` | `#00D46A` | Primary buttons, active nav states, progress bars, key accents |
| `green-dim` | `#00a854` | Button hover, secondary highlights |
| `gold` | `#f5a623` | 1st place, trophies, special highlights |
| `silver` | `#9ca3af` | 2nd place |
| `bronze` | `#b45309` | 3rd place |
| `red-accent` | `#e63946` | Alerts, live match indicator, danger actions |
| `dark-bg` | `#0d0d0d` | Main background — near black, like Filmin |
| `dark-card` | `#161616` | Card backgrounds |
| `dark-card-hover` | `#1e1e1e` | Card hover state |
| `dark-border` | `#2a2a2a` | Borders and dividers — very subtle |
| `white` | `#ffffff` | Primary text |
| `gray-muted` | `#888888` | Secondary text, placeholders, captions |
| `gray-dim` | `#555555` | Tertiary text, disabled states |

### Typography

Filmin-inspired: clean and editorial. Bebas Neue used sparingly — only for scores and the logo. Everything else is Inter, with weight and size doing the heavy lifting instead of decorative fonts.

| Role | Font | Weight | Size (desktop → mobile) |
|---|---|---|---|
| Logo | Bebas Neue | 400 | 28px |
| Score / Number display | Bebas Neue | 400 | varies (32–64px) |
| Page title | Inter | 700 | 32px → 24px |
| Section heading | Inter | 600 | 20px → 18px |
| Card title | Inter | 600 | 16px → 15px |
| Body | Inter | 400 | 15px → 14px |
| Label / Caption | Inter | 400 | 13px → 12px |
| Nav links | Inter | 500 | 14px |

### Spacing & Radius

- Base unit: `4px`
- Card border radius: `12px` (rounded-xl)
- Button border radius: `8px` (rounded-lg)
- Input border radius: `8px`
- Pill / badge radius: `9999px` (fully rounded)

### Shadows & Effects

Filmin-like: minimal shadows, no heavy textures. Depth comes from layering dark shades, not from dramatic effects.

- Card shadow: `0 2px 12px rgba(0,0,0,0.6)` — subtle, tight
- Gold glow (1st place only): `0 0 16px rgba(245,166,35,0.3)`
- Green glow (active/live indicator): `0 0 8px rgba(0,212,106,0.4)`
- Background: flat `#0d0d0d`, no texture — cleanliness is the aesthetic
- Transitions: `150ms ease` on hover states, nothing flashy

### Iconography

- Library: **Lucide React**
- Style: stroke icons, 24px default, 20px in nav/compact contexts
- Key icons: `Trophy`, `Star`, `Flag`, `Users`, `Calendar`, `Settings`, `ChevronRight`, `Home`, `BarChart2`, `ClipboardList`, `Shield`
- Flags: rendered as images (country flag CDN) next to team names

---

## 2. Global Layout

### Desktop (≥ 1024px)
- **Top navbar** with logo on the left and navigation links on the right
- Content area: max-width `1200px`, centered, `px-8` padding
- Cards in grid layouts (2–3 columns)

### Mobile (< 1024px)
- No top navbar links — replaced by **bottom navigation bar** (fixed, 5 tabs)
- Full-width content, `px-4` padding
- Single-column layouts

### Background
- Full-page flat `#0d0d0d` — no gradients, no patterns, no texture
- Cards sit on this background with `dark-card` (`#161616`) — differentiated purely by shade, not by shadow or border
- Borders (`#2a2a2a`) used only where structure is needed, not decoratively

---

## 3. Components

### 3.1 Navigation — Top Bar (desktop)

- Height: `60px`
- Background: `#0d0d0d` (same as page bg) with a very subtle `1px` bottom border in `dark-border`
- Left: Logo — "Mund**IA**l 26" with "IA" in `green-primary`, rest in `white`, Bebas Neue 28px
- Center-left: **Competition switcher** — pill-shaped dropdown showing active competition name (e.g. "World Cup 2026"), with a small chevron; clicking opens a dropdown listing all competitions the user belongs to; active competition has a `green-primary` dot indicator
- Right: nav links in Inter 500 14px — Ranking, Resultados, Mi Quiniela, (+ Admin if admin role)
- Inactive links: `gray-muted`, hover: `white` (150ms transition)
- Active link: `white` + `green-primary` 2px underline offset below
- Far right: user avatar (circle, 32px) with dropdown (Perfil, Cerrar sesión)

### 3.2 Navigation — Bottom Bar (mobile)

- Height: `64px`, fixed at bottom
- Background: `dark-card`, top border `dark-border`
- 5 tabs: **Inicio** (Home), **Resultados** (Flag), **Ranking** (Trophy), **Quiniela** (ClipboardList), **Perfil** (User)
- Active tab: icon + label in `green-primary`, inactive in `gray-muted`
- Tab label: Inter 11px below icon
- **Competition switcher on mobile:** sticky banner below the top of the page (not in the bottom nav), showing current competition name with a swap icon; tapping opens a bottom sheet with the list

### 3.11 Competition Switcher

- Pill component: `dark-card` bg, `dark-border` border, `8px` radius
- Left: small competition logo/icon (20px) or trophy icon as fallback
- Center: competition name, Inter 500 14px, `white`
- Right: `ChevronDown` icon, `gray-muted`
- Dropdown list item: logo + name + status badge (ACTIVO / PRÓXIMO / FINALIZADO)
- Active competition: `green-primary` left border on the dropdown item
- Transition: `150ms ease` open/close

### 3.3 Buttons

| Variant | Background | Text | Border |
|---|---|---|---|
| Primary | `green-primary` | `#0d0d0d` (dark text on green) | none |
| Primary hover | `green-dim` | `#0d0d0d` | none |
| Secondary | transparent | `white` | `1px solid #2a2a2a` |
| Secondary hover | `#1e1e1e` | `white` | `1px solid #2a2a2a` |
| Danger | `red-accent` | `white` | none |
| Ghost | transparent | `gray-muted` | none |
| Ghost hover | transparent | `white` | none |

- Height: `40px`, `px-5`, Inter 500 14px
- Border radius: `6px` — slightly more refined than before
- Loading state: spinner replacing text, same background
- No uppercase — sentence case only (Filmin-like)

### 3.4 Cards

- Background: `#161616`
- Border: `1px solid #2a2a2a` — very understated, just enough to separate
- Border radius: `8px` — clean, not overly rounded
- Padding: `20px` desktop, `16px` mobile
- Hover (if interactive): background shifts to `#1e1e1e`, border stays — no color flash
- No heavy shadows — layered darkness does the separation work

### 3.5 Inputs & Forms

- Background: `dark-bg`
- Border: `1px solid dark-border`
- Focus border: `green-primary`
- Text: `white`
- Placeholder: `gray-muted`
- Label: Inter 13px, `gray-muted`, above the field
- Error state: `red-accent` border + error message below

### 3.6 Badges / Status Pills

| Status | Background | Text |
|---|---|---|
| Scheduled (Pendiente) | `dark-border` | `gray-muted` |
| Live (En juego) | `red-accent` at 20% opacity | `red-accent` + pulse dot |
| Finished (Finalizado) | `green-primary` at 20% opacity | `green-primary` |
| Admin role | `gold` at 20% opacity | `gold` |
| Active | `green-primary` at 20% opacity | `green-primary` |
| Inactive | `dark-border` | `gray-muted` |

### 3.7 Score Input (match prediction)

- Two number inputs side by side with a dash " — " separator
- Large, centered numbers (Bebas Neue 32px)
- Width: `72px` each, square-ish
- Background: `dark-bg`, green border on focus

### 3.8 Progress Bar

- Track: `dark-border`
- Fill: `green-primary`
- Height: `8px`, fully rounded
- Label above: "X de Y predicciones completadas" in Inter 13px `gray-muted`
- Percentage on the right: Inter 13px `white`

### 3.9 Avatar

- Circle crop
- Sizes: 32px (table), 48px (card), 80px (podium), 120px (profile)
- Fallback: colored circle with initials (Inter bold, white)
- Initials background: derived from user name (one of 5–6 preset brand colors)

### 3.10 Podium (top 3)

- Three elevated cards arranged as a podium (2nd | 1st | 3rd height order)
- 1st: tallest card, gold border + gold glow, large trophy icon, Bebas Neue 48px points
- 2nd: silver border, medium height
- 3rd: bronze border, shortest
- Each card: avatar (80px), name (Inter 700 18px), points (Bebas Neue 36px), rank number

---

## 4. Pages

### 4.1 `/login`

**Layout:** Full-screen, vertically centered card (max-width `420px`)

**Background:** Flat `#0d0d0d` — no gradient. The card itself provides all the contrast. Filmin-style: the login page looks like the rest of the app, not a separate landing experience.

**Card contents (top to bottom):**
1. Logo: "Mund**IA**l 26" Bebas Neue 48px + tagline "La quiniela del Mundial" Inter 14px `gray-muted`
2. Divider
3. Label "Email" + email input
4. Label "Contraseña" + password input (toggle visibility)
5. Primary button "Entrar" (full width)
6. Link "¿No tienes cuenta? **Regístrate**"

**States:**
- Loading: button shows spinner, inputs disabled
- Error: red message below the button ("Email o contraseña incorrectos")

---

### 4.2 `/register`

**Layout:** Same full-screen card style as login (max-width `480px`)

**Card contents:**
1. Logo + tagline
2. Two inputs side by side: "Nombre" | "Apellido"
3. "Email" input
4. "Contraseña" input
5. "Confirmar contraseña" input
6. "Foto de perfil" — optional file upload area (dashed border, upload icon, "Subir foto (opcional)")
7. Primary button "Crear cuenta" (full width)
8. Link "¿Ya tienes cuenta? **Inicia sesión**"

**States:**
- Validation errors shown inline below each field
- Password mismatch error on confirm field
- Success: brief "¡Cuenta creada!" toast, redirect to `/predictions`

---

### 4.3 `/ranking` — Leaderboard

**Header section:**
- Page title "Clasificación" Bebas Neue 40px
- Subtitle "[Competition Name] · Actualizado hace X minutos" Inter 14px `gray-muted`
- Auto-refresh indicator (subtle spinning icon when refreshing)

**Podium section (top 3 users):**
- Visible only when ≥ 3 participants
- Horizontal arrangement: 2nd (left) | 1st (center, elevated) | 3rd (right)
- On mobile: stacked vertically, 1st on top

**Rankings table (positions 4+):**
- Columns: # | Player (avatar + name) | Points
- Row height: 56px
- Alternate row backgrounds (very subtle)
- Current user row: green-primary at 10% opacity + left border accent
- On mobile: full-width, compact (smaller avatar, truncated name)

**Empty state:**
- Illustration placeholder + "Aún no hay puntuaciones. ¡El torneo no ha comenzado!"

---

### 4.4 `/results` — Results

**Header:**
- "Resultados" Bebas Neue 40px
- Phase filter tabs: "Grupos" | "Ronda de 32" | "Octavos" | "Cuartos" | "Semis" | "Final"
- Active tab: `green-primary` underline

**Match cards (in a list, grouped by phase):**

```
┌─────────────────────────────────────────┐
│  [Flag] España        1 – 0    Francia [Flag]  │
│                    FINALIZADO               │
└─────────────────────────────────────────┘
```

- Home team: flag + name (left-aligned)
- Score: centered, Bebas Neue 32px. "vs" if not started
- Away team: name + flag (right-aligned)
- Status badge: bottom-center
- Live matches: red pulsing dot + "EN JUEGO" badge
- Match date/time shown if scheduled

**Group stage layout:**
- Cards grouped under "Grupo A", "Grupo B"… collapsible section headers

---

### 4.5 `/predictions` — Predictions

**Pre-deadline state (form):**

**Header:**
- "Mi Quiniela" Bebas Neue 40px
- Progress bar component (full width)
- "Guardar" button (sticky on mobile, top-right on desktop) — saves current progress

**Section tabs (horizontal scrollable on mobile):**
1. Partidos de Grupos
2. Clasificación de Grupos
3. Fase Eliminatoria
4. Premios Especiales

**Tab 1 — Partidos de Grupos:**
- Matches grouped by "Grupo A", "Grupo B"…
- Each match: team A | score input — score input | team B
- Validated: only 0–99 integers

**Tab 2 — Clasificación de Grupos:**
- One card per group (16 cards)
- Each card: 3 team selectors (1º, 2º, 3º) — dropdown or reorderable list
- Teams pre-populated from the group

**Tab 3 — Fase Eliminatoria:**
- Visual bracket or list of rounds
- For each slot: team selector dropdown ("¿Quién pasa?")
- Slots unlock visually as earlier rounds are filled

**Tab 4 — Premios Especiales:**
- "Campeón del Mundial" — team selector
- "MVP del torneo" — player selector (searchable)
- "Máximo goleador" — player selector (searchable)
- "Mejor portero" — player selector (searchable, filtered to goalkeepers)

**Post-deadline state (read-only):**
- Same layout but all inputs replaced with static values
- Banner at top: "El plazo de envío ha finalizado. Esta es tu quiniela." with deadline date
- No save button

---

### 4.6 `/admin/users` — User Management

**Header:** "Gestión de Usuarios" + "Nuevo usuario" button (top right)

**Table:**
| Avatar | Nombre | Email | Rol | Estado | Acciones |
|---|---|---|---|---|---|
| circle | Juan García | juan@... | badge | toggle | edit / delete |

- Role badge: gold "Admin" or gray "Usuario"
- Estado: toggle switch (active/inactive)
- Delete: opens confirmation modal ("¿Eliminar a Juan García? Esta acción no se puede deshacer.")
- Edit: opens slide-in panel or modal with editable fields

**Create/Edit modal:**
- Fields: Nombre, Apellido, Email, Rol (select), Contraseña (only on create)
- Primary button "Guardar", secondary "Cancelar"

---

### 4.7 `/admin/scoring` — Scoring Rules

**Header:** "Reglas de Puntuación"
**Subtitle:** "Los cambios se aplicarán a todos los usuarios al guardar."

**Form — one row per rule:**
```
Marcador exacto          [  3  ] puntos
Ganador / empate         [  1  ] puntos
Posición exacta en grupo [  2  ] puntos
Clasificado eliminatoria [  2  ] puntos
Campeón del mundial      [  5  ] puntos
MVP del torneo           [  3  ] puntos
Máximo goleador          [  3  ] puntos
Mejor portero            [  3  ] puntos
```

- Number input per row (min 0, max 99)
- "Guardar cambios" primary button at bottom
- After save: "Recalcular puntuaciones" secondary button appears with a warning banner

---

### 4.8 `/admin/tournament` — Tournament Config

**Section 1 — Deadline:**
- "Fecha límite de quinielas"
- Date + time picker input
- Current value shown
- "Guardar" button

**Section 2 — API Sync:**
- Last sync: "Hace 12 minutos (14:32)"
- Next scheduled sync: "En 3 minutos"
- Status indicator: green dot "Operativo" / red dot "Error"
- "Sincronizar ahora" button → shows spinner while syncing → success/error toast

**Section 3 — Stats (read-only):**
- Total participants: X
- Quinielas completadas: X / Y
- Partidos sincronizados: X / 104

---

### 4.9 `/admin/logs` — Activity & Error Logs

**Header:** "REGISTRO DE ACTIVIDAD" (ACTIVIDAD in green-primary)

**Filter bar:** Type (Sincronización | Errores | Usuarios) + Competition dropdown + Date range picker

**Log table:**
```
Timestamp | Type badge | Competition | Message | Duration / Detail
```
- Type badges: green "SYNC OK", red "ERROR", blue "USUARIO", yellow "SISTEMA"
- Row click: expands inline to show full detail / stack trace
- Auto-refresh toggle: green dot "En vivo" when enabled
- Empty state: "No hay registros para este filtro"

---

### 4.10 `/admin/database` — Database Health

**Header:** "BASE DE DATOS" (DATOS in green-primary)

**Health card (top):**
- Large status indicator: green "OPERATIVA" / red "ERROR"
- Response time: "X ms" in Bebas Neue 32px
- Connection pool: progress bar

**Table stats grid (2-col desktop, 1-col mobile):**
Each card: table name + row count (Bebas Neue 24px) + last updated
Tables shown: users, competitions, matches, predictions, scores, sync_logs

**Last migration card:**
- Migration filename + applied date + status badge

**SQL Runner (read-only):**
- Monospace textarea (dark-bg, dark-border, 12px font)
- "EJECUTAR" button
- Results: simple table or error message in red
- Warning banner: "Solo lectura. Las consultas de escritura serán rechazadas."

---

### 4.11 `/admin/api` — Football API Management

**Header:** "API DE FÚTBOL" (API in green-primary)

**API Status card:**
- Provider: "football-data.org"
- Plan badge: "FREE TIER" in gold
- Rate limit: "X / 10 req/min" with progress bar
- Daily requests: "X / Y" with progress bar
- Connection status: green/red dot + latency

**Per-competition sync cards** (one card per active competition):
```
┌─────────────────────────────────┐
│  [Logo] World Cup 2026          │
│  Último sync: hace 12 min       │
│  Partidos: 48 / 104             │
│  Estado: ● OPERATIVO            │
│  [SINCRONIZAR AHORA]            │
└─────────────────────────────────┘
```
- Sync button: shows spinner during sync, then success/error toast
- Matches progress bar: green fill

**Last API response preview:**
- Collapsible JSON block, monospace, dark-card bg, `gray-muted` text
- "Ver respuesta completa" expandable

---

## 5. User Flows

### Registration → First prediction
```
/register → success toast → /predictions (tab 1, progress 0%)
→ fill matches → auto-save → progress updates
→ submit when 100% complete → confirmation screen
```

### During tournament (returning user)
```
Login → /ranking (default landing)
→ tap "Resultados" → see live scores
→ tap "Mi Quiniela" → read-only view of predictions
```

### Admin updates scoring
```
/admin/puntuacion → change values → Guardar
→ "Recalcular puntuaciones" → loading → success toast
→ /ranking updates with new points
```

---

## 6. Responsive Behavior Summary

| Element | Desktop | Mobile |
|---|---|---|
| Navigation | Top bar with links | Bottom tab bar |
| Ranking | Podium + table side by side (optionally) | Podium stacked + full-width rows |
| Resultados | 2-column match grid | Single column list |
| Quiniela tabs | Horizontal tabs | Scrollable tabs |
| Match score inputs | Inline in a row | Inline in a compact row |
| Admin tables | Full columns visible | Horizontal scroll or condensed |
| Cards | Multi-column grid | Single column |
| Modals | Centered overlay | Full-screen bottom sheet |

---

## 7. Empty & Loading States

| Page | Loading | Empty |
|---|---|---|
| Ranking | Skeleton rows (3–5) | "Aún no hay puntuaciones" + football illustration |
| Resultados | Skeleton match cards | "No hay partidos disponibles aún" |
| Quiniela | Skeleton form | — (always has content) |
| Admin usuarios | Skeleton table | "No hay usuarios registrados" + create button |

- Skeleton style: `dark-border` background with shimmer animation
- All async data uses SWR, so stale data shows while revalidating (no full loading screen on revisit)

---

*Document created: March 2026 | Last updated: 2026-03-22*
