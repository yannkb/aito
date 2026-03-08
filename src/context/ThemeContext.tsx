/* eslint-disable react-refresh/only-export-components */
import { createContext, use, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { STORAGE_KEYS } from '../constants/storage'

export type ThemeMode = 'auto' | 'dark-gym' | 'polynesian'
export type Theme = 'dark-gym' | 'polynesian'

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

function resolveTheme(mode: ThemeMode): Theme {
  if (mode === 'auto') return getSystemTheme()
  return mode
}

function isValidMode(value: string | null): value is ThemeMode {
  return value === 'auto' || value === 'dark-gym' || value === 'polynesian'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.THEME)
    return isValidMode(stored) ? stored : 'auto'
  })

  const [resolvedTheme, setResolvedTheme] = useState<Theme>(() => resolveTheme(mode))

  useEffect(() => {
    setResolvedTheme(resolveTheme(mode))
    localStorage.setItem(STORAGE_KEYS.THEME, mode)
  }, [mode])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme)
  }, [resolvedTheme])

  useEffect(() => {
    if (mode !== 'auto') return

    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      setResolvedTheme(e.matches ? 'dark-gym' : 'polynesian')
    }

    mql.addEventListener('change', handler)
    return () => {
      mql.removeEventListener('change', handler)
    }
  }, [mode])

  const setMode = useMemo(
    () => (newMode: ThemeMode) => {
      setModeState(newMode)
    },
    []
  )

  const value = useMemo(
    () => ({ theme: resolvedTheme, mode, setMode }),
    [resolvedTheme, mode, setMode]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = use(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
