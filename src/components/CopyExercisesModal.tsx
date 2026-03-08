import { useState } from 'react'
import type { Day } from '../types/program'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { Select } from './ui/Select'
import styles from './CopyExercisesModal.module.css'

interface CopyExercisesModalProps {
  open: boolean
  onClose: () => void
  sourceDays: Day[]
  onCopy: (sourceDayId: string) => void
}

export function CopyExercisesModal({ open, onClose, sourceDays, onCopy }: CopyExercisesModalProps) {
  const [selectedDayId, setSelectedDayId] = useState('')

  const effectiveId = selectedDayId || (sourceDays[0]?.id ?? '')

  function handleClose() {
    setSelectedDayId('')
    onClose()
  }

  function handleCopy() {
    onCopy(effectiveId)
    setSelectedDayId('')
  }

  return (
    <Modal open={open} onClose={handleClose} title="Copy Exercises From">
      <div className={styles.formStack}>
        <Select
          label="Source Day"
          options={sourceDays.map(d => ({
            value: d.id,
            label: `${d.name} — ${d.sessionName} (${d.exercises.length} exercises)`,
          }))}
          value={effectiveId}
          onChange={(e) => setSelectedDayId(e.target.value)}
        />
        <div className={styles.formActions}>
          <Button onClick={handleCopy} disabled={!effectiveId}>
            Copy Exercises
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  )
}
