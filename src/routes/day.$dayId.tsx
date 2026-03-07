import { createRoute, Link } from '@tanstack/react-router'
import { useState, useCallback } from 'react'
import { Route as rootRoute } from './__root'
import { useProgram, useProgramDispatch } from '../context/ProgramContext'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { IconButton } from '../components/ui/IconButton'
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

  const day = program.days.find((d) => d.id === dayId)

  const [exerciseModalOpen, setExerciseModalOpen] = useState(false)
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Exercise | null>(null)
  const [editingHeader, setEditingHeader] = useState(false)
  const [headerName, setHeaderName] = useState('')
  const [headerSession, setHeaderSession] = useState('')

  const [formName, setFormName] = useState('')
  const [formSets, setFormSets] = useState('3')
  const [formReps, setFormReps] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const openAddModal = useCallback(() => {
    setEditingExercise(null)
    setFormName('')
    setFormSets('3')
    setFormReps('')
    setFormNotes('')
    setFormErrors({})
    setExerciseModalOpen(true)
  }, [])

  const openEditModal = useCallback((exercise: Exercise) => {
    setEditingExercise(exercise)
    setFormName(exercise.name)
    setFormSets(String(exercise.sets))
    setFormReps(exercise.reps)
    setFormNotes(exercise.notes ?? '')
    setFormErrors({})
    setExerciseModalOpen(true)
  }, [])

  const closeExerciseModal = useCallback(() => {
    setExerciseModalOpen(false)
    setEditingExercise(null)
  }, [])

  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {}
    if (!formName.trim()) errors.name = 'Name is required'
    if (!formReps.trim()) errors.reps = 'Reps is required'
    const setsNum = Number(formSets)
    if (!formSets || isNaN(setsNum) || setsNum < 1 || !Number.isInteger(setsNum)) {
      errors.sets = 'Must be a whole number >= 1'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }, [formName, formSets, formReps])

  const handleExerciseSubmit = useCallback(() => {
    if (!day || !validateForm()) return

    if (editingExercise) {
      dispatch({
        type: 'UPDATE_EXERCISE',
        payload: {
          dayId: day.id,
          exerciseId: editingExercise.id,
          updates: {
            name: formName.trim(),
            sets: Number(formSets),
            reps: formReps.trim(),
            notes: formNotes.trim() || undefined,
          },
        },
      })
    } else {
      const newExercise: Exercise = {
        id: `ex-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: formName.trim(),
        sets: Number(formSets),
        reps: formReps.trim(),
        notes: formNotes.trim() || undefined,
      }
      dispatch({
        type: 'ADD_EXERCISE',
        payload: { dayId: day.id, exercise: newExercise },
      })
    }
    closeExerciseModal()
  }, [day, editingExercise, formName, formSets, formReps, formNotes, validateForm, dispatch, closeExerciseModal])

  const handleDelete = useCallback(() => {
    if (!day || !deleteTarget) return
    dispatch({
      type: 'DELETE_EXERCISE',
      payload: { dayId: day.id, exerciseId: deleteTarget.id },
    })
    setDeleteTarget(null)
  }, [day, deleteTarget, dispatch])

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
        <div className={styles.topBar}>
          <Link to="/" className={styles.backButton} aria-label="Back to overview">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
        </div>
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

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link to="/" className={styles.backButton} aria-label="Back to overview">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <span className={styles.topBarTitle}>{day.name} &mdash; {day.sessionName}</span>
      </div>

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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          </div>
          <span className={styles.sessionBadge}>{day.sessionName}</span>
        </div>
      )}

      <p className={styles.exerciseCount}>
        {day.exercises.length} exercise{day.exercises.length !== 1 ? 's' : ''}
      </p>

      {day.exercises.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>&#x1F3CB;</span>
          <h3 className={styles.emptyTitle}>No exercises yet</h3>
          <p className={styles.emptyText}>
            No exercises yet &mdash; add your first one!
          </p>
        </div>
      ) : (
        <div className={styles.exerciseList}>
          {day.exercises.map((exercise, index) => (
            <div key={exercise.id} className={styles.exerciseCard} data-testid="exercise-card">
              <div className={styles.exerciseIndex}>{index + 1}</div>
              <div className={styles.exerciseBody}>
                <span className={styles.exerciseName}>{exercise.name}</span>
                <div className={styles.exerciseMeta}>
                  <span className={styles.setsReps} data-testid="sets-reps">
                    {exercise.sets} &times; {exercise.reps}
                  </span>
                </div>
                {exercise.notes && (
                  <span className={styles.exerciseNotes}>{exercise.notes}</span>
                )}
              </div>
              <div className={styles.exerciseActions}>
                <div className={styles.exerciseActionsRow}>
                  <IconButton
                    aria-label={`Move ${exercise.name} up`}
                    onClick={() => handleMoveUp(exercise.id)}
                    disabled={index === 0}
                    data-testid="move-up-btn"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                  </IconButton>
                  <div className={styles.actionDividerV} />
                  <IconButton
                    aria-label={`Move ${exercise.name} down`}
                    onClick={() => handleMoveDown(exercise.id)}
                    disabled={index === day.exercises.length - 1}
                    data-testid="move-down-btn"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </IconButton>
                </div>
                <div className={styles.actionDivider} />
                <div className={styles.exerciseActionsRow}>
                  <IconButton
                    aria-label={`Edit ${exercise.name}`}
                    onClick={() => openEditModal(exercise)}
                    data-testid="edit-exercise-btn"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </IconButton>
                  <div className={styles.actionDividerV} />
                  <IconButton
                    aria-label={`Delete ${exercise.name}`}
                    variant="danger"
                    onClick={() => setDeleteTarget(exercise)}
                    data-testid="delete-exercise-btn"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </IconButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.addBar}>
        <Button fullWidth onClick={openAddModal} data-testid="add-exercise-btn">
          + Add Exercise
        </Button>
      </div>

      <Modal
        open={exerciseModalOpen}
        onClose={closeExerciseModal}
        title={editingExercise ? 'Edit Exercise' : 'Add Exercise'}
      >
        <div className={styles.formStack}>
          <Input
            label="Exercise Name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
            placeholder="e.g. Bench Press"
            error={formErrors.name}
            data-testid="exercise-name-input"
          />
          <Input
            label="Sets"
            type="number"
            min={1}
            value={formSets}
            onChange={(e) => setFormSets(e.target.value)}
            required
            placeholder="e.g. 4"
            error={formErrors.sets}
            data-testid="exercise-sets-input"
          />
          <Input
            label="Reps"
            type="text"
            value={formReps}
            onChange={(e) => setFormReps(e.target.value)}
            required
            placeholder='e.g. 6-8, 30-45s, 2min'
            error={formErrors.reps}
            data-testid="exercise-reps-input"
          />
          <div className={styles.textareaWrapper}>
            <label className={styles.textareaLabel} htmlFor="exercise-notes">
              Notes
            </label>
            <textarea
              id="exercise-notes"
              className={styles.textarea}
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="Optional notes..."
              rows={3}
              data-testid="exercise-notes-input"
            />
          </div>
          <div className={styles.formActions}>
            <Button onClick={handleExerciseSubmit} data-testid="exercise-submit-btn">
              {editingExercise ? 'Save Changes' : 'Add Exercise'}
            </Button>
            <Button variant="secondary" onClick={closeExerciseModal}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete Exercise"
      >
        <div className={styles.deleteConfirm}>
          <p className={styles.deleteMessage}>
            Are you sure you want to delete{' '}
            <span className={styles.deleteExName}>{deleteTarget?.name}</span>?
            This cannot be undone.
          </p>
          <div className={styles.deleteActions}>
            <Button variant="danger" onClick={handleDelete} data-testid="confirm-delete-btn">
              Delete
            </Button>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
