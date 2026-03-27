// Server-side race simulation
// The server is authoritative -- it runs the physics and broadcasts state.

const TICK_INTERVAL = 33 // ~30fps
const FINISH_LINE = 1.0
const BASE_SPEED = 0.012 // base drift per tick (everyone finishes eventually)
const BOOST_SPEED_MULT = 1.4 // +40% speed
const BOOST_DURATION = 500 // ms
const BOOST_COST = 15
const BOOST_METER_MAX = 100
const BOOST_RECHARGE_RATE = 5 / (1000 / TICK_INTERVAL) // 5 per second, converted to per-tick
const SABOTAGE_SLOW_MULT = 0.7 // -30% speed
const SABOTAGE_DURATION = 2000 // ms
const SABOTAGE_COOLDOWN = 8000 // ms

export function createRaceState(players) {
  const state = {
    startTime: Date.now(),
    finished: false,
    winnerId: null,
    players: {},
  }

  for (const player of players) {
    state.players[player.id] = {
      id: player.id,
      name: player.name,
      lottieId: player.lottieId,
      position: 0,
      boostMeter: BOOST_METER_MAX,
      activeEffects: [], // { type, multiplier, expiresAt }
      sabotageCooldownUntil: 0,
    }
  }

  return state
}

export function processBoost(raceState, playerId) {
  const player = raceState.players[playerId]
  if (!player || raceState.finished) return null

  if (player.boostMeter < BOOST_COST) return null

  player.boostMeter -= BOOST_COST
  player.activeEffects.push({
    type: 'boost',
    multiplier: BOOST_SPEED_MULT,
    expiresAt: Date.now() + BOOST_DURATION,
  })

  return { type: 'boost', playerId }
}

export function processSabotage(raceState, fromId, targetId) {
  const from = raceState.players[fromId]
  const target = raceState.players[targetId]
  if (!from || !target || raceState.finished) return null
  if (fromId === targetId) return null

  const now = Date.now()
  if (from.sabotageCooldownUntil > now) return null

  from.sabotageCooldownUntil = now + SABOTAGE_COOLDOWN

  target.activeEffects.push({
    type: 'sabotage',
    multiplier: SABOTAGE_SLOW_MULT,
    expiresAt: now + SABOTAGE_DURATION,
  })

  return { type: 'sabotage', fromId, targetId }
}

export function tick(raceState) {
  if (raceState.finished) return null

  const now = Date.now()

  for (const player of Object.values(raceState.players)) {
    // Remove expired effects
    player.activeEffects = player.activeEffects.filter(e => e.expiresAt > now)

    // Calculate speed multiplier from active effects
    let speedMult = 1.0
    for (const effect of player.activeEffects) {
      speedMult *= effect.multiplier
    }

    // Move forward
    player.position += BASE_SPEED * speedMult
    player.position = Math.min(player.position, FINISH_LINE)

    // Recharge boost meter
    player.boostMeter = Math.min(BOOST_METER_MAX, player.boostMeter + BOOST_RECHARGE_RATE)

    // Check finish
    if (player.position >= FINISH_LINE && !raceState.winnerId) {
      raceState.winnerId = player.id
      raceState.finished = true
    }
  }

  // Build broadcast payload
  const positions = {}
  const boostMeters = {}
  const effects = {}

  for (const [id, player] of Object.entries(raceState.players)) {
    positions[id] = player.position
    boostMeters[id] = player.boostMeter
    effects[id] = player.activeEffects.map(e => e.type)
  }

  return {
    positions,
    boostMeters,
    effects,
    finished: raceState.finished,
    winnerId: raceState.winnerId,
  }
}

export { TICK_INTERVAL, SABOTAGE_COOLDOWN, BOOST_METER_MAX }
