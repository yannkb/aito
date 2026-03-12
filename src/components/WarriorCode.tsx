import { useState } from 'react'
import { Card } from './ui/Card'
import { ChevronUpIcon, ChevronDownIcon } from './icons'
import { STORAGE_KEYS } from '../constants/storage'
import { quotes, toolkit, habits, getDailyQuote } from '../data/wisdom'
import styles from './WarriorCode.module.css'

interface WarriorCodeProps {
  className?: string
}

export function WarriorCode({ className }: WarriorCodeProps) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.HABITS_COLLAPSED) === 'true'
    } catch {
      return false
    }
  })

  const dailyQuote = getDailyQuote(quotes)

  function toggle() {
    const next = !collapsed
    setCollapsed(next)
    try {
      localStorage.setItem(STORAGE_KEYS.HABITS_COLLAPSED, String(next))
    } catch (error) {
      console.warn('Failed to persist collapse state:', error)
    }
  }

  return (
    <Card className={`${styles.warrior} ${className ?? ''}`} noPadding>
      <button
        type="button"
        className={styles.header}
        onClick={toggle}
        aria-expanded={!collapsed}
      >
        <span className={styles.title}>Warrior&#39;s Code</span>
        {collapsed ? <ChevronDownIcon size={18} /> : <ChevronUpIcon size={18} />}
      </button>

      <div className={styles.quoteSection}>
        <p className={styles.quoteText}>{dailyQuote.text}</p>
        {dailyQuote.author && (
          <p className={styles.quoteAuthor}>{'\u2014 '}{dailyQuote.author}</p>
        )}
      </div>

      {!collapsed && (
        <>
          <div className={styles.toolkitSection}>
            <h3 className={styles.sectionTitle}>When Life Hits</h3>
            <div className={styles.toolkitGrid}>
              {toolkit.map((entry) => (
                <span key={entry.trigger} className={styles.toolkitEntry}>
                  <span className={styles.toolkitTrigger}>{entry.trigger}</span>
                  {' \u2192 '}
                  {entry.action}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.habitsSection}>
            <h3 className={styles.sectionTitle}>Daily Habits</h3>
            <ol className={styles.habitList}>
              {habits.map((habit) => (
                <li key={habit.text} className={styles.habit}>
                  <span className={styles.habitIcon} aria-hidden="true">{habit.icon}</span>
                  <span>{habit.text}</span>
                </li>
              ))}
            </ol>
          </div>
        </>
      )}
    </Card>
  )
}
