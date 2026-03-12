import type { Exercise } from '../types/program'
import { Popover } from './ui/Popover'
import { EditIcon, ChevronUpIcon, ChevronDownIcon, DeleteIcon, MoreIcon } from './icons'
import styles from './ExerciseCard.module.css'

interface ExerciseCardProps {
  exercise: Exercise
  index: number
  totalExercises: number
  onEdit: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
}

export function ExerciseCard({
  exercise,
  index,
  totalExercises,
  onEdit,
  onMoveUp,
  onMoveDown,
  onDelete,
}: ExerciseCardProps): React.JSX.Element {
  return (
    <div className={styles.exerciseCard} data-testid="exercise-card">
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
            icon: <EditIcon />,
            label: 'Edit',
            onClick: onEdit,
          },
          {
            icon: <ChevronUpIcon />,
            label: 'Move up',
            onClick: onMoveUp,
            disabled: index === 0,
          },
          {
            icon: <ChevronDownIcon />,
            label: 'Move down',
            onClick: onMoveDown,
            disabled: index === totalExercises - 1,
          },
          {
            icon: <DeleteIcon />,
            label: 'Delete',
            onClick: onDelete,
            variant: 'danger',
          },
        ]}
        trigger={
          <button
            type="button"
            className={styles.moreButton}
            aria-label={`Actions for ${exercise.name}`}
          >
            <MoreIcon size={18} />
          </button>
        }
      />
    </div>
  )
}
