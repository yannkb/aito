import type { ThemeMode } from '../context/ThemeContext'
import { useTheme } from '../context/ThemeContext'
import styles from './ThemeToggle.module.css'

interface SegmentOption {
  mode: ThemeMode
  label: string
  emoji: string
}

const OPTIONS: SegmentOption[] = [
  { mode: 'auto', label: 'Auto', emoji: '🌗' },
  { mode: 'dark-gym', label: 'Dark Gym', emoji: '🏋️' },
  { mode: 'polynesian', label: 'Polynesian', emoji: '🌺' },
]

function getSystemLabel(): string {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Dark' : 'Light'
}

export function ThemeToggle() {
  const { mode, setMode } = useTheme()

  return (
    <div className={styles.segmented} role="group" aria-label="Theme selection">
      {OPTIONS.map((option) => (
        <button
          key={option.mode}
          className={`${styles.segment} ${mode === option.mode ? styles.active : ''}`}
          onClick={() => setMode(option.mode)}
          aria-pressed={mode === option.mode}
          aria-label={`${option.label} theme`}
        >
          <span className={styles.emoji}>{option.emoji}</span>
          <span className={styles.label}>
            {option.mode === 'auto' ? `Auto (${getSystemLabel()})` : option.label}
          </span>
        </button>
      ))}
    </div>
  )
}
