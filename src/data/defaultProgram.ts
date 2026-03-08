import type { Program, Exercise } from '../types/program';

const mobilityExercises: Omit<Exercise, 'id'>[] = [
  {
    name: '90/90 Hip Switches',
    sets: 1,
    reps: '1 min/side',
    notes: 'Hip internal + external rotation',
    image: '/exercises/90-90-hip-switches.svg',
  },
  {
    name: 'Couch Stretch',
    sets: 1,
    reps: '1 min/side',
    notes: 'Hip flexors',
    image: '/exercises/couch-stretch.svg',
  },
  {
    name: 'Deep Squat Hold',
    sets: 1,
    reps: '2 min',
    notes: 'Ankles + hips + thoracic',
    image: '/exercises/deep-squat-hold.svg',
  },
  {
    name: "World's Greatest Stretch",
    sets: 1,
    reps: '5 reps/side',
    notes: 'Full-body opener',
    image: '/exercises/worlds-greatest-stretch.svg',
  },
  {
    name: 'Cat-Cow',
    sets: 1,
    reps: '10 reps',
    notes: 'Spinal mobility',
    image: '/exercises/cat-cow.svg',
  },
  {
    name: 'Wall Slides',
    sets: 1,
    reps: '10 reps',
    notes: 'Shoulder health + thoracic extension',
    image: '/exercises/wall-slides.svg',
  },
  {
    name: 'Pigeon Stretch',
    sets: 1,
    reps: '1 min/side',
    notes: 'Deep hip opening',
    image: '/exercises/pigeon-stretch.svg',
  },
];

function withIds(exercises: Omit<Exercise, 'id'>[], prefix: string): Exercise[] {
  return exercises.map((ex, i) => ({
    ...ex,
    id: `${prefix}-mob-${i}`,
  }));
}

export const defaultProgram: Program = {
  days: [
    {
      id: 'default-monday',
      name: 'Monday',
      sessionName: 'Mobility · Dance PM',
      sessionType: 'dance',
      exercises: withIds(mobilityExercises, 'mon'),
    },
    {
      id: 'default-tuesday',
      name: 'Tuesday',
      sessionName: 'Mobility · Dance PM',
      sessionType: 'dance',
      exercises: withIds(mobilityExercises, 'tue'),
    },
    {
      id: 'default-wednesday',
      name: 'Wednesday',
      sessionName: 'Mobility · Dance PM',
      sessionType: 'dance',
      exercises: withIds(mobilityExercises, 'wed'),
    },
    {
      id: 'default-thursday',
      name: 'Thursday',
      sessionName: 'Upper Body',
      sessionType: 'gym',
      exercises: [],
    },
    {
      id: 'default-friday',
      name: 'Friday',
      sessionName: 'Lower Body',
      sessionType: 'gym',
      exercises: [],
    },
    {
      id: 'default-saturday',
      name: 'Saturday',
      sessionName: 'Ori Conditioning + Run',
      sessionType: 'cardio',
      exercises: [
        {
          id: 'sat-wall-sit',
          name: 'Wall Sit',
          sets: 3,
          reps: '60s',
          notes: 'Low position, thighs parallel. 30s rest between sets.',
        },
        {
          id: 'sat-paoti-ladder',
          name: "Pa'oti Ladder",
          sets: 8,
          reps: '30s on / 30s rest',
          notes: 'Focus on speed and sharpness',
        },
        {
          id: 'sat-deep-squat-hold',
          name: 'Deep Squat Hold',
          sets: 2,
          reps: '60s',
          notes: 'Heels down, open hips, breathe',
        },
        {
          id: 'sat-outdoor-run',
          name: 'Outdoor Run',
          sets: 1,
          reps: '40-50 min',
          notes: 'Easy to moderate pace. Base endurance.',
        },
      ],
    },
    {
      id: 'default-sunday',
      name: 'Sunday',
      sessionName: 'Rest + Mobility',
      sessionType: 'rest',
      exercises: withIds(mobilityExercises, 'sun'),
    },
  ],
};
