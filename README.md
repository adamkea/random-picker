# 🏁 Pick A Winner

A fun, animated racing game for picking winners (or losers) from a list of names. Race animated characters against each other solo, or go head-to-head with friends in real-time multiplayer.

## Features

### Solo Mode
- Enter up to 20 racers by name — one at a time or paste a comma/newline-separated list
- Each racer gets a unique animated Lottie runner avatar
- Choose race duration: 15s, 30s, 1 min, or 1 min 30s
- Choose to reveal the **winner** or the **loser**
- Confetti celebration when the result is announced
- Race history saved locally (last 20 results)

### Multiplayer Mode
- Host creates a room and shares a 4-character code with friends
- Up to 5 players per room
- **Boost** your racer for a speed burst (costs boost meter)
- **Sabotage** a rival to slow them down (8s cooldown)
- Server-authoritative physics — no cheating
- Join via room code or a shareable URL (`?room=XXXX`)
- Host can start a new race after results, or players can return to the lobby

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite |
| Animations | Lottie (via `@lottiefiles/dotlottie-react`) |
| Motion / transitions | Motion (Framer Motion) |
| Confetti | `canvas-confetti` |
| Backend | Express 5, Node.js |
| Real-time comms | Socket.IO 4 |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install dependencies

```bash
npm install
```

### Development

Run the frontend dev server and the backend server in separate terminals:

```bash
# Terminal 1 — Vite dev server (http://localhost:5173)
npm run dev

# Terminal 2 — Express + Socket.IO server (http://localhost:3001)
npm run server
```

### Production

Build the frontend and serve everything from the Express server:

```bash
npm run build
npm start
```

The server listens on port `3001` by default. Set the `PORT` environment variable to change it.

To allow additional origins for the Socket.IO connection, set `ALLOWED_ORIGINS` as a comma-separated list:

```bash
ALLOWED_ORIGINS=https://yourdomain.com npm start
```

## How to Play

### Solo
1. Select **Solo Race** from the home screen
2. Add racer names (type + Enter, or paste a list)
3. Pick a race duration and whether to find the **Winner** or **Loser**
4. Hit **Start Race** and watch them go!

### Multiplayer
1. Select **Host Multiplayer**, enter your name, and click **Create Room**
2. Share the 4-character room code (or the URL) with friends
3. Friends select **Join** and enter the code and their name
4. The host sets the race duration and clicks **Start Race**
5. During the race, tap **Boost** to speed up or **Sabotage** to slow down a rival
6. After the race, the host can kick off another round
