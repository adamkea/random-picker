import { useState, useCallback, useEffect } from 'react'
import InputPhase from './components/InputPhase'
import RaceTrack from './components/RaceTrack'
import Result from './components/Result'
import History from './components/History'
import './App.css'

export const EMOJI_POOL = [
  // Transport & Speed
  '🚀', '🏎️', '🏍️', '🛸', '🚁', '✈️', '🚂', '🛶', '🚤', '🛹',
  '🚲', '🛺', '🚜', '⛵', '🛩️',
  // Animals
  '🐎', '🦄', '🐆', '🐇', '🦅', '🐉', '🐅', '🦊', '🐬', '🦈',
  '🦁', '🐺', '🦇', '🐝', '🐙', '🦋', '🐢', '🦎', '🐍', '🦑',
  '🐘', '🦏', '🐊', '🦩', '🐧', '🐻', '🦖', '🦕', '🐳', '🦬',
  // Nature & Elements
  '⚡', '🔥', '💨', '🌪️', '☄️', '🌊', '❄️', '🌸', '🍀', '🌙',
  // Objects & Symbols
  '🎯', '💎', '🏆', '👑', '🎸', '🎭', '🧲', '💣', '🪃', '⚔️',
  '🛡️', '🔮', '🧨', '🎪', '🗿',
  // Food & Fun
  '🍕', '🌮', '🍩', '🧁', '🍉', '🌶️', '🍄', '🎃', '👻', '🤖',
  '👽', '🦸', '🧙', '🥷', '🏴‍☠️',
]

function assignEmojis(entries) {
  const usedEmojis = new Set(entries.filter(e => e.emoji).map(e => e.emoji))
  const available = EMOJI_POOL.filter(e => !usedEmojis.has(e))
  const shuffled = [...available].sort(() => Math.random() - 0.5)
  let randomIdx = 0
  return entries.map((entry, i) => ({
    name: entry.name,
    emoji: entry.emoji || shuffled[randomIdx++ % (shuffled.length || 1)] || EMOJI_POOL[i % EMOJI_POOL.length],
    id: `${entry.name}-${i}`,
  }))
}

function App() {
  const [phase, setPhase] = useState('input') // input | countdown | racing | result
  const [racers, setRacers] = useState([])
  const [names, setNames] = useState([])
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

  const handleStartRace = useCallback((entries) => {
    const assigned = assignEmojis(entries)
    setNames(entries)
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
