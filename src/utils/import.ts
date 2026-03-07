import type { Program, Day, Exercise } from '../types/program'

function isValidExercise(exercise: unknown): exercise is Exercise {
  if (typeof exercise !== 'object' || exercise === null) return false
  const ex = exercise as Record<string, unknown>
  
  return (
    typeof ex.id === 'string' &&
    typeof ex.name === 'string' &&
    typeof ex.sets === 'number' &&
    typeof ex.reps === 'string' &&
    (ex.notes === undefined || typeof ex.notes === 'string')
  )
}

function isValidDay(day: unknown): day is Day {
  if (typeof day !== 'object' || day === null) return false
  const d = day as Record<string, unknown>
  
  if (
    typeof d.id !== 'string' ||
    typeof d.name !== 'string' ||
    typeof d.sessionName !== 'string' ||
    (d.sessionType !== 'gym' &&
      d.sessionType !== 'dance' &&
      d.sessionType !== 'cardio' &&
      d.sessionType !== 'rest')
  ) {
    return false
  }

  if (!Array.isArray(d.exercises)) return false
  
  return d.exercises.every(isValidExercise)
}

function isValidProgram(data: unknown): data is Program {
  if (typeof data !== 'object' || data === null) return false
  const program = data as Record<string, unknown>
  
  if (!Array.isArray(program.days)) return false
  
  return program.days.every(isValidDay)
}

export function importProgram(file: File): Promise<Program> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const text = e.target?.result
        if (typeof text !== 'string') {
          reject(new Error('Failed to read file content'))
          return
        }

        const data = JSON.parse(text)

        if (!isValidProgram(data)) {
          reject(
            new Error(
              'Invalid program structure. Must have "days" array with valid day objects.'
            )
          )
          return
        }

        resolve(data)
      } catch (error) {
        if (error instanceof SyntaxError) {
          reject(new Error('Invalid JSON file'))
        } else {
          reject(error)
        }
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsText(file)
  })
}
