export interface Program {
  days: Day[];
}

export interface Day {
  id: string;
  name: string; // "Monday", "Tuesday", etc.
  sessionName: string; // "Push", "Ori Tahiti", "Rest / Mobility"
  sessionType: 'gym' | 'dance' | 'cardio' | 'rest';
  exercises: Exercise[];
  notes?: string;
}

export interface Exercise {
  id: string;
  name: string; // "Back Squat"
  sets: number; // 4
  reps: string; // "6-8" or "30-45s" for timed holds
  notes?: string; // "Endurance taparuru", "Quad focus"
  image?: string; // "/exercises/deep-squat-hold.svg" — optional illustration
}
