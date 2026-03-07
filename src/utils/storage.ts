import type { Program } from '../types/program';

const STORAGE_KEY = 'training-pwa-program';

export function saveProgram(program: Program): void {
  try {
    const serialized = JSON.stringify(program);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.error('Failed to save program to localStorage:', error);
  }
}

export function loadProgram(): Program | null {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (serialized === null) {
      return null;
    }
    return JSON.parse(serialized) as Program;
  } catch (error) {
    console.error('Failed to load program from localStorage:', error);
    return null;
  }
}
