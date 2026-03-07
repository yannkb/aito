import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import type { Program, Day, Exercise } from '../types/program';
import { defaultProgram } from '../data/defaultProgram';
import { saveProgram, loadProgram } from '../utils/storage';

type ProgramAction =
  | { type: 'LOAD_PROGRAM'; payload: Program }
  | { type: 'ADD_DAY'; payload: Day }
  | {
      type: 'UPDATE_DAY';
      payload: {
        dayId: string;
        updates: Partial<Pick<Day, 'name' | 'sessionName' | 'sessionType'>>;
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
  | { type: 'IMPORT_PROGRAM'; payload: Program };

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
      const dayIndex = state.days.findIndex(
        (day) => day.id === action.payload.dayId
      );
      if (dayIndex === -1) return state;

      const day = state.days[dayIndex];
      const exerciseIndex = day.exercises.findIndex(
        (ex) => ex.id === action.payload.exerciseId
      );
      if (exerciseIndex <= 0) return state;

      const newExercises = [...day.exercises];
      [newExercises[exerciseIndex - 1], newExercises[exerciseIndex]] = [
        newExercises[exerciseIndex],
        newExercises[exerciseIndex - 1],
      ];

      return {
        ...state,
        days: state.days.map((d, i) =>
          i === dayIndex ? { ...d, exercises: newExercises } : d
        ),
      };
    }

    case 'MOVE_EXERCISE_DOWN': {
      const dayIndex = state.days.findIndex(
        (day) => day.id === action.payload.dayId
      );
      if (dayIndex === -1) return state;

      const day = state.days[dayIndex];
      const exerciseIndex = day.exercises.findIndex(
        (ex) => ex.id === action.payload.exerciseId
      );
      if (exerciseIndex === -1 || exerciseIndex >= day.exercises.length - 1)
        return state;

      const newExercises = [...day.exercises];
      [newExercises[exerciseIndex], newExercises[exerciseIndex + 1]] = [
        newExercises[exerciseIndex + 1],
        newExercises[exerciseIndex],
      ];

      return {
        ...state,
        days: state.days.map((d, i) =>
          i === dayIndex ? { ...d, exercises: newExercises } : d
        ),
      };
    }

    case 'MOVE_DAY_UP': {
      const dayIndex = state.days.findIndex(
        (day) => day.id === action.payload.dayId
      );
      if (dayIndex <= 0) return state;

      const newDays = [...state.days];
      [newDays[dayIndex - 1], newDays[dayIndex]] = [
        newDays[dayIndex],
        newDays[dayIndex - 1],
      ];

      return {
        ...state,
        days: newDays,
      };
    }

    case 'MOVE_DAY_DOWN': {
      const dayIndex = state.days.findIndex(
        (day) => day.id === action.payload.dayId
      );
      if (dayIndex === -1 || dayIndex >= state.days.length - 1) return state;

      const newDays = [...state.days];
      [newDays[dayIndex], newDays[dayIndex + 1]] = [
        newDays[dayIndex + 1],
        newDays[dayIndex],
      ];

      return {
        ...state,
        days: newDays,
      };
    }

    case 'IMPORT_PROGRAM':
      return action.payload;

    default:
      return state;
  }
}

const ProgramContext = createContext<Program | undefined>(undefined);
const ProgramDispatchContext = createContext<
  React.Dispatch<ProgramAction> | undefined
>(undefined);

export function ProgramProvider({ children }: { children: ReactNode }) {
  const [program, dispatch] = useReducer(programReducer, null, () => {
    const loaded = loadProgram();
    return loaded ?? defaultProgram;
  });

  const saveTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (saveTimeoutRef.current !== null) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      saveProgram(program);
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
        {children}
      </ProgramDispatchContext.Provider>
    </ProgramContext.Provider>
  );
}

export function useProgram() {
  const context = useContext(ProgramContext);
  if (context === undefined) {
    throw new Error('useProgram must be used within a ProgramProvider');
  }
  return context;
}

export function useProgramDispatch() {
  const context = useContext(ProgramDispatchContext);
  if (context === undefined) {
    throw new Error('useProgramDispatch must be used within a ProgramProvider');
  }
  return context;
}
