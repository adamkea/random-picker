import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import LottieRacer from './LottieRacer'

const TICK_INTERVAL = 30 // ~33fps

export default function RaceTrack({ racers, phase, duration, onCountdownDone, onRaceFinish }) {
  const [countdownValue, setCountdownValue] = useState(3)
  const [positions, setPositions] = useState(() => racers.map(() => 0))
  const [velocities, setVelocities] = useState(() => racers.map(() => 0))
  const raceRef = useRef(null)
  const winnerRef = useRef(null)

  // Countdown
  useEffect(() => {
    if (phase !== 'countdown') return

    setCountdownValue(3)
    setPositions(racers.map(() => 0))
    setVelocities(racers.map(() => 0))

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
    const raceDuration = duration || 5000
    const winnerIndex = racers.findIndex(r => r.id === winnerRef.current.id)
    const startTime = Date.now()

    // Generate random speed profiles for each racer
    // Each racer gets a pre-computed set of speed segments to avoid per-tick randomness
    const profiles = racers.map((_, i) => {
      const isWinner = i === winnerIndex
      const baseSpeed = isWinner ? 0.85 + Math.random() * 0.15 : 0.5 + Math.random() * 0.35
      // Pre-compute burst info
      const burstPoint = 0.7 + Math.random() * 0.2
      const burstMultiplier = isWinner ? 1.5 : 1.2 + Math.random() * 0.15
      // Pre-compute loser final cap
      const loserCap = 0.75 + Math.random() * 0.17
      // Pre-compute speed variation segments (varying speed, always positive)
      const segmentCount = 8 + Math.floor(Math.random() * 6)
      const segments = Array.from({ length: segmentCount }, () => 0.6 + Math.random() * 0.8)
      return { baseSpeed, burstPoint, burstMultiplier, loserCap, segments, segmentCount, isWinner }
    })

    // Track max positions to ensure monotonic forward movement
    const maxPositions = racers.map(() => 0)

    raceRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / raceDuration, 1)

      const newPositions = profiles.map((profile, i) => {
        // Get speed variation from pre-computed segments
        const segIdx = Math.min(Math.floor(progress * profile.segmentCount), profile.segmentCount - 1)
        let speed = profile.baseSpeed * profile.segments[segIdx]

        // Apply burst near finish
        if (progress > profile.burstPoint) {
          speed *= profile.burstMultiplier
        }

        // Calculate position
        let pos = progress * speed

        // Winner must reach 1.0 at the end
        if (profile.isWinner) {
          const minPos = progress * 0.6
          pos = Math.max(pos, minPos)
          if (progress > 0.9) {
            pos = Math.max(pos, (progress - 0.9) / 0.1 * (1 - pos) + pos)
          }
        } else {
          pos = Math.min(pos, profile.loserCap)
        }

        pos = Math.min(Math.max(pos, 0), profile.isWinner && progress >= 1 ? 1 : 0.92)

        // Enforce monotonic forward movement
        maxPositions[i] = Math.max(maxPositions[i], pos)
        return maxPositions[i]
      })

      setPositions(prev => {
        setVelocities(newPositions.map((pos, i) => pos - (prev[i] || 0)))
        return newPositions
      })

      if (progress >= 1) {
        clearInterval(raceRef.current)
        setTimeout(() => {
          onRaceFinish(winnerRef.current)
        }, 400)
      }
    }, TICK_INTERVAL)
  }, [racers, duration, onRaceFinish])

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

  const RACER_SIZE = 96
  const trackHeight = Math.max(250, racers.length * 80)

  return (
    <motion.div
      className="race-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="race-track" style={{ height: trackHeight }}>
        <div className="finish-line" />
        {racers.map((racer, i) => {
          const pos = positions[i] || 0
          const vel = velocities[i] || 0
          const isFinished = pos >= 0.99
          const isMoving = Math.abs(vel) > 0.0001
          const speedThreshold = 0.003 * (5000 / (duration || 5000))
          const isFast = vel > speedThreshold
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
                  speed={1 + Math.abs(vel) * 80}
                  playing={isMoving}
                />
              </div>
              {isFast && (
                <motion.div
                  className="speed-trail"
                  animate={{ opacity: [0.6, 0.2, 0.6] }}
                  transition={{ duration: 0.4, repeat: Infinity }}
                />
              )}
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
