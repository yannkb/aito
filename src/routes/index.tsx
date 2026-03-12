import { useState, useEffect } from 'react'
import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import { useProgram, useProgramDispatch } from '../context/ProgramContext'
import { useToast } from '../context/ToastContext'
import type { Day } from '../types/program'
import { generateId } from '../utils/id'
import { createProgramSnapshot } from '../utils/snapshot'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { DayCard } from '../components/DayCard'
import { DayForm } from '../components/DayForm'
import { WarriorCode } from '../components/WarriorCode'
import styles from './index.module.css'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomeComponent,
})

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
    const snapshot = createProgramSnapshot(program)
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
      <WarriorCode />

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
