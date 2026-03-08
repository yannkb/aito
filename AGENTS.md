# AITO — Project Knowledge Base

**Generated:** 2026-03-08 · **Commit:** 7fcfc8a · **Branch:** master

## OVERVIEW

Mobile-first PWA for managing a weekly training program combining gym workouts and ʻOri Tahiti (Polynesian dance). React 19 + Vite 7 + TanStack Router. No backend — localStorage only. Two themes: Dark Gym (default) + Polynesian Vibe.

## STRUCTURE

```
aito/
├── src/
│   ├── routes/           # TanStack Router pages (index, day detail, settings)
│   ├── components/ui/    # Reusable UI primitives (Button, Card, Modal, Input, Select, IconButton, Popover)
│   ├── components/       # Feature components (DayCard, DayForm, ExerciseCard, icons, ThemeToggle, Toast, ErrorBoundary)
│   ├── context/          # State: ProgramContext (useReducer, 14 actions) + ThemeContext + ToastContext
│   ├── constants/        # Centralized localStorage keys (STORAGE_KEYS)
│   ├── types/            # Program/Day/Exercise interfaces
│   ├── data/             # Default training program (mobility, gym, ori, rest)
│   ├── utils/            # Storage, import/export, ID generation, snapshot
│   ├── styles/           # Global CSS, navigation, theme CSS files
│   └── App.tsx           # Router provider (routeTree.gen auto-generated)
├── public/exercises/     # 7 SVG exercise illustrations (mobility)
└── vite.config.ts        # React Compiler, PWA, chunk splitting, GitHub Pages base
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add/edit routes | `src/routes/` | Use `createRoute` + `getParentRoute`, NOT `createFileRoute` |
| Route tree | `src/routeTree.gen.ts` | Auto-generated — never edit manually |
| State actions | `src/context/ProgramContext.tsx` | 14 action types in discriminated union, exhaustive `never` check |
| Data types | `src/types/program.ts` | Program → Day → Exercise hierarchy |
| Default data | `src/data/defaultProgram.ts` | `withIds()` helper for shared mobility exercises |
| Theme CSS vars | `src/styles/themes/dark-gym.css`, `polynesian.css` | Applied via `data-theme` on `<html>` |
| Global reset | `src/styles/global.css` | iOS zoom prevention, z-index tokens, theme transitions |
| Nav layout | `src/styles/navigation.css` | Fixed bottom nav + safe-area padding, backdrop-filter behind `@supports` |
| UI components | `src/components/ui/` | Each has `.tsx` + `.module.css` pair |
| Feature components | `src/components/` | DayCard, DayForm, ExerciseCard, icons, Toast, ErrorBoundary |
| PWA config | `vite.config.ts` | `registerType: 'prompt'`, workbox globPatterns, React Compiler, manualChunks |
| Import validation | `src/utils/import.ts` | Runtime type guards for JSON import (`isValidProgram` exported) |
| localStorage keys | `src/constants/storage.ts` | `STORAGE_KEYS.PROGRAM`, `STORAGE_KEYS.THEME` |
| Snapshot/undo | `src/utils/snapshot.ts` | `createProgramSnapshot()` — deep copy for undo toast |
| Shared icons | `src/components/icons.tsx` | EditIcon, DuplicateIcon, ChevronUpIcon, ChevronDownIcon, DeleteIcon, MoreIcon |

## CODE MAP

| Symbol | Type | File | Role |
|--------|------|------|------|
| `Program` | interface | types/program.ts | Root state: `{ days: Day[] }` |
| `Day` | interface | types/program.ts | id, name, sessionName, sessionType, exercises |
| `Exercise` | interface | types/program.ts | id, name, sets, reps, notes?, image? |
| `STORAGE_KEYS` | const | constants/storage.ts | `{ PROGRAM: 'aito-program', THEME: 'aito-theme' }` |
| `ProgramProvider` | component | context/ProgramContext.tsx | Wraps app, useReducer + debounced localStorage save (500ms) |
| `programReducer` | function | context/ProgramContext.tsx | 14 actions: CRUD days/exercises + move + duplicate + import + copy |
| `swapItems` | function | context/ProgramContext.tsx | Generic array swap helper used by all 4 move actions |
| `useProgram` | hook | context/ProgramContext.tsx | Read program state (via React 19 `use()`) |
| `useProgramDispatch` | hook | context/ProgramContext.tsx | Dispatch actions (via React 19 `use()`) |
| `useSaved` | hook | context/ProgramContext.tsx | Boolean — true briefly after auto-save |
| `ThemeProvider` | component | context/ThemeContext.tsx | Theme state + `data-theme` attribute sync, memoized value |
| `useTheme` | hook | context/ThemeContext.tsx | `{ theme, toggleTheme, setTheme }` |
| `ToastProvider` | component | context/ToastContext.tsx | Toast queue with auto-dismiss, action buttons, variants |
| `useToast` | hook | context/ToastContext.tsx | `{ showToast, dismissToast }` |
| `DayCard` | component | components/DayCard.tsx | Day list item with session badge, popover actions menu |
| `DayForm` | component | components/DayForm.tsx | Reusable form for add/edit day modals |
| `ExerciseCard` | component | components/ExerciseCard.tsx | Exercise list item with index, image, sets×reps, popover menu |
| `defaultProgram` | const | data/defaultProgram.ts | 7-day week: Mon-Wed mobility+dance, Thu upper, Fri lower, Sat ori+run, Sun rest |
| `generateId` | function | utils/id.ts | `crypto.randomUUID()` wrapper |
| `saveProgram` | function | utils/storage.ts | JSON.stringify → localStorage (uses STORAGE_KEYS) |
| `loadProgram` | function | utils/storage.ts | localStorage → validated with `isValidProgram()`, no `as` cast |
| `isValidProgram` | function | utils/import.ts | Type guard: validates full Program → Day → Exercise shape |
| `importProgram` | function | utils/import.ts | File → JSON parse → validate → `Promise<Program>` |
| `exportProgram` | function | utils/export.ts | Download as `training-program-YYYY-MM-DD.json` |
| `createProgramSnapshot` | function | utils/snapshot.ts | Deep copy program (spread days + exercises) for undo |

## CONVENTIONS

- **Routing**: `createRoute({ getParentRoute: () => rootRoute, path, component })` — NOT file-based `createFileRoute`
- **CSS**: CSS Modules (`.module.css`) for components/routes, plain CSS for globals/nav/themes
- **State**: Context + useReducer only. Debounced auto-save to localStorage. Exhaustive `never` check in reducer default case.
- **Context hooks**: React 19 `use()` API (not `useContext`). Custom hooks exported from their Context file, no separate `hooks/` directory.
- **UI components**: Accept `className?` prop for composition. Variants via `variant` prop ("primary" | "secondary" | "danger"). All touch targets ≥ 44px.
- **IDs**: `generateId()` (crypto.randomUUID) for user-created items; deterministic `${prefix}-mob-${i}` for default program
- **Icons**: Shared SVG components in `components/icons.tsx` with `size` prop. Nav icons in `__root.tsx` stay inline.
- **Session types**: `'gym' | 'dance' | 'cardio' | 'rest'` — discriminated union, used for styling + icons
- **localStorage keys**: Centralized in `constants/storage.ts` — `STORAGE_KEYS.PROGRAM`, `STORAGE_KEYS.THEME`
- **Imports**: `verbatimModuleSyntax: true` — all type-only imports MUST use `import type`
- **Page titles**: React 19 JSX `<title>` element in `__root.tsx` (not `document.title` useEffect)
- **Z-index tokens**: `--z-nav: 100`, `--z-toast: 200`, `--z-modal: 1000`, `--z-popover: 1100` defined in `#root`
- **Theme transitions**: Scoped to `button, a, input, select, textarea` only (not `*`)
- **Backdrop-filter**: Wrapped in `@supports` + `@media (prefers-reduced-motion: no-preference)`
- **Provider order** (main.tsx): ErrorBoundary → ThemeProvider → ProgramProvider → ToastProvider → App

## ANTI-PATTERNS (THIS PROJECT)

- **NO backend/API/database** — localStorage only, period
- **NO `as any`**, `@ts-ignore`, `@ts-expect-error` — strict TypeScript enforced
- **NO implicit type imports** — `verbatimModuleSyntax` requires `import type`
- **NO Redux, MobX, Zustand** — Context + useReducer is the ceiling
- **NO CSS-in-JS** (styled-components, emotion) — CSS Modules + CSS variables only
- **NO animation libraries** — CSS transitions only, keep bundle light
- **NO SSR** — pure client-side SPA
- **NO drag-and-drop** — use move up/down buttons for reordering
- **NO workout history/logging/tracking** — this is a program editor, not a tracker
- **NO user accounts or authentication**
- **NO reset-to-default button** — user explicitly declined this feature
- **NO `createFileRoute`** — causes duplicate route errors with this setup
- **NO `useContext`** — use React 19 `use()` API instead

## GUIDELINES

### General

- **Read before writing.** Always read the existing file before editing. Match the surrounding code style exactly.
- **Minimal diffs.** Change only what's needed. Don't refactor adjacent code while fixing a bug. Don't restructure imports unless the task requires it.
- **One concern per file.** Components do rendering. Context files do state. Utils do logic. Don't mix responsibilities.
- **Name things for what they do, not what they are.** `createProgramSnapshot` > `cloneHelper`. `swapItems` > `arrayUtil`.
- **No dead code.** Don't leave commented-out code, unused imports, or empty catch blocks.
- **Fail explicitly.** Throw errors with descriptive messages. Validate inputs at boundaries (localStorage loads, JSON imports, URL params). Never silently swallow errors.
- **Keep files under 300 lines.** If a route file grows fat, extract components. If a reducer gets complex, extract helpers above it. The extraction pattern is already established (DayCard, ExerciseCard, swapItems, createProgramSnapshot).

### TypeScript

- **`strict: true` is non-negotiable.** All strict flags are enabled: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `erasableSyntaxOnly`.
- **`import type` for types.** `verbatimModuleSyntax` is enabled — type-only imports must use `import type { X }`, not `import { X }`.
- **No type assertions.** Don't use `as`, `as any`, `as unknown`. Use type guards (`isValidProgram`) or proper generics (`swapItems<T>`). The only allowed assertion is `as const` on literal objects.
- **Exhaustive switches.** Every switch on a discriminated union must have a `default: { const _exhaustive: never = value; return _exhaustive; }` case. This catches missing handlers at compile time.
- **Discriminated unions over booleans.** Session types are `'gym' | 'dance' | 'cardio' | 'rest'`, not `isGym: boolean`. Action types are a union, not string constants.

### React 19

- **`use()` over `useContext()`.** This project uses the React 19 `use()` API for context consumption. All three context files follow this pattern.
- **JSX `<title>` over `document.title`.** React 19 hoists `<title>` to `<head>` automatically. See `__root.tsx` for the pattern.
- **React Compiler is active.** `babel-plugin-react-compiler` auto-memoizes components. You rarely need manual `useMemo`/`useCallback` except for context values passed to providers (see ThemeContext).
- **Don't fight the Compiler.** Avoid patterns that break React Compiler: mutating objects in render, reading refs during render, non-idempotent render functions. Keep components pure.

### CSS & Styling

- **CSS Modules for components, plain CSS for globals.** Every `.tsx` component gets a `.module.css` file. Global styles (reset, nav, themes) use plain `.css`.
- **CSS custom properties for theming.** All colors, shadows, fonts, and radii are defined as `--color-*`, `--shadow-*`, `--font-*`, `--radius-*` in theme files. Never hardcode color values in component CSS.
- **Use the z-index tokens.** `var(--z-nav)`, `var(--z-toast)`, `var(--z-modal)`, `var(--z-popover)`. Never use magic z-index numbers.
- **44px minimum touch targets.** All interactive elements (buttons, links, inputs) must be at least 44×44px. This is an iOS/mobile accessibility requirement.
- **Mobile-first.** Write styles for mobile, then add `@media (min-width: 768px)` for desktop. Mobile is the primary target.
- **No `*` selectors for transitions.** Theme transitions are scoped to interactive elements only (`button, a, input, select, textarea`). Broad `*` transitions cause jank.
- **`@supports` for progressive enhancement.** Wrap `backdrop-filter` and other cutting-edge properties in `@supports` queries with `prefers-reduced-motion` checks.

### State Management

- **Context + useReducer only.** No external state libraries. If state needs to be shared, add it to an existing context or create a new one following the established pattern.
- **Dispatch actions, don't set state directly.** All program mutations go through `useProgramDispatch()`. Every action type is in the `ProgramAction` union.
- **Add new actions to the union.** When adding a new action: (1) add the type to `ProgramAction`, (2) add the case to `programReducer`, (3) the exhaustive check will catch you if you forget.
- **Snapshot before destructive actions.** Use `createProgramSnapshot(program)` before dispatching delete/move operations, so undo can restore via `LOAD_PROGRAM`.
- **Use `STORAGE_KEYS` constants.** Never hardcode `'aito-program'` or `'aito-theme'`. Import from `constants/storage.ts`.

### Components

- **Props interface above the component.** Define `interface XProps { ... }` immediately before `export function X`.
- **Callbacks as props, not context.** Extracted components (DayCard, ExerciseCard) receive `onEdit`, `onDelete`, `onMoveUp` callbacks. They don't call `useProgramDispatch()` directly — the parent route orchestrates.
- **UI primitives are dumb.** `components/ui/` components accept data and callbacks. They have no knowledge of program state, routing, or business logic.
- **Popover items are declarative.** Build the `items` array with `icon`, `label`, `onClick`, `variant`, `disabled` — the Popover handles rendering and positioning.
- **Use shared icons.** Import from `components/icons.tsx`. Don't inline SVGs in feature components. Only `__root.tsx` nav icons stay inline.

### Adding New Features

1. **New route:** Create in `src/routes/`, use `createRoute({ getParentRoute: () => rootRoute })`. Add to `routeTree.gen.ts` imports. Add nav link in `__root.tsx` if needed.
2. **New action:** Add type to `ProgramAction` union → add case to `programReducer` → exhaustive check enforces completeness.
3. **New component:** Create `.tsx` + `.module.css` pair. If it's reusable UI → `components/ui/`. If it's feature-specific → `components/`. Accept `className?` prop.
4. **New theme variable:** Add to BOTH `dark-gym.css` AND `polynesian.css`. Use `var(--your-variable)` in component CSS. Forgetting one theme file = broken styling.
5. **New localStorage key:** Add to `STORAGE_KEYS` in `constants/storage.ts`. Never use raw string keys.

## COMMANDS

```bash
npm run dev       # Vite dev server (requires Node ≥20.19)
npm run build     # tsc -b && vite build (TypeScript check + production build)
npm run lint      # ESLint (TS/TSX files only)
npm run preview   # Preview production build
```

## NOTES

- **React Compiler**: Enabled via `babel-plugin-react-compiler` in vite.config.ts. Auto-memoizes components.
- **Chunk splitting**: `manualChunks` in vite.config.ts splits vendor (react/react-dom), router (@tanstack/react-router), and app code.
- **PWA update**: Service worker checks for updates hourly. User gets a prompt toast, not auto-refresh.
- **GitHub Pages**: `base` in vite.config.ts reads `BASE_URL` env var for deployment path.
- **iOS zoom**: All text inputs forced to `font-size: 16px !important` to prevent auto-zoom on iOS Safari.
- **Mobility images**: 7 SVGs in `public/exercises/`, referenced by `Exercise.image` field. Only mobility exercises have images.
- **Theme switching**: `data-theme` attribute on `document.documentElement`. CSS custom properties cascade. ThemeContext value is memoized.
- **Export filename**: `training-program-YYYY-MM-DD.json` (not "aito" — legacy naming).
- **Import validation**: Runtime type guards in `utils/import.ts` — validates full Program → Day → Exercise shape. Also used by `loadProgram()` for safe localStorage reads.
- **Desktop breakpoint**: Nav moves to top at `768px+`, but mobile is the primary target.
- **Node version**: Vite 7.3 requires Node.js ≥20.19. Use `fnm install 22` if on older version.
- **"Aito"**: Means "warrior" and "ironwood tree" in Tahitian.
