import { useCallback, useRef } from "react";

// ─── constants ───────────────────────────────────────────────────────────────
const SESSIONS = [
  { key: "focus",  label: "Focus",       icon: "🧠", color: "#7c3aed" },
  { key: "short",  label: "Short Break", icon: "☕", color: "#0ea5e9" },
  { key: "long",   label: "Long Break",  icon: "🛌", color: "#10b981" },
];

const QUOTES = [
  { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
  { text: "Focus on being productive instead of busy.",                  author: "Tim Ferriss" },
  { text: "It's not about having time. It's about making time.",         author: "Unknown" },
  { text: "Small daily improvements lead to stunning results.",          author: "Robin Sharma" },
];
// Pick once per mount, not per render, without using state (no need to persist across nav)
const QUOTE = QUOTES[Math.floor(Math.random() * QUOTES.length)];

const fmt = (s) => {
  const t = Math.max(0, s);
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
};

// ─── ring ─────────────────────────────────────────────────────────────────────
function Ring({ secs, total, accent }) {
  const SIZE = 260, STROKE = 14;
  const r     = (SIZE - STROKE) / 2;
  const circ  = 2 * Math.PI * r;
  const pct   = total > 0 ? Math.max(0, Math.min(1, 1 - secs / total)) : 0;
  const angle = -Math.PI / 2 + pct * 2 * Math.PI;
  const dx    = SIZE / 2 + r * Math.cos(angle);
  const dy    = SIZE / 2 + r * Math.sin(angle);

  return (
    <svg width={SIZE} height={SIZE}>
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <radialGradient id="bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#1a0b4e" />
          <stop offset="100%" stopColor="#0a0520" />
        </radialGradient>
      </defs>
      {/* bg disc */}
      <circle cx={SIZE/2} cy={SIZE/2} r={SIZE/2} fill="url(#bg)" />
      {/* track */}
      <circle cx={SIZE/2} cy={SIZE/2} r={r} fill="none" stroke="#2a1868" strokeWidth={STROKE} />
      {/* progress */}
      <circle
        cx={SIZE/2} cy={SIZE/2} r={r} fill="none"
        stroke={accent} strokeWidth={STROKE} strokeLinecap="round"
        strokeDasharray={`${circ * pct} ${circ}`}
        style={{ transform:"rotate(-90deg)", transformOrigin:"center",
                 filter:"url(#glow)", transition:"stroke-dasharray 0.9s linear" }}
      />
      {/* dot */}
      {pct > 0.005 && (
        <circle cx={dx} cy={dy} r={STROKE / 2 + 2} fill="white" filter="url(#glow)" />
      )}
    </svg>
  );
}

// ─── main component ───────────────────────────────────────────────────────────
// NOTE: This component is now fully controlled by Dashboard.jsx. There is no
// internal timer here anymore — `secs`/`running` are owned by the parent, and
// the same single setInterval in Dashboard.jsx drives both this full page AND
// the sidebar widget, so they can never drift out of sync with each other.
export default function PomodoroPage({
  tasks = [],
  pomSessions = 0,
  setPomSessions,
  secs, setSecs,
  running, setRunning,
  type, setType,
  settings, setSettings,
}) {
  const total  = settings[type];
  const accent = SESSIONS.find(s => s.key === type)?.color ?? "#7c3aed";
  const endTime = new Date(Date.now() + secs * 1000)
    .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  const done = !running && secs === 0;

  const handleStartPause = useCallback(() => {
    if (done) { setSecs(total); }
    setRunning(r => !r);
  }, [done, total, setSecs, setRunning]);

  const handleReset = useCallback(() => {
    setRunning(false);
    setSecs(total);
  }, [total, setRunning, setSecs]);

  // FIX: cycle now respects settings.interval instead of a hardcoded
  // "long break every 4th focus session" sequence. After `interval` focus
  // sessions, the next break is "long"; otherwise it's "short". Skipping a
  // break always goes back to "focus".
  const handleSkip = useCallback(() => {
    setRunning(false);
    if (type === "focus") {
      const isLongBreakDue = settings.interval > 0 && (pomSessions + 1) % settings.interval === 0;
      setType(isLongBreakDue ? "long" : "short");
    } else {
      setType("focus");
    }
  }, [type, pomSessions, settings.interval, setRunning, setType]);

  const adjustSetting = (key, delta) => {
    setSettings(prev => ({
      ...prev,
      [key]: key === "interval"
        ? Math.min(8,  Math.max(1, prev[key] + delta))
        : Math.min(60*60, Math.max(60, prev[key] + delta * 60)),
    }));
  };

  const completedDots = Math.min(pomSessions, 8);
  const pct = total > 0 ? Math.round((1 - secs / total) * 100) : 0;

  return (
    <div className="flex gap-6 px-8 pb-8 w-full min-h-0">

      {/* ── LEFT ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-4 min-w-0">

        {/* session tabs */}
        <div className="flex gap-2">
          {SESSIONS.map(s => (
            <button
              key={s.key}
              onClick={() => setType(s.key)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
              style={type === s.key
                ? { background: s.color, color: "#fff", boxShadow: `0 0 16px ${s.color}66` }
                : { background: "#160b38", color: "#888", border: "1px solid #2a1868" }}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>

        {/* timer card */}
        <div
          className="relative flex-1 rounded-3xl flex flex-col items-center justify-center gap-5 overflow-hidden"
          style={{ background: "#0a0520", border: "1px solid #2a1868", minHeight: 440 }}
        >
          {/* subtle star dots */}
          {Array.from({length:14}, (_,i) => (
            <span key={i} style={{
              position:"absolute", borderRadius:"50%",
              width: i%4===0?2:1, height: i%4===0?2:1,
              background:"#a78bfa", opacity: 0.2 + i*0.03,
              top:`${(i*13+7)%85}%`, left:`${(i*19+5)%98}%`,
              pointerEvents:"none",
            }}/>
          ))}

          {/* mountain silhouette */}
          <svg style={{position:"absolute",bottom:0,left:0,width:"100%",opacity:0.18,pointerEvents:"none"}}
               viewBox="0 0 800 160" preserveAspectRatio="none">
            <path d="M0 160 L120 60 L240 110 L380 10 L520 90 L660 45 L800 100 L800 160Z" fill="#3b1d8a"/>
            <path d="M0 160 L160 100 L320 130 L460 60 L600 120 L800 70 L800 160Z"        fill="#2a1868"/>
          </svg>

          {/* ring + time */}
          <div className="relative flex items-center justify-center">
            <Ring secs={secs} total={total} accent={accent} />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
              <span className="text-xs font-medium" style={{color: accent}}>
                {SESSIONS.find(s=>s.key===type)?.icon} {SESSIONS.find(s=>s.key===type)?.label}
              </span>
              <span className="font-black tabular-nums text-white" style={{fontSize:58, lineHeight:1.05, letterSpacing:"-2px"}}>
                {fmt(secs)}
              </span>
              <span className="text-xs px-3 py-1 rounded-full" style={{background:"#2a1868", color:"#a78bfa"}}>
                {done ? "✅ Done! Great work" : running ? "Stay in the zone…" : "Ready to focus"}
              </span>
            </div>
          </div>

          {/* progress pill */}
          <div className="flex items-center gap-3" style={{width:260}}>
            <div className="flex-1 h-1.5 rounded-full" style={{background:"#2a1868"}}>
              <div className="h-full rounded-full transition-all duration-1000"
                   style={{width:`${pct}%`, background: accent}} />
            </div>
            <span className="text-xs tabular-nums" style={{color:"#a78bfa", minWidth:30}}>{pct}%</span>
          </div>

          {/* task pill */}
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl"
               style={{background:"rgba(42,24,104,0.7)", border:"1px solid #3b1d8a", maxWidth:380}}>
            <span style={{color: accent}}>📌</span>
            <span className="text-sm text-white truncate">
              {tasks[0]?.title ?? "No task selected — add one from Tasks"}
            </span>
          </div>

          {/* controls */}
          <div className="flex items-center gap-4">
            {/* reset */}
            <button onClick={handleReset}
              className="flex flex-col items-center justify-center gap-0.5 rounded-2xl transition-all active:scale-95"
              style={{background:"#1e0f52", border:"1px solid #3b1d8a", width:52, height:52}}>
              <span className="text-base">↺</span>
              <span className="text-xs text-gray-500">Reset</span>
            </button>

            {/* start / pause */}
            <button onClick={handleStartPause}
              className="flex flex-col items-center justify-center gap-0.5 rounded-full transition-all active:scale-95"
              style={{background: accent, width:68, height:68,
                      boxShadow:`0 0 32px ${accent}99`, border:`2px solid ${accent}`}}>
              <span className="text-2xl leading-none">{running ? "⏸" : "▶"}</span>
              <span className="text-xs font-semibold text-white">{running ? "Pause" : done ? "Again" : "Start"}</span>
            </button>

            {/* skip */}
            <button onClick={handleSkip}
              className="flex flex-col items-center justify-center gap-0.5 rounded-2xl transition-all active:scale-95"
              style={{background:"#1e0f52", border:"1px solid #3b1d8a", width:52, height:52}}>
              <span className="text-base">⏭</span>
              <span className="text-xs text-gray-500">Skip</span>
            </button>
          </div>

          {/* quote */}
          <div className="flex flex-col items-center gap-0.5 px-10 text-center pb-10" style={{maxWidth:460}}>
            <p className="text-xs text-gray-400 italic">❝ {QUOTE.text}</p>
            <p className="text-xs" style={{color:"#7c3aed"}}>— {QUOTE.author}</p>
          </div>

          {/* bottom bar */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center gap-6 px-6 py-3"
               style={{background:"rgba(10,5,32,0.9)", borderTop:"1px solid #2a1868"}}>
            <Stat label="Focusing On"    value={tasks[0]?.title ?? "—"} dot={accent} />
            <Stat label="Session Length" value={`${Math.round(total/60)} min`} />
            <Stat label="Ends At"        value={running ? endTime : "—"} />
            <Stat label="Sessions Today" value={String(pomSessions)} highlight />
            <button className="ml-auto text-xs text-gray-500 hover:text-white transition px-3 py-1.5 rounded-lg"
                    style={{background:"#1e0f52"}}>⛶ Full Screen</button>
          </div>
        </div>
      </div>

      {/* ── RIGHT ────────────────────────────────────────────────────── */}
      <aside className="w-60 flex-shrink-0 flex flex-col gap-4">

        {/* session type picker (mirrors tab) */}
        <Card title="Session Type">
          <div className="grid grid-cols-3 gap-2">
            {SESSIONS.map(s => (
              <button key={s.key} onClick={() => setType(s.key)}
                className="flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-medium transition-all"
                style={type === s.key
                  ? {background: s.color, color:"#fff"}
                  : {background:"#0f0630", color:"#888"}}>
                <span className="text-base">{s.icon}</span>
                <span style={{fontSize:10}}>{s.label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* settings */}
        <Card title="Settings">
          {[
            {key:"focus",    label:"Focus",           unit:"min"},
            {key:"short",    label:"Short Break",     unit:"min"},
            {key:"long",     label:"Long Break",      unit:"min"},
            {key:"interval", label:"Long Break Every",unit:"sessions"},
          ].map(({key,label,unit}) => (
            <div key={key} className="flex items-center justify-between py-1.5"
                 style={{borderBottom:"1px solid #1e0f52"}}>
              <span className="text-xs text-gray-400">{label}</span>
              <div className="flex items-center gap-1.5">
                <AdjBtn onClick={() => adjustSetting(key,-1)}>−</AdjBtn>
                <span className="text-xs text-white font-semibold w-14 text-center">
                  {key==="interval" ? `${settings[key]} ${unit}` : `${settings[key]/60} ${unit}`}
                </span>
                <AdjBtn onClick={() => adjustSetting(key,+1)}>+</AdjBtn>
              </div>
            </div>
          ))}
        </Card>

        {/* today's sessions */}
        <Card title="Today's Sessions" right={<span className="text-xs text-gray-500">{completedDots}/8</span>}>
          <div className="grid grid-cols-8 gap-1">
            {Array.from({length:8}, (_,i) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                     style={i < completedDots
                       ? {background:"#7c3aed", color:"#fff"}
                       : {background:"#2a1868", border:"1px solid #3b1d8a", color:"transparent"}}>
                  {i < completedDots ? "✓" : ""}
                </div>
                <span className="text-gray-600" style={{fontSize:9}}>{i+1}</span>
              </div>
            ))}
          </div>
          {pomSessions > 0 && (
            <p className="text-center text-xs mt-1" style={{color:"#a78bfa"}}>
              {pomSessions} total session{pomSessions !== 1?"s":""} 🎉
            </p>
          )}
        </Card>

        {/* tip */}
        <Card title="Why Pomodoro?">
          <p className="text-xs text-gray-400 leading-relaxed">
            Work in focused bursts with short breaks to maximise deep work and prevent burnout.
            After {settings.interval} focus sessions, take a longer rest.
          </p>
        </Card>
      </aside>
    </div>
  );
}

// ─── tiny helpers ─────────────────────────────────────────────────────────────
function Card({ title, right, children }) {
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-3"
         style={{background:"#160b38", border:"1px solid #2a1868"}}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white">{title}</p>
        {right}
      </div>
      {children}
    </div>
  );
}

function AdjBtn({ onClick, children }) {
  return (
    <button onClick={onClick}
      className="w-6 h-6 rounded-md flex items-center justify-center text-gray-300 hover:text-white transition active:scale-90 text-sm font-bold"
      style={{background:"#2a1868"}}>
      {children}
    </button>
  );
}

function Stat({ label, value, dot, highlight }) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="text-xs text-gray-500 whitespace-nowrap">{label}</span>
      <span className="text-sm text-white flex items-center gap-1.5 truncate"
            style={highlight ? {color:"#a78bfa", fontWeight:700} : {}}>
        {dot && <span className="w-2 h-2 rounded-full flex-shrink-0 inline-block" style={{background:dot}}/>}
        {value}
      </span>
    </div>
  );
}