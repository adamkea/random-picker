import { motion } from 'motion/react'
import LottieRacer from './LottieRacer'

const RACER_SIZE = 96

export default function RaceRenderer({ racers, positions, velocities, duration }) {
  const trackHeight = Math.max(250, racers.length * 80)

  return (
    <div className="race-track" style={{ height: trackHeight }}>
      <div className="finish-line" />
      {racers.map((racer, i) => {
        const pos = positions[i] || 0
        const vel = velocities[i] || 0
        const isFinished = pos >= 0.99
        const yOffset = (i / racers.length) * (trackHeight - RACER_SIZE - 24)

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
                size={RACER_SIZE}
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
