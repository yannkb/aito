import { useTheme } from '../context/ThemeContext'
import './ThemeToggle.css'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark-gym' ? 'polynesian' : 'dark-gym'} theme`}
    >
      <span className="theme-toggle-label">
        {theme === 'dark-gym' ? '🏋️ Dark Gym' : '🌺 Polynesian'}
      </span>
    </button>
  )
}
