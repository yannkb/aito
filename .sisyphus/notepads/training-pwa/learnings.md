
# Task 6 Learnings: App Shell + TanStack Router

## Date: 2026-03-07

## Routing Setup
- TanStack Router v1.166.2 requires careful route setup
- File-based routing with `createFileRoute` can be problematic - safer to use manual `createRoute` with `getParentRoute`
- Route tree structure:
  - Root route: `createRootRoute()`
  - Child routes: `createRoute({ getParentRoute: () => rootRoute, path: '/...' })`
  - Route tree exported from `routeTree.gen.ts`
- Avoided "Duplicate routes" error by using proper parent-child relationship setup

## Navigation Implementation
- Mobile-first bottom navigation bar approach
- Used fixed positioning with backdrop-filter blur effect
- SVG icons for Program and Settings
- Active state styling with `activeProps` from TanStack Router
- Bottom nav height: 72px with proper padding-bottom on content area

## Route Structure
- `/` - Home/Weekly Overview
- `/settings` - Settings page
- `/day/:dayId` - Day detail with dynamic parameter
- All routes use placeholder content with clear messaging

## CSS Organization
- Created separate `navigation.css` for nav-specific styles
- Imported in `__root.tsx` component
- Responsive design with tablet/desktop breakpoints (@media 768px)
- Bottom nav transforms to top nav on larger screens

## Theme Integration
- Applied `data-theme="dark-gym"` to root element in __root.tsx
- Theme CSS variables work correctly across all routes
- CSS custom properties (--surface-base, --text-primary, etc.) properly inherited

## Build Verification
- TypeScript compilation successful
- Vite build completed without errors
- All routes accessible and functional
- No console errors in browser (except React DevTools warning)

## QA Results
- Routes render correctly: ✓
- Navigation functional: ✓
- URL changes on navigation: ✓
- Active state highlighting works: ✓
- Dynamic route params work (/day/monday): ✓

# Task 9 Learnings: Shared UI Components

## Date: 2026-03-07

## CSS Modules with Vite
- Vite supports `.module.css` natively — no config needed
- Import as `import styles from './Component.module.css'`
- Class names accessed as `styles.className`
- Works seamlessly with TypeScript (no declaration files needed for basic usage)

## Component Design Patterns
- All interactive elements enforce min 44px height/width (Apple HIG touch targets)
- `verbatimModuleSyntax: true` in tsconfig requires `import type` for type-only imports
- Used `useId()` hook for accessible label-input association
- Modal uses focus trap with keyboard event listener + `requestAnimationFrame` for initial focus

## Theme Token Discipline
- Zero hardcoded hex colors — all via `var(--color-*)` tokens
- Danger button uses muted bg + danger text (avoids needing a `--color-text-on-danger` token)
- Danger hover inverts to full danger bg with `var(--color-bg)` text — works for both themes
- `font-size: 1rem` (16px) on Input/Select prevents iOS Safari zoom-on-focus

## Mobile-First CSS Details
- Modal slides up from bottom on small screens (sheet pattern), centers on taller viewports
- `-webkit-tap-highlight-color: transparent` removes blue flash on mobile tap
- `touch-action: manipulation` prevents double-tap zoom delay
- `overscroll-behavior: contain` prevents scroll chaining in modals
- `-webkit-appearance: none` on Select removes native styling for custom chevron

## Component API Conventions
- Extend native HTML attributes (`ButtonHTMLAttributes`, `InputHTMLAttributes`, etc.)
- Spread `...props` last to allow consumer overrides
- `className` prop merged with internal classes for composability
- IconButton requires `aria-label` via TypeScript interface (accessibility enforced at type level)

## Files Created
- `src/components/ui/Button.tsx` + `Button.module.css` — primary/secondary/danger + sm/md/lg sizes
- `src/components/ui/Card.tsx` + `Card.module.css` — elevated/interactive/noPadding variants
- `src/components/ui/Modal.tsx` + `Modal.module.css` — backdrop click close, focus trap, ESC key, body scroll lock
- `src/components/ui/Input.tsx` + `Input.module.css` — label, error state, 16px font, ARIA
- `src/components/ui/Select.tsx` + `Select.module.css` — options array, placeholder, custom chevron
- `src/components/ui/IconButton.tsx` + `IconButton.module.css` — 44x44px, default/danger/primary + rounded

# Task 12 Learnings: Day Detail Route (Exercise CRUD)

## Date: 2026-03-07

## Route Implementation
- Existing placeholder in `day.$dayId.tsx` only needed body replacement, not full file rewrite
- Route was already registered in `routeTree.gen.ts` from Task 6
- `Route.useParams()` provides typed `dayId` from URL

## State Management Integration
- `useProgram()` returns full program, find day via `program.days.find(d => d.id === dayId)`
- All CRUD through `useProgramDispatch()`: ADD_EXERCISE, UPDATE_EXERCISE, DELETE_EXERCISE
- Reorder via MOVE_EXERCISE_UP/MOVE_EXERCISE_DOWN with dayId + exerciseId payload
- UPDATE_DAY for header editing takes `dayId` + `updates` partial
- Auto-save via ProgramContext's 500ms debounce works transparently

## Modal Form Pattern
- Shared modal for Add/Edit: `editingExercise` null = add mode, populated = edit mode
- Reset form state in `openAddModal`, pre-fill in `openEditModal`
- Validation: check required fields + sets >= 1 integer before dispatch
- ID generation for new exercises: `ex-${Date.now()}-${random}`

## UI Component Usage
- Input component spreads `...props` onto `<input>`, so data-testid attrs pass through correctly
- Input with `type="number" min={1}` works for sets
- No built-in Textarea component — used native `<textarea>` styled via CSS Modules
- IconButton `variant="danger"` for delete actions, `disabled` for first/last reorder bounds
- Modal `open` prop controls visibility, `onClose` for backdrop/ESC dismissal

## CSS Modules Patterns
- Exercise card: index column | body | actions layout with flexbox
- Staggered animation-delay on exercise cards (nth-child 1-10)
- Sticky top bar with `position: sticky; z-index: 10; background: var(--color-bg)`
- Sticky add button bar at bottom with gradient fade
- `composes: actionBtn` for composing base + danger button styles

## Playwright QA
- `browser_fill_form` can cause navigation if it clicks outside modal backdrop
- More reliable: use `browser_run_code` with full scenario in one async function
- Dev server (Vite) can drop connection between Playwright interactions — restart when needed
- Test IDs work well for targeting: `[data-testid="exercise-card"]`, `[data-testid="sets-reps"]`
- `aria-label` targeting for specific exercise actions: `[aria-label="Edit Bench Press"]`

## QA Results
- Scenario 1 (Day detail): 6 exercises, "Monday" heading, "4 × 6-8" for Bench Press ✓
- Scenario 2 (Add exercise): Skull Crushers added as 7th card, "3 × 10-12" ✓
- Scenario 3 (Edit exercise): Pre-filled values correct, reps changed to "8-10" ✓
- Scenario 4 (Delete exercise): Skull Crushers removed, back to 6 cards ✓
- Scenario 5 (Persistence): "4 × 8-10" survived navigation away and back ✓
