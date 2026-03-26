import { useState, useCallback, useEffect } from 'react'
import InputPhase from './components/InputPhase'
import RaceTrack from './components/RaceTrack'
import Result from './components/Result'
import History from './components/History'
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
  const [phase, setPhase] = useState('input') // input | countdown | racing | result
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

  useEffect(() => {
    localStorage.setItem('emoji-racer-history', JSON.stringify(history))
  }, [history])

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

  return (
    <div className="app">
      <h1 className="app-title">
        <span>🏁</span> Emoji Racer
      </h1>

      {phase === 'input' && (
        <InputPhase onStart={handleStartRace} />
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
    </div>
  )
}

export default App
