import { useState } from 'react'

export default function ModeSelector({ onSolo, onMultiplayer, onJoin }) {
  const [joinCode, setJoinCode] = useState('')
  const [showJoin, setShowJoin] = useState(false)

  return (
    <div className="w-full">
      <div className="flex gap-5 mb-6 max-[600px]:flex-col">
        <button
          className="flex-1 flex flex-col items-center gap-3 p-8 rounded-2xl border-2 border-white/10 bg-white/[.07] text-white cursor-pointer transition-all backdrop-blur-xl hover:border-green-primary hover:bg-white/[.10] hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.4)]"
          onClick={onSolo}
        >
          <span className="text-5xl">🏃</span>
          <span className="text-xl font-bold">Solo Race</span>
          <span className="text-sm text-white/50">Enter names &amp; pick a winner</span>
        </button>
        <button
          className="flex-1 flex flex-col items-center gap-3 p-8 rounded-2xl border-2 border-white/10 bg-white/[.07] text-white cursor-pointer transition-all backdrop-blur-xl hover:border-purple-primary hover:bg-white/[.10] hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.4)]"
          onClick={onMultiplayer}
        >
          <span className="text-5xl">🎮</span>
          <span className="text-xl font-bold">Host Multiplayer</span>
          <span className="text-sm text-white/50">Create a room for friends to join</span>
        </button>
      </div>
      <div className="text-center">
        {!showJoin ? (
          <button
            className="bg-transparent border-0 text-white/50 text-sm cursor-pointer underline p-2 hover:text-white transition-colors"
            onClick={() => setShowJoin(true)}
          >
            Have a room code? Join a session
          </button>
        ) : (
          <div className="flex gap-2.5 justify-center">
            <input
              type="text"
              className="w-[120px] px-4 py-3 rounded-[10px] border-2 border-white/15 bg-white/[.08] text-white text-xl font-bold text-center tracking-[4px] uppercase outline-none focus:border-purple-primary transition-colors"
              placeholder="CODE"
              maxLength={4}
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && joinCode.length === 4) onJoin(joinCode)
              }}
              autoFocus
            />
            <button
              className="px-6 py-3 rounded-[10px] bg-gradient-to-br from-purple-primary to-purple-deep text-white font-semibold cursor-pointer hover:-translate-y-px hover:shadow-[0_4px_15px_rgba(0,0,0,0.3)] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
              disabled={joinCode.length !== 4}
              onClick={() => onJoin(joinCode)}
            >
              Join
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
