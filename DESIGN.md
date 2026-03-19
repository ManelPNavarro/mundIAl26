# mundIAl26 — Design Specification

> Design source of truth for UI/UX. Focused on visual identity, page layouts, components, and responsive behavior.
> For technical details (data model, API, deployment) see PLANNING.md.

---

## 1. Visual Identity

### Colors

| Token | Hex | Usage |
|---|---|---|
| `green-primary` | `#1a7a3e` | Primary buttons, active states, progress bars, accents |
| `green-light` | `#22a34f` | Button hover, highlights |
| `gold` | `#f5a623` | 1st place, trophies, special highlights |
| `silver` | `#9ca3af` | 2nd place |
| `bronze` | `#b45309` | 3rd place |
| `red-accent` | `#e63946` | Alerts, live match indicator, danger actions |
| `dark-bg` | `#1a1a2e` | Main background |
| `dark-card` | `#16213e` | Card backgrounds |
| `dark-border` | `#0f3460` | Card borders, dividers |
| `white` | `#ffffff` | Primary text on dark backgrounds |
| `gray-muted` | `#6b7280` | Secondary text, placeholders |

### Typography

| Role | Font | Weight | Size (desktop → mobile) |
|---|---|---|---|
| Display / Hero | Bebas Neue | 400 (naturally bold) | 64px → 40px |
| Page title | Bebas Neue | 400 | 40px → 28px |
| Section heading | Bebas Neue | 400 | 28px → 22px |
| Card title | Inter | 700 | 18px → 16px |
| Body | Inter | 400 | 16px → 14px |
| Label / Caption | Inter | 500 | 13px → 12px |
| Score / Number | Bebas Neue | 400 | varies |

### Spacing & Radius

- Base unit: `4px`
- Card border radius: `12px` (rounded-xl)
- Button border radius: `8px` (rounded-lg)
- Input border radius: `8px`
- Pill / badge radius: `9999px` (fully rounded)

### Shadows & Effects

- Card shadow: `0 4px 24px rgba(0,0,0,0.4)`
- Gold glow (1st place): `0 0 20px rgba(245,166,35,0.4)`
- Green glow (active/live): `0 0 12px rgba(26,122,62,0.5)`
- Background texture: subtle dark gradient or noise overlay on `dark-bg`

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
- Full-page dark background `#1a1a2e`
- Subtle radial gradient or diagonal stripe pattern (very subtle, low opacity) to add texture
- Cards float on top with `dark-card` background and `dark-border` border

---

## 3. Components

### 3.1 Navigation — Top Bar (desktop)

- Height: `64px`
- Background: `dark-card` with bottom border `dark-border`
- Left: Logo — "Mund**IA**l 26" with "IA" in `gold`, rest in `white`, Bebas Neue 28px
- Right: nav links — Ranking, Resultados, Mi Quiniela, (Admin badge if admin role)
- Active link: `green-primary` underline or highlight
- Far right: user avatar (circle, 36px) with dropdown (Perfil, Cerrar sesión)

### 3.2 Navigation — Bottom Bar (mobile)

- Height: `64px`, fixed at bottom
- Background: `dark-card`, top border `dark-border`
- 5 tabs: **Inicio** (Home), **Resultados** (Flag), **Ranking** (Trophy), **Quiniela** (ClipboardList), **Perfil** (User)
- Active tab: icon + label in `green-primary`, inactive in `gray-muted`
- Tab label: Inter 11px below icon

### 3.3 Buttons

| Variant | Background | Text | Border |
|---|---|---|---|
| Primary | `green-primary` | white | none |
| Primary hover | `green-light` | white | none |
| Secondary | transparent | white | `dark-border` |
| Danger | `red-accent` | white | none |
| Ghost | transparent | `gray-muted` | none |

- Height: `44px` (touch-friendly), `px-6`
- Loading state: spinner replacing text, same background

### 3.4 Cards

- Background: `dark-card`
- Border: `1px solid dark-border`
- Border radius: `12px`
- Padding: `24px` desktop, `16px` mobile
- Hover (if interactive): border color shifts to `green-primary`

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

**Background:** Stadium-inspired — dark gradient from `#1a1a2e` to `#0f3460` with a subtle radial green glow from the center bottom (simulating pitch lights)

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
- Success: brief "¡Cuenta creada!" toast, redirect to `/quiniela`

---

### 4.3 `/ranking` — Leaderboard

**Header section:**
- Page title "Clasificación" Bebas Neue 40px
- Subtitle "Mundial 2026 · Actualizado hace X minutos" Inter 14px `gray-muted`
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

### 4.4 `/resultados` — Results

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

### 4.5 `/quiniela` — Predictions

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

### 4.6 `/admin/usuarios` — User Management

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

### 4.7 `/admin/puntuacion` — Scoring Rules

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

### 4.8 `/admin/torneo` — Tournament Config

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

## 5. User Flows

### Registration → First prediction
```
/register → success toast → /quiniela (tab 1, progress 0%)
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

*Document created: March 2026 | Last updated: 2026-03-19*
