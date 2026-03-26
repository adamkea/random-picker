import { useRef, useCallback, useState } from 'react'
import { io } from 'socket.io-client'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || ''

export function useSocket() {
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const [playerId, setPlayerId] = useState(null)
  const [lobbyState, setLobbyState] = useState(null)
  const [phase, setPhase] = useState(null)
  const [countdownValue, setCountdownValue] = useState(null)
  const [raceTick, setRaceTick] = useState(null)
  const [raceFinish, setRaceFinish] = useState(null)
  const [effects, setEffects] = useState([])
  const [error, setError] = useState(null)

  const ensureConnected = useCallback(() => {
    return new Promise((resolve, reject) => {
      // Already connected
      if (socketRef.current?.connected) {
        resolve(socketRef.current)
        return
      }

      // Already created but not yet connected — wait for it
      if (socketRef.current) {
        socketRef.current.once('connect', () => resolve(socketRef.current))
        socketRef.current.once('connect_error', (err) => reject(new Error(`Cannot reach server: ${err.message}`)))
        return
      }

      // Create new socket
      const socket = io(SERVER_URL, {
        transports: ['websocket', 'polling'],
        timeout: 5000,
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

      socket.once('connect', () => resolve(socket))
      socket.once('connect_error', (err) => {
        reject(new Error(`Cannot reach server. Is it running? (${err.message})`))
      })
    })
  }, [])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
      setConnected(false)
      setPhase(null)
      setLobbyState(null)
      setPlayerId(null)
      setError(null)
    }
  }, [])

  const createRoom = useCallback(async (name) => {
    setError(null)
    const socket = await ensureConnected()
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Server did not respond. Is it running?'))
      }, 5000)

      socket.emit('create_room', { name }, (res) => {
        clearTimeout(timer)
        if (res.error) {
          setError(res.error)
          reject(new Error(res.error))
        } else {
          setPlayerId(res.playerId)
          setError(null)
          resolve(res)
        }
      })
    })
  }, [ensureConnected])

  const joinRoom = useCallback(async (code, name) => {
    setError(null)
    const socket = await ensureConnected()
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Server did not respond. Is it running?'))
      }, 5000)

      socket.emit('join_room', { code, name }, (res) => {
        clearTimeout(timer)
        if (res.error) {
          setError(res.error)
          reject(new Error(res.error))
        } else {
          setPlayerId(res.playerId)
          setError(null)
          resolve(res)
        }
      })
    })
  }, [ensureConnected])

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
    disconnect,
  }
}
