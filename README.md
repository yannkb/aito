# Aito

Mobile-first PWA for managing a weekly training program combining gym workouts and ʻOri Tahiti (Polynesian dance).

> *Aito* means "warrior" and "ironwood tree" in Tahitian.

## Features

- Weekly program editor with day and exercise management
- Session types: gym, dance, cardio, rest
- Two themes: Dark Gym (default) and Polynesian Vibe
- Import/export programs as JSON
- Installable PWA with offline support
- No account required — all data stays in your browser

## Tech Stack

- React 19, TypeScript, Vite 7
- TanStack Router
- CSS Modules + CSS custom properties
- localStorage persistence
- Workbox (service worker)

## Getting Started

```bash
npm install
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | TypeScript check + production build |
| `npm run lint` | ESLint |
| `npm run preview` | Preview production build |
