import type { Day } from '../types/program'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Select } from './ui/Select'
import styles from './DayForm.module.css'

const SESSION_TYPE_OPTIONS = [
  { value: 'gym', label: 'Gym' },
  { value: 'dance', label: 'Dance' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'rest', label: 'Rest' },
]

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

export function DayForm({
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
        onChange={(e) => {
          const value = e.target.value
          if (value === 'gym' || value === 'dance' || value === 'cardio' || value === 'rest') {
            onTypeChange(value)
          }
        }}
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
