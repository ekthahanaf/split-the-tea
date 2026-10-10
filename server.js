// Split The Tea - anonymous random chat server
// Everything lives in memory. No database. Restart/refresh = everything gone.

const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
app.disable("x-powered-by");
app.use(express.static(path.join(__dirname, "public")));
app.get("/health", (_req, res) => res.send("ok"));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
  maxHttpBufferSize: 10_000, // tiny payloads only, text chat
});

// ---------- config ----------
const INTEREST_WAIT_MS = 7000; // after this, interests are ignored and we match randomly
const MAX_MSG_LEN = 1000;
const MAX_INTERESTS = 5;
const RATE_LIMIT = { count: 6, perMs: 4000 }; // 6 messages / 4 sec
const REPORTS_TO_BLOCK = 3;
const BLOCK_MS = 15 * 60 * 1000;

// ---------- in-memory state ----------
const users = new Map(); // socket.id -> user
const waiting = new Set(); // socket ids searching
const reportCounts = new Map(); // ip -> reports (in memory only)
const blockedUntil = new Map(); // ip -> timestamp

const BAD_WORDS = ["fuck", "shit", "bitch", "nigger", "slut", "porn"];
function clean(text) {
  let out = String(text).slice(0, MAX_MSG_LEN);
  for (const w of BAD_WORDS) {
    out = out.replace(new RegExp(w, "gi"), (m) => "*".repeat(m.length));
  }
  return out;
}

function getIp(socket) {
  const xf = socket.handshake.headers["x-forwarded-for"];
  return (xf ? xf.split(",")[0] : socket.handshake.address || "").trim();
}

function broadcastOnline() {
  io.emit("online_count", users.size);
}

// ---------- matching ----------
function overlap(a, b) {
  return a.interests.filter((i) => b.interests.includes(i));
}

function canPair(a, b, now) {
  if (a.id === b.id) return false;

  // country filter: if either wants same-country, countries must match
  if ((a.sameCountry || b.sameCountry) && a.country !== b.country) return false;

  // language filter: hard filter only when both chose a language
  if (a.lang !== "any" && b.lang !== "any" && a.lang !== b.lang) return false;

  // interests: need overlap, unless someone has none or has waited long enough
  if (a.interests.length && b.interests.length) {
    const waitedLong =
      now - a.since > INTEREST_WAIT_MS || now - b.since > INTEREST_WAIT_MS;
    if (!waitedLong && overlap(a, b).length === 0) return false;
  }
  return true;
}

function pair(a, b) {
  waiting.delete(a.id);
  waiting.delete(b.id);
  a.partner = b.id;
  b.partner = a.id;
  const common = overlap(a, b);
  io.to(a.id).emit("matched", { common });
  io.to(b.id).emit("matched", { common });
}

function matchAll() {
  const now = Date.now();
  const list = [...waiting].map((id) => users.get(id)).filter(Boolean);
  list.sort((x, y) => x.since - y.since); // longest waiting first
  for (let i = 0; i < list.length; i++) {
    const a = list[i];
    if (!waiting.has(a.id)) continue;
    // best candidate = most shared interests
    let best = null;
    let bestScore = -1;
    for (let j = i + 1; j < list.length; j++) {
      const b = list[j];
      if (!waiting.has(b.id) || !canPair(a, b, now)) continue;
      const score = overlap(a, b).length;
      if (score > bestScore) {
        best = b;
        bestScore = score;
      }
    }
    if (best) pair(a, best);
  }
}
setInterval(matchAll, 1500);

function leaveChat(user, notify = true) {
  waiting.delete(user.id);
  if (user.partner) {
    const p = users.get(user.partner);
    if (p) {
      p.partner = null;
      if (notify) io.to(p.id).emit("stranger_left");
    }
    user.partner = null;
  }
}

// ---------- sockets ----------
io.on("connection", (socket) => {
  const ip = getIp(socket);
  const until = blockedUntil.get(ip);
  if (until && until > Date.now()) {
    socket.emit("blocked", { minutes: Math.ceil((until - Date.now()) / 60000) });
    socket.disconnect(true);
    return;
  }

  const user = {
    id: socket.id,
    ip,
    interests: [],
    country: "WW",
    sameCountry: false,
    lang: "any",
    since: 0,
    partner: null,
    stamps: [],
  };
  users.set(socket.id, user);
  broadcastOnline();

  socket.on("start", (prefs = {}) => {
    leaveChat(user);
    const raw = Array.isArray(prefs.interests) ? prefs.interests : [];
    user.interests = [
      ...new Set(
        raw
          .map((i) => String(i).trim().toLowerCase().slice(0, 24))
          .filter(Boolean)
      ),
    ].slice(0, MAX_INTERESTS);
    user.country = String(prefs.country || "WW").slice(0, 2).toUpperCase();
    user.sameCountry = !!prefs.sameCountry && user.country !== "WW";
    user.lang = String(prefs.lang || "any").slice(0, 3).toLowerCase();
    user.since = Date.now();
    waiting.add(user.id);
    socket.emit("waiting");
    matchAll();
  });

  socket.on("message", (text) => {
    if (!user.partner || typeof text !== "string" || !text.trim()) return;
    const now = Date.now();
    user.stamps = user.stamps.filter((t) => now - t < RATE_LIMIT.perMs);
    if (user.stamps.length >= RATE_LIMIT.count) {
      socket.emit("rate_limited");
      return;
    }
    user.stamps.push(now);
    io.to(user.partner).emit("message", clean(text));
  });

  socket.on("typing", (isTyping) => {
    if (user.partner) io.to(user.partner).emit("typing", !!isTyping);
  });

  socket.on("report", () => {
    if (!user.partner) return;
    const target = users.get(user.partner);
    if (!target) return;
    const n = (reportCounts.get(target.ip) || 0) + 1;
    reportCounts.set(target.ip, n);
    if (n >= REPORTS_TO_BLOCK) {
      blockedUntil.set(target.ip, Date.now() + BLOCK_MS);
      reportCounts.delete(target.ip);
      io.to(target.id).emit("blocked", { minutes: BLOCK_MS / 60000 });
      const s = io.sockets.sockets.get(target.id);
      if (s) s.disconnect(true);
    }
  });

  socket.on("leave", () => leaveChat(user));

  socket.on("disconnect", () => {
    leaveChat(user);
    users.delete(socket.id);
    broadcastOnline();
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Split The Tea is brewing on port ${PORT}`));
