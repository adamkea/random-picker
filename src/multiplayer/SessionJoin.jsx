import { useState } from 'react'

const glassCard = 'w-full bg-white/[.06] rounded-2xl p-7 backdrop-blur-[10px] border border-white/10 text-center'
const btnStart = 'w-full bg-gradient-to-br from-green-primary to-green-deep text-white text-xl font-semibold py-3.5 px-10 rounded-[10px] cursor-pointer hover:-translate-y-px hover:shadow-[0_4px_15px_rgba(0,0,0,0.3)] transition-all mt-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0'

export default function SessionJoin({ onJoin, error }) {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState('name')

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
      <div className={glassCard}>
        <h2 className="text-xl font-semibold mb-5">Join a Race</h2>
        <form className="flex flex-col gap-3 items-center" onSubmit={handleSubmitName}>
          <input
            type="text"
            className="w-full max-w-[300px] px-4 py-3 rounded-[10px] border-2 border-white/15 bg-white/[.08] text-white text-lg text-center outline-none focus:border-purple-primary placeholder:text-white/35 transition-colors"
            placeholder="Your name"
            maxLength={20}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <button className={btnStart} type="submit" disabled={!name.trim()}>
            Next
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className={glassCard}>
      <h2 className="text-xl font-semibold mb-5">Enter Room Code</h2>
      <form className="flex flex-col gap-3 items-center" onSubmit={handleJoin}>
        <input
          type="text"
          className="w-[160px] px-4 py-4 rounded-xl border-2 border-white/15 bg-white/[.08] text-white text-[32px] font-extrabold text-center tracking-[8px] uppercase outline-none focus:border-purple-primary transition-colors"
          placeholder="ABCD"
          maxLength={4}
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          autoFocus
        />
        <button className={btnStart} type="submit" disabled={code.length !== 4}>
          Join Race
        </button>
        {error && <p className="text-red-light text-sm mt-2">{error}</p>}
      </form>
      <button
        className="bg-transparent border-0 text-white/50 cursor-pointer text-sm mt-3 hover:text-white transition-colors"
        onClick={() => setStep('name')}
      >
        &larr; Back
      </button>
    </div>
  )
}
