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

export default function InputPhase({ onStart }) {
  const [entries, setEntries] = useState(loadEntries) // { name, lottie: { id, src, label } }
  const [inputValue, setInputValue] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState(null)
  const [showPicker, setShowPicker] = useState(false)
  const [duration, setDuration] = useState(15000)
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
      const lottie = selectedAvatar || randomUnusedAvatar(prev)
      return [...prev, { name: trimmed, lottie }]
    })
    setInputValue('')
    setSelectedAvatar(null)
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

  const handlePickAvatar = (lottie) => {
    setSelectedAvatar(lottie)
    setShowPicker(false)
    inputRef.current?.focus()
  }

  return (
    <div className="input-phase">
      <h2>Enter Racers</h2>
      <p className="racer-count">{entries.length}/{MAX_RACERS} racers — paste a comma or newline-separated list, or add one at a time</p>

      <div className="racers-list">
        {entries.map((entry, i) => (
          <div key={i} className="racer-tag">
            <span className="racer-tag-emoji">
              <LottieRacer src={entry.lottie?.src} size={22} />
            </span>
            <span className="name">{entry.name}</span>
            <button className="remove" onClick={() => removeName(i)}>&times;</button>
          </div>
        ))}
      </div>

      <div className="name-input-row">
        <div className="emoji-input-wrapper">
          <button
            className="emoji-toggle-btn"
            onClick={() => setShowPicker(!showPicker)}
            title={selectedAvatar ? 'Change avatar' : 'Pick an avatar (or leave for random)'}
          >
            {selectedAvatar ? (
              <LottieRacer src={selectedAvatar.src} size={28} />
            ) : (
              '🎲'
            )}
          </button>
          {showPicker && (
            <div className="emoji-picker">
              {LOTTIE_POOL.map((lottie) => (
                <button
                  key={lottie.id}
                  className={`emoji-option${selectedAvatar?.id === lottie.id ? ' selected' : ''}`}
                  onClick={() => handlePickAvatar(lottie)}
                  title={lottie.label}
                >
                  <LottieRacer src={lottie.src} size={36} />
                </button>
              ))}
              {selectedAvatar && (
                <button className="emoji-option emoji-random" onClick={() => handlePickAvatar(null)}>
                  🎲 Random
                </button>
              )}
            </div>
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={entries.length >= MAX_RACERS ? 'Max racers reached' : 'Enter a name...'}
          disabled={entries.length >= MAX_RACERS}
          autoFocus
        />
        <button
          className="btn btn-add"
          onClick={addName}
          disabled={!inputValue.trim() || entries.length >= MAX_RACERS}
        >
          Add
        </button>
      </div>

      <div className="duration-selector">
        <span className="duration-label">Race Length</span>
        <div className="duration-options">
          {DURATION_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={`duration-btn${duration === opt.value ? ' active' : ''}`}
              onClick={() => setDuration(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <button
        className="btn btn-start"
        onClick={() => onStart(entries, duration)}
        disabled={entries.length < 2}
      >
        {entries.length < 2 ? 'Add at least 2 racers' : `Start Race! (${entries.length} racers)`}
      </button>
    </div>
  )
}
