import { motion } from 'motion/react'
import LottieRacer from './LottieRacer'

const MAX_RACER_SIZE = 160
const MIN_RACER_SIZE = 40

export default function RaceRenderer({ racers, positions, velocities, duration }) {
  const count = racers.length

  // Compute racer size to fit all racers within the viewport-constrained track.
  // The track height is set via CSS (100vh - header space). We use a rough
  // estimate here and let CSS clamp the container. Each racer needs size + gap.
  const availableHeight = window.innerHeight - 120
  const sizeFromFit = Math.floor(availableHeight / Math.max(count, 1) * 0.75)
  const racerSize = Math.max(MIN_RACER_SIZE, Math.min(MAX_RACER_SIZE, sizeFromFit))

  const trackHeight = Math.max(availableHeight, count * (racerSize * 0.6))

  return (
    <div className="race-track" style={{ height: Math.min(trackHeight, availableHeight) }}>
      <div className="finish-line" />
      {racers.map((racer, i) => {
        const pos = positions[i] || 0
        const vel = velocities[i] || 0
        const isFinished = pos >= 0.99
        const yOffset = (i / count) * (Math.min(trackHeight, availableHeight) - racerSize - 8)

        return (
          <motion.div
            key={racer.id}
            className="racer-wrapper"
            style={{ top: yOffset }}
            initial={{ left: '0%', opacity: 0 }}
            animate={{
              left: `${pos * 85}%`,
              opacity: 1,
              scale: isFinished ? [1, 1.2, 1.05] : 1,
            }}
            transition={{
              left: { type: 'tween', duration: 0.05, ease: 'linear' },
              opacity: { duration: 0.3, delay: i * 0.05 },
              scale: { duration: 0.4, ease: 'easeOut' },
            }}
          >
            <div className="racer-name">{racer.name}</div>
            <div className={`racer-emoji ${isFinished ? 'racer-finished' : ''}`}>
              <LottieRacer
                src={racer.lottie.src}
                size={racerSize}
                speed={Math.max(0.3, 1 + Math.abs(vel) * 80)}
                playing={true}
              />
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
