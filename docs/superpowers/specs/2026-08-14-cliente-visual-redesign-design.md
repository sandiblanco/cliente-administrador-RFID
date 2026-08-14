# Manual timing client — visual redesign

**Date:** 2026-08-14
**Scope:** `cliente/` app only (the manual/fallback timing client used by 3 event staff). The `administrador/` app is explicitly out of scope for this iteration — it keeps its current retro-terminal identity.

## Context

`cliente` is a small React 19 + Vite SPA with no CSS framework and no additional runtime dependencies beyond `react`/`react-dom`. It talks to the backend (`rfid_system_carrera_del_informatico_2026`, a separate repo) over:

- `GET /runners`, `GET /results` on load, merged into a runner list (`src/services/api.js`)
- `POST /events` to register a manual arrival (`{ source: "manual", runner_id, timestamp }`)
- `WebSocket /ws/live` for live confirmation/correction of times and runner add/edit (`src/services/socket.js`), with a 10s background poll as a safety net if the socket doesn't deliver

Current structure:

```
src/
├── App.jsx                 state, handlers, socket/poll wiring — DO NOT CHANGE LOGIC
├── components/
│   ├── RunnerInput.jsx      free-text ID field, submits on Enter
│   ├── RunnerGrid.jsx       renders the list of RunnerCard
│   └── RunnerCard.jsx       one runner's status/name/id/time
├── services/
│   ├── api.js               HTTP calls (untouched)
│   └── socket.js            WebSocket client (untouched)
└── styles.css                single plain CSS file, neutral light theme
```

There is no existing design system to extend — the current styling is intentionally minimal ("estilo neutro"), and the sibling `administrador` app uses an unrelated khaki/black retro-terminal palette, so this redesign establishes the Carrera del Informático brand identity in code for the first time.

**Device context:** staff use **phones** in the field, outdoors, during a live race. This drives a phone-first layout and a light/day theme for sun-glare readability, with the dark-navy brand identity concentrated in the header/chrome (see Theme section). No search/filter is being added — this is a purely visual pass; the full unfiltered runner grid stays as-is functionally.

## What must not change

- `App.jsx` state, effects, handlers (`handleSubmit`, `handleRunnerFinished`, `handleRunnerUpdated`, `pollRunners`) — no logic edits.
- `services/api.js`, `services/socket.js` — untouched.
- All existing behavior: validation messages, the 10s pending-confirmation timeout, the 10s background poll fallback, error categorization (`validation` / `connection` / `server`), the runner-count header text.
- No new npm dependencies. No new HTTP/WS endpoints. No search/filter (confirmed out of scope).

## CSS architecture

Stay in plain CSS — no CSS-in-JS, no Tailwind, no CSS modules. Split the current single `src/styles.css` into a small set of files under `src/styles/`, imported from one entry stylesheet:

- `tokens.css` — CSS custom properties: colors, spacing, radii, shadows, font stacks, breakpoints
- `base.css` — resets, body, typography defaults, focus states
- `layout.css` — header/chrome, app shell, input section
- `components.css` — runner grid/card, error/status banner
- `decorative.css` — circuit/particle motifs, pending-pulse animation

`main.jsx` changes its one import from `./styles.css` to `./styles/index.css` (a file that just `@import`s the others in order). This is a pure reorganization — Vite bundles multi-file CSS natively, no build config changes needed.

Component files (`RunnerCard.jsx`, `RunnerInput.jsx`, `RunnerGrid.jsx`, `App.jsx`) get **additive-only** JSX changes: new `className`s, a couple of small inline SVG icons, and one new `inputMode="numeric"` attribute on the existing input. No props, state, or handlers change shape.

## Design tokens

Light/day theme, brand-accented (per your confirmation: full brand identity, light background instead of dark navy background).

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#F4F7FA` (Cold White) | dominant body background |
| `--surface` | `#FFFFFF` / very-faint blue-tinted white | cards |
| `--border` | `#9CB1C7` (Blue Gray) at low opacity | card/input borders |
| `--text` | `#0A2547` (Dark Blue) | primary text on light surfaces |
| `--text-muted` | `#4C6480`-ish (Dark Blue, lightened) | secondary text |
| `--chrome-bg` | `#061A33` (Deep Navy) | header bar only |
| `--chrome-text` | `#F4F7FA` (Cold White) | header text |
| `--accent-primary` | `#008FF5` (Electric Blue) | primary actions, input focus ring |
| `--accent-secondary` | `#00C9D8` (Technology Cyan) | live/status indicators |
| `--accent-success` | `#00E6C3` / `#5BE3A5` (Turquoise/Mint) | registered status, success |
| `--accent-error` | muted red (e.g. `#C0392B`-ish, desaturated to fit the cold palette) | validation/server error banner |
| `--accent-warning` | muted amber | connection error banner |

Accents are borders, icons, numerals, small fills, and the header bar — never large saturated surfaces, per the brief. Error/warning colors are a usability necessity (semantic alerting), not a violation of "avoid red/orange branding" — they're used narrowly, only in the existing error banner.

## Header / chrome (confirmed treatment)

Sticky header in Deep Navy (`--chrome-bg`) with Cold White text — the one place the dark-navy brand foundation gets full presence, functioning like a scoreboard strip. Contains:

- Wordmark/title: "Carrera del Informático" (small eyebrow) + "Registro de llegadas" (h1)
- Live counter as a stat chip: `42/120` with the numeral in the technical font, mint/cyan accent

Below the header, the input + grid area sits on the light body background for outdoor legibility.

## Typography

- Body, labels, hints, error text: keep the current system-ui stack (`system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`) — already solid, zero risk.
- Headings, runner IDs, live counter, and recorded times: self-hosted **Chakra Petch** (OFL-licensed, geometric/technical/sporty without tipping into cyberpunk or gamer aesthetics), weights 600/700, bundled as local `woff2` files under `src/assets/fonts/` with local `@font-face` declarations — **not** a Google Fonts CDN link, so branding/layout never depends on outside network access during a live event.
- Time/ID numerals use `font-variant-numeric: tabular-nums` so digits don't jitter in width as they update live.

## Layout (phone-first)

```
┌──────────────────────────────────┐
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│  Deep Navy header, sticky
│▓ CARRERA DEL INFORMÁTICO        ▓│
│▓ Registro de llegadas   42/120  ▓│
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
├──────────────────────────────────┤  Cold White body
│  [ 128_______________________ ] │  large, numeric keypad on mobile
│  Presione Enter para registrar   │
│                                   │
│  (error banner appears here,     │
│   only when relevant)            │
│                                   │
│  ┌──────────────┐ ┌─────────────┐│
│  │ ● Ana G.     │ │ ○ Bruno T.  ││  2-column card grid
│  │  #128        │ │  #129       ││  (tuned auto-fill/minmax,
│  │  01:32:04    │ │ Sin registrar│  same mechanism as today)
│  └──────────────┘ └─────────────┘│
│  ┌──────────────┐ ┌─────────────┐│
│  │ ⏳ Carla P.  │ │ ○ Diego R.  ││
│  │  #130        │ │  #131       ││
│  │ Registrando...│ │ Sin registrar│
│  └──────────────┘ └─────────────┘│
└──────────────────────────────────┘
```

Grid keeps the existing CSS Grid mechanism (`repeat(auto-fill, minmax(…, 1fr))`), just retuned so two columns land comfortably on a ~375-430px phone viewport. Since layouts may occasionally run on tablet/laptop too (mixed use wasn't fully ruled out), the grid naturally reflows to more columns on wider viewports — no separate breakpoint logic needed beyond what `auto-fill` already gives.

## Component treatment

- **RunnerInput**: taller (≥48px) touch target, larger font size, `inputMode="numeric"` added (mobile numeric keypad — presentational only, doesn't touch the existing string-based submit logic), visible focus ring in Electric Blue, hint text kept below as-is.
- **RunnerCard**: left-edge accent (color-coded dot/bar) — mint for registered, neutral blue-gray for unregistered, animated pulse for pending. Runner name in body font; runner ID and time in Chakra Petch, time in turquoise with tabular numerals. "Registrando..." pending state gets a subtle (not distracting) pulsing dot, disabled under `prefers-reduced-motion`.
- **RunnerGrid**: unchanged data flow; only the empty-state message and grid container get restyled.
- **Error banner**: icon + message, color-coded per existing `type` (`validation`/`server` → muted red, `connection` → muted amber), same position/logic as today.
- **Header**: new element in `App.jsx`'s JSX (title/eyebrow + stat chip) — presentational only, computed from existing `registeredCount`/`runners.length` values already in state.

## Decorative / motion elements

Implemented entirely in CSS (pseudo-elements, inline SVG-as-background via `background-image: url("data:image/svg+xml...")`, gradients) — no new JSX elements for decoration, so component files stay minimal. One subtle circuit-as-race-route motif near the header: a thin low-opacity curved line with 2-3 glowing node dots in a blue→cyan→mint gradient. Very low opacity (~5-8%), static or a slow multi-second opacity breathe. `prefers-reduced-motion: reduce` disables all breathing/pulsing animation (pending-state pulse included).

## Icons

Small inline SVG icons (geometric, ~1.5px stroke, no library dependency) added directly in the relevant component JSX: status glyph in `RunnerCard` (alternative/complement to the color dot), alert glyph in the error banner. Kept minimal and consistent in stroke weight.

## Favicon

Current favicon is a generic placeholder abstract mark unrelated to the event. Proposing to replace it with a small brand-aligned mark (circuit-node/speed-line motif in the accent gradient) as part of this pass — low-risk, visible brand touch. Flag during implementation if you'd rather leave the current one.

## Accessibility / verification

- WCAG AA contrast check for all text/background pairs, especially navy-on-white body text and white-on-navy header text.
- Visible focus states on the input (already interactive-only element).
- `prefers-reduced-motion` respected for all added animation.
- No existing test suite in `cliente` (no test script/framework in `package.json`) — this redesign doesn't introduce one; verification is manual, at phone viewport widths (~375-430px) primarily, with a spot-check at tablet/desktop widths since device usage may not be 100% phone-only.

## Out of scope (explicitly)

- `administrador` app — untouched this iteration.
- Any new functionality: search/filter, sorting, new endpoints, new WS message types.
- Any change to `App.jsx` state/effects logic, `services/api.js`, `services/socket.js`.
