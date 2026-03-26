import { useState, useRef, useEffect } from 'react'
import { EMOJI_POOL } from '../App'

const MAX_RACERS = 10
const STORAGE_KEY = 'emoji-racer-entries'

function loadEntries() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (Array.isArray(saved)) return saved
  } catch {}
  return []
}

export default function InputPhase({ onStart }) {
  const [entries, setEntries] = useState(loadEntries) // { name, emoji: string|null }
  const [inputValue, setInputValue] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState(null)
  const [showPicker, setShowPicker] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  }, [entries])

  const addName = () => {
    const trimmed = inputValue.trim()
    if (!trimmed || entries.length >= MAX_RACERS) return
    setEntries(prev => [...prev, { name: trimmed, emoji: selectedEmoji }])
    setInputValue('')
    setSelectedEmoji(null)
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
      const pasted = text
        .split(/[\n,]+/)
        .map(s => s.trim())
        .filter(Boolean)
        .slice(0, MAX_RACERS - entries.length)
        .map(name => ({ name, emoji: null }))
      setEntries(prev => [...prev, ...pasted].slice(0, MAX_RACERS))
      setInputValue('')
    }
  }

  const handlePickEmoji = (emoji) => {
    setSelectedEmoji(emoji)
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
            <span className="racer-tag-emoji">{entry.emoji || '🎲'}</span>
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
            title={selectedEmoji ? 'Change emoji' : 'Pick an emoji (or leave for random)'}
          >
            {selectedEmoji || '🎲'}
          </button>
          {showPicker && (
            <div className="emoji-picker">
              {EMOJI_POOL.map((emoji) => (
                <button
                  key={emoji}
                  className={`emoji-option${selectedEmoji === emoji ? ' selected' : ''}`}
                  onClick={() => handlePickEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
              {selectedEmoji && (
                <button className="emoji-option emoji-random" onClick={() => handlePickEmoji(null)}>
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

      <button
        className="btn btn-start"
        onClick={() => onStart(entries)}
        disabled={entries.length < 2}
      >
        {entries.length < 2 ? 'Add at least 2 racers' : `Start Race! (${entries.length} racers)`}
      </button>
    </div>
  )
}
