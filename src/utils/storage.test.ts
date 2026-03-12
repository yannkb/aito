import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Program } from '../types/program'
import { STORAGE_KEYS } from '../constants/storage'

const mockStorage = new Map<string, string>()
vi.stubGlobal('localStorage', {
  getItem: (key: string) => mockStorage.get(key) ?? null,
  setItem: (key: string, value: string) => { mockStorage.set(key, value) },
  removeItem: (key: string) => { mockStorage.delete(key) },
  clear: () => { mockStorage.clear() },
})

const { saveProgram, loadProgram } = await import('./storage')

function validProgram(): Program {
  return {
    days: [
      {
        id: 'day-1',
        name: 'Monday',
        sessionName: 'Push',
        sessionType: 'gym',
        exercises: [
          { id: 'ex-1', name: 'Squat', sets: 4, reps: '6-8' },
        ],
      },
    ],
  }
}

describe('saveProgram', () => {
  beforeEach(() => {
    mockStorage.clear()
  })

  it('saves valid program and returns true', () => {
    const program = validProgram()
    const result = saveProgram(program)
    expect(result).toBe(true)
    const stored = mockStorage.get(STORAGE_KEYS.PROGRAM)
    expect(stored).toBeDefined()
    expect(JSON.parse(stored!)).toEqual(program)
  })

  it('uses the correct storage key', () => {
    saveProgram(validProgram())
    expect(mockStorage.has(STORAGE_KEYS.PROGRAM)).toBe(true)
    expect(mockStorage.has('aito-program')).toBe(true)
  })

  it('returns false when localStorage throws (quota exceeded)', () => {
    vi.stubGlobal('localStorage', {
      ...localStorage,
      setItem: () => { throw new DOMException('QuotaExceededError') },
    })
    const result = saveProgram(validProgram())
    expect(result).toBe(false)
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => mockStorage.get(key) ?? null,
      setItem: (key: string, value: string) => { mockStorage.set(key, value) },
      removeItem: (key: string) => { mockStorage.delete(key) },
      clear: () => { mockStorage.clear() },
    })
  })

  it('overwrites previous data on second save', () => {
    saveProgram(validProgram())
    const updated: Program = { days: [] }
    saveProgram(updated)
    const stored = JSON.parse(mockStorage.get(STORAGE_KEYS.PROGRAM)!)
    expect(stored.days).toEqual([])
  })
})

describe('loadProgram', () => {
  beforeEach(() => {
    mockStorage.clear()
  })

  it('returns program when valid data exists', () => {
    const program = validProgram()
    mockStorage.set(STORAGE_KEYS.PROGRAM, JSON.stringify(program))
    const loaded = loadProgram()
    expect(loaded).toEqual(program)
  })

  it('returns null when key does not exist', () => {
    expect(loadProgram()).toBeNull()
  })

  it('returns null when data is invalid JSON', () => {
    mockStorage.set(STORAGE_KEYS.PROGRAM, '{invalid json!!!')
    expect(loadProgram()).toBeNull()
  })

  it('returns null when data is valid JSON but invalid program', () => {
    mockStorage.set(STORAGE_KEYS.PROGRAM, JSON.stringify({ notDays: true }))
    expect(loadProgram()).toBeNull()
  })

  it('returns null when stored program has invalid exercise', () => {
    const bad = {
      days: [{
        id: 'd1',
        name: 'Monday',
        sessionName: 'Push',
        sessionType: 'gym',
        exercises: [{ id: 'e1', name: '', sets: 0, reps: '' }],
      }],
    }
    mockStorage.set(STORAGE_KEYS.PROGRAM, JSON.stringify(bad))
    expect(loadProgram()).toBeNull()
  })

  it('returns program with empty days array', () => {
    mockStorage.set(STORAGE_KEYS.PROGRAM, JSON.stringify({ days: [] }))
    const loaded = loadProgram()
    expect(loaded).toEqual({ days: [] })
  })
})
