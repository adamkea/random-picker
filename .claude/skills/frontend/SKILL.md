# Frontend Development Skill

This skill assists with frontend development tasks for the Pick A Winner React/Vite application.

## Project Stack

- **Framework:** React 19 + Vite
- **Animation:** Lottie (@lottiefiles/dotlottie-react), Motion
- **Real-time:** Socket.IO client
- **Effects:** canvas-confetti
- **Linting:** ESLint with React hooks plugin

## Dev Commands

```bash
# Start frontend dev server (http://localhost:5173)
npm run dev

# Start backend server (http://localhost:3001)
npm run server

# Build for production
npm run build

# Lint
npm run lint
```

## Project Structure

```
src/
├── App.jsx              # Root component — manages mode & phase state
├── lottiePool.js        # Avatar pool (12 Lottie runners)
├── components/          # Solo mode components
│   ├── ModeSelector.jsx
│   ├── InputPhase.jsx
│   ├── RaceTrack.jsx
│   ├── RaceRenderer.jsx
│   ├── LottieRacer.jsx
│   ├── Result.jsx
│   └── History.jsx
└── multiplayer/         # Multiplayer components
    ├── useSocket.js
    ├── SessionJoin.jsx
    ├── MultiplayerLobby.jsx
    ├── MultiplayerRace.jsx
    ├── MultiplayerResult.jsx
    └── PlayerControls.jsx
```

## Key Conventions

- **State machine pattern:** `App.jsx` drives all phase transitions (`input` → `race` → `result`)
- **Socket events** flow through `useSocket.js`; emit/on patterns live there
- **Lottie avatars** are assigned from `lottiePool.js` — add new runners by extending the pool array
- **CSS:** component-level styles in `App.css`; global resets in `index.css`
- **No TypeScript** — plain JSX throughout

## Common Tasks

### Add a new component
1. Create `src/components/MyComponent.jsx`
2. Import and render in `App.jsx` or the relevant parent
3. Add styles inline or in `App.css`

### Add a new Socket.IO event (multiplayer)
1. Add the `socket.on('event-name', handler)` in `useSocket.js`
2. Add the server-side emit in `server/index.js`

### Add a new Lottie racer
1. Drop the `.json` animation file in `public/lottie/`
2. Add an entry to the pool array in `src/lottiePool.js`

## Instructions

When the user invokes this skill, help them with:
1. UI/UX improvements to the race or result screens
2. New React components following the existing patterns
3. Animation and Lottie integration
4. Multiplayer feature additions
5. Debugging frontend issues (check browser console, Vite HMR, ESLint output)

Ask the user what frontend task they want to work on, then proceed.
