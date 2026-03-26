import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'

const RACE_DURATION = 5000 // 5 seconds
const TICK_INTERVAL = 30 // ~33fps

export default function RaceTrack({ racers, phase, onCountdownDone, onRaceFinish }) {
  const [countdownValue, setCountdownValue] = useState(3)
  const [positions, setPositions] = useState(() => racers.map(() => 0))
  const raceRef = useRef(null)
  const winnerRef = useRef(null)

  // Countdown
  useEffect(() => {
    if (phase !== 'countdown') return

    setCountdownValue(3)
    setPositions(racers.map(() => 0))

    // Pre-determine winner
    winnerRef.current = racers[Math.floor(Math.random() * racers.length)]

    const timers = [
      setTimeout(() => setCountdownValue(2), 700),
      setTimeout(() => setCountdownValue(1), 1400),
      setTimeout(() => setCountdownValue('GO!'), 2100),
      setTimeout(() => onCountdownDone(), 2600),
    ]

    return () => timers.forEach(clearTimeout)
  }, [phase, racers, onCountdownDone])

  // Race animation
  const startRace = useCallback(() => {
    const winnerIndex = racers.findIndex(r => r.id === winnerRef.current.id)
    const startTime = Date.now()

    // Generate random speed profiles for each racer
    const profiles = racers.map((_, i) => {
      const isWinner = i === winnerIndex
      const baseSpeed = isWinner ? 0.85 + Math.random() * 0.15 : 0.5 + Math.random() * 0.35
      const stutterPoints = Array.from({ length: 3 + Math.floor(Math.random() * 3) }, () => Math.random())
      const burstPoint = 0.7 + Math.random() * 0.2
      return { baseSpeed, stutterPoints, burstPoint, isWinner }
    })

    raceRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / RACE_DURATION, 1)

      const newPositions = profiles.map((profile) => {
        let speed = profile.baseSpeed

        // Apply stutters
        for (const sp of profile.stutterPoints) {
          const dist = Math.abs(progress - sp)
          if (dist < 0.05) {
            speed *= 0.3 + dist * 10
          }
        }

        // Apply burst near finish
        if (progress > profile.burstPoint) {
          speed *= 1.2 + (profile.isWinner ? 0.3 : Math.random() * 0.15)
        }

        // Calculate position with easing
        let pos = progress * speed
        // Add some wobble
        pos += Math.sin(progress * 15 + profile.baseSpeed * 10) * 0.01

        // Winner must reach 1.0 at the end
        if (profile.isWinner) {
          const minPos = progress * 0.6
          pos = Math.max(pos, minPos)
          if (progress > 0.9) {
            pos = Math.max(pos, (progress - 0.9) / 0.1 * (1 - pos) + pos)
          }
        } else {
          pos = Math.min(pos, 0.75 + Math.random() * 0.15)
        }

        return Math.min(Math.max(pos, 0), profile.isWinner && progress >= 1 ? 1 : 0.92)
      })

      setPositions(newPositions)

      if (progress >= 1) {
        clearInterval(raceRef.current)
        setTimeout(() => {
          onRaceFinish(winnerRef.current)
        }, 400)
      }
    }, TICK_INTERVAL)
  }, [racers, onRaceFinish])

  useEffect(() => {
    if (phase === 'racing') {
      startRace()
    }
    return () => {
      if (raceRef.current) clearInterval(raceRef.current)
    }
  }, [phase, startRace])

  if (phase === 'countdown') {
    return (
      <div className="race-container">
        <AnimatePresence mode="wait">
          <motion.div
            key={countdownValue}
            className={`countdown ${countdownValue === 'GO!' ? 'go' : ''}`}
            initial={{ scale: 2.5, opacity: 0, rotate: -15 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.3, opacity: 0, rotate: 15, filter: 'blur(8px)' }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 20,
              mass: 0.8,
            }}
          >
            {countdownValue}
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  return (
    <motion.div
      className="race-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="race-track">
        {racers.map((racer, i) => {
          const pos = positions[i] || 0
          const isFinished = pos >= 0.99
          const isFast = pos > 0.5

          return (
            <motion.div
              key={racer.id}
              className="lane"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 200 }}
            >
              <div className="lane-label">{racer.name}</div>
              <div className="lane-track">
                {/* Speed trail effect */}
                {isFast && (
                  <motion.div
                    className="speed-trail"
                    style={{ left: `${pos * 90}%` }}
                    animate={{ opacity: [0.6, 0.2, 0.6] }}
                    transition={{ duration: 0.4, repeat: Infinity }}
                  />
                )}
                <motion.div
                  className={`racer-emoji ${isFinished ? 'racer-finished' : ''}`}
                  animate={{
                    left: `${pos * 90}%`,
                    scale: isFinished ? [1, 1.4, 1.1] : 1,
                    rotate: isFinished ? [0, -10, 10, 0] : 0,
                  }}
                  transition={{
                    left: { type: 'tween', duration: 0.05, ease: 'linear' },
                    scale: { duration: 0.4, ease: 'easeOut' },
                    rotate: { duration: 0.4, ease: 'easeOut' },
                  }}
                >
                  {racer.emoji}
                </motion.div>
                <div className="finish-line" />
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
