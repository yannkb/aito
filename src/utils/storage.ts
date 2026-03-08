import type { Program } from '../types/program';
import { STORAGE_KEYS } from '../constants/storage';
import { isValidProgram } from './import';

export function saveProgram(program: Program): void {
  try {
    const serialized = JSON.stringify(program);
    localStorage.setItem(STORAGE_KEYS.PROGRAM, serialized);
  } catch (error) {
    console.error('Failed to save program to localStorage:', error);
  }
}

export function loadProgram(): Program | null {
  try {
    const serialized = localStorage.getItem(STORAGE_KEYS.PROGRAM);
    if (serialized === null) {
      return null;
    }
    const parsed: unknown = JSON.parse(serialized);
    if (!isValidProgram(parsed)) {
      console.error('Invalid program data in localStorage');
      return null;
    }
    return parsed;
  } catch (error) {
    console.error('Failed to load program from localStorage:', error);
    return null;
  }
}
