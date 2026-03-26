// Lottie animation pool — replaces the old EMOJI_POOL
// Each entry points to a .json (or .lottie) file in public/lottie/
// Replace the placeholder files with real running character animations
// downloaded from https://app.lottiefiles.com/

const ANIMATION_URL = 'https://lottie.host/a4a4cff4-f497-4f51-9f08-5bc248eda4fb/whtJhgsjiU.lottie'

export const LOTTIE_POOL = [
  { id: 'runner-1', src: ANIMATION_URL, label: 'Runner 1' },
  { id: 'runner-2', src: ANIMATION_URL, label: 'Runner 2' },
  { id: 'runner-3', src: ANIMATION_URL, label: 'Runner 3' },
  { id: 'runner-4', src: ANIMATION_URL, label: 'Runner 4' },
  { id: 'runner-5', src: ANIMATION_URL, label: 'Runner 5' },
  { id: 'runner-6', src: ANIMATION_URL, label: 'Runner 6' },
  { id: 'runner-7', src: ANIMATION_URL, label: 'Runner 7' },
  { id: 'runner-8', src: ANIMATION_URL, label: 'Runner 8' },
  { id: 'runner-9', src: ANIMATION_URL, label: 'Runner 9' },
  { id: 'runner-10', src: ANIMATION_URL, label: 'Runner 10' },
  { id: 'runner-11', src: ANIMATION_URL, label: 'Runner 11' },
  { id: 'runner-12', src: ANIMATION_URL, label: 'Runner 12' },
]

export function getLottieById(id) {
  return LOTTIE_POOL.find(l => l.id === id)
}
