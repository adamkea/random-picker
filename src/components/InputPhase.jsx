import { useState, useRef } from 'react'

const MAX_RACERS = 10

export default function InputPhase({ onStart }) {
  const [names, setNames] = useState([])
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef(null)

  const addName = () => {
    const trimmed = inputValue.trim()
    if (!trimmed || names.length >= MAX_RACERS) return
    setNames(prev => [...prev, trimmed])
    setInputValue('')
    inputRef.current?.focus()
  }

  const removeName = (index) => {
    setNames(prev => prev.filter((_, i) => i !== index))
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
        .slice(0, MAX_RACERS - names.length)
      setNames(prev => [...prev, ...pasted].slice(0, MAX_RACERS))
      setInputValue('')
    }
  }

  return (
    <div className="input-phase">
      <h2>Enter Racers</h2>
      <p className="racer-count">{names.length}/{MAX_RACERS} racers — paste a comma or newline-separated list, or add one at a time</p>

      <div className="racers-list">
        {names.map((name, i) => (
          <div key={i} className="racer-tag">
            <span className="name">{name}</span>
            <button className="remove" onClick={() => removeName(i)}>&times;</button>
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
          placeholder={names.length >= MAX_RACERS ? 'Max racers reached' : 'Enter a name...'}
          disabled={names.length >= MAX_RACERS}
          autoFocus
        />
        <button
          className="btn btn-add"
          onClick={addName}
          disabled={!inputValue.trim() || names.length >= MAX_RACERS}
        >
          Add
        </button>
      </div>

      <button
        className="btn btn-start"
        onClick={() => onStart(names)}
        disabled={names.length < 2}
      >
        {names.length < 2 ? 'Add at least 2 racers' : `Start Race! (${names.length} racers)`}
      </button>
    </div>
  )
}
