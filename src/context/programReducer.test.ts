import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Program, Day, Exercise } from '../types/program'

vi.mock('../utils/id', () => ({
  generateId: vi.fn(),
}))

const { programReducer, swapItems } = await import('./ProgramContext')
const { generateId } = await import('../utils/id')

const mockGenerateId = vi.mocked(generateId)

function makeExercise(overrides: Partial<Exercise> = {}): Exercise {
  return {
    id: 'ex-1',
    name: 'Squat',
    sets: 4,
    reps: '6-8',
    ...overrides,
  }
}

function makeDay(overrides: Partial<Day> = {}): Day {
  return {
    id: 'day-1',
    name: 'Monday',
    sessionName: 'Push',
    sessionType: 'gym',
    exercises: [],
    ...overrides,
  }
}

function makeProgram(days: Day[] = []): Program {
  return { days }
}

describe('swapItems', () => {
  it('swaps item up with its predecessor', () => {
    const result = swapItems(['a', 'b', 'c'], 1, 'up')
    expect(result).toEqual(['b', 'a', 'c'])
  })

  it('swaps item down with its successor', () => {
    const result = swapItems(['a', 'b', 'c'], 1, 'down')
    expect(result).toEqual(['a', 'c', 'b'])
  })

  it('returns null when moving first item up', () => {
    expect(swapItems(['a', 'b'], 0, 'up')).toBeNull()
  })

  it('returns null when moving last item down', () => {
    expect(swapItems(['a', 'b'], 1, 'down')).toBeNull()
  })

  it('returns null for single-element array moving up', () => {
    expect(swapItems(['a'], 0, 'up')).toBeNull()
  })

  it('returns null for single-element array moving down', () => {
    expect(swapItems(['a'], 0, 'down')).toBeNull()
  })

  it('does not mutate the original array', () => {
    const original = ['a', 'b', 'c']
    swapItems(original, 1, 'up')
    expect(original).toEqual(['a', 'b', 'c'])
  })

  it('swaps first and second when moving index 1 up', () => {
    const result = swapItems([1, 2, 3, 4], 1, 'up')
    expect(result).toEqual([2, 1, 3, 4])
  })

  it('swaps last two when moving second-to-last down', () => {
    const result = swapItems([1, 2, 3, 4], 2, 'down')
    expect(result).toEqual([1, 2, 4, 3])
  })
})

describe('programReducer', () => {
  beforeEach(() => {
    mockGenerateId.mockReset()
  })

  describe('LOAD_PROGRAM', () => {
    it('replaces entire state with payload', () => {
      const initial = makeProgram([makeDay()])
      const newProgram = makeProgram([makeDay({ id: 'day-new', name: 'Friday' })])
      const result = programReducer(initial, { type: 'LOAD_PROGRAM', payload: newProgram })
      expect(result).toEqual(newProgram)
    })

    it('can load empty program', () => {
      const initial = makeProgram([makeDay()])
      const empty = makeProgram([])
      const result = programReducer(initial, { type: 'LOAD_PROGRAM', payload: empty })
      expect(result.days).toHaveLength(0)
    })
  })

  describe('ADD_DAY', () => {
    it('adds day to end of days array', () => {
      const initial = makeProgram([makeDay({ id: 'day-1' })])
      const newDay = makeDay({ id: 'day-2', name: 'Tuesday' })
      const result = programReducer(initial, { type: 'ADD_DAY', payload: newDay })
      expect(result.days).toHaveLength(2)
      expect(result.days[1]).toEqual(newDay)
    })

    it('adds day to empty program', () => {
      const initial = makeProgram()
      const newDay = makeDay()
      const result = programReducer(initial, { type: 'ADD_DAY', payload: newDay })
      expect(result.days).toHaveLength(1)
      expect(result.days[0]).toEqual(newDay)
    })
  })

  describe('UPDATE_DAY', () => {
    it('updates matching day fields', () => {
      const initial = makeProgram([makeDay({ id: 'day-1', name: 'Monday' })])
      const result = programReducer(initial, {
        type: 'UPDATE_DAY',
        payload: { dayId: 'day-1', updates: { name: 'Lundi', sessionType: 'dance' } },
      })
      expect(result.days[0].name).toBe('Lundi')
      expect(result.days[0].sessionType).toBe('dance')
      expect(result.days[0].sessionName).toBe('Push')
    })

    it('does not affect other days', () => {
      const initial = makeProgram([
        makeDay({ id: 'day-1', name: 'Monday' }),
        makeDay({ id: 'day-2', name: 'Tuesday' }),
      ])
      const result = programReducer(initial, {
        type: 'UPDATE_DAY',
        payload: { dayId: 'day-1', updates: { name: 'Changed' } },
      })
      expect(result.days[1].name).toBe('Tuesday')
    })

    it('can set optional notes field', () => {
      const initial = makeProgram([makeDay({ id: 'day-1' })])
      const result = programReducer(initial, {
        type: 'UPDATE_DAY',
        payload: { dayId: 'day-1', updates: { notes: 'Rest between sets' } },
      })
      expect(result.days[0].notes).toBe('Rest between sets')
    })
  })

  describe('DELETE_DAY', () => {
    it('removes the matching day', () => {
      const initial = makeProgram([
        makeDay({ id: 'day-1' }),
        makeDay({ id: 'day-2' }),
      ])
      const result = programReducer(initial, {
        type: 'DELETE_DAY',
        payload: { dayId: 'day-1' },
      })
      expect(result.days).toHaveLength(1)
      expect(result.days[0].id).toBe('day-2')
    })

    it('returns same structure when dayId not found', () => {
      const initial = makeProgram([makeDay({ id: 'day-1' })])
      const result = programReducer(initial, {
        type: 'DELETE_DAY',
        payload: { dayId: 'nonexistent' },
      })
      expect(result.days).toHaveLength(1)
    })
  })

  describe('ADD_EXERCISE', () => {
    it('adds exercise to the specified day', () => {
      const initial = makeProgram([makeDay({ id: 'day-1', exercises: [] })])
      const exercise = makeExercise({ id: 'ex-new' })
      const result = programReducer(initial, {
        type: 'ADD_EXERCISE',
        payload: { dayId: 'day-1', exercise },
      })
      expect(result.days[0].exercises).toHaveLength(1)
      expect(result.days[0].exercises[0]).toEqual(exercise)
    })

    it('appends to existing exercises', () => {
      const existing = makeExercise({ id: 'ex-1' })
      const initial = makeProgram([makeDay({ id: 'day-1', exercises: [existing] })])
      const newEx = makeExercise({ id: 'ex-2', name: 'Bench Press' })
      const result = programReducer(initial, {
        type: 'ADD_EXERCISE',
        payload: { dayId: 'day-1', exercise: newEx },
      })
      expect(result.days[0].exercises).toHaveLength(2)
      expect(result.days[0].exercises[1].id).toBe('ex-2')
    })
  })

  describe('UPDATE_EXERCISE', () => {
    it('updates matching exercise in the correct day', () => {
      const ex = makeExercise({ id: 'ex-1', name: 'Squat', sets: 4 })
      const initial = makeProgram([makeDay({ id: 'day-1', exercises: [ex] })])
      const result = programReducer(initial, {
        type: 'UPDATE_EXERCISE',
        payload: { dayId: 'day-1', exerciseId: 'ex-1', updates: { sets: 5, notes: 'Heavy' } },
      })
      expect(result.days[0].exercises[0].sets).toBe(5)
      expect(result.days[0].exercises[0].notes).toBe('Heavy')
      expect(result.days[0].exercises[0].name).toBe('Squat')
    })

    it('does not affect exercises in other days', () => {
      const ex1 = makeExercise({ id: 'ex-1' })
      const ex2 = makeExercise({ id: 'ex-2', name: 'Deadlift' })
      const initial = makeProgram([
        makeDay({ id: 'day-1', exercises: [ex1] }),
        makeDay({ id: 'day-2', exercises: [ex2] }),
      ])
      const result = programReducer(initial, {
        type: 'UPDATE_EXERCISE',
        payload: { dayId: 'day-1', exerciseId: 'ex-1', updates: { name: 'Front Squat' } },
      })
      expect(result.days[1].exercises[0].name).toBe('Deadlift')
    })
  })

  describe('DELETE_EXERCISE', () => {
    it('removes the matching exercise from the day', () => {
      const exercises = [
        makeExercise({ id: 'ex-1' }),
        makeExercise({ id: 'ex-2' }),
      ]
      const initial = makeProgram([makeDay({ id: 'day-1', exercises })])
      const result = programReducer(initial, {
        type: 'DELETE_EXERCISE',
        payload: { dayId: 'day-1', exerciseId: 'ex-1' },
      })
      expect(result.days[0].exercises).toHaveLength(1)
      expect(result.days[0].exercises[0].id).toBe('ex-2')
    })

    it('no-op when exercise not found', () => {
      const initial = makeProgram([makeDay({ id: 'day-1', exercises: [makeExercise()] })])
      const result = programReducer(initial, {
        type: 'DELETE_EXERCISE',
        payload: { dayId: 'day-1', exerciseId: 'nonexistent' },
      })
      expect(result.days[0].exercises).toHaveLength(1)
    })
  })

  describe('MOVE_EXERCISE_UP', () => {
    it('swaps exercise with the one above', () => {
      const exercises = [
        makeExercise({ id: 'ex-1', name: 'First' }),
        makeExercise({ id: 'ex-2', name: 'Second' }),
      ]
      const initial = makeProgram([makeDay({ id: 'day-1', exercises })])
      const result = programReducer(initial, {
        type: 'MOVE_EXERCISE_UP',
        payload: { dayId: 'day-1', exerciseId: 'ex-2' },
      })
      expect(result.days[0].exercises[0].name).toBe('Second')
      expect(result.days[0].exercises[1].name).toBe('First')
    })

    it('no-op when exercise is already first', () => {
      const exercises = [
        makeExercise({ id: 'ex-1', name: 'First' }),
        makeExercise({ id: 'ex-2', name: 'Second' }),
      ]
      const initial = makeProgram([makeDay({ id: 'day-1', exercises })])
      const result = programReducer(initial, {
        type: 'MOVE_EXERCISE_UP',
        payload: { dayId: 'day-1', exerciseId: 'ex-1' },
      })
      expect(result).toBe(initial)
    })

    it('returns same state when day not found', () => {
      const initial = makeProgram([makeDay({ id: 'day-1', exercises: [makeExercise()] })])
      const result = programReducer(initial, {
        type: 'MOVE_EXERCISE_UP',
        payload: { dayId: 'nonexistent', exerciseId: 'ex-1' },
      })
      expect(result).toBe(initial)
    })
  })

  describe('MOVE_EXERCISE_DOWN', () => {
    it('swaps exercise with the one below', () => {
      const exercises = [
        makeExercise({ id: 'ex-1', name: 'First' }),
        makeExercise({ id: 'ex-2', name: 'Second' }),
      ]
      const initial = makeProgram([makeDay({ id: 'day-1', exercises })])
      const result = programReducer(initial, {
        type: 'MOVE_EXERCISE_DOWN',
        payload: { dayId: 'day-1', exerciseId: 'ex-1' },
      })
      expect(result.days[0].exercises[0].name).toBe('Second')
      expect(result.days[0].exercises[1].name).toBe('First')
    })

    it('no-op when exercise is already last', () => {
      const exercises = [
        makeExercise({ id: 'ex-1' }),
        makeExercise({ id: 'ex-2' }),
      ]
      const initial = makeProgram([makeDay({ id: 'day-1', exercises })])
      const result = programReducer(initial, {
        type: 'MOVE_EXERCISE_DOWN',
        payload: { dayId: 'day-1', exerciseId: 'ex-2' },
      })
      expect(result).toBe(initial)
    })
  })

  describe('MOVE_DAY_UP', () => {
    it('swaps day with the one above', () => {
      const initial = makeProgram([
        makeDay({ id: 'day-1', name: 'Monday' }),
        makeDay({ id: 'day-2', name: 'Tuesday' }),
      ])
      const result = programReducer(initial, {
        type: 'MOVE_DAY_UP',
        payload: { dayId: 'day-2' },
      })
      expect(result.days[0].name).toBe('Tuesday')
      expect(result.days[1].name).toBe('Monday')
    })

    it('no-op when day is already first', () => {
      const initial = makeProgram([
        makeDay({ id: 'day-1' }),
        makeDay({ id: 'day-2' }),
      ])
      const result = programReducer(initial, {
        type: 'MOVE_DAY_UP',
        payload: { dayId: 'day-1' },
      })
      expect(result).toBe(initial)
    })
  })

  describe('MOVE_DAY_DOWN', () => {
    it('swaps day with the one below', () => {
      const initial = makeProgram([
        makeDay({ id: 'day-1', name: 'Monday' }),
        makeDay({ id: 'day-2', name: 'Tuesday' }),
      ])
      const result = programReducer(initial, {
        type: 'MOVE_DAY_DOWN',
        payload: { dayId: 'day-1' },
      })
      expect(result.days[0].name).toBe('Tuesday')
      expect(result.days[1].name).toBe('Monday')
    })

    it('no-op when day is already last', () => {
      const initial = makeProgram([
        makeDay({ id: 'day-1' }),
        makeDay({ id: 'day-2' }),
      ])
      const result = programReducer(initial, {
        type: 'MOVE_DAY_DOWN',
        payload: { dayId: 'day-2' },
      })
      expect(result).toBe(initial)
    })
  })

  describe('DUPLICATE_DAY', () => {
    it('inserts a copy right after the source day', () => {
      mockGenerateId
        .mockReturnValueOnce('new-day-id')
        .mockReturnValueOnce('new-ex-id')

      const exercises = [makeExercise({ id: 'ex-1', name: 'Squat', sets: 4, reps: '6-8' })]
      const initial = makeProgram([
        makeDay({ id: 'day-1', name: 'Monday', sessionName: 'Push', sessionType: 'gym', exercises }),
        makeDay({ id: 'day-2', name: 'Tuesday' }),
      ])

      const result = programReducer(initial, {
        type: 'DUPLICATE_DAY',
        payload: { dayId: 'day-1' },
      })

      expect(result.days).toHaveLength(3)
      expect(result.days[1].id).toBe('new-day-id')
      expect(result.days[1].name).toBe('Monday (copy)')
      expect(result.days[1].sessionName).toBe('Push')
      expect(result.days[1].sessionType).toBe('gym')
      expect(result.days[1].exercises).toHaveLength(1)
      expect(result.days[1].exercises[0].id).toBe('new-ex-id')
      expect(result.days[1].exercises[0].name).toBe('Squat')
      expect(result.days[2].id).toBe('day-2')
    })

    it('returns same state when dayId not found', () => {
      const initial = makeProgram([makeDay({ id: 'day-1' })])
      const result = programReducer(initial, {
        type: 'DUPLICATE_DAY',
        payload: { dayId: 'nonexistent' },
      })
      expect(result).toBe(initial)
    })

    it('generates unique IDs for each duplicated exercise', () => {
      mockGenerateId
        .mockReturnValueOnce('dup-day')
        .mockReturnValueOnce('dup-ex-1')
        .mockReturnValueOnce('dup-ex-2')

      const exercises = [
        makeExercise({ id: 'ex-1' }),
        makeExercise({ id: 'ex-2' }),
      ]
      const initial = makeProgram([makeDay({ id: 'day-1', exercises })])

      const result = programReducer(initial, {
        type: 'DUPLICATE_DAY',
        payload: { dayId: 'day-1' },
      })

      expect(result.days[1].exercises[0].id).toBe('dup-ex-1')
      expect(result.days[1].exercises[1].id).toBe('dup-ex-2')
    })
  })

  describe('COPY_EXERCISES_FROM_DAY', () => {
    it('appends copied exercises to target day', () => {
      mockGenerateId
        .mockReturnValueOnce('copied-ex-1')
        .mockReturnValueOnce('copied-ex-2')

      const sourceExercises = [
        makeExercise({ id: 'src-1', name: 'Squat' }),
        makeExercise({ id: 'src-2', name: 'Bench' }),
      ]
      const targetExercise = makeExercise({ id: 'tgt-1', name: 'Deadlift' })
      const initial = makeProgram([
        makeDay({ id: 'day-src', exercises: sourceExercises }),
        makeDay({ id: 'day-tgt', exercises: [targetExercise] }),
      ])

      const result = programReducer(initial, {
        type: 'COPY_EXERCISES_FROM_DAY',
        payload: { targetDayId: 'day-tgt', sourceDayId: 'day-src' },
      })

      const target = result.days[1]
      expect(target.exercises).toHaveLength(3)
      expect(target.exercises[0].id).toBe('tgt-1')
      expect(target.exercises[1].id).toBe('copied-ex-1')
      expect(target.exercises[1].name).toBe('Squat')
      expect(target.exercises[2].id).toBe('copied-ex-2')
      expect(target.exercises[2].name).toBe('Bench')
    })

    it('returns same state when source day not found', () => {
      const initial = makeProgram([makeDay({ id: 'day-1' })])
      const result = programReducer(initial, {
        type: 'COPY_EXERCISES_FROM_DAY',
        payload: { targetDayId: 'day-1', sourceDayId: 'nonexistent' },
      })
      expect(result).toBe(initial)
    })

    it('copies zero exercises from empty source', () => {
      const initial = makeProgram([
        makeDay({ id: 'day-src', exercises: [] }),
        makeDay({ id: 'day-tgt', exercises: [makeExercise()] }),
      ])
      const result = programReducer(initial, {
        type: 'COPY_EXERCISES_FROM_DAY',
        payload: { targetDayId: 'day-tgt', sourceDayId: 'day-src' },
      })
      expect(result.days[1].exercises).toHaveLength(1)
    })
  })
})
