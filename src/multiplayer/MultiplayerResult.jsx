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
    // Fire confetti
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
    <div className="result-container">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        <div className="winner-emoji">
          <LottieRacer src={winnerLottie.src} size={120} speed={1} playing={true} />
        </div>
      </motion.div>

      <motion.div
        className="winner-name"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {raceFinish?.winnerName}
      </motion.div>

      <div className="winner-label">
        {isWinner ? '🎉 You won!' : '🏆 Winner!'}
      </div>

      <div className="result-actions">
        {isHost ? (
          <>
            <button className="btn btn-rerace" onClick={onPlayAgain}>
              Race Again
            </button>
            <button className="btn btn-reset" onClick={onBackToLobby}>
              Back to Lobby
            </button>
          </>
        ) : (
          <p className="waiting-text">Waiting for host...</p>
        )}
      </div>
    </div>
  )
}
