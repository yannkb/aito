import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { useProgram, useProgramDispatch } from '../context/ProgramContext'
import { useToast } from '../context/ToastContext'
import { createProgramSnapshot } from '../utils/snapshot'
import { generateId } from '../utils/id'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { ExerciseCard } from '../components/ExerciseCard'
import { ExerciseForm } from '../components/ExerciseForm'
import { CopyExercisesModal } from '../components/CopyExercisesModal'
import { EditIcon, BarbellIcon, ExternalLinkIcon } from '../components/icons'
import type { Day, Exercise } from '../types/program'
import { Route } from './day.$dayId'
import styles from './day.$dayId.module.css'

const SESSION_BADGE_STYLES: Record<Day['sessionType'], string> = {
  gym: styles.sessionBadgeGym,
  dance: styles.sessionBadgeDance,
  cardio: styles.sessionBadgeCardio,
  rest: styles.sessionBadgeRest,
}

export default function DayDetailComponent() {
  const { dayId } = Route.useParams()
  const program = useProgram()
  const dispatch = useProgramDispatch()
  const { showToast } = useToast()

  const day = program.days.find((d) => d.id === dayId)

  const [exerciseModalOpen, setExerciseModalOpen] = useState(false)
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)
  const [copyModalOpen, setCopyModalOpen] = useState(false)
  const [editingHeader, setEditingHeader] = useState(false)
  const [headerName, setHeaderName] = useState('')
  const [headerSession, setHeaderSession] = useState('')
  const [headerNotes, setHeaderNotes] = useState('')

  function openAddModal() {
    setEditingExercise(null)
    setExerciseModalOpen(true)
  }

  function openEditModal(exercise: Exercise) {
    setEditingExercise(exercise)
    setExerciseModalOpen(true)
  }

  function closeExerciseModal() {
    setExerciseModalOpen(false)
    setEditingExercise(null)
  }

  function handleExerciseSubmit(data: { name: string; sets: number; reps: string; notes?: string }) {
    if (!day) return

    if (editingExercise) {
      dispatch({
        type: 'UPDATE_EXERCISE',
        payload: {
          dayId: day.id,
          exerciseId: editingExercise.id,
          updates: data,
        },
      })
    } else {
      dispatch({
        type: 'ADD_EXERCISE',
        payload: { dayId: day.id, exercise: { id: generateId(), ...data } },
      })
    }
    closeExerciseModal()
  }

  function handleDeleteExercise(exercise: Exercise) {
    if (!day) return
    const snapshot = createProgramSnapshot(program)
    dispatch({
      type: 'DELETE_EXERCISE',
      payload: { dayId: day.id, exerciseId: exercise.id },
    })
    showToast({
      message: `${exercise.name} deleted`,
      action: {
        label: 'Undo',
        onClick: () => dispatch({ type: 'LOAD_PROGRAM', payload: snapshot })
      }
    })
  }

  function handleCopyExercises(sourceDayId: string) {
    if (!day) return
    dispatch({
      type: 'COPY_EXERCISES_FROM_DAY',
      payload: { targetDayId: day.id, sourceDayId },
    })
    setCopyModalOpen(false)
    showToast({ message: 'Exercises copied', variant: 'success' })
  }

  function handleMoveUp(exerciseId: string) {
    if (!day) return
    dispatch({
      type: 'MOVE_EXERCISE_UP',
      payload: { dayId: day.id, exerciseId },
    })
  }

  function handleMoveDown(exerciseId: string) {
    if (!day) return
    dispatch({
      type: 'MOVE_EXERCISE_DOWN',
      payload: { dayId: day.id, exerciseId },
    })
  }

  function startEditHeader() {
    if (!day) return
    setHeaderName(day.name)
    setHeaderSession(day.sessionName)
    setHeaderNotes(day.notes ?? '')
    setEditingHeader(true)
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'n' || e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target
      if (!(target instanceof HTMLElement)) return
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable) return
      e.preventDefault()
      setEditingExercise(null)
      setExerciseModalOpen(true)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  function saveHeader() {
    if (!day) return
    if (!headerName.trim() || !headerSession.trim()) return
    dispatch({
      type: 'UPDATE_DAY',
      payload: {
        dayId: day.id,
        updates: {
          name: headerName.trim(),
          sessionName: headerSession.trim(),
          notes: headerNotes.trim() || undefined,
        },
      },
    })
    setEditingHeader(false)
  }

  if (!day) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>
          <span className={styles.emptyIcon}>&#x26A0;</span>
          <h2 className={styles.errorTitle}>Day not found</h2>
          <p className={styles.errorText}>
            The day you&apos;re looking for doesn&apos;t exist in your program.
          </p>
          <Link to="/">
            <Button variant="secondary">Back to Program</Button>
          </Link>
        </div>
      </div>
    )
  }

  const otherDaysWithExercises = program.days.filter(d => d.id !== dayId && d.exercises.length > 0)

  return (
    <div className={styles.page}>
      {editingHeader ? (
        <div className={styles.editHeaderForm}>
          <Input
            label="Day Name"
            value={headerName}
            onChange={(e) => setHeaderName(e.target.value)}
            required
            placeholder="e.g. Monday"
          />
          <Input
            label="Session Name"
            value={headerSession}
            onChange={(e) => setHeaderSession(e.target.value)}
            required
            placeholder="e.g. Push"
          />
          <div className={styles.notesWrapper}>
            <label className={styles.notesLabel} htmlFor="day-notes">Notes</label>
            <textarea
              id="day-notes"
              className={styles.notesTextarea}
              value={headerNotes}
              onChange={(e) => setHeaderNotes(e.target.value)}
              placeholder="Optional notes for this day..."
              rows={3}
            />
          </div>
          <div className={styles.editHeaderActions}>
            <Button size="sm" onClick={saveHeader}>Save</Button>
            <Button size="sm" variant="secondary" onClick={() => setEditingHeader(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <div className={styles.header}>
          <div className={styles.headerRow}>
            <h1 className={styles.dayName}>{day.name}</h1>
            <button
              type="button"
              className={styles.editHeaderButton}
              onClick={startEditHeader}
              aria-label="Edit day name and session"
              data-testid="edit-header-btn"
            >
              <EditIcon />
            </button>
          </div>
          <span className={`${styles.sessionBadge} ${SESSION_BADGE_STYLES[day.sessionType]}`}>{day.sessionName}</span>
          {day.notes && <p className={styles.dayNotes}>{day.notes}</p>}
        </div>
      )}

      {day.sessionType === 'gym' && (
        <div className={styles.gymCard}>
          <div className={styles.gymSection}>
            <span className={styles.gymIcon}><BarbellIcon size={32} /></span>
            <p className={styles.gymText}>Track your sets and reps in Hevy</p>
            <a
              href="https://hevy.com/deeplink/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.gymLink}
            >
              Open Hevy
              <ExternalLinkIcon />
            </a>
          </div>
        </div>
      )}

      {day.sessionType !== 'gym' && (
        <>
          {day.exercises.length > 0 ? (
            <div className={styles.exerciseSection}>
              <p className={styles.exerciseCount}>
                {day.exercises.length} exercise{day.exercises.length !== 1 ? 's' : ''}
              </p>
              <div className={styles.exerciseList}>
                {day.exercises.map((exercise, index) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    index={index}
                    totalExercises={day.exercises.length}
                    onEdit={() => openEditModal(exercise)}
                    onMoveUp={() => handleMoveUp(exercise.id)}
                    onMoveDown={() => handleMoveDown(exercise.id)}
                    onDelete={() => handleDeleteExercise(exercise)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.emptyExercises}>
              <span className={styles.emptyExercisesIcon}>📋</span>
              <p className={styles.emptyExercisesText}>No exercises yet</p>
              <p className={styles.emptyExercisesHint}>Add one below to build your session</p>
            </div>
          )}

          <div className={styles.addBar}>
            <div className={styles.addBarButtons}>
              <Button
                fullWidth
                variant="secondary"
                onClick={() => setCopyModalOpen(true)}
                disabled={otherDaysWithExercises.length === 0}
              >
                Copy from another day
              </Button>
              <Button fullWidth variant="secondary" onClick={openAddModal} data-testid="add-exercise-btn">
                + Add Exercise
              </Button>
            </div>
            <p className={styles.shortcutHint}>Press <kbd className={styles.kbd}>N</kbd> to add exercise</p>
          </div>
        </>
      )}

      <Modal
        open={exerciseModalOpen}
        onClose={closeExerciseModal}
        title={editingExercise ? 'Edit Exercise' : 'Add Exercise'}
      >
        <ExerciseForm
          key={editingExercise?.id ?? 'new'}
          exercise={editingExercise}
          onSubmit={handleExerciseSubmit}
          onCancel={closeExerciseModal}
        />
      </Modal>

      <CopyExercisesModal
        open={copyModalOpen}
        onClose={() => setCopyModalOpen(false)}
        sourceDays={otherDaysWithExercises}
        onCopy={handleCopyExercises}
      />
    </div>
  )
}
