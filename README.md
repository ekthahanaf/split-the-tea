# Split The Tea

Anonymous random text chat. No login, no database, nothing saved. Refresh or leave and the chat is gone.

## Features
- Random stranger matching
- Interest matching (shared interests first, random after ~7 seconds)
- Country filter (worldwide, or only your country) and language filter
- Typing indicator, live online count, Next / Stop buttons
- 18+ gate, Report button (3 reports = 15 min block, kept only in memory)
- Rate limiting and a basic word filter
- Frontend: React + Tailwind (no build step). Backend: Node.js + Express + Socket.io

## Run locally
```bash
npm install
npm start
```
Open http://localhost:3000 (open it in two tabs to test chatting with yourself).

## Deploy free on Render
1. Push this folder to a GitHub repo.
2. On render.com: New > Web Service > pick the repo.
3. Build command: `npm install`, Start command: `npm start`, plan: Free.
4. Done. Frontend and backend are served from the same URL.

Note: free Render services sleep after inactivity, so the first load can take 30-50 seconds. Ping `/health` with UptimeRobot to keep it awake.

## Structure
```
server.js        backend (Socket.io, matching, in-memory only)
public/
  index.html     page + Tailwind config
  app.jsx        React app
  style.css      small custom styles
```
