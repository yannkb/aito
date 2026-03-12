export interface Quote {
  text: string
  author?: string
}

export interface ToolkitEntry {
  trigger: string
  action: string
}

export interface Habit {
  icon: string
  text: string
}

export function getDailyQuote(collection: Quote[]): Quote {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const dayOfYear = Math.floor(
    (now.getTime() - start.getTime()) / 86_400_000
  )
  return collection[dayOfYear % collection.length]
}

export const quotes: Quote[] = [
  {
    text: 'The only way to deal with an unfree world is to become so absolutely free that your very existence is an act of rebellion.',
    author: 'Albert Camus',
  },
  {
    text: 'My heart is at ease knowing that what was meant for me will never miss me, and that what misses me was never meant for me.',
    author: 'Imam al-Shafi\u2019i',
  },
  {
    text: 'If you\u2019re a Kanye West fan, you\u2019re not a fan of me. You\u2019re a fan of yourself.',
    author: 'Kanye West',
  },
  {
    text: 'You have power over your mind \u2014 not outside events. Realize this, and you will find strength.',
    author: 'Marcus Aurelius',
  },
  {
    text: 'We suffer more often in imagination than in reality.',
    author: 'Seneca',
  },
  {
    text: 'It is not that we have a short time to live, but that we waste a great deal of it.',
    author: 'Seneca',
  },
  {
    text: 'No man is free who is not master of himself.',
    author: 'Epictetus',
  },
  {
    text: 'Waste no more time arguing about what a good man should be. Be one.',
    author: 'Marcus Aurelius',
  },
  {
    text: 'The impediment to action advances action. What stands in the way becomes the way.',
    author: 'Marcus Aurelius',
  },
  {
    text: 'Discipline equals freedom.',
    author: 'Jocko Willink',
  },
  {
    text: 'I don\u2019t stop when I\u2019m tired. I stop when I\u2019m done.',
    author: 'David Goggins',
  },
  {
    text: 'When your mind is telling you you\u2019re done, you\u2019re really only 40% done.',
    author: 'David Goggins',
  },
  {
    text: 'A fit body, a calm mind, a house full of love. These things cannot be bought \u2014 they must be earned.',
    author: 'Naval Ravikant',
  },
  {
    text: 'Desire is a contract that you make with yourself to be unhappy until you get what you want.',
    author: 'Naval Ravikant',
  },
  {
    text: 'Compare yourself to who you were yesterday, not to who someone else is today.',
    author: 'Jordan Peterson',
  },
  {
    text: 'Do not pray for an easy life. Pray for the strength to endure a difficult one.',
    author: 'Bruce Lee',
  },
  {
    text: 'He who fears death will never do anything worthy of a living man.',
    author: 'Seneca',
  },
  {
    text: 'Difficulties strengthen the mind, as labor does the body.',
    author: 'Seneca',
  },
  {
    text: 'Begin at once to live, and count each separate day as a separate life.',
    author: 'Seneca',
  },
  {
    text: 'The cave you fear to enter holds the treasure you seek.',
    author: 'Joseph Campbell',
  },
  {
    text: 'A man who has not passed through the inferno of his passions has never overcome them.',
    author: 'Carl Jung',
  },
  {
    text: 'Victorious warriors win first and then go to war, while defeated warriors go to war first and then seek to win.',
    author: 'Sun Tzu',
  },
  {
    text: 'Death is more certain than tomorrow morning \u2014 yet you prepare for tomorrow and not for death. Tend to your soul first.',
  },
  {
    text: 'Chase purpose, not people. What is meant for you will find you when you become who you are meant to be.',
  },
]

export const toolkit: ToolkitEntry[] = [
  { trigger: 'Sad', action: 'sunlight' },
  { trigger: 'Doubt', action: 'pray' },
  { trigger: 'Angry', action: 'lift' },
  { trigger: 'Stressed', action: 'run' },
  { trigger: 'Lonely', action: 'family' },
  { trigger: 'Tired', action: 'sleep' },
  { trigger: 'Anxious', action: 'walk' },
  { trigger: 'Overthinking', action: 'talk to a friend' },
]

export const habits: Habit[] = [
  { icon: '\u{1F37D}\uFE0F', text: 'Final food 4 hours before bed' },
  { icon: '\u{1F4F5}', text: 'Screens off 30 min before bed' },
  { icon: '\u{1F534}', text: 'Avoid blue light 2hr before bed \u2014 use red/amber' },
  { icon: '\u{1F4D6}', text: 'Book in hand 10 min before sleep' },
  { icon: '\u{1F319}', text: 'Go to bed at the same time every night' },
  { icon: '\u2600\uFE0F', text: 'Light in eyes when waking (sun or 10k lux)' },
  { icon: '\u{1F6B6}', text: 'Walk for 10 min immediately after eating' },
  { icon: '\u{1F4AA}', text: 'Daily exercise (even if for 20 min)' },
  { icon: '\u{1F957}', text: 'Eat good stuff, ditch the junk' },
  { icon: '\u2764\uFE0F', text: 'Foster friends, family and love' },
]
