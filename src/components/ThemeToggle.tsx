import type { ThemeMode } from '../context/ThemeContext'
import { useTheme } from '../context/ThemeContext'
import styles from './ThemeToggle.module.css'

interface ThemeOption {
  mode: ThemeMode
  label: string
  emoji: string
}

const THEMES: ThemeOption[] = [
  { mode: 'dark-gym', label: 'Dark Gym', emoji: '🏋️' },
  { mode: 'polynesian', label: 'Polynesian', emoji: '🌺' },
  { mode: 'berserk', label: 'Berserk', emoji: '⚔️' },
  { mode: 'dragon-ball', label: 'Dragon Ball', emoji: '🔥' },
]

export function ThemeToggle(): React.JSX.Element {
  const { theme, mode, setMode } = useTheme()
  const systemLabel = theme === 'polynesian' ? 'Light' : 'Dark'

  return (
    <div className={styles.container} role="group" aria-label="Theme selection">
      <button
        className={`${styles.autoButton} ${mode === 'auto' ? styles.active : ''}`}
        onClick={() => setMode('auto')}
        aria-pressed={mode === 'auto'}
        aria-label="Auto theme"
      >
        <span className={styles.emoji}>🌗</span>
        <span className={styles.label}>Auto ({systemLabel})</span>
      </button>

      <div className={styles.themeGrid}>
        {THEMES.map((option) => (
          <button
            key={option.mode}
            className={`${styles.themeButton} ${mode === option.mode ? styles.active : ''}`}
            onClick={() => setMode(option.mode)}
            aria-pressed={mode === option.mode}
            aria-label={`${option.label} theme`}
          >
            <span className={styles.emoji}>{option.emoji}</span>
            <span className={styles.label}>{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
