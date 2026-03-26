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
  // mode: 'select' | 'solo' | 'multiplayer-join' | 'multiplayer'
  const [mode, setMode] = useState('select')

  // Solo state
  const [phase, setPhase] = useState('input')
  const [racers, setRacers] = useState([])
  const [names, setNames] = useState([])
  const [duration, setDuration] = useState(30000)
  const [winner, setWinner] = useState(null)
  const [history, setHistory] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('emoji-racer-history'))
      if (Array.isArray(saved)) return saved
    } catch {}
    return []
  })

  // Multiplayer state
  const socket = useSocket()
  const [joinName, setJoinName] = useState('')

  // Check URL for room code on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const room = params.get('room')
    if (room && room.length === 4) {
      setMode('multiplayer-join')
      // Store the code for SessionJoin to use
      window.__pendingRoomCode = room.toUpperCase()
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('emoji-racer-history', JSON.stringify(history))
  }, [history])

  // Solo handlers
  const handleStartRace = useCallback((entries, raceDuration) => {
    const assigned = assignAvatars(entries)
    setNames(entries)
    setRacers(assigned)
    setDuration(raceDuration)
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
    handleStartRace(names)
  }, [names, handleStartRace])

  const handleNewRace = useCallback(() => {
    setPhase('input')
    setRacers([])
    setWinner(null)
  }, [])

  const handleClearHistory = useCallback(() => {
    setHistory([])
  }, [])

  // Multiplayer handlers
  const handleHostMultiplayer = useCallback(async () => {
    const name = prompt('Enter your name:')
    if (!name?.trim()) return
    try {
      await socket.createRoom(name.trim())
      setMode('multiplayer')
    } catch {
      // error is set in socket state
    }
  }, [socket])

  const handleJoinFromSelector = useCallback((code) => {
    window.__pendingRoomCode = code
    setMode('multiplayer-join')
  }, [])

  const handleJoinRoom = useCallback(async (code, name) => {
    try {
      await socket.joinRoom(code, name)
      setMode('multiplayer')
      // Clean up URL param
      window.history.replaceState({}, '', window.location.pathname)
    } catch {
      // error is set in socket state
    }
  }, [socket])

  const handleBackToMenu = useCallback(() => {
    setMode('select')
    window.history.replaceState({}, '', window.location.pathname)
  }, [])

  return (
    <div className="app">
      <h1 className="app-title">
        <span>🏁</span> Pick A Winner
      </h1>

      {/* Mode selection */}
      {mode === 'select' && (
        <ModeSelector
          onSolo={() => setMode('solo')}
          onMultiplayer={handleHostMultiplayer}
          onJoin={handleJoinFromSelector}
        />
      )}

      {/* Solo mode -- unchanged from original */}
      {mode === 'solo' && (
        <>
          {phase === 'input' && (
            <>
              <button className="btn btn-reset btn-back-menu" onClick={handleBackToMenu}>
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
              onCountdownDone={handleCountdownDone}
              onRaceFinish={handleRaceFinish}
            />
          )}

          {phase === 'result' && winner && (
            <Result
              winner={winner}
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
          <button className="btn btn-reset btn-back-menu" onClick={handleBackToMenu}>
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
        </>
      )}
    </div>
  )
}

export default App
