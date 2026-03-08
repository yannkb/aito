import { Link } from '@tanstack/react-router'
import type { Day } from '../types/program'
import { Card } from './ui/Card'
import { Popover } from './ui/Popover'
import { EditIcon, DuplicateIcon, ChevronUpIcon, ChevronDownIcon, DeleteIcon, MoreIcon } from './icons'
import styles from './DayCard.module.css'

const SESSION_TYPE_ICONS: Record<Day['sessionType'], string> = {
  gym: '\u{1F3CB}',
  dance: '\u{1F483}',
  cardio: '\u{1F525}',
  rest: '\u{1F9D8}',
}

const BADGE_STYLES: Record<Day['sessionType'], string> = {
  gym: styles.badgeGym,
  dance: styles.badgeDance,
  cardio: styles.badgeCardio,
  rest: styles.badgeRest,
}

const TYPE_BADGE_STYLES: Record<Day['sessionType'], string> = {
  gym: styles.typeBadgeGym,
  dance: styles.typeBadgeDance,
  cardio: styles.typeBadgeCardio,
  rest: styles.typeBadgeRest,
}

interface DayCardProps {
  day: Day
  index: number
  totalDays: number
  isToday: boolean
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}

export function DayCard({
  day,
  index,
  totalDays,
  isToday,
  onEdit,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: DayCardProps) {
  return (
    <Card noPadding interactive={false} className={`${styles.dayCard} ${isToday ? styles.dayCardToday : ''}`} data-testid="day-card" data-today={isToday || undefined}>
      <Link
        to="/day/$dayId"
        params={{ dayId: day.id }}
        className={styles.dayCardMain}
      >
        <div className={`${styles.badge} ${BADGE_STYLES[day.sessionType]}`}>
          {SESSION_TYPE_ICONS[day.sessionType]}
        </div>
        <div className={styles.dayInfo}>
          <div className={styles.dayName}>
            {day.name}
            {isToday && <span className={styles.todayBadge}>Today</span>}
          </div>
          <div className={styles.sessionRow}>
            <span className={styles.sessionName}>{day.sessionName}</span>
            <span className={`${styles.typeBadge} ${TYPE_BADGE_STYLES[day.sessionType]}`}>
              {day.sessionType}
            </span>
          </div>
          {day.sessionType !== 'gym' && (
            <span className={styles.exerciseCount}>
              {day.exercises.length} exercise{day.exercises.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </Link>

      <Popover
        align="right"
        items={[
          {
            icon: <EditIcon />,
            label: 'Edit',
            onClick: onEdit,
          },
          {
            icon: <DuplicateIcon />,
            label: 'Duplicate',
            onClick: onDuplicate,
          },
          {
            icon: <ChevronUpIcon />,
            label: 'Move up',
            onClick: onMoveUp,
            disabled: index === 0,
          },
          {
            icon: <ChevronDownIcon />,
            label: 'Move down',
            onClick: onMoveDown,
            disabled: index === totalDays - 1,
          },
          {
            icon: <DeleteIcon />,
            label: 'Delete',
            onClick: onDelete,
            variant: 'danger',
          },
        ]}
        trigger={
          <button
            type="button"
            className={styles.moreButton}
            aria-label={`Actions for ${day.name}`}
          >
            <MoreIcon />
          </button>
        }
      />
    </Card>
  )
}
