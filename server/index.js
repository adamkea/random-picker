import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  createRaceState,
  processBoost,
  processSabotage,
  tick,
  TICK_INTERVAL,
  SABOTAGE_COOLDOWN,
  BOOST_METER_MAX,
} from './gameLoop.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 3001

const app = express()
const httpServer = createServer(app)

// Serve built frontend in production
const distPath = path.join(__dirname, '..', 'dist')
app.use(express.static(distPath))
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

const defaultOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:4173']
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? [...defaultOrigins, ...process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())]
  : defaultOrigins

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
})

// Lottie avatars (must match client lottiePool.js)
const AVATAR_IDS = ['runner-original', 'runner-green', 'runner-blue', 'runner-pink', 'runner-yellow']

// Room storage
const rooms = new Map()

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no ambiguous chars
  let code
  do {
    code = ''
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)]
  } while (rooms.has(code))
  return code
}

function getLobbyState(room) {
  return {
    code: room.code,
    hostId: room.hostId,
    phase: room.phase,
    duration: room.duration,
    players: Object.values(room.players).map(p => ({
      id: p.id,
      name: p.name,
      lottieId: p.lottieId,
    })),
  }
}

function cleanupRoom(code) {
  const room = rooms.get(code)
  if (!room) return
  if (room.tickInterval) clearInterval(room.tickInterval)
  rooms.delete(code)
}

io.on('connection', (socket) => {
  let currentRoom = null

  socket.on('create_room', ({ name }, callback) => {
    if (currentRoom) {
      return callback({ error: 'Already in a room' })
    }

    const code = generateCode()
    const room = {
      code,
      hostId: socket.id,
      phase: 'lobby',
      duration: 30000,
      players: {},
      raceState: null,
      tickInterval: null,
      usedAvatars: [],
    }

    // Assign avatar
    const avatarId = AVATAR_IDS[0]
    room.usedAvatars.push(avatarId)

    room.players[socket.id] = {
      id: socket.id,
      name: name || 'Host',
      lottieId: avatarId,
    }

    rooms.set(code, room)
    currentRoom = code
    socket.join(code)

    callback({ ok: true, code, playerId: socket.id, lottieId: avatarId })
    io.to(code).emit('lobby_state', getLobbyState(room))
  })

  socket.on('join_room', ({ code, name }, callback) => {
    if (currentRoom) {
      return callback({ error: 'Already in a room' })
    }

    const room = rooms.get(code?.toUpperCase())
    if (!room) {
      return callback({ error: 'Room not found' })
    }

    if (room.phase !== 'lobby') {
      return callback({ error: 'Race already in progress' })
    }

    const playerCount = Object.keys(room.players).length
    if (playerCount >= 5) {
      return callback({ error: 'Room is full (max 5 players)' })
    }

    // Assign next available avatar
    const available = AVATAR_IDS.filter(id => !room.usedAvatars.includes(id))
    const avatarId = available[0] || AVATAR_IDS[playerCount % AVATAR_IDS.length]
    room.usedAvatars.push(avatarId)

    room.players[socket.id] = {
      id: socket.id,
      name: name || `Player ${playerCount + 1}`,
      lottieId: avatarId,
    }

    currentRoom = code.toUpperCase()
    socket.join(currentRoom)

    callback({ ok: true, playerId: socket.id, lottieId: avatarId })
    io.to(currentRoom).emit('lobby_state', getLobbyState(room))
  })

  socket.on('set_duration', (duration) => {
    const room = rooms.get(currentRoom)
    if (!room || socket.id !== room.hostId) return
    if ([15000, 30000, 60000, 90000].includes(duration)) {
      room.duration = duration
      io.to(currentRoom).emit('lobby_state', getLobbyState(room))
    }
  })

  socket.on('start_race', () => {
    const room = rooms.get(currentRoom)
    if (!room || socket.id !== room.hostId) return
    if (room.phase !== 'lobby') return
    if (Object.keys(room.players).length < 2) return

    room.phase = 'countdown'
    io.to(currentRoom).emit('phase', 'countdown')

    // Countdown: 3 -> 2 -> 1 -> GO -> race
    let count = 3
    const countdownInterval = setInterval(() => {
      io.to(currentRoom).emit('countdown', count)
      count--
      if (count < 0) {
        clearInterval(countdownInterval)
        startRace(room)
      }
    }, 700)
  })

  function startRace(room) {
    room.phase = 'racing'
    const players = Object.values(room.players)
    room.raceState = createRaceState(players)

    io.to(room.code).emit('phase', 'racing')

    // Start tick loop
    room.tickInterval = setInterval(() => {
      const snapshot = tick(room.raceState)
      if (!snapshot) return

      io.to(room.code).emit('race_tick', snapshot)

      if (snapshot.finished) {
        clearInterval(room.tickInterval)
        room.tickInterval = null
        room.phase = 'result'

        const winner = room.players[snapshot.winnerId]
        io.to(room.code).emit('race_finish', {
          winnerId: snapshot.winnerId,
          winnerName: winner?.name || 'Unknown',
          winnerLottieId: winner?.lottieId,
        })
      }
    }, TICK_INTERVAL)
  }

  socket.on('boost', () => {
    const room = rooms.get(currentRoom)
    if (!room || room.phase !== 'racing') return
    const result = processBoost(room.raceState, socket.id)
    if (result) {
      io.to(currentRoom).emit('effect_applied', result)
    }
  })

  socket.on('sabotage', ({ targetId }) => {
    const room = rooms.get(currentRoom)
    if (!room || room.phase !== 'racing') return
    const result = processSabotage(room.raceState, socket.id, targetId)
    if (result) {
      io.to(currentRoom).emit('effect_applied', result)
    }
  })

  socket.on('play_again', () => {
    const room = rooms.get(currentRoom)
    if (!room || socket.id !== room.hostId) return
    if (room.phase !== 'result') return

    if (room.tickInterval) clearInterval(room.tickInterval)
    room.phase = 'lobby'
    room.raceState = null

    io.to(currentRoom).emit('phase', 'lobby')
    io.to(currentRoom).emit('lobby_state', getLobbyState(room))
  })

  socket.on('disconnect', () => {
    if (!currentRoom) return
    const room = rooms.get(currentRoom)
    if (!room) return

    // Remove avatar from used list
    const player = room.players[socket.id]
    if (player) {
      room.usedAvatars = room.usedAvatars.filter(id => id !== player.lottieId)
    }

    delete room.players[socket.id]

    // If host left or room empty, clean up
    if (Object.keys(room.players).length === 0) {
      cleanupRoom(currentRoom)
      return
    }

    // If host left, promote next player
    if (socket.id === room.hostId) {
      const nextHost = Object.keys(room.players)[0]
      room.hostId = nextHost
    }

    io.to(currentRoom).emit('lobby_state', getLobbyState(room))

    // If racing and only 1 player left, end race
    if (room.phase === 'racing' && Object.keys(room.players).length < 2) {
      if (room.tickInterval) clearInterval(room.tickInterval)
      room.phase = 'result'
      const lastPlayer = Object.values(room.players)[0]
      io.to(currentRoom).emit('race_finish', {
        winnerId: lastPlayer.id,
        winnerName: lastPlayer.name,
        winnerLottieId: lastPlayer.lottieId,
      })
    }
  })
})

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
