import { useState } from 'react'
import { LOTTIE_POOL } from '../lottiePool'
import LottieRacer from '../components/LottieRacer'

const DURATIONS = [
  { label: '15s', value: 15000 },
  { label: '30s', value: 30000 },
  { label: '1 min', value: 60000 },
  { label: '1.5 min', value: 90000 },
]

const durationBtnClass = (active) =>
  `px-4 py-2 rounded-lg border-2 text-sm font-semibold cursor-pointer transition-all ${
    active
      ? 'border-purple-primary bg-purple-primary/20 text-white'
      : 'border-white/15 bg-white/[.06] text-white/60 hover:border-white/30 hover:text-white'
  }`

export default function MultiplayerLobby({ lobbyState, playerId, onSetDuration, onStartRace, onLeave }) {
  const isHost = lobbyState.hostId === playerId
  const playerCount = lobbyState.players.length

  return (
    <div className="w-full bg-white/[.06] rounded-2xl p-7 backdrop-blur-[10px] border border-white/10">
      <div className="text-center mb-6">
        <span className="block text-sm text-white/50 mb-1">Room Code</span>
        <span className="block text-[56px] max-[600px]:text-[40px] font-black tracking-[12px] max-[600px]:tracking-[8px] bg-gradient-to-br from-purple-primary to-purple-deep bg-clip-text text-transparent">
          {lobbyState.code}
        </span>
        <button
          className="mt-2 bg-white/10 border border-white/20 text-white/70 px-4 py-1.5 rounded-lg cursor-pointer text-xs hover:bg-white/15 hover:text-white transition-all"
          onClick={() => {
            const url = `${window.location.origin}${window.location.pathname}?room=${lobbyState.code}`
            navigator.clipboard?.writeText(url)
          }}
        >
          Copy Link
        </button>
      </div>

      <div className="mb-5">
        <h3 className="text-base text-white/60 mb-3">Players ({playerCount}/5)</h3>
        <div className="flex flex-col gap-2">
          {lobbyState.players.map((player) => {
            const lottie = LOTTIE_POOL.find(l => l.id === player.lottieId) || LOTTIE_POOL[0]
            return (
              <div key={player.id} className="flex items-center gap-3 px-3 py-2 bg-white/[.04] rounded-[10px] animate-fade-in">
                <LottieRacer src={lottie.src} size={48} speed={1} playing={true} />
                <span className="text-base font-semibold flex items-center gap-2">
                  {player.name}
                  {player.id === lobbyState.hostId && (
                    <span className="text-[10px] font-bold bg-gradient-to-br from-gold-primary to-gold-deep text-black px-1.5 py-0.5 rounded">
                      HOST
                    </span>
                  )}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {isHost ? (
        <div className="mt-4">
          <div className="flex items-center gap-3 mb-3 mt-2">
            <span className="text-sm font-semibold text-white/60 whitespace-nowrap">Race Duration:</span>
            <div className="flex gap-1.5">
              {DURATIONS.map((d) => (
                <button
                  key={d.value}
                  className={durationBtnClass(lobbyState.duration === d.value)}
                  onClick={() => onSetDuration(d.value)}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
          <button
            className="w-full bg-gradient-to-br from-green-primary to-green-deep text-white text-xl font-semibold py-3.5 px-10 rounded-[10px] cursor-pointer hover:-translate-y-px hover:shadow-[0_4px_15px_rgba(0,0,0,0.3)] transition-all mt-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
            disabled={playerCount < 2}
            onClick={onStartRace}
          >
            {playerCount < 2 ? 'Need at least 2 players' : `Start Race (${playerCount} players)`}
          </button>
        </div>
      ) : (
        <div className="text-center py-5">
          <div className="text-white/50 text-base">Waiting for host to start the race</div>
        </div>
      )}
    </div>
  )
}
