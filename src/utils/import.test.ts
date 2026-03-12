import { describe, it, expect } from 'vitest'
import { isValidProgram } from './import'

function validExercise(overrides: Record<string, unknown> = {}) {
  return {
    id: 'ex-1',
    name: 'Squat',
    sets: 4,
    reps: '6-8',
    ...overrides,
  }
}

function validDay(overrides: Record<string, unknown> = {}) {
  return {
    id: 'day-1',
    name: 'Monday',
    sessionName: 'Push',
    sessionType: 'gym',
    exercises: [validExercise()],
    ...overrides,
  }
}

function validProgram(overrides: Record<string, unknown> = {}) {
  return {
    days: [validDay()],
    ...overrides,
  }
}

describe('isValidProgram', () => {
  it('accepts a minimal valid program', () => {
    expect(isValidProgram({ days: [] })).toBe(true)
  })

  it('accepts a full valid program with all optional fields', () => {
    const program = validProgram({
      days: [
        validDay({
          notes: 'Take it easy',
          exercises: [
            validExercise({ notes: 'Focus on form', image: '/exercises/squat.svg' }),
          ],
        }),
      ],
    })
    expect(isValidProgram(program)).toBe(true)
  })

  it('accepts program with multiple days and exercises', () => {
    const program = {
      days: [
        validDay({ id: 'day-1', exercises: [validExercise({ id: 'ex-1' }), validExercise({ id: 'ex-2' })] }),
        validDay({ id: 'day-2', sessionType: 'dance' }),
        validDay({ id: 'day-3', sessionType: 'cardio' }),
        validDay({ id: 'day-4', sessionType: 'rest', exercises: [] }),
      ],
    }
    expect(isValidProgram(program)).toBe(true)
  })

  it('rejects null', () => {
    expect(isValidProgram(null)).toBe(false)
  })

  it('rejects undefined', () => {
    expect(isValidProgram(undefined)).toBe(false)
  })

  it('rejects a string', () => {
    expect(isValidProgram('not a program')).toBe(false)
  })

  it('rejects a number', () => {
    expect(isValidProgram(42)).toBe(false)
  })

  it('rejects an array', () => {
    expect(isValidProgram([validDay()])).toBe(false)
  })

  it('rejects object without days', () => {
    expect(isValidProgram({ name: 'My Program' })).toBe(false)
  })

  it('rejects object where days is not an array', () => {
    expect(isValidProgram({ days: 'not-array' })).toBe(false)
  })

  it('rejects object where days is a number', () => {
    expect(isValidProgram({ days: 5 })).toBe(false)
  })

  it('rejects day missing id', () => {
    const day = validDay()
    const { id: _id, ...dayNoId } = day
    void _id
    expect(isValidProgram({ days: [dayNoId] })).toBe(false)
  })

  it('rejects day missing name', () => {
    const day = validDay()
    const { name: _name, ...dayNoName } = day
    void _name
    expect(isValidProgram({ days: [dayNoName] })).toBe(false)
  })

  it('rejects day missing sessionName', () => {
    const day = validDay()
    const { sessionName: _sn, ...dayNoSessionName } = day
    void _sn
    expect(isValidProgram({ days: [dayNoSessionName] })).toBe(false)
  })

  it('rejects day with invalid sessionType', () => {
    expect(isValidProgram({ days: [validDay({ sessionType: 'yoga' })] })).toBe(false)
  })

  it('rejects day with numeric sessionType', () => {
    expect(isValidProgram({ days: [validDay({ sessionType: 123 })] })).toBe(false)
  })

  it('rejects day without exercises array', () => {
    expect(isValidProgram({ days: [validDay({ exercises: 'none' })] })).toBe(false)
  })

  it('rejects day with notes as number', () => {
    expect(isValidProgram({ days: [validDay({ notes: 42 })] })).toBe(false)
  })

  it('accepts day without notes (undefined)', () => {
    const day = validDay()
    delete (day as Record<string, unknown>).notes
    expect(isValidProgram({ days: [day] })).toBe(true)
  })

  it('rejects exercise with empty name', () => {
    expect(isValidProgram({ days: [validDay({ exercises: [validExercise({ name: '' })] })] })).toBe(false)
  })

  it('rejects exercise with sets = 0', () => {
    expect(isValidProgram({ days: [validDay({ exercises: [validExercise({ sets: 0 })] })] })).toBe(false)
  })

  it('rejects exercise with negative sets', () => {
    expect(isValidProgram({ days: [validDay({ exercises: [validExercise({ sets: -1 })] })] })).toBe(false)
  })

  it('rejects exercise with sets > 999', () => {
    expect(isValidProgram({ days: [validDay({ exercises: [validExercise({ sets: 1000 })] })] })).toBe(false)
  })

  it('accepts exercise with sets = 999', () => {
    expect(isValidProgram({ days: [validDay({ exercises: [validExercise({ sets: 999 })] })] })).toBe(true)
  })

  it('accepts exercise with sets = 1', () => {
    expect(isValidProgram({ days: [validDay({ exercises: [validExercise({ sets: 1 })] })] })).toBe(true)
  })

  it('rejects exercise with non-integer sets (2.5)', () => {
    expect(isValidProgram({ days: [validDay({ exercises: [validExercise({ sets: 2.5 })] })] })).toBe(false)
  })

  it('rejects exercise with string sets', () => {
    expect(isValidProgram({ days: [validDay({ exercises: [validExercise({ sets: '4' })] })] })).toBe(false)
  })

  it('rejects exercise with empty reps', () => {
    expect(isValidProgram({ days: [validDay({ exercises: [validExercise({ reps: '' })] })] })).toBe(false)
  })

  it('rejects exercise with numeric reps', () => {
    expect(isValidProgram({ days: [validDay({ exercises: [validExercise({ reps: 10 })] })] })).toBe(false)
  })

  it('rejects exercise missing id', () => {
    const ex = validExercise()
    const { id: _id, ...exNoId } = ex
    void _id
    expect(isValidProgram({ days: [validDay({ exercises: [exNoId] })] })).toBe(false)
  })

  it('rejects exercise with notes as number', () => {
    expect(isValidProgram({ days: [validDay({ exercises: [validExercise({ notes: 123 })] })] })).toBe(false)
  })

  it('rejects exercise with image as number', () => {
    expect(isValidProgram({ days: [validDay({ exercises: [validExercise({ image: 42 })] })] })).toBe(false)
  })

  it('accepts exercise with string notes and string image', () => {
    const ex = validExercise({ notes: 'Go heavy', image: '/exercises/squat.svg' })
    expect(isValidProgram({ days: [validDay({ exercises: [ex] })] })).toBe(true)
  })

  it('rejects null exercise in array', () => {
    expect(isValidProgram({ days: [validDay({ exercises: [null] })] })).toBe(false)
  })

  it('rejects null day in array', () => {
    expect(isValidProgram({ days: [null] })).toBe(false)
  })
})
