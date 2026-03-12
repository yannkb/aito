/* eslint-disable react-refresh/only-export-components */
import { createContext, use, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { STORAGE_KEYS } from '../constants/storage'

export type ThemeMode = 'auto' | 'dark-gym' | 'polynesian' | 'berserk' | 'dragon-ball'
export type Theme = 'dark-gym' | 'polynesian' | 'berserk' | 'dragon-ball'

interface ThemeContextType {
  theme: Theme
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark-gym'
    : 'polynesian'
}

const VALID_MODES: ReadonlySet<string> = new Set<ThemeMode>(['auto', 'dark-gym', 'polynesian', 'berserk', 'dragon-ball'])

function isValidMode(value: string | null): value is ThemeMode {
  return value !== null && VALID_MODES.has(value)
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.THEME)
    return isValidMode(stored) ? stored : 'auto'
  })

  const [systemTheme, setSystemTheme] = useState<Theme>(getSystemTheme)

  const resolvedTheme = mode === 'auto' ? systemTheme : mode

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, mode)
  }, [mode])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme)
  }, [resolvedTheme])

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark-gym' : 'polynesian')
    }
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  const value = useMemo(
    () => ({ theme: resolvedTheme, mode, setMode: setModeState }),
    [resolvedTheme, mode]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextType {
  const context = use(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
