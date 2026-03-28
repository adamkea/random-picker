import { useState, useCallback, useEffect } from 'react'
import InputPhase from './components/InputPhase'
import RaceTrack from './components/RaceTrack'
import Result from './components/Result'
import History from './components/History'
import ModeSelector from './components/ModeSelector'
import { useSocket } from './multiplayer/useSocket'
import SessionJoin from './multiplayer/SessionJoin'
import MultiplayerLobby from './multiplayer/MultiplayerLobby'
import MultiplayerRace from './multiplayer/MultiplayerRace'
import MultiplayerResult from './multiplayer/MultiplayerResult'
import { LOTTIE_POOL } from './lottiePool'
import './App.css'

function assignAvatars(entries) {
  const usedIds = new Set(entries.filter(e => e.lottie).map(e => e.lottie.id))
  const available = LOTTIE_POOL.filter(l => !usedIds.has(l.id))
  const shuffled = [...available].sort(() => Math.random() - 0.5)
  let randomIdx = 0
  return entries.map((entry, i) => ({
    name: entry.name,
    lottie: entry.lottie || shuffled[randomIdx++ % (shuffled.length || 1)] || LOTTIE_POOL[i % LOTTIE_POOL.length],
    id: `${entry.name}-${i}`,
  }))
}

function App() {
  // mode: 'select' | 'solo' | 'host-name' | 'multiplayer-join' | 'multiplayer'
  const [mode, setMode] = useState('select')

  // Solo state
  const [phase, setPhase] = useState('input')
  const [racers, setRacers] = useState([])
  const [names, setNames] = useState([])
  const [duration, setDuration] = useState(30000)
  const [winner, setWinner] = useState(null)
  const [raceGoal, setRaceGoal] = useState('winner')
  const [history, setHistory] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('emoji-racer-history'))
      if (Array.isArray(saved)) return saved
    } catch {}
    return []
  })

  // Multiplayer state
  const socket = useSocket()
  const [hostName, setHostName] = useState('')
  const [connecting, setConnecting] = useState(false)

  // Check URL for room code on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const room = params.get('room')
    if (room && room.length === 4) {
      setMode('multiplayer-join')
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('emoji-racer-history', JSON.stringify(history))
  }, [history])

  // Solo handlers
  const handleStartRace = useCallback((entries, raceDuration, goal = 'winner') => {
    const assigned = assignAvatars(entries)
    setNames(entries)
    setRacers(assigned)
    setDuration(raceDuration)
    setRaceGoal(goal)
    setWinner(null)
    setPhase('countdown')
  }, [])

  const handleCountdownDone = useCallback(() => {
    setPhase('racing')
  }, [])

  const handleRaceFinish = useCallback((winningRacer) => {
    setWinner(winningRacer)
    setPhase('result')
    setHistory(prev => [winningRacer, ...prev].slice(0, 20))
  }, [])

  const handleRerace = useCallback(() => {
    handleStartRace(names, duration, raceGoal)
  }, [names, duration, raceGoal, handleStartRace])

  const handleNewRace = useCallback(() => {
    setPhase('input')
    setRacers([])
    setWinner(null)
  }, [])

  const handleClearHistory = useCallback(() => {
    setHistory([])
  }, [])

  // Multiplayer handlers
  const handleCreateRoom = useCallback(async (e) => {
    e.preventDefault()
    if (!hostName.trim() || connecting) return
    setConnecting(true)
    try {
      await socket.createRoom(hostName.trim())
      setMode('multiplayer')
    } catch (err) {
      console.error('Failed to create room:', err)
    } finally {
      setConnecting(false)
    }
  }, [hostName, connecting, socket])

  const handleJoinFromSelector = useCallback((code) => {
    setMode('multiplayer-join')
  }, [])

  const handleJoinRoom = useCallback(async (code, name) => {
    try {
      await socket.joinRoom(code, name)
      setMode('multiplayer')
      window.history.replaceState({}, '', window.location.pathname)
    } catch (err) {
      console.error('Failed to join room:', err)
    }
  }, [socket])

  const handleBackToMenu = useCallback(() => {
    socket.disconnect()
    setMode('select')
    setHostName('')
    setConnecting(false)
    window.history.replaceState({}, '', window.location.pathname)
  }, [socket])

  const btnBack = 'self-start text-sm px-5 py-2.5 rounded-[10px] border border-white/20 bg-white/10 text-white font-semibold cursor-pointer hover:-translate-y-px hover:shadow-[0_4px_15px_rgba(0,0,0,0.3)] transition-all'
  const btnStart = 'w-full bg-gradient-to-br from-green-primary to-green-deep text-white text-xl font-semibold py-4 px-10 rounded-[10px] cursor-pointer hover:-translate-y-px hover:shadow-[0_4px_15px_rgba(0,0,0,0.3)] transition-all mt-3 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0'
  const glassCard = 'w-full bg-white/[.07] rounded-2xl p-10 backdrop-blur-xl border border-white/[.12]'

  return (
    <div className="w-full max-w-[1400px] flex flex-col items-center gap-8">
      <h1 className="text-[60px] max-[600px]:text-[32px] font-bold text-center mt-4">
        <span className="inline-block animate-title-bounce">🏁</span>
        <span className="bg-gradient-to-r from-white via-purple-primary to-white bg-clip-text text-transparent"> Pick A Winner</span>
      </h1>

      {/* Mode selection */}
      {mode === 'select' && (
        <ModeSelector
          onSolo={() => setMode('solo')}
          onMultiplayer={() => setMode('host-name')}
          onJoin={handleJoinFromSelector}
        />
      )}

      {/* Host name entry */}
      {mode === 'host-name' && (
        <>
          <button className={btnBack} onClick={handleBackToMenu}>
            &larr; Back
          </button>
          <div className={`${glassCard} text-center`}>
            <h2 className="text-xl font-semibold mb-5">Host a Race</h2>
            <form className="flex flex-col gap-3 items-center" onSubmit={handleCreateRoom}>
              <input
                type="text"
                className="w-full max-w-[300px] px-4 py-3 rounded-[10px] border-2 border-white/15 bg-white/[.08] text-white text-lg text-center outline-none focus:border-purple-primary placeholder:text-white/35 transition-colors"
                placeholder="Your name"
                maxLength={20}
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                autoFocus
              />
              <button
                className={btnStart}
                type="submit"
                disabled={!hostName.trim() || connecting}
              >
                {connecting ? 'Connecting...' : 'Create Room'}
              </button>
              {socket.error && <p className="text-red-light text-sm mt-2">{socket.error}</p>}
            </form>
          </div>
        </>
      )}

      {/* Solo mode */}
      {mode === 'solo' && (
        <>
          {phase === 'input' && (
            <>
              <button className={btnBack} onClick={handleBackToMenu}>
                &larr; Back
              </button>
              <InputPhase onStart={handleStartRace} />
            </>
          )}

          {(phase === 'countdown' || phase === 'racing') && (
            <RaceTrack
              racers={racers}
              phase={phase}
              duration={duration}
              raceGoal={raceGoal}
              onCountdownDone={handleCountdownDone}
              onRaceFinish={handleRaceFinish}
            />
          )}

          {phase === 'result' && winner && (
            <Result
              winner={winner}
              raceGoal={raceGoal}
              onRerace={handleRerace}
              onNewRace={handleNewRace}
            />
          )}

          {history.length > 0 && (
            <History items={history} onClear={handleClearHistory} />
          )}
        </>
      )}

      {/* Multiplayer join flow */}
      {mode === 'multiplayer-join' && (
        <>
          <button className={btnBack} onClick={handleBackToMenu}>
            &larr; Back
          </button>
          <SessionJoin
            onJoin={handleJoinRoom}
            error={socket.error}
          />
        </>
      )}

      {/* Multiplayer game */}
      {mode === 'multiplayer' && (
        <>
          {socket.phase === 'lobby' && socket.lobbyState && (
            <MultiplayerLobby
              lobbyState={socket.lobbyState}
              playerId={socket.playerId}
              onSetDuration={socket.setDuration}
              onStartRace={socket.startRace}
              onLeave={handleBackToMenu}
            />
          )}

          {(socket.phase === 'countdown' || socket.phase === 'racing') && (
            <MultiplayerRace
              phase={socket.phase}
              countdownValue={socket.countdownValue}
              raceTick={socket.raceTick}
              lobbyState={socket.lobbyState}
              playerId={socket.playerId}
              effects={socket.effects}
              onBoost={socket.boost}
              onSabotage={socket.sabotage}
            />
          )}

          {socket.phase === 'result' && socket.raceFinish && (
            <MultiplayerResult
              raceFinish={socket.raceFinish}
              lobbyState={socket.lobbyState}
              playerId={socket.playerId}
              onPlayAgain={socket.playAgain}
              onBackToLobby={socket.playAgain}
            />
          )}

          {!socket.phase && !socket.lobbyState && (
            <div className={`${glassCard} text-center`}>
              <p className="text-white/50 text-base">Connecting...</p>
              {socket.error && <p className="text-red-light text-sm mt-2">{socket.error}</p>}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default App
