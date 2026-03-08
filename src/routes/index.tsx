import { useState, useEffect } from 'react'
import { createRoute, Link } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import { useProgram, useProgramDispatch } from '../context/ProgramContext'
import { useToast } from '../context/ToastContext'
import type { Day } from '../types/program'
import { generateId } from '../utils/id'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Popover } from '../components/ui/Popover'
import styles from './index.module.css'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomeComponent,
})

const SESSION_TYPE_OPTIONS = [
  { value: 'gym', label: 'Gym' },
  { value: 'dance', label: 'Dance' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'rest', label: 'Rest' },
]

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

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function getTodayName(): string {
  return DAY_NAMES[new Date().getDay()]
}

function HomeComponent() {
  const program = useProgram()
  const dispatch = useProgramDispatch()
  const { showToast } = useToast()
  const todayName = getTodayName()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingDay, setEditingDay] = useState<Day | null>(null)
  const [formName, setFormName] = useState('')
  const [formSession, setFormSession] = useState('')
  const [formType, setFormType] = useState<Day['sessionType']>('gym')

  useEffect(() => {
    const timer = setTimeout(() => {
      const el = document.querySelector('[data-today="true"]')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 50)
    return () => clearTimeout(timer)
  }, [])

  const nameExists = formName.trim() !== '' && program.days.some(
    d => d.name.toLowerCase() === formName.trim().toLowerCase() && d.id !== editingDay?.id
  )

  function openAddModal() {
    setEditingDay(null)
    setFormName('')
    setFormSession('')
    setFormType('gym')
    setModalOpen(true)
  }

  function openEditModal(day: Day) {
    setEditingDay(day)
    setFormName(day.name)
    setFormSession(day.sessionName)
    setFormType(day.sessionType)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingDay(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formName.trim() || !formSession.trim()) return

    if (editingDay) {
      dispatch({
        type: 'UPDATE_DAY',
        payload: {
          dayId: editingDay.id,
          updates: {
            name: formName.trim(),
            sessionName: formSession.trim(),
            sessionType: formType,
          },
        },
      })
    } else {
      const newDay: Day = {
        id: generateId(),
        name: formName.trim(),
        sessionName: formSession.trim(),
        sessionType: formType,
        exercises: [],
      }
      dispatch({ type: 'ADD_DAY', payload: newDay })
    }

    closeModal()
  }

  function handleDelete(day: Day) {
    const snapshot = { ...program, days: [...program.days.map(d => ({ ...d, exercises: [...d.exercises] }))] }
    dispatch({ type: 'DELETE_DAY', payload: { dayId: day.id } })
    showToast({
      message: `${day.name} deleted`,
      action: {
        label: 'Undo',
        onClick: () => dispatch({ type: 'LOAD_PROGRAM', payload: snapshot })
      }
    })
  }

  if (program.days.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>{'\u{1F4CB}'}</div>
          <h2 className={styles.emptyTitle}>No training days yet</h2>
          <p className={styles.emptyDescription}>
            Build your weekly program by adding training days. Mix gym sessions,
            dance practice, cardio, and rest days.
          </p>
          <Button onClick={openAddModal} size="lg" data-testid="add-first-day">
            Add your first day
          </Button>
        </div>

        <Modal
          open={modalOpen}
          onClose={closeModal}
          title="Add Day"
        >
          <DayForm
            formName={formName}
            formSession={formSession}
            formType={formType}
            onNameChange={setFormName}
            onSessionChange={setFormSession}
            onTypeChange={setFormType}
            onSubmit={handleSubmit}
            onCancel={closeModal}
            submitLabel="Add Day"
            nameWarning={nameExists ? 'A day with this name already exists' : undefined}
          />
        </Modal>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.dayList} data-testid="day-list">
        {program.days.map((day, index) => (
          <DayCard
            key={day.id}
            day={day}
            index={index}
            totalDays={program.days.length}
            isToday={day.name.toLowerCase() === todayName.toLowerCase()}
            onEdit={() => openEditModal(day)}
            onDuplicate={() => dispatch({ type: 'DUPLICATE_DAY', payload: { dayId: day.id } })}
            onDelete={() => handleDelete(day)}
            onMoveUp={() =>
              dispatch({ type: 'MOVE_DAY_UP', payload: { dayId: day.id } })
            }
            onMoveDown={() =>
              dispatch({ type: 'MOVE_DAY_DOWN', payload: { dayId: day.id } })
            }
          />
        ))}
      </div>

      <div className={styles.addDaySection}>
        <Button
          fullWidth
          variant="secondary"
          onClick={openAddModal}
          data-testid="add-day"
        >
          + Add Day
        </Button>
      </div>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingDay ? 'Edit Day' : 'Add Day'}
      >
        <DayForm
          formName={formName}
          formSession={formSession}
          formType={formType}
          onNameChange={setFormName}
          onSessionChange={setFormSession}
          onTypeChange={setFormType}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          submitLabel={editingDay ? 'Save Changes' : 'Add Day'}
          nameWarning={nameExists ? 'A day with this name already exists' : undefined}
        />
      </Modal>

    </div>
  )
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

function DayCard({
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
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
            label: 'Edit',
            onClick: onEdit,
          },
          {
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>,
            label: 'Duplicate',
            onClick: onDuplicate,
          },
          {
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>,
            label: 'Move up',
            onClick: onMoveUp,
            disabled: index === 0,
          },
          {
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>,
            label: 'Move down',
            onClick: onMoveDown,
            disabled: index === totalDays - 1,
          },
          {
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>,
            label: 'Delete',
            onClick: onDelete,
            variant: 'danger' as const,
          },
        ]}
        trigger={
          <button
            type="button"
            className={styles.moreButton}
            aria-label={`Actions for ${day.name}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>
        }
      />
    </Card>
  )
}

interface DayFormProps {
  formName: string
  formSession: string
  formType: Day['sessionType']
  onNameChange: (val: string) => void
  onSessionChange: (val: string) => void
  onTypeChange: (val: Day['sessionType']) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  submitLabel: string
  nameWarning?: string
}

function DayForm({
  formName,
  formSession,
  formType,
  onNameChange,
  onSessionChange,
  onTypeChange,
  onSubmit,
  onCancel,
  submitLabel,
  nameWarning,
}: DayFormProps) {
  return (
    <form onSubmit={onSubmit} className={styles.formStack}>
      <Input
        label="Day Name"
        placeholder="e.g. Monday"
        value={formName}
        onChange={(e) => onNameChange(e.target.value)}
        required
        error={nameWarning}
        data-testid="day-name-input"
      />
      <Input
        label="Session Name"
        placeholder="e.g. Push, Ori Tahiti"
        value={formSession}
        onChange={(e) => onSessionChange(e.target.value)}
        required
        data-testid="session-name-input"
      />
      <Select
        label="Session Type"
        options={SESSION_TYPE_OPTIONS}
        value={formType}
        onChange={(e) => onTypeChange(e.target.value as Day['sessionType'])}
        required
        data-testid="session-type-select"
      />
      <div className={styles.formActions}>
        <Button variant="secondary" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" data-testid="submit-day">
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
