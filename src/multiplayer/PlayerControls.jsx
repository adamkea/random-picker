import { useState, useCallback, useRef, useEffect } from 'react'

const SABOTAGE_COOLDOWN = 8000

export default function PlayerControls({ playerId, players, boostMeter, onBoost, onSabotage, effects }) {
  const [sabotageCooldown, setSabotageCooldown] = useState(0)
  const [showTargets, setShowTargets] = useState(false)
  const cooldownRef = useRef(null)

  const otherPlayers = players.filter(p => p.id !== playerId)

  const isSabotaged = effects.some(
    e => e.type === 'sabotage' && e.targetId === playerId && Date.now() - e.ts < 2000
  )

  const handleBoost = useCallback(() => {
    onBoost()
  }, [onBoost])

  const handleSabotage = useCallback((targetId) => {
    onSabotage(targetId)
    setShowTargets(false)
    setSabotageCooldown(SABOTAGE_COOLDOWN)

    if (cooldownRef.current) clearInterval(cooldownRef.current)
    const start = Date.now()
    cooldownRef.current = setInterval(() => {
      const remaining = SABOTAGE_COOLDOWN - (Date.now() - start)
      if (remaining <= 0) {
        setSabotageCooldown(0)
        clearInterval(cooldownRef.current)
      } else {
        setSabotageCooldown(remaining)
      }
    }, 100)
  }, [onSabotage])

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current)
    }
  }, [])

  const meterPercent = Math.round(boostMeter || 0)

  return (
    <div className={`w-full p-6 mt-4 bg-white/[.07] rounded-2xl border border-white/[.12] backdrop-blur-xl ${isSabotaged ? 'animate-sabotage-shake' : ''}`}>
      {/* Boost meter */}
      <div className="relative h-6 bg-white/10 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-gradient-to-r from-green-primary to-green-deep rounded-full transition-[width] duration-100"
          style={{ width: `${meterPercent}%` }}
        />
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">
          {meterPercent}
        </span>
      </div>

      <div className="flex gap-3 items-stretch max-[600px]:flex-col">
        {/* Sabotage area */}
        <div className="flex-1">
          {showTargets ? (
            <div className="flex flex-col gap-1.5">
              {otherPlayers.map(p => (
                <button
                  key={p.id}
                  className="px-2.5 py-2 rounded-[10px] border-2 border-white/20 bg-red-light/20 text-white text-sm font-semibold cursor-pointer transition-all hover:bg-red-light/40 hover:border-red-light"
                  onClick={() => handleSabotage(p.id)}
                >
                  {p.name}
                </button>
              ))}
              <button
                className="p-1.5 bg-transparent border-0 text-white/40 cursor-pointer text-sm hover:text-white/70 transition-colors"
                onClick={() => setShowTargets(false)}
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              className="w-full h-full text-base font-bold p-4 rounded-2xl border-0 bg-gradient-to-br from-red-light to-red-deep text-white cursor-pointer transition-all select-none hover:enabled:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={sabotageCooldown > 0}
              onClick={() => setShowTargets(true)}
            >
              {sabotageCooldown > 0
                ? `💣 ${Math.ceil(sabotageCooldown / 1000)}s`
                : '💣 Sabotage'}
            </button>
          )}
        </div>

        {/* Boost button */}
        <button
          className="flex-[2] text-[24px] max-[600px]:text-lg font-extrabold p-5 max-[600px]:p-4 rounded-2xl border-0 bg-gradient-to-br from-green-primary to-green-deep text-white cursor-pointer transition-all select-none touch-manipulation hover:enabled:scale-[1.02] hover:enabled:shadow-[0_4px_20px_rgba(52,211,153,0.4)] active:enabled:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={handleBoost}
          disabled={meterPercent < 15}
        >
          🚀 BOOST
        </button>
      </div>

      {/* Sabotage hit overlay */}
      {isSabotaged && (
        <div className="fixed inset-0 bg-red-primary/30 pointer-events-none z-[100] animate-flash-fade" />
      )}
    </div>
  )
}
