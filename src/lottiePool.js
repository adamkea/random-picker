// Lottie animation pool — replaces the old EMOJI_POOL
// Each entry points to a .json (or .lottie) file in public/lottie/
// Replace the placeholder files with real running character animations
// downloaded from https://app.lottiefiles.com/

export const LOTTIE_POOL = [
  { id: 'runner-1', src: 'https://lottie.host/a4a4cff4-f497-4f51-9f08-5bc248eda4fb/whtJhgsjiU.lottie', label: 'Runner' },
  { id: 'runner-2', src: '/lottie/runner-2.json', label: 'Blue Sprinter' },
  { id: 'runner-3', src: '/lottie/runner-3.json', label: 'Green Dasher' },
  { id: 'runner-4', src: '/lottie/runner-4.json', label: 'Gold Flash' },
  { id: 'runner-5', src: '/lottie/runner-5.json', label: 'Purple Bolt' },
  { id: 'runner-6', src: '/lottie/runner-6.json', label: 'Orange Blazer' },
  { id: 'runner-7', src: '/lottie/runner-7.json', label: 'Cyan Streak' },
  { id: 'runner-8', src: '/lottie/runner-8.json', label: 'Pink Racer' },
  { id: 'runner-9', src: '/lottie/runner-9.json', label: 'Silver Swift' },
  { id: 'runner-10', src: '/lottie/runner-10.json', label: 'Bronze Pacer' },
  { id: 'runner-11', src: '/lottie/runner-11.json', label: 'Yellow Zapper' },
  { id: 'runner-12', src: '/lottie/runner-12.json', label: 'Indigo Jogger' },
]

export function getLottieById(id) {
  return LOTTIE_POOL.find(l => l.id === id)
}
