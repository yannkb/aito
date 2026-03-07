import { useState } from 'react'
import { createRoute, Link } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import { useProgram, useProgramDispatch } from '../context/ProgramContext'
import type { Day } from '../types/program'
import { generateId } from '../utils/id'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
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

function HomeComponent() {
  const program = useProgram()
  const dispatch = useProgramDispatch()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingDay, setEditingDay] = useState<Day | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Day | null>(null)
  const [formName, setFormName] = useState('')
  const [formSession, setFormSession] = useState('')
  const [formType, setFormType] = useState<Day['sessionType']>('gym')

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

  function confirmDelete() {
    if (!deleteTarget) return
    dispatch({ type: 'DELETE_DAY', payload: { dayId: deleteTarget.id } })
    setDeleteTarget(null)
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
          />
        </Modal>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>My Program</h1>
        <p className={styles.subtitle}>
          {program.days.length} day{program.days.length !== 1 ? 's' : ''} planned
        </p>
      </header>

      <div className={styles.dayList} data-testid="day-list">
        {program.days.map((day, index) => (
          <DayCard
            key={day.id}
            day={day}
            index={index}
            totalDays={program.days.length}
            onEdit={() => openEditModal(day)}
            onDelete={() => setDeleteTarget(day)}
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
        />
      </Modal>

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete Day"
      >
        <div className={styles.deleteConfirm}>
          <p className={styles.deleteMessage}>
            Remove <strong>{deleteTarget?.name}</strong> and all its exercises?
            This cannot be undone.
          </p>
          <div className={styles.deleteActions}>
            <Button
              variant="secondary"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              data-testid="confirm-delete"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

interface DayCardProps {
  day: Day
  index: number
  totalDays: number
  onEdit: () => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}

function DayCard({
  day,
  index,
  totalDays,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: DayCardProps) {
  return (
    <Card noPadding interactive={false} className={styles.dayCard} data-testid="day-card">
      <Link
        to="/day/$dayId"
        params={{ dayId: day.id }}
        className={styles.dayCardMain}
      >
        <div className={`${styles.badge} ${BADGE_STYLES[day.sessionType]}`}>
          {SESSION_TYPE_ICONS[day.sessionType]}
        </div>
        <div className={styles.dayInfo}>
          <div className={styles.dayName}>{day.name}</div>
          <div className={styles.sessionRow}>
            <span className={styles.sessionName}>{day.sessionName}</span>
            <span className={`${styles.typeBadge} ${TYPE_BADGE_STYLES[day.sessionType]}`}>
              {day.sessionType}
            </span>
          </div>
          <span className={styles.exerciseCount}>
            {day.exercises.length} exercise{day.exercises.length !== 1 ? 's' : ''}
          </span>
        </div>
        <span className={styles.chevron}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </span>
      </Link>

      <div className={styles.dayActions}>
        <button
          onClick={onMoveUp}
          disabled={index === 0}
          aria-label={`Move ${day.name} up`}
          type="button"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
        <div className={styles.actionDivider} />
        <button
          onClick={onMoveDown}
          disabled={index === totalDays - 1}
          aria-label={`Move ${day.name} down`}
          type="button"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        <div className={styles.actionDivider} />
        <button
          onClick={onEdit}
          aria-label={`Edit ${day.name}`}
          type="button"
          data-testid="edit-day"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <div className={styles.actionDivider} />
        <button
          onClick={onDelete}
          aria-label={`Delete ${day.name}`}
          type="button"
          data-testid="delete-day"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
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
}: DayFormProps) {
  return (
    <form onSubmit={onSubmit} className={styles.formStack}>
      <Input
        label="Day Name"
        placeholder="e.g. Monday"
        value={formName}
        onChange={(e) => onNameChange(e.target.value)}
        required
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
