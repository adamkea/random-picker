import { useState, useRef } from 'react'
import { EMOJI_POOL } from '../App'

const MAX_RACERS = 10

export default function InputPhase({ onStart }) {
  const [entries, setEntries] = useState([]) // { name, emoji: string|null }
  const [inputValue, setInputValue] = useState('')
  const [pickerIndex, setPickerIndex] = useState(null)
  const inputRef = useRef(null)

  const addName = () => {
    const trimmed = inputValue.trim()
    if (!trimmed || entries.length >= MAX_RACERS) return
    setEntries(prev => [...prev, { name: trimmed, emoji: null }])
    setInputValue('')
    inputRef.current?.focus()
  }

  const removeName = (index) => {
    setEntries(prev => prev.filter((_, i) => i !== index))
    if (pickerIndex === index) setPickerIndex(null)
  }

  const selectEmoji = (index, emoji) => {
    setEntries(prev => prev.map((e, i) => i === index ? { ...e, emoji } : e))
    setPickerIndex(null)
  }

  const clearEmoji = (index) => {
    setEntries(prev => prev.map((e, i) => i === index ? { ...e, emoji: null } : e))
    setPickerIndex(null)
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

  return (
    <div className="input-phase">
      <h2>Enter Racers</h2>
      <p className="racer-count">{entries.length}/{MAX_RACERS} racers — paste a comma or newline-separated list, or add one at a time</p>

      <div className="racers-list">
        {entries.map((entry, i) => (
          <div key={i} className="racer-tag">
            <button
              className="emoji-pick-btn"
              onClick={() => setPickerIndex(pickerIndex === i ? null : i)}
              title="Pick an emoji"
            >
              {entry.emoji || '🎲'}
            </button>
            <span className="name">{entry.name}</span>
            <button className="remove" onClick={() => removeName(i)}>&times;</button>
            {pickerIndex === i && (
              <div className="emoji-picker">
                {EMOJI_POOL.map((emoji) => (
                  <button
                    key={emoji}
                    className={`emoji-option${entry.emoji === emoji ? ' selected' : ''}`}
                    onClick={() => selectEmoji(i, emoji)}
                  >
                    {emoji}
                  </button>
                ))}
                {entry.emoji && (
                  <button className="emoji-option emoji-random" onClick={() => clearEmoji(i)}>
                    🎲
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="name-input-row">
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
