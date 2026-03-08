/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  use,
  useReducer,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Program, Day, Exercise } from '../types/program'
import { defaultProgram } from '../data/defaultProgram';
import { saveProgram, loadProgram } from '../utils/storage';
import { generateId } from '../utils/id';

type ProgramAction =
  | { type: 'LOAD_PROGRAM'; payload: Program }
  | { type: 'ADD_DAY'; payload: Day }
  | {
      type: 'UPDATE_DAY';
      payload: {
        dayId: string;
        updates: Partial<Pick<Day, 'name' | 'sessionName' | 'sessionType' | 'notes'>>;
      };
    }
  | { type: 'DELETE_DAY'; payload: { dayId: string } }
  | { type: 'ADD_EXERCISE'; payload: { dayId: string; exercise: Exercise } }
  | {
      type: 'UPDATE_EXERCISE';
      payload: {
        dayId: string;
        exerciseId: string;
        updates: Partial<Exercise>;
      };
    }
  | {
      type: 'DELETE_EXERCISE';
      payload: { dayId: string; exerciseId: string };
    }
  | { type: 'MOVE_EXERCISE_UP'; payload: { dayId: string; exerciseId: string } }
  | {
      type: 'MOVE_EXERCISE_DOWN';
      payload: { dayId: string; exerciseId: string };
    }
  | { type: 'MOVE_DAY_UP'; payload: { dayId: string } }
  | { type: 'MOVE_DAY_DOWN'; payload: { dayId: string } }
  | { type: 'DUPLICATE_DAY'; payload: { dayId: string } }
  | { type: 'COPY_EXERCISES_FROM_DAY'; payload: { targetDayId: string; sourceDayId: string } };

function swapItems<T>(array: T[], index: number, direction: 'up' | 'down'): T[] | null {
  const targetIndex = direction === 'up' ? index - 1 : index + 1
  if (targetIndex < 0 || targetIndex >= array.length) return null
  const result = [...array];
  [result[index], result[targetIndex]] = [result[targetIndex], result[index]]
  return result
}

function programReducer(state: Program, action: ProgramAction): Program {
  switch (action.type) {
    case 'LOAD_PROGRAM':
      return action.payload;

    case 'ADD_DAY':
      return {
        ...state,
        days: [...state.days, action.payload],
      };

    case 'UPDATE_DAY':
      return {
        ...state,
        days: state.days.map((day) =>
          day.id === action.payload.dayId
            ? { ...day, ...action.payload.updates }
            : day
        ),
      };

    case 'DELETE_DAY':
      return {
        ...state,
        days: state.days.filter((day) => day.id !== action.payload.dayId),
      };

    case 'ADD_EXERCISE':
      return {
        ...state,
        days: state.days.map((day) =>
          day.id === action.payload.dayId
            ? {
                ...day,
                exercises: [...day.exercises, action.payload.exercise],
              }
            : day
        ),
      };

    case 'UPDATE_EXERCISE':
      return {
        ...state,
        days: state.days.map((day) =>
          day.id === action.payload.dayId
            ? {
                ...day,
                exercises: day.exercises.map((exercise) =>
                  exercise.id === action.payload.exerciseId
                    ? { ...exercise, ...action.payload.updates }
                    : exercise
                ),
              }
            : day
        ),
      };

    case 'DELETE_EXERCISE':
      return {
        ...state,
        days: state.days.map((day) =>
          day.id === action.payload.dayId
            ? {
                ...day,
                exercises: day.exercises.filter(
                  (exercise) => exercise.id !== action.payload.exerciseId
                ),
              }
            : day
        ),
      };

    case 'MOVE_EXERCISE_UP': {
      const dayIndex = state.days.findIndex(d => d.id === action.payload.dayId)
      if (dayIndex === -1) return state
      const day = state.days[dayIndex]
      const exIndex = day.exercises.findIndex(ex => ex.id === action.payload.exerciseId)
      const swapped = swapItems(day.exercises, exIndex, 'up')
      if (!swapped) return state
      return {
        ...state,
        days: state.days.map((d, i) => i === dayIndex ? { ...d, exercises: swapped } : d),
      }
    }

    case 'MOVE_EXERCISE_DOWN': {
      const dayIndex = state.days.findIndex(d => d.id === action.payload.dayId)
      if (dayIndex === -1) return state
      const day = state.days[dayIndex]
      const exIndex = day.exercises.findIndex(ex => ex.id === action.payload.exerciseId)
      const swapped = swapItems(day.exercises, exIndex, 'down')
      if (!swapped) return state
      return {
        ...state,
        days: state.days.map((d, i) => i === dayIndex ? { ...d, exercises: swapped } : d),
      }
    }

    case 'MOVE_DAY_UP': {
      const dayIndex = state.days.findIndex(d => d.id === action.payload.dayId)
      const swapped = swapItems(state.days, dayIndex, 'up')
      return swapped ? { ...state, days: swapped } : state
    }

    case 'MOVE_DAY_DOWN': {
      const dayIndex = state.days.findIndex(d => d.id === action.payload.dayId)
      const swapped = swapItems(state.days, dayIndex, 'down')
      return swapped ? { ...state, days: swapped } : state
    }

    case 'DUPLICATE_DAY': {
      const sourceDayIndex = state.days.findIndex(
        (day) => day.id === action.payload.dayId
      );
      if (sourceDayIndex === -1) return state;

      const sourceDay = state.days[sourceDayIndex];
      const duplicatedDay: Day = {
        id: generateId(),
        name: `${sourceDay.name} (copy)`,
        sessionName: sourceDay.sessionName,
        sessionType: sourceDay.sessionType,
        exercises: sourceDay.exercises.map((ex) => ({
          ...ex,
          id: generateId(),
        })),
      };

      const newDays = [...state.days];
      newDays.splice(sourceDayIndex + 1, 0, duplicatedDay);

      return {
        ...state,
        days: newDays,
      };
    }

    case 'COPY_EXERCISES_FROM_DAY': {
      const sourceDay = state.days.find(d => d.id === action.payload.sourceDayId)
      if (!sourceDay) return state

      const copiedExercises = sourceDay.exercises.map(ex => ({
        ...ex,
        id: generateId(),
      }))

      return {
        ...state,
        days: state.days.map(d =>
          d.id === action.payload.targetDayId
            ? { ...d, exercises: [...d.exercises, ...copiedExercises] }
            : d
        ),
      }
    }

    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}

const ProgramContext = createContext<Program | undefined>(undefined);
const ProgramDispatchContext = createContext<
  React.Dispatch<ProgramAction> | undefined
>(undefined);
const SavedContext = createContext<boolean>(false);

export function ProgramProvider({ children }: { children: ReactNode }) {
  const [program, dispatch] = useReducer(programReducer, null, () => {
    const loaded = loadProgram();
    return loaded ?? defaultProgram;
  });

  const [saved, setSaved] = useState(false);
  const saveTimeoutRef = useRef<number | null>(null);
  const savedTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (saveTimeoutRef.current !== null) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      saveProgram(program);
      setSaved(true);
      if (savedTimeoutRef.current !== null) {
        clearTimeout(savedTimeoutRef.current);
      }
      savedTimeoutRef.current = window.setTimeout(() => {
        setSaved(false);
      }, 1500);
    }, 500);

    return () => {
      if (saveTimeoutRef.current !== null) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [program]);

  return (
    <ProgramContext.Provider value={program}>
      <ProgramDispatchContext.Provider value={dispatch}>
        <SavedContext.Provider value={saved}>
          {children}
        </SavedContext.Provider>
      </ProgramDispatchContext.Provider>
    </ProgramContext.Provider>
  );
}

export function useProgram() {
  const context = use(ProgramContext);
  if (context === undefined) {
    throw new Error('useProgram must be used within a ProgramProvider');
  }
  return context;
}

export function useProgramDispatch() {
  const context = use(ProgramDispatchContext);
  if (context === undefined) {
    throw new Error('useProgramDispatch must be used within a ProgramProvider');
  }
  return context;
}

export function useSaved() {
  return use(SavedContext);
}
