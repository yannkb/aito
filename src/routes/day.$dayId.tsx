import { createRoute, Link } from '@tanstack/react-router'
import { useState, useCallback } from 'react'
import { Route as rootRoute } from './__root'
import { useProgram, useProgramDispatch } from '../context/ProgramContext'
import { useToast } from '../context/ToastContext'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Popover } from '../components/ui/Popover'
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
  const [copySourceDayId, setCopySourceDayId] = useState('')
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
        id: crypto.randomUUID(),
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

  const handleDeleteExercise = useCallback(
    (exercise: Exercise) => {
      if (!day) return
      const snapshot = { ...program, days: [...program.days.map(d => ({ ...d, exercises: [...d.exercises] }))] }
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

  const handleCopyExercises = useCallback(() => {
    if (!day || !copySourceDayId) return
    dispatch({
      type: 'COPY_EXERCISES_FROM_DAY',
      payload: { targetDayId: day.id, sourceDayId: copySourceDayId },
    })
    setCopyModalOpen(false)
    setCopySourceDayId('')
    showToast({ message: 'Exercises copied', variant: 'success' })
  }, [day, copySourceDayId, dispatch, showToast])

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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          </div>
          <span className={styles.sessionBadge}>{day.sessionName}</span>
        </div>
      )}

      {day.sessionType === 'gym' && (
        <div className={styles.gymSection}>
          <svg className={styles.gymIcon} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6.5 6.5h-1a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1z" />
            <path d="M17.5 6.5h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1z" />
            <path d="M3.5 10v4" />
            <path d="M20.5 10v4" />
            <line x1="7.5" y1="12" x2="16.5" y2="12" />
          </svg>
          <p className={styles.gymText}>Track this workout in Hevy</p>
          <a
            href="https://hevy.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.gymLink}
          >
            Open Hevy
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
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
                  <div key={exercise.id} className={styles.exerciseCard} data-testid="exercise-card">
                    <div className={styles.exerciseIndex}>{index + 1}</div>
                    <div className={styles.exerciseBody}>
                      {exercise.image && (
                        <img
                          src={`${import.meta.env.BASE_URL}${exercise.image.replace(/^\//, '')}`}
                          alt={exercise.name}
                          className={styles.exerciseImage}
                          loading="lazy"
                          width="64"
                          height="64"
                        />
                      )}
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
                    <Popover
                      align="right"
                      items={[
                        {
                          icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
                          label: 'Edit',
                          onClick: () => openEditModal(exercise),
                        },
                        {
                          icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>,
                          label: 'Move up',
                          onClick: () => handleMoveUp(exercise.id),
                          disabled: index === 0,
                        },
                        {
                          icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>,
                          label: 'Move down',
                          onClick: () => handleMoveDown(exercise.id),
                          disabled: index === day.exercises.length - 1,
                        },
                        {
                          icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>,
                          label: 'Delete',
                          onClick: () => handleDeleteExercise(exercise),
                          variant: 'danger' as const,
                        },
                      ]}
                      trigger={
                        <button
                          type="button"
                          className={styles.moreButton}
                          aria-label={`Actions for ${exercise.name}`}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="5" r="2" />
                            <circle cx="12" cy="12" r="2" />
                            <circle cx="12" cy="19" r="2" />
                          </svg>
                        </button>
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.addBar}>
            <div className={styles.addBarButtons}>
              <Button
                fullWidth
                variant="secondary"
                onClick={() => {
                  const otherDays = program.days.filter(d => d.id !== dayId && d.exercises.length > 0)
                  if (otherDays.length > 0) {
                    setCopySourceDayId(otherDays[0].id)
                    setCopyModalOpen(true)
                  }
                }}
                disabled={program.days.filter(d => d.id !== dayId && d.exercises.length > 0).length === 0}
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
        open={copyModalOpen}
        onClose={() => { setCopyModalOpen(false); setCopySourceDayId('') }}
        title="Copy Exercises From"
      >
        <div className={styles.formStack}>
          <Select
            label="Source Day"
            options={program.days
              .filter(d => d.id !== dayId && d.exercises.length > 0)
              .map(d => ({ value: d.id, label: `${d.name} — ${d.sessionName} (${d.exercises.length} exercises)` }))}
            value={copySourceDayId}
            onChange={(e) => setCopySourceDayId(e.target.value)}
          />
          <div className={styles.formActions}>
            <Button onClick={handleCopyExercises} disabled={!copySourceDayId}>
              Copy Exercises
            </Button>
            <Button variant="secondary" onClick={() => { setCopyModalOpen(false); setCopySourceDayId('') }}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
