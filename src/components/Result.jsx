import { useEffect } from 'react'
import { motion } from 'motion/react'
import confetti from 'canvas-confetti'
import LottieRacer from './LottieRacer'

export default function Result({ winner, raceGoal = 'winner', onRerace, onNewRace }) {
  const isLoser = raceGoal === 'loser'

  useEffect(() => {
    if (isLoser) return

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

  const containerClass = `w-full text-center bg-white/[.06] rounded-2xl p-8 border ${
    isLoser ? 'border-red-primary/30 bg-red-primary/[.06]' : 'border-white/15'
  }`

  return (
    <motion.div
      className={containerClass}
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <motion.div
        className={`${isLoser ? 'loser-emoji' : 'winner-emoji'} flex items-center justify-center`}
        initial={{ scale: 0, rotate: isLoser ? 0 : -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
      >
        <LottieRacer src={winner.lottie.src} size={140} playing={true} />
      </motion.div>

      <motion.div
        className={`text-[52px] max-[600px]:text-[36px] font-bold my-4 bg-clip-text text-transparent ${
          isLoser
            ? 'bg-gradient-to-br from-red-primary via-red-deep to-red-primary'
            : 'bg-gradient-to-br from-gold-primary via-gold-deep to-gold-primary'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
      >
        {winner.name}
      </motion.div>

      <motion.div
        className="text-lg text-white/50 mb-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
        {isLoser ? 'loses the race! 💀' : 'wins the race! 🏆'}
      </motion.div>

      <motion.div
        className="flex gap-3 justify-center mt-4"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.3 }}
      >
        <button
          className="bg-gradient-to-br from-gold-primary to-gold-deep text-black text-lg font-bold px-8 py-3 rounded-[10px] cursor-pointer hover:-translate-y-px hover:shadow-[0_4px_15px_rgba(0,0,0,0.3)] transition-all"
          onClick={onRerace}
        >
          Race Again
        </button>
        <button
          className="px-6 py-3 rounded-[10px] bg-white/10 border border-white/20 text-white font-semibold cursor-pointer hover:-translate-y-px hover:shadow-[0_4px_15px_rgba(0,0,0,0.3)] transition-all"
          onClick={onNewRace}
        >
          New Racers
        </button>
      </motion.div>
    </motion.div>
  )
}
