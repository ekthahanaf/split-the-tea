const { useState, useEffect, useRef, useCallback } = React;

const COUNTRIES = [
  ["WW", "Worldwide"], ["PK", "Pakistan"], ["IN", "India"], ["BD", "Bangladesh"],
  ["US", "United States"], ["GB", "United Kingdom"], ["CA", "Canada"], ["AU", "Australia"],
  ["AE", "UAE"], ["SA", "Saudi Arabia"], ["TR", "Turkey"], ["EG", "Egypt"],
  ["NG", "Nigeria"], ["ZA", "South Africa"], ["DE", "Germany"], ["FR", "France"],
  ["ES", "Spain"], ["IT", "Italy"], ["NL", "Netherlands"], ["RU", "Russia"],
  ["CN", "China"], ["JP", "Japan"], ["KR", "South Korea"], ["ID", "Indonesia"],
  ["MY", "Malaysia"], ["PH", "Philippines"], ["BR", "Brazil"], ["MX", "Mexico"],
  ["AR", "Argentina"],
];

const LANGS = [
  ["any", "Any language"], ["en", "English"], ["ur", "Urdu"], ["hi", "Hindi"],
  ["ar", "Arabic"], ["bn", "Bengali"], ["es", "Spanish"], ["fr", "French"],
  ["de", "German"], ["tr", "Turkish"], ["ru", "Russian"], ["zh", "Chinese"],
  ["ja", "Japanese"], ["pt", "Portuguese"], ["id", "Indonesian"],
];

function Logo({ size = 56 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <g className="steam" stroke="#D9A441" strokeWidth="3" strokeLinecap="round">
        <path d="M26 24c-4-4 4-7 0-12" />
        <path d="M38 24c4-4-4-7 0-12" />
      </g>
      <path d="M12 28h36v10a16 16 0 0 1-16 16h-4a16 16 0 0 1-16-16V28z" fill="#2F6B5B" />
      <path d="M48 31h4a6 6 0 0 1 0 12h-5" stroke="#2F6B5B" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M30 28l3 7-4 6 3 13" stroke="#EEF3EF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Gate({ onAccept }) {
  const [ok, setOk] = useState(false);
  return (
    <main className="min-h-full grid place-items-center p-5">
      <div className="max-w-md w-full">
        <Logo size={72} />
        <h1 className="font-display font-extrabold text-5xl sm:text-6xl leading-[0.95] mt-4 tracking-tight">
          Split The Tea
        </h1>
        <p className="mt-4 text-lg text-ink/80">
          Talk to a random stranger. No accounts, no database. When you refresh or leave, the chat is gone.
        </p>
        <ul className="mt-6 space-y-2 text-ink/80">
          <li>Be kind. Harassment gets you blocked.</li>
          <li>Never share personal details like your phone number, address or passwords.</li>
          <li>Text only. Nothing is saved on our side.</li>
        </ul>
        <label className="mt-7 flex items-start gap-3 cursor-pointer select-none">
          <input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)}
                 className="mt-1 h-5 w-5 accent-[#2F6B5B]" />
          <span>I am 18 or older and I agree to follow the rules above.</span>
        </label>
        <button disabled={!ok} onClick={onAccept}
                className="mt-6 w-full rounded-xl bg-jade text-white font-semibold py-3.5 text-lg
                           disabled:opacity-40 disabled:cursor-not-allowed hover:bg-ink transition-colors">
          Enter
        </button>
      </div>
    </main>
  );
}

function Setup({ prefs, setPrefs, onStart, online }) {
  const [tag, setTag] = useState("");
  const addTag = () => {
    const t = tag.trim().toLowerCase();
    if (t && !prefs.interests.includes(t) && prefs.interests.length < 5) {
      setPrefs({ ...prefs, interests: [...prefs.interests, t] });
    }
    setTag("");
  };
  const removeTag = (t) => setPrefs({ ...prefs, interests: prefs.interests.filter((i) => i !== t) });

  const field = "w-full rounded-xl border border-ink/20 bg-white px-4 py-3 focus:border-jade";

  return (
    <main className="min-h-full grid lg:grid-cols-2">
      <section className="flex flex-col justify-center p-6 sm:p-12 lg:p-16">
        <Logo size={80} />
        <h1 className="font-display font-extrabold text-6xl sm:text-7xl xl:text-8xl leading-[0.9] tracking-tight mt-5">
          Split<br />The Tea
        </h1>
        <p className="mt-5 text-xl text-ink/75 max-w-md">
          Meet someone new from anywhere in the world. Say what you like, spill a little, and move on.
        </p>
        <p className="mt-8 flex items-center gap-2 text-ink/70">
          <span className="h-2.5 w-2.5 rounded-full bg-jade inline-block"></span>
          {online} {online === 1 ? "person" : "people"} online now
        </p>
      </section>

      <section className="bg-leaf p-6 sm:p-12 lg:p-16 flex items-center">
        <div className="w-full max-w-md mx-auto">
          <h2 className="font-display font-bold text-2xl">Who do you want to talk to?</h2>

          <label className="block mt-6">
            <span className="font-semibold">Interests (up to 5)</span>
            <div className="mt-2 flex gap-2">
              <input className={field} value={tag} placeholder="music, cricket, coding"
                     onChange={(e) => setTag(e.target.value)}
                     onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); } }} />
              <button onClick={addTag} className="rounded-xl bg-ink text-white px-5 font-semibold">Add</button>
            </div>
          </label>
          <div className="mt-3 flex flex-wrap gap-2 min-h-[2rem]">
            {prefs.interests.map((t) => (
              <button key={t} onClick={() => removeTag(t)} title="Remove"
                      className="rounded-full bg-chai/90 text-ink px-3 py-1 text-sm font-semibold">
                {t} &times;
              </button>
            ))}
            {!prefs.interests.length && <span className="text-ink/60 text-sm">No interests means anyone can match with you.</span>}
          </div>

          <label className="block mt-5">
            <span className="font-semibold">Your country</span>
            <select className={field + " mt-2"} value={prefs.country}
                    onChange={(e) => setPrefs({ ...prefs, country: e.target.value })}>
              {COUNTRIES.map(([c, n]) => <option key={c} value={c}>{n}</option>)}
            </select>
          </label>

          <label className={"mt-3 flex items-center gap-3 select-none " + (prefs.country === "WW" ? "opacity-50" : "cursor-pointer")}>
            <input type="checkbox" disabled={prefs.country === "WW"} checked={prefs.sameCountry}
                   onChange={(e) => setPrefs({ ...prefs, sameCountry: e.target.checked })}
                   className="h-5 w-5 accent-[#2F6B5B]" />
            <span>Only match people from my country</span>
          </label>

          <label className="block mt-5">
            <span className="font-semibold">Language</span>
            <select className={field + " mt-2"} value={prefs.lang}
                    onChange={(e) => setPrefs({ ...prefs, lang: e.target.value })}>
              {LANGS.map(([c, n]) => <option key={c} value={c}>{n}</option>)}
            </select>
          </label>

          <button onClick={onStart}
                  className="mt-8 w-full rounded-xl bg-jade text-white font-display font-bold text-xl py-4 hover:bg-ink transition-colors">
            Find a stranger
          </button>
        </div>
      </section>
    </main>
  );
}

function Chat({ socket, prefs, online, onStop }) {
  const [status, setStatus] = useState("waiting"); // waiting | matched | left
  const [common, setCommon] = useState([]);
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [notice, setNotice] = useState("");
  const endRef = useRef(null);
  const typingTimer = useRef(null);
  const iAmTyping = useRef(false);

  const search = useCallback(() => {
    setMessages([]); setTyping(false); setCommon([]); setNotice("");
    setStatus("waiting");
    socket.emit("start", prefs);
  }, [socket, prefs]);

  useEffect(() => {
    const on = {
      waiting: () => setStatus("waiting"),
      matched: (d) => { setStatus("matched"); setCommon(d?.common || []); },
      message: (m) => { setMessages((x) => [...x, { me: false, text: m }]); setTyping(false); },
      typing: (t) => setTyping(!!t),
      stranger_left: () => { setStatus("left"); setTyping(false); },
      rate_limited: () => { setNotice("Slow down a little."); setTimeout(() => setNotice(""), 2000); },
    };
    Object.entries(on).forEach(([e, f]) => socket.on(e, f));
    socket.emit("start", prefs);
    return () => Object.entries(on).forEach(([e, f]) => socket.off(e, f));
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing, status]);

  const send = () => {
    const t = input.trim();
    if (!t || status !== "matched") return;
    socket.emit("message", t);
    setMessages((x) => [...x, { me: true, text: t }]);
    setInput("");
    if (iAmTyping.current) { iAmTyping.current = false; socket.emit("typing", false); }
  };

  const onChange = (e) => {
    setInput(e.target.value);
    if (status !== "matched") return;
    if (!iAmTyping.current) { iAmTyping.current = true; socket.emit("typing", true); }
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => { iAmTyping.current = false; socket.emit("typing", false); }, 1200);
  };

  const report = () => {
    if (status !== "matched") return;
    if (confirm("Report this stranger and move on?")) { socket.emit("report"); search(); }
  };

  const stop = () => { socket.emit("leave"); onStop(); };

  const banner =
    status === "waiting" ? "Looking for someone to talk to..." :
    status === "left" ? "The stranger left. Chat is gone for good." :
    common.length ? "You both like: " + common.join(", ") : "You are connected. Say hi.";

  return (
    <main className="h-full flex flex-col max-w-3xl mx-auto bg-white sm:border-x sm:border-ink/10">
      <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-ink/10 bg-leaf">
        <div className="flex items-center gap-2">
          <Logo size={34} />
          <span className="font-display font-bold text-lg">Split The Tea</span>
        </div>
        <span className="text-sm text-ink/70">{online} online</span>
      </header>

      <div className={"px-4 py-2 text-sm font-semibold " + (status === "matched" ? "bg-jade text-white" : "bg-chai/30")}>
        {banner}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-2" aria-live="polite">
        {status === "matched" && !messages.length && (
          <p className="text-center text-ink/50 mt-10">Nobody knows who you are. Start the conversation.</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={"flex " + (m.me ? "justify-end" : "justify-start")}>
            <div className={"bubble rounded-2xl px-4 py-2 " +
              (m.me ? "bg-jade text-white rounded-br-sm" : "bg-porcelain border border-ink/10 rounded-bl-sm")}>
              {m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-porcelain border border-ink/10 px-4 py-3 dots" aria-label="Stranger is typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {notice && <div className="px-4 pb-1 text-sm text-brick font-semibold">{notice}</div>}

      <footer className="border-t border-ink/10 p-3 bg-white">
        <div className="flex gap-2 mb-2">
          <button onClick={search} className="rounded-lg bg-ink text-white px-4 py-2 font-semibold">Next stranger</button>
          <button onClick={stop} className="rounded-lg border border-ink/25 px-4 py-2 font-semibold">Stop</button>
          <button onClick={report} disabled={status !== "matched"}
                  className="ml-auto rounded-lg text-brick border border-brick/40 px-4 py-2 font-semibold disabled:opacity-30">
            Report
          </button>
        </div>
        <div className="flex gap-2">
          <input value={input} onChange={onChange} maxLength={1000}
                 onKeyDown={(e) => e.key === "Enter" && send()}
                 disabled={status !== "matched"}
                 placeholder={status === "matched" ? "Type a message" : "Waiting for a stranger"}
                 className="flex-1 rounded-xl border border-ink/20 px-4 py-3 disabled:bg-porcelain focus:border-jade" />
          <button onClick={send} disabled={status !== "matched" || !input.trim()}
                  className="rounded-xl bg-jade text-white px-6 font-semibold disabled:opacity-40">Send</button>
        </div>
      </footer>
    </main>
  );
}

function App() {
  const [stage, setStage] = useState("gate");
  const [online, setOnline] = useState(0);
  const [blocked, setBlocked] = useState(null);
  const [prefs, setPrefs] = useState({ interests: [], country: "WW", sameCountry: false, lang: "any" });
  const socketRef = useRef(null);

  if (!socketRef.current) socketRef.current = io();
  const socket = socketRef.current;

  useEffect(() => {
    socket.on("online_count", setOnline);
    socket.on("blocked", (d) => setBlocked(d));
    return () => { socket.off("online_count", setOnline); };
  }, []);

  if (blocked) {
    return (
      <main className="min-h-full grid place-items-center p-6 text-center">
        <div>
          <h1 className="font-display font-extrabold text-4xl">You have been blocked</h1>
          <p className="mt-3 text-ink/70">Too many people reported you. Try again in about {blocked.minutes} minutes.</p>
        </div>
      </main>
    );
  }

  if (stage === "gate") return <Gate onAccept={() => setStage("setup")} />;
  if (stage === "setup") return <Setup prefs={prefs} setPrefs={setPrefs} online={online} onStart={() => setStage("chat")} />;
  return <Chat socket={socket} prefs={prefs} online={online} onStop={() => setStage("setup")} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
