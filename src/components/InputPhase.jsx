import { useState, useRef, useEffect } from 'react'
import { LOTTIE_POOL } from '../lottiePool'
import LottieRacer from './LottieRacer'

const MAX_RACERS = 20
const STORAGE_KEY = 'emoji-racer-entries'

function loadEntries() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (Array.isArray(saved)) return saved
  } catch {}
  return []
}

const DURATION_OPTIONS = [
  { label: '15s', value: 15000 },
  { label: '30s', value: 30000 },
  { label: '1 min', value: 60000 },
  { label: '1 min 30s', value: 90000 },
]

const inputBase = 'flex-1 px-4 py-3 rounded-[10px] border-2 border-white/15 bg-white/[.08] text-white text-base outline-none focus:border-purple-primary placeholder:text-white/35 transition-colors disabled:opacity-50'
const btnAdd = 'px-6 py-3 rounded-[10px] bg-gradient-to-br from-purple-primary to-purple-deep text-white font-semibold cursor-pointer hover:-translate-y-px hover:shadow-[0_4px_15px_rgba(0,0,0,0.3)] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0'

export default function InputPhase({ onStart }) {
  const [entries, setEntries] = useState(loadEntries)
  const [inputValue, setInputValue] = useState('')
  const [duration, setDuration] = useState(15000)
  const [raceGoal, setRaceGoal] = useState('winner')
  const inputRef = useRef(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  }, [entries])

  const randomUnusedAvatar = (currentEntries) => {
    const usedIds = new Set(currentEntries.map(e => e.lottie?.id))
    const available = LOTTIE_POOL.filter(l => !usedIds.has(l.id))
    if (available.length === 0) return LOTTIE_POOL[Math.floor(Math.random() * LOTTIE_POOL.length)]
    return available[Math.floor(Math.random() * available.length)]
  }

  const addName = () => {
    const trimmed = inputValue.trim()
    if (!trimmed || entries.length >= MAX_RACERS) return
    setEntries(prev => {
      const lottie = randomUnusedAvatar(prev)
      return [...prev, { name: trimmed, lottie }]
    })
    setInputValue('')
    inputRef.current?.focus()
  }

  const removeName = (index) => {
    setEntries(prev => prev.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addName()
    }
  }

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text')
    if (text.includes('\n') || text.includes(',')) {
      e.preventDefault()
      const names = text
        .split(/[\n,]+/)
        .map(s => s.trim())
        .filter(Boolean)
        .slice(0, MAX_RACERS - entries.length)
      setEntries(prev => {
        let combined = [...prev]
        for (const name of names) {
          if (combined.length >= MAX_RACERS) break
          combined.push({ name, lottie: randomUnusedAvatar(combined) })
        }
        return combined
      })
      setInputValue('')
    }
  }

  const durationBtnClass = (active) =>
    `px-4 py-2 rounded-lg border-2 text-sm font-semibold cursor-pointer transition-all ${
      active
        ? 'border-purple-primary bg-purple-primary/20 text-white'
        : 'border-white/15 bg-white/[.06] text-white/60 hover:border-white/30 hover:text-white'
    }`

  return (
    <div className="w-full bg-white/[.06] rounded-2xl p-7 backdrop-blur-[10px] border border-white/10">
      <h2 className="text-[22px] mb-4 font-semibold">Enter Racers</h2>
      <p className="text-[13px] text-white/45 mb-2">
        {entries.length}/{MAX_RACERS} racers — paste a comma or newline-separated list, or add one at a time
      </p>

      <div className="flex flex-wrap gap-2 mb-3 min-h-[40px]">
        {entries.map((entry, i) => (
          <div key={i} className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5 text-[15px] border border-white/15 animate-fade-in">
            <span className="inline-flex items-center">
              <LottieRacer src={entry.lottie?.src} size={32} />
            </span>
            <span>{entry.name}</span>
            <button
              className="bg-transparent border-0 text-white/50 cursor-pointer text-base px-0.5 leading-none hover:text-red-light transition-colors"
              onClick={() => removeName(i)}
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2.5 mb-4">
        <input
          ref={inputRef}
          type="text"
          className={inputBase}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={entries.length >= MAX_RACERS ? 'Max racers reached' : 'Enter a name...'}
          disabled={entries.length >= MAX_RACERS}
          autoFocus
        />
        <button
          className={btnAdd}
          onClick={addName}
          disabled={!inputValue.trim() || entries.length >= MAX_RACERS}
        >
          Add
        </button>
      </div>

      <div className="flex items-center gap-3 mb-3 mt-2">
        <span className="text-sm font-semibold text-white/60 whitespace-nowrap">Race Length</span>
        <div className="flex gap-1.5">
          {DURATION_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={durationBtnClass(duration === opt.value)}
              onClick={() => setDuration(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 mb-3 mt-2">
        <span className="text-sm font-semibold text-white/60 whitespace-nowrap">Show</span>
        <div className="flex gap-1.5">
          <button
            className={durationBtnClass(raceGoal === 'winner')}
            onClick={() => setRaceGoal('winner')}
          >
            Winner
          </button>
          <button
            className={durationBtnClass(raceGoal === 'loser')}
            onClick={() => setRaceGoal('loser')}
          >
            Loser
          </button>
        </div>
      </div>

      <button
        className="w-full bg-gradient-to-br from-green-primary to-green-deep text-white text-xl font-semibold py-3.5 px-10 rounded-[10px] cursor-pointer hover:-translate-y-px hover:shadow-[0_4px_15px_rgba(0,0,0,0.3)] transition-all mt-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
        onClick={() => onStart(entries, duration, raceGoal)}
        disabled={entries.length < 2}
      >
        {entries.length < 2 ? 'Add at least 2 racers' : `Start Race! (${entries.length} racers)`}
      </button>
    </div>
  )
}
