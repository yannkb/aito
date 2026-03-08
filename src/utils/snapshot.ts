import type { Program } from '../types/program'

export function createProgramSnapshot(program: Program): Program {
  return {
    ...program,
    days: program.days.map(d => ({
      ...d,
      exercises: [...d.exercises],
    })),
  }
}
