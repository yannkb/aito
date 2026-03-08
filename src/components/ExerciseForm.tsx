import { useState } from 'react'
import type { Exercise } from '../types/program'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import styles from './ExerciseForm.module.css'

interface ExerciseFormData {
  name: string
  sets: number
  reps: string
  notes?: string
}

interface ExerciseFormProps {
  exercise: Exercise | null
  onSubmit: (data: ExerciseFormData) => void
  onCancel: () => void
}

export function ExerciseForm({ exercise, onSubmit, onCancel }: ExerciseFormProps) {
  const [name, setName] = useState(exercise?.name ?? '')
  const [sets, setSets] = useState(exercise ? String(exercise.sets) : '3')
  const [reps, setReps] = useState(exercise?.reps ?? '')
  const [notes, setNotes] = useState(exercise?.notes ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = 'Name is required'
    if (!reps.trim()) newErrors.reps = 'Reps is required'
    const setsNum = Number(sets)
    if (!sets || isNaN(setsNum) || setsNum < 1 || !Number.isInteger(setsNum)) {
      newErrors.sets = 'Must be a whole number >= 1'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit() {
    if (!validate()) return
    onSubmit({
      name: name.trim(),
      sets: Number(sets),
      reps: reps.trim(),
      notes: notes.trim() || undefined,
    })
  }

  return (
    <div className={styles.formStack}>
      <Input
        label="Exercise Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        placeholder="e.g. Bench Press"
        error={errors.name}
        data-testid="exercise-name-input"
      />
      <Input
        label="Sets"
        type="number"
        min={1}
        value={sets}
        onChange={(e) => setSets(e.target.value)}
        required
        placeholder="e.g. 4"
        error={errors.sets}
        data-testid="exercise-sets-input"
      />
      <Input
        label="Reps"
        type="text"
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        required
        placeholder="e.g. 6-8, 30-45s, 2min"
        error={errors.reps}
        data-testid="exercise-reps-input"
      />
      <div className={styles.textareaWrapper}>
        <label className={styles.textareaLabel} htmlFor="exercise-notes">
          Notes
        </label>
        <textarea
          id="exercise-notes"
          className={styles.textarea}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes..."
          rows={3}
          data-testid="exercise-notes-input"
        />
      </div>
      <div className={styles.formActions}>
        <Button onClick={handleSubmit} data-testid="exercise-submit-btn">
          {exercise ? 'Save Changes' : 'Add Exercise'}
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
