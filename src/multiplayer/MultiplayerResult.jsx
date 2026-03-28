import { useEffect } from 'react'
import { motion } from 'motion/react'
import confetti from 'canvas-confetti'
import LottieRacer from '../components/LottieRacer'
import { LOTTIE_POOL } from '../lottiePool'

export default function MultiplayerResult({ raceFinish, lobbyState, playerId, onPlayAgain, onBackToLobby }) {
  const isHost = lobbyState?.hostId === playerId
  const isWinner = raceFinish?.winnerId === playerId

  const winnerLottie = LOTTIE_POOL.find(l => l.id === raceFinish?.winnerLottieId) || LOTTIE_POOL[0]

  useEffect(() => {
    const duration = 3000
    const end = Date.now() + duration
    const interval = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(interval)
        return
      }
      confetti({
        particleCount: isWinner ? 8 : 3,
        angle: 60 + Math.random() * 60,
        spread: 60,
        origin: { x: Math.random(), y: 0.6 },
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isWinner])

  return (
    <div className="w-full text-center bg-white/[.07] rounded-2xl p-12 backdrop-blur-xl border border-white/[.12]">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        <div className="winner-emoji flex items-center justify-center">
          <LottieRacer src={winnerLottie.src} size={120} speed={1} playing={true} />
        </div>
      </motion.div>

      <motion.div
        className="text-[52px] max-[600px]:text-[36px] font-bold my-4 bg-gradient-to-br from-gold-primary via-gold-deep to-gold-primary bg-clip-text text-transparent"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {raceFinish?.winnerName}
      </motion.div>

      <div className="text-lg text-white/50 mb-5">
        {isWinner ? '🎉 You won!' : '🏆 Winner!'}
      </div>

      <div className="flex gap-3 justify-center mt-4">
        {isHost ? (
          <>
            <button
              className="bg-gradient-to-br from-gold-primary to-gold-deep text-black text-lg font-bold px-8 py-3 rounded-[10px] cursor-pointer hover:-translate-y-px hover:shadow-[0_4px_15px_rgba(0,0,0,0.3)] transition-all"
              onClick={onPlayAgain}
            >
              Race Again
            </button>
            <button
              className="px-6 py-3 rounded-[10px] bg-white/10 border border-white/20 text-white font-semibold cursor-pointer hover:-translate-y-px hover:shadow-[0_4px_15px_rgba(0,0,0,0.3)] transition-all"
              onClick={onBackToLobby}
            >
              Back to Lobby
            </button>
          </>
        ) : (
          <p className="text-white/50 text-base">Waiting for host...</p>
        )}
      </div>
    </div>
  )
}
