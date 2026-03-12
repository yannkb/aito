import { describe, it, expect } from 'vitest'
import type { Program } from '../types/program'
import { createProgramSnapshot } from './snapshot'

function makeProgram(): Program {
  return {
    days: [
      {
        id: 'day-1',
        name: 'Monday',
        sessionName: 'Push',
        sessionType: 'gym',
        notes: 'Upper body focus',
        exercises: [
          {
            id: 'ex-1',
            name: 'Bench Press',
            sets: 4,
            reps: '6-8',
            notes: 'Pause at bottom',
            image: '/exercises/bench.svg',
          },
          {
            id: 'ex-2',
            name: 'OHP',
            sets: 3,
            reps: '8-10',
          },
        ],
      },
      {
        id: 'day-2',
        name: 'Tuesday',
        sessionName: 'Ori Tahiti',
        sessionType: 'dance',
        exercises: [
          {
            id: 'ex-3',
            name: 'Tamau',
            sets: 3,
            reps: '30s',
          },
        ],
      },
    ],
  }
}

describe('createProgramSnapshot', () => {
  it('returns an object equal to the original', () => {
    const original = makeProgram()
    const snapshot = createProgramSnapshot(original)
    expect(snapshot).toEqual(original)
  })

  it('returns a different reference at program level', () => {
    const original = makeProgram()
    const snapshot = createProgramSnapshot(original)
    expect(snapshot).not.toBe(original)
  })

  it('returns a different reference for the days array', () => {
    const original = makeProgram()
    const snapshot = createProgramSnapshot(original)
    expect(snapshot.days).not.toBe(original.days)
  })

  it('returns different references for each day', () => {
    const original = makeProgram()
    const snapshot = createProgramSnapshot(original)
    for (let i = 0; i < original.days.length; i++) {
      expect(snapshot.days[i]).not.toBe(original.days[i])
    }
  })

  it('returns different references for each exercise', () => {
    const original = makeProgram()
    const snapshot = createProgramSnapshot(original)
    for (let i = 0; i < original.days.length; i++) {
      for (let j = 0; j < original.days[i].exercises.length; j++) {
        expect(snapshot.days[i].exercises[j]).not.toBe(original.days[i].exercises[j])
      }
    }
  })

  it('does not affect original when snapshot day is mutated', () => {
    const original = makeProgram()
    const snapshot = createProgramSnapshot(original)
    snapshot.days[0].name = 'Changed'
    expect(original.days[0].name).toBe('Monday')
  })

  it('does not affect original when snapshot exercise is mutated', () => {
    const original = makeProgram()
    const snapshot = createProgramSnapshot(original)
    snapshot.days[0].exercises[0].name = 'Changed Exercise'
    expect(original.days[0].exercises[0].name).toBe('Bench Press')
  })

  it('does not affect original when exercise is added to snapshot', () => {
    const original = makeProgram()
    const snapshot = createProgramSnapshot(original)
    snapshot.days[0].exercises.push({
      id: 'ex-new',
      name: 'New',
      sets: 1,
      reps: '1',
    })
    expect(original.days[0].exercises).toHaveLength(2)
  })

  it('preserves optional fields (notes, image)', () => {
    const original = makeProgram()
    const snapshot = createProgramSnapshot(original)
    expect(snapshot.days[0].notes).toBe('Upper body focus')
    expect(snapshot.days[0].exercises[0].notes).toBe('Pause at bottom')
    expect(snapshot.days[0].exercises[0].image).toBe('/exercises/bench.svg')
  })

  it('handles empty program (no days)', () => {
    const original: Program = { days: [] }
    const snapshot = createProgramSnapshot(original)
    expect(snapshot).toEqual({ days: [] })
    expect(snapshot).not.toBe(original)
    expect(snapshot.days).not.toBe(original.days)
  })

  it('handles day with no exercises', () => {
    const original: Program = {
      days: [
        {
          id: 'day-1',
          name: 'Rest',
          sessionName: 'Rest Day',
          sessionType: 'rest',
          exercises: [],
        },
      ],
    }
    const snapshot = createProgramSnapshot(original)
    expect(snapshot.days[0].exercises).toEqual([])
    expect(snapshot.days[0].exercises).not.toBe(original.days[0].exercises)
  })
})
