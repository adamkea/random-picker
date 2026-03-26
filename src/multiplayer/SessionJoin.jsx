import { useState } from 'react'

export default function SessionJoin({ onJoin, error }) {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState('name') // name | code

  const handleSubmitName = (e) => {
    e.preventDefault()
    if (name.trim()) setStep('code')
  }

  const handleJoin = (e) => {
    e.preventDefault()
    if (code.length === 4 && name.trim()) {
      onJoin(code, name.trim())
    }
  }

  if (step === 'name') {
    return (
      <div className="session-join">
        <h2>Join a Race</h2>
        <form onSubmit={handleSubmitName}>
          <input
            type="text"
            className="join-name-input"
            placeholder="Your name"
            maxLength={20}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <button className="btn btn-start" type="submit" disabled={!name.trim()}>
            Next
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="session-join">
      <h2>Enter Room Code</h2>
      <form onSubmit={handleJoin}>
        <input
          type="text"
          className="join-code-input"
          placeholder="ABCD"
          maxLength={4}
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          autoFocus
        />
        <button className="btn btn-start" type="submit" disabled={code.length !== 4}>
          Join Race
        </button>
        {error && <p className="join-error">{error}</p>}
      </form>
      <button className="btn-back" onClick={() => setStep('name')}>
        &larr; Back
      </button>
    </div>
  )
}
