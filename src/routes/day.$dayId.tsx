import { createRoute, Link } from '@tanstack/react-router'
import { useState, useCallback } from 'react'
import { Route as rootRoute } from './__root'
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
import type { Exercise } from '../types/program'
import styles from './day.$dayId.module.css'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/day/$dayId',
  component: DayDetailComponent,
})

function DayDetailComponent() {
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

  const openAddModal = useCallback(() => {
    setEditingExercise(null)
    setExerciseModalOpen(true)
  }, [])

  const openEditModal = useCallback((exercise: Exercise) => {
    setEditingExercise(exercise)
    setExerciseModalOpen(true)
  }, [])

  const closeExerciseModal = useCallback(() => {
    setExerciseModalOpen(false)
    setEditingExercise(null)
  }, [])

  const handleExerciseSubmit = useCallback((data: { name: string; sets: number; reps: string; notes?: string }) => {
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
  }, [day, editingExercise, dispatch, closeExerciseModal])

  const handleDeleteExercise = useCallback(
    (exercise: Exercise) => {
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
    },
    [day, program, dispatch, showToast]
  )

  const handleCopyExercises = useCallback((sourceDayId: string) => {
    if (!day) return
    dispatch({
      type: 'COPY_EXERCISES_FROM_DAY',
      payload: { targetDayId: day.id, sourceDayId },
    })
    setCopyModalOpen(false)
    showToast({ message: 'Exercises copied', variant: 'success' })
  }, [day, dispatch, showToast])

  const handleMoveUp = useCallback(
    (exerciseId: string) => {
      if (!day) return
      dispatch({
        type: 'MOVE_EXERCISE_UP',
        payload: { dayId: day.id, exerciseId },
      })
    },
    [day, dispatch]
  )

  const handleMoveDown = useCallback(
    (exerciseId: string) => {
      if (!day) return
      dispatch({
        type: 'MOVE_EXERCISE_DOWN',
        payload: { dayId: day.id, exerciseId },
      })
    },
    [day, dispatch]
  )

  const startEditHeader = useCallback(() => {
    if (!day) return
    setHeaderName(day.name)
    setHeaderSession(day.sessionName)
    setEditingHeader(true)
  }, [day])

  const saveHeader = useCallback(() => {
    if (!day) return
    if (!headerName.trim() || !headerSession.trim()) return
    dispatch({
      type: 'UPDATE_DAY',
      payload: {
        dayId: day.id,
        updates: {
          name: headerName.trim(),
          sessionName: headerSession.trim(),
        },
      },
    })
    setEditingHeader(false)
  }, [day, headerName, headerSession, dispatch])

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
          <span className={styles.sessionBadge}>{day.sessionName}</span>
        </div>
      )}

      {day.sessionType === 'gym' && (
        <div className={styles.gymSection}>
          <span className={styles.gymIcon}><BarbellIcon size={32} /></span>
          <p className={styles.gymText}>Track this workout in Hevy</p>
          <a
            href="https://hevy.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.gymLink}
          >
            Open Hevy
            <ExternalLinkIcon />
          </a>
        </div>
      )}

      {day.sessionType !== 'gym' && (
        <>
          {day.exercises.length > 0 && (
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
