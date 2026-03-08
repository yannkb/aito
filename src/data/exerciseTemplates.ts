export interface ExerciseTemplate {
  name: string
  sets: number
  reps: string
  notes?: string
  category: 'mobility' | 'conditioning' | 'gym'
}

export const exerciseTemplates: ExerciseTemplate[] = [
  {
    name: '90/90 Hip Switches',
    sets: 1,
    reps: '1 min/side',
    notes: 'Hip internal + external rotation',
    category: 'mobility',
  },
  {
    name: 'Couch Stretch',
    sets: 1,
    reps: '1 min/side',
    notes: 'Hip flexors',
    category: 'mobility',
  },
  {
    name: 'Deep Squat Hold',
    sets: 1,
    reps: '2 min',
    notes: 'Ankles + hips + thoracic',
    category: 'mobility',
  },
  {
    name: "World's Greatest Stretch",
    sets: 1,
    reps: '5 reps/side',
    notes: 'Full-body opener',
    category: 'mobility',
  },
  {
    name: 'Cat-Cow',
    sets: 1,
    reps: '10 reps',
    notes: 'Spinal mobility',
    category: 'mobility',
  },
  {
    name: 'Wall Slides',
    sets: 1,
    reps: '10 reps',
    notes: 'Shoulder health + thoracic extension',
    category: 'mobility',
  },
  {
    name: 'Pigeon Stretch',
    sets: 1,
    reps: '1 min/side',
    notes: 'Deep hip opening',
    category: 'mobility',
  },

  {
    name: 'Wall Sit',
    sets: 3,
    reps: '60s',
    notes: 'Low position, thighs parallel. 30s rest between sets.',
    category: 'conditioning',
  },
  {
    name: "Pa'oti Ladder",
    sets: 8,
    reps: '30s on / 30s rest',
    notes: 'Focus on speed and sharpness',
    category: 'conditioning',
  },
  {
    name: 'Deep Squat Hold',
    sets: 2,
    reps: '60s',
    notes: 'Heels down, open hips, breathe',
    category: 'conditioning',
  },
  {
    name: 'Outdoor Run',
    sets: 1,
    reps: '40-50 min',
    notes: 'Easy to moderate pace. Base endurance.',
    category: 'conditioning',
  },

  {
    name: 'Bench Press',
    sets: 4,
    reps: '6-8',
    category: 'gym',
  },
  {
    name: 'Back Squat',
    sets: 4,
    reps: '6-8',
    category: 'gym',
  },
  {
    name: 'Deadlift',
    sets: 3,
    reps: '5',
    category: 'gym',
  },
  {
    name: 'Overhead Press',
    sets: 4,
    reps: '8-10',
    category: 'gym',
  },
  {
    name: 'Barbell Row',
    sets: 4,
    reps: '8-10',
    category: 'gym',
  },
  {
    name: 'Pull-ups',
    sets: 3,
    reps: 'max',
    category: 'gym',
  },
  {
    name: 'Dumbbell Lunges',
    sets: 3,
    reps: '10/side',
    category: 'gym',
  },
  {
    name: 'Romanian Deadlift',
    sets: 3,
    reps: '10',
    category: 'gym',
  },
]
