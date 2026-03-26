import { useEffect } from 'react'
import confetti from 'canvas-confetti'

export default function Result({ winner, onRerace, onNewRace }) {
  useEffect(() => {
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
  }, [])

  return (
    <div className="result-container">
      <div className="winner-emoji">{winner.emoji}</div>
      <div className="winner-name">{winner.name}</div>
      <div className="winner-label">wins the race! 🏆</div>
      <div className="result-actions">
        <button className="btn btn-rerace" onClick={onRerace}>
          Race Again
        </button>
        <button className="btn btn-reset" onClick={onNewRace}>
          New Racers
        </button>
      </div>
    </div>
  )
}
