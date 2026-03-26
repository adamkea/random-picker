import { useEffect, useRef, useCallback, useState } from 'react'
import { io } from 'socket.io-client'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || ''

export function useSocket() {
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const [playerId, setPlayerId] = useState(null)
  const [lobbyState, setLobbyState] = useState(null)
  const [phase, setPhase] = useState(null) // lobby | countdown | racing | result
  const [countdownValue, setCountdownValue] = useState(null)
  const [raceTick, setRaceTick] = useState(null)
  const [raceFinish, setRaceFinish] = useState(null)
  const [effects, setEffects] = useState([]) // recent effect_applied events
  const [error, setError] = useState(null)

  useEffect(() => {
    const socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
    })
    socketRef.current = socket

    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))

    socket.on('lobby_state', (state) => {
      setLobbyState(state)
      setPhase('lobby')
    })

    socket.on('phase', (p) => {
      setPhase(p)
      if (p === 'lobby') {
        setRaceFinish(null)
        setRaceTick(null)
        setCountdownValue(null)
        setEffects([])
      }
    })

    socket.on('countdown', (val) => setCountdownValue(val))

    socket.on('race_tick', (data) => setRaceTick(data))

    socket.on('race_finish', (data) => {
      setRaceFinish(data)
      setPhase('result')
    })

    socket.on('effect_applied', (effect) => {
      setEffects(prev => [...prev.slice(-10), { ...effect, ts: Date.now() }])
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const createRoom = useCallback((name) => {
    return new Promise((resolve, reject) => {
      socketRef.current?.emit('create_room', { name }, (res) => {
        if (res.error) {
          setError(res.error)
          reject(res.error)
        } else {
          setPlayerId(res.playerId)
          setError(null)
          resolve(res)
        }
      })
    })
  }, [])

  const joinRoom = useCallback((code, name) => {
    return new Promise((resolve, reject) => {
      socketRef.current?.emit('join_room', { code, name }, (res) => {
        if (res.error) {
          setError(res.error)
          reject(res.error)
        } else {
          setPlayerId(res.playerId)
          setError(null)
          resolve(res)
        }
      })
    })
  }, [])

  const setDuration = useCallback((duration) => {
    socketRef.current?.emit('set_duration', duration)
  }, [])

  const startRace = useCallback(() => {
    socketRef.current?.emit('start_race')
  }, [])

  const boost = useCallback(() => {
    socketRef.current?.emit('boost')
  }, [])

  const sabotage = useCallback((targetId) => {
    socketRef.current?.emit('sabotage', { targetId })
  }, [])

  const playAgain = useCallback(() => {
    socketRef.current?.emit('play_again')
  }, [])

  return {
    connected,
    playerId,
    lobbyState,
    phase,
    countdownValue,
    raceTick,
    raceFinish,
    effects,
    error,
    createRoom,
    joinRoom,
    setDuration,
    startRace,
    boost,
    sabotage,
    playAgain,
  }
}
