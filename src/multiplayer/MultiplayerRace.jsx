import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import RaceRenderer from '../components/RaceRenderer'
import PlayerControls from './PlayerControls'
import { LOTTIE_POOL } from '../lottiePool'

export default function MultiplayerRace({
  phase,
  countdownValue,
  raceTick,
  lobbyState,
  playerId,
  effects,
  onBoost,
  onSabotage,
}) {
  const prevTickRef = useRef(null)
  const [velocities, setVelocities] = useState([])

  // Build racers array from lobby state
  const players = lobbyState?.players || []
  const racers = players.map(p => {
    const lottie = LOTTIE_POOL.find(l => l.id === p.lottieId) || LOTTIE_POOL[0]
    return {
      id: p.id,
      name: p.name,
      lottie,
    }
  })

  // Convert tick positions (object keyed by id) to array ordered by racers
  const positions = racers.map(r => raceTick?.positions?.[r.id] || 0)

  // Compute velocities from position deltas
  useEffect(() => {
    if (!raceTick) return
    const prev = prevTickRef.current
    if (prev) {
      setVelocities(racers.map(r => {
        const cur = raceTick.positions?.[r.id] || 0
        const old = prev.positions?.[r.id] || 0
        return cur - old
      }))
    }
    prevTickRef.current = raceTick
  }, [raceTick])

  const myBoostMeter = raceTick?.boostMeters?.[playerId] || 100

  if (phase === 'countdown') {
    return (
      <div className="w-full bg-white/[.04] rounded-2xl p-5 border border-white/10">
        <AnimatePresence mode="wait">
          <motion.div
            key={countdownValue}
            className={`text-center font-extrabold [text-shadow:0_0_40px_rgba(255,255,255,0.5)] py-[60px] ${
              countdownValue === 0
                ? 'text-[140px] text-green-primary'
                : 'text-[120px] text-white'
            }`}
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
            {countdownValue === 0 ? 'GO!' : countdownValue}
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col gap-3">
      <motion.div
        className="w-full bg-white/[.04] rounded-2xl p-5 border border-white/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <RaceRenderer
          racers={racers}
          positions={positions}
          velocities={velocities}
          duration={lobbyState?.duration || 30000}
        />
      </motion.div>

      <PlayerControls
        playerId={playerId}
        players={players}
        boostMeter={myBoostMeter}
        effects={effects}
        onBoost={onBoost}
        onSabotage={onSabotage}
      />
    </div>
  )
}
