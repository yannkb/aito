# AITO — Project Knowledge Base

**Generated:** 2026-03-08 · **Commit:** 728b555 · **Branch:** master

## OVERVIEW

Mobile-first PWA for managing a weekly training program combining gym workouts and ʻOri Tahiti (Polynesian dance). React 19 + Vite 7 + TanStack Router. No backend — localStorage only. Two themes: Dark Gym (default) + Polynesian Vibe.

## STRUCTURE

```
aito/
├── src/
│   ├── routes/           # TanStack Router pages (index, day detail, settings)
│   ├── components/ui/    # Reusable UI primitives (Button, Card, Modal, Input, Select, IconButton)
│   ├── components/       # Feature components (ThemeToggle, PWAUpdatePrompt)
│   ├── context/          # State: ProgramContext (useReducer, 12 actions) + ThemeContext
│   ├── types/            # Program/Day/Exercise interfaces
│   ├── data/             # Default training program (mobility, gym, ori, rest)
│   ├── utils/            # Storage, import/export, ID generation
│   ├── styles/           # Global CSS, navigation, theme CSS files
│   └── App.tsx           # Router provider (routeTree.gen auto-generated)
├── public/exercises/     # 7 SVG exercise illustrations (mobility)
└── vite.config.ts        # PWA config, GitHub Pages base path support
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add/edit routes | `src/routes/` | Use `createRoute` + `getParentRoute`, NOT `createFileRoute` |
| Route tree | `src/routeTree.gen.ts` | Auto-generated — never edit manually |
| State actions | `src/context/ProgramContext.tsx` | 12 action types in discriminated union |
| Data types | `src/types/program.ts` | Program → Day → Exercise hierarchy |
| Default data | `src/data/defaultProgram.ts` | `withIds()` helper for shared mobility exercises |
| Theme CSS vars | `src/styles/themes/dark-gym.css`, `polynesian.css` | Applied via `data-theme` on `<html>` |
| Global reset | `src/styles/global.css` | iOS zoom prevention, scrollbar, selection |
| Nav layout | `src/styles/navigation.css` | Fixed bottom nav + safe-area padding |
| UI components | `src/components/ui/` | Each has `.tsx` + `.module.css` pair |
| PWA config | `vite.config.ts` | `registerType: 'prompt'`, workbox globPatterns |
| Import validation | `src/utils/import.ts` | Runtime type guards for JSON import |

## CODE MAP

| Symbol | Type | File | Role |
|--------|------|------|------|
| `Program` | interface | types/program.ts | Root state: `{ days: Day[] }` |
| `Day` | interface | types/program.ts | id, name, sessionName, sessionType, exercises |
| `Exercise` | interface | types/program.ts | id, name, sets, reps, notes?, image? |
| `ProgramProvider` | component | context/ProgramContext.tsx | Wraps app, useReducer + debounced localStorage save (500ms) |
| `programReducer` | function | context/ProgramContext.tsx | 12 actions: CRUD days/exercises + move + import |
| `useProgram` | hook | context/ProgramContext.tsx | Read program state |
| `useProgramDispatch` | hook | context/ProgramContext.tsx | Dispatch actions |
| `ThemeProvider` | component | context/ThemeContext.tsx | Theme state + `data-theme` attribute sync |
| `useTheme` | hook | context/ThemeContext.tsx | `{ theme, toggleTheme, setTheme }` |
| `defaultProgram` | const | data/defaultProgram.ts | 7-day week: Mon-Wed mobility+dance, Thu upper, Fri lower, Sat ori+run, Sun rest |

## CONVENTIONS

- **Routing**: `createRoute({ getParentRoute: () => rootRoute, path, component })` — NOT file-based `createFileRoute`
- **CSS**: CSS Modules (`.module.css`) for components/routes, plain CSS for globals/nav/themes
- **Hooks in context**: Custom hooks (`useProgram`, `useTheme`) exported from their Context file, no separate `hooks/` directory
- **UI components**: Accept `className?` prop for composition. Variants via `variant` prop ("primary" | "secondary" | "danger"). All touch targets ≥ 44px.
- **State**: Context + useReducer only. No Redux/Zustand. Debounced auto-save to localStorage.
- **IDs**: `crypto.randomUUID()` for user-created items; deterministic `${prefix}-mob-${i}` for default program
- **Inline SVG icons**: All icons are inline `<svg>` elements, no icon library
- **Session types**: `'gym' | 'dance' | 'cardio' | 'rest'` — discriminated union, used for styling + icons
- **localStorage keys**: `aito-program`, `aito-theme`

## ANTI-PATTERNS (THIS PROJECT)

- **NO backend/API/database** — localStorage only, period
- **NO `as any`**, `@ts-ignore`, `@ts-expect-error` — strict TypeScript enforced
- **NO Redux, MobX, Zustand** — Context + useReducer is the ceiling
- **NO CSS-in-JS** (styled-components, emotion) — CSS Modules + CSS variables only
- **NO animation libraries** — CSS transitions only, keep bundle light
- **NO SSR** — pure client-side SPA
- **NO drag-and-drop** — use move up/down buttons for reordering
- **NO workout history/logging/tracking** — this is a program editor, not a tracker
- **NO user accounts or authentication**
- **NO reset-to-default button** — user explicitly declined this feature
- **NO `createFileRoute`** — causes duplicate route errors with this setup

## COMMANDS

```bash
npm run dev       # Vite dev server
npm run build     # tsc -b && vite build (TypeScript check + production build)
npm run lint      # ESLint (TS/TSX files only)
npm run preview   # Preview production build
```

## NOTES

- **PWA update**: Service worker checks for updates hourly. User gets a prompt toast, not auto-refresh.
- **GitHub Pages**: `base` in vite.config.ts reads `BASE_URL` env var for deployment path.
- **iOS zoom**: All text inputs forced to `font-size: 16px !important` to prevent auto-zoom on iOS Safari.
- **Mobility images**: 7 SVGs in `public/exercises/`, referenced by `Exercise.image` field. Only mobility exercises have images. Rendered as `<img>` in day detail view.
- **Theme switching**: `data-theme` attribute on `document.documentElement`. CSS custom properties cascade to all components. Transition on `background-color`, `color`, `border-color`.
- **Export filename**: `training-program-YYYY-MM-DD.json` (not "aito" — legacy naming).
- **Import validation**: Runtime type guards in `utils/import.ts` — validates full Program → Day → Exercise shape before accepting.
- **Desktop breakpoint**: Nav moves to top at `768px+`, but mobile is the primary target.
- **"Aito"**: Means "warrior" and "ironwood tree" in Tahitian.
