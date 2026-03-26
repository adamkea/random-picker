import { useState, useCallback } from 'react'
import InputPhase from './components/InputPhase'
import RaceTrack from './components/RaceTrack'
import Result from './components/Result'
import History from './components/History'
import './App.css'

const EMOJI_POOL = [
  '🚀', '🏎️', '🐎', '🦄', '🐆', '🐇', '🦅', '🐉', '🏍️', '🛸',
  '🐅', '🦊', '🐬', '🦈', '⚡', '🔥', '💨', '🌪️', '🎯', '🦁',
]

function assignEmojis(names) {
  const shuffled = [...EMOJI_POOL].sort(() => Math.random() - 0.5)
  return names.map((name, i) => ({
    name,
    emoji: shuffled[i % shuffled.length],
    id: `${name}-${i}`,
  }))
}

function App() {
  const [phase, setPhase] = useState('input') // input | countdown | racing | result
  const [racers, setRacers] = useState([])
  const [names, setNames] = useState([])
  const [winner, setWinner] = useState(null)
  const [history, setHistory] = useState([])

  const handleStartRace = useCallback((nameList) => {
    const assigned = assignEmojis(nameList)
    setNames(nameList)
    setRacers(assigned)
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
