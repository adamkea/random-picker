import { useState, useCallback, useRef, useEffect } from 'react'

const SABOTAGE_COOLDOWN = 8000

export default function PlayerControls({ playerId, players, boostMeter, onBoost, onSabotage, effects }) {
  const [sabotageCooldown, setSabotageCooldown] = useState(0)
  const [showTargets, setShowTargets] = useState(false)
  const cooldownRef = useRef(null)

  const otherPlayers = players.filter(p => p.id !== playerId)

  // Track if we're being sabotaged
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
    <div className={`player-controls ${isSabotaged ? 'sabotaged' : ''}`}>
      {/* Boost meter */}
      <div className="boost-meter-container">
        <div className="boost-meter-bar" style={{ width: `${meterPercent}%` }} />
        <span className="boost-meter-text">{meterPercent}</span>
      </div>

      <div className="controls-row">
        {/* Sabotage button */}
        <div className="sabotage-area">
          {showTargets ? (
            <div className="target-picker">
              {otherPlayers.map(p => (
                <button
                  key={p.id}
                  className="btn btn-target"
                  onClick={() => handleSabotage(p.id)}
                >
                  {p.name}
                </button>
              ))}
              <button className="btn-target-cancel" onClick={() => setShowTargets(false)}>
                ✕
              </button>
            </div>
          ) : (
            <button
              className="btn btn-sabotage"
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
          className="btn btn-boost"
          onClick={handleBoost}
          disabled={meterPercent < 15}
        >
          🚀 BOOST
        </button>
      </div>

      {/* Sabotage hit overlay */}
      {isSabotaged && <div className="sabotage-flash" />}
    </div>
  )
}
