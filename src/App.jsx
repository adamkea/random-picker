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
      // error is shown via socket.error or we set it
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

  return (
    <div className="app">
      <h1 className="app-title">
        <span>🏁</span> Pick A Winner
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
          <button className="btn btn-reset btn-back-menu" onClick={handleBackToMenu}>
            &larr; Back
          </button>
          <div className="session-join">
            <h2>Host a Race</h2>
            <form onSubmit={handleCreateRoom}>
              <input
                type="text"
                className="join-name-input"
                placeholder="Your name"
                maxLength={20}
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                autoFocus
              />
              <button
                className="btn btn-start"
                type="submit"
                disabled={!hostName.trim() || connecting}
              >
                {connecting ? 'Connecting...' : 'Create Room'}
              </button>
              {socket.error && <p className="join-error">{socket.error}</p>}
            </form>
          </div>
        </>
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

          {/* Show if mode is multiplayer but socket hasn't received lobby yet */}
          {!socket.phase && !socket.lobbyState && (
            <div className="session-join">
              <p className="waiting-dots">Connecting...</p>
              {socket.error && <p className="join-error">{socket.error}</p>}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default App
