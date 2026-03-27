import { useEffect } from 'react'
import { motion } from 'motion/react'
import confetti from 'canvas-confetti'
import LottieRacer from './LottieRacer'

export default function Result({ winner, raceGoal = 'winner', onRerace, onNewRace }) {
  const isLoser = raceGoal === 'loser'

  useEffect(() => {
    if (isLoser) return // No confetti for losers

    // Fire confetti bursts
    const fire = (opts) => {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        ...opts,
      })
    }

    fire({ angle: 60, origin: { x: 0.2 } })
    fire({ angle: 120, origin: { x: 0.8 } })

    const timer = setTimeout(() => {
      fire({ angle: 90, origin: { x: 0.5, y: 0.7 }, particleCount: 120, spread: 100 })
    }, 300)

    return () => clearTimeout(timer)
  }, [isLoser])

  return (
    <motion.div
      className={`result-container${isLoser ? ' result-loser' : ''}`}
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <motion.div
        className={isLoser ? 'loser-emoji' : 'winner-emoji'}
        initial={{ scale: 0, rotate: isLoser ? 0 : -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
      >
        <LottieRacer src={winner.lottie.src} size={140} playing={true} />
      </motion.div>
      <motion.div
        className={isLoser ? 'loser-name' : 'winner-name'}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
      >
        {winner.name}
      </motion.div>
      <motion.div
        className={isLoser ? 'loser-label' : 'winner-label'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
        {isLoser ? 'loses the race! 💀' : 'wins the race! 🏆'}
      </motion.div>
      <motion.div
        className="result-actions"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.3 }}
      >
        <button className="btn btn-rerace" onClick={onRerace}>
          Race Again
        </button>
        <button className="btn btn-reset" onClick={onNewRace}>
          New Racers
        </button>
      </motion.div>
    </motion.div>
  )
}
