// Lottie animation pool — each entry is a different color variant of the running character

export const LOTTIE_POOL = [
  { id: 'runner-original', src: 'https://lottie.host/a4a4cff4-f497-4f51-9f08-5bc248eda4fb/whtJhgsjiU.lottie', label: 'Original' },
  { id: 'runner-green', src: 'https://lottie.host/e885378b-0ce3-47d4-9dcc-0c88d26e73eb/PYotBUsycE.lottie', label: 'Green' },
  { id: 'runner-blue', src: 'https://lottie.host/4570fd28-21db-4f62-9de0-2b9bdb806a14/lIIraGN2Fm.lottie', label: 'Blue' },
  { id: 'runner-pink', src: 'https://lottie.host/32de5796-2f17-44ca-850d-055b08105610/VX8wsxExl1.lottie', label: 'Pink' },
  { id: 'runner-yellow', src: 'https://lottie.host/773e71b4-71e2-49e1-bc21-844d7f5b3172/GgS4B0PYYt.lottie', label: 'Yellow' },
]

export function getLottieById(id) {
  return LOTTIE_POOL.find(l => l.id === id)
}
