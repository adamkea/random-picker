import { motion } from 'motion/react'
import LottieRacer from './LottieRacer'

const RACER_SIZE = 160

export default function RaceRenderer({ racers, positions, velocities, duration }) {
  const trackHeight = Math.max(400, racers.length * 130)

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-white/[.02]" style={{ height: trackHeight }}>
      <div className="finish-line" />
      {racers.map((racer, i) => {
        const pos = positions[i] || 0
        const vel = velocities[i] || 0
        const isFinished = pos >= 0.99
        const yOffset = (i / racers.length) * (trackHeight - RACER_SIZE - 24)

        return (
          <motion.div
            key={racer.id}
            className="absolute flex flex-col items-center z-[2]"
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
            <div className="text-lg font-semibold text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.7)] whitespace-nowrap text-center mb-1 max-w-[180px] overflow-hidden text-ellipsis max-[600px]:text-xs max-[600px]:max-w-[100px]">
              {racer.name}
            </div>
            <div className={`racer-emoji z-[2] flex items-center [filter:drop-shadow(0_0_4px_rgba(255,255,255,0.3))] ${isFinished ? '[filter:drop-shadow(0_0_12px_rgba(251,191,36,0.8))]' : ''}`}>
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
