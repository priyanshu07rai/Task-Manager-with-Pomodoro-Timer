import React, { useState, useEffect, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import TaskPage from "./TaskPage";
import PomodoroPage from "./PomodoroPage";
import CalendarPage from "./Calendarpage";
import AnalyticsPage from "./AnalyticsPage";
import SettingsPage from "./Settings";

const fmt = (s) => {
  const abs = Math.abs(s);
  const sign = s < 0 ? "-" : "";
  return `${sign}${String(Math.floor(abs / 60)).padStart(1, "0")}:${String(abs % 60).padStart(2, "0")}`;
};

const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const todayIdx = (new Date().getDay() + 6) % 7;

const NAV = [
  { icon: "⊞", label: "Dashboard" },
  { icon: "✓", label: "Task" },
  { icon: "◷", label: "Pomodoro" },
  { icon: "📅", label: "Calendar" },
  { icon: "⌇", label: "Analytics" },
  { icon: "⚙", label: "Settings" },
];

const PIE_COLORS = ["#7c3aed", "#a78bfa", "#c4b5fd", "#5b21b6"];

// ── localStorage helpers ─────────────────────────────────────────────────────
const STORAGE_PREFIX = "focusflow_";
const loadFromStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};
const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch {}
};

const DEFAULT_POMODORO_SETTINGS = { focus: 25 * 60, short: 5 * 60, long: 15 * 60, interval: 4 };

function PomodoroRing({ seconds, total, size = 160, stroke = 10 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const progress = total > 0 ? Math.max(0, Math.min(1, 1 - seconds / total)) : 0;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#2a1868" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="#7c3aed" strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={`${circ * progress} ${circ}`}
        style={{ transition: "stroke-dasharray 1s linear" }}
      />
    </svg>
  );
}

function Sidebar({ activeNav, setActiveNav, secs, total, running, setRunning, setSecs }) {
  return (
    <aside className="flex flex-col w-56 flex-shrink-0 py-6 px-4 gap-1" style={{ background: "#0f0630", borderRight: "1px solid #1e1050" }}>
      <div className="flex items-center gap-2 px-2 mb-6">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg,#7c3aed,#4f1fb8)" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 13L6 7l3 4 2-3 2 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="4" r="1.5" fill="white" />
          </svg>
        </div>
        <span className="font-bold text-lg tracking-tight">FocusFlow</span>
      </div>

      {NAV.map(({ icon, label }) => (
        <button
          key={label}
          onClick={() => setActiveNav(label)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition text-left"
          style={activeNav === label ? { background: "#3b1d8a", color: "#fff" } : { color: "#888", background: "transparent" }}
        >
          <span className="text-base w-5 text-center">{icon}</span>
          {label}
        </button>
      ))}

      <div className="mt-auto rounded-2xl p-4 flex flex-col items-center gap-3" style={{ background: "#160b38", border: "1px solid #2a1868" }}>
        <p className="text-sm font-semibold text-white">Today's Focus</p>
        <div className="relative">
          <PomodoroRing seconds={secs} total={total} size={120} stroke={8} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold tabular-nums">{fmt(secs)}</span>
            <span className="text-xs text-purple-400">Time Left</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setRunning((r) => !r)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
            style={{ background: "#7c3aed" }}
          >
            {running ? "⏸" : "▶"}
          </button>
          <button
            onClick={() => { setRunning(false); setSecs(total); }}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
            style={{ background: "#2a1868" }}
          >
            ⏹
          </button>
        </div>
      </div>
    </aside>
  );
}

const PRIORITY_DOT = { High: "#ef4444", Medium: "#f97316", Low: "#22c55e" };

const DASH_COLUMNS = [
  { key: "To Do", label: "To Do", color: "#a78bfa" },
  { key: "In Progress", label: "In Progress", color: "#fb923c" },
  { key: "Completed", label: "Completed", color: "#4ade80" },
];

function DashboardTodoColumn({ colKey, label, color, cards, onAdd, onToggleDone }) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");

  const submit = () => {
    if (!title.trim()) return;
    onAdd(colKey, title.trim());
    setTitle("");
    setAdding(false);
  };

  return (
    <div className="flex-1 min-w-0 rounded-xl p-3 flex flex-col gap-2" style={{ background: "#160b38", border: "1px solid #2a1868" }}>
      <div className="flex items-center justify-center gap-1.5 mb-1">
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
        <h3 className="text-sm font-medium text-white">{label}</h3>
        <span className="text-xs text-gray-500">({cards.length})</span>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        {cards.length === 0 && !adding && <p className="text-center text-xs text-gray-600 py-3">No tasks yet</p>}
        {cards.slice(0, 4).map((t) => (
          <div key={t.id} className="rounded-lg px-3 py-2 flex items-center gap-2" style={{ background: "#1f1050" }}>
            {colKey !== "Completed" && (
              <button onClick={() => onToggleDone(t.id)} className="flex-shrink-0">
                <div className="w-3.5 h-3.5 rounded border border-gray-600 hover:border-purple-500 transition" />
              </button>
            )}
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: PRIORITY_DOT[t.priority] || PRIORITY_DOT.Medium }} />
            <span className={`text-sm truncate ${colKey === "Completed" ? "text-gray-500 line-through" : "text-gray-200"}`}>{t.title}</span>
          </div>
        ))}
        {cards.length > 4 && <p className="text-center text-xs text-gray-600">+{cards.length - 4} more</p>}
      </div>

      {adding ? (
        <div className="flex gap-1.5">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
              if (e.key === "Escape") { setAdding(false); setTitle(""); }
            }}
            placeholder="Task name…"
            className="flex-1 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
            style={{ background: "#2a1868" }}
          />
          <button onClick={submit} className="text-purple-400 font-bold px-1">✓</button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center justify-center gap-1.5 text-gray-500 hover:text-purple-300 transition text-xs py-1.5 rounded-lg"
          style={{ background: "#120a36" }}
        >
          <span className="text-base leading-none">⊕</span> Add Task
        </button>
      )}
    </div>
  );
}

function DashboardTodoList({ tasks, setTasks }) {
  const grouped = {
    "To Do": tasks.filter((t) => t.status === "To Do"),
    "In Progress": tasks.filter((t) => t.status === "In Progress"),
    "Completed": tasks.filter((t) => t.status === "Completed"),
  };

  const addCard = (status, title) =>
    setTasks((prev) => [
      ...prev,
      { id: Date.now(), title, desc: "", priority: "Medium", due: "", assignee: "", status, done: status === "Completed" },
    ]);

  const toggleDone = (id) =>
    setTasks((ts) =>
      ts.map((t) => (t.id === id ? { ...t, done: true, status: "Completed", prevStatus: t.status } : t))
    );

  return (
    <div className="rounded-2xl p-5 flex flex-col gap-4" style={{ background: "#0f0630", border: "1px solid #1e1050" }}>
      <h2 className="text-center text-lg font-semibold">To Do</h2>
      <div className="flex gap-4">
        {DASH_COLUMNS.map(({ key, label, color }) => (
          <DashboardTodoColumn
            key={key}
            colKey={key}
            label={label}
            color={color}
            cards={grouped[key]}
            onAdd={addCard}
            onToggleDone={toggleDone}
          />
        ))}
      </div>
    </div>
  );
}

function DashboardContent({ secs, total, pomSessions, tasks, setTasks, schedule, setSchedule, focusedSecs, sessionLog, streak }) {
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventDraft, setEventDraft] = useState({ title: "", time: "" });

  const addEvent = () => {
    if (!eventDraft.title.trim()) return;
    setSchedule((prev) => [...prev, { id: Date.now(), title: eventDraft.title.trim(), time: eventDraft.time.trim() }]);
    setEventDraft({ title: "", time: "" });
    setShowEventForm(false);
  };
  const removeEvent = (id) => setSchedule((prev) => prev.filter((e) => e.id !== id));

  const tasksToday = tasks.length;
  const completedToday = tasks.filter((t) => t.status === "Completed").length;

  const focusData = WEEK.map((day, i) => {
    const mins = sessionLog.filter((s) => s.dayIdx === i).reduce((sum, s) => sum + (s.mins || 0), 0);
    const todayExtra = i === todayIdx ? Math.floor((total - secs) / 60) : 0;
    const totalMins = mins + todayExtra;
    return { day, hours: Math.round((totalMins / 60) * 100) / 100 };
  });
  const hasFocusData = focusData.some((d) => d.hours > 0);

  const priorityCounts = tasks.reduce((acc, t) => {
    const p = t.priority || "Medium";
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(priorityCounts).map(([name, value], i) => ({ name, value, color: PIE_COLORS[i % PIE_COLORS.length] }));
  const pieTotal = pieData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-1 min-w-0 px-8 gap-6">
      <div className="flex-1 flex flex-col gap-5 min-w-0 pb-8">
        <div className="grid grid-cols-4 gap-4">
          {[
            { icon: "📋", label: "Tasks Today",  value: String(tasksToday),            sub: tasksToday ? `${completedToday} completed` : "No tasks yet" },
            { icon: "⌨️", label: "Focus time",   value: (() => { const m = Math.floor(focusedSecs / 60); return m >= 60 ? `${Math.floor(m/60)}h ${m%60}m` : `${m}m`; })(), sub: null },
            { icon: "🍅", label: "Pomodoros",    value: String(pomSessions),            sub: null },
            { icon: "🔥", label: "Streak",       value: String(streak),                 sub: streak > 0 ? `${streak} day${streak > 1 ? "s" : ""} in a row` : "Complete a session to start" },
          ].map(({ icon, label, value, sub }) => (
            <div key={label} className="rounded-2xl px-4 py-3 flex items-center gap-3" style={{ background: "#160b38", border: "1px solid #2a1868" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: "#3b1d8a" }}>{icon}</div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-lg font-bold leading-tight">{value}</p>
                {sub && <p className="text-xs truncate text-gray-500">{sub}</p>}
              </div>
            </div>
          ))}
        </div>

        <DashboardTodoList tasks={tasks} setTasks={setTasks} />

        <div className="rounded-2xl p-5 flex flex-col gap-4" style={{ background: "#0f0630", border: "1px solid #1e1050" }}>
          <h2 className="text-center text-lg font-semibold">Analytics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl p-3" style={{ background: "#160b38", border: "1px solid #2a1868" }}>
              <p className="text-xs font-medium text-white mb-1">Focus Time <span className="text-gray-500">(This Week)</span></p>
              {hasFocusData ? (
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={focusData} barSize={12}>
                    <XAxis dataKey="day" tick={{ fill: "#888", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ background: "#1b0d45", border: "none", borderRadius: 8, color: "#fff", fontSize: 11 }} formatter={(v) => [`${v}h`, "Focus"]} />
                    <Bar dataKey="hours" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[120px] flex items-center justify-center text-xs text-gray-600">Run a focus session to see data here</div>
              )}
            </div>
            <div className="rounded-xl p-3 flex flex-col" style={{ background: "#160b38", border: "1px solid #2a1868" }}>
              <p className="text-xs font-medium text-white mb-1">Tasks by Priority</p>
              {pieTotal > 0 ? (
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <PieChart width={90} height={90}>
                      <Pie data={pieData} cx={40} cy={40} innerRadius={25} outerRadius={40} dataKey="value" strokeWidth={0}>
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                    </PieChart>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-sm font-bold">{pieTotal}</span>
                      <span className="text-xs text-gray-400">tasks</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {pieData.map((d) => (
                      <div key={d.name} className="flex items-center gap-1.5 text-xs">
                        <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                        <span className="text-gray-300">{d.name}</span>
                        <span className="text-gray-500 ml-1">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-[90px] flex items-center justify-center text-xs text-gray-600">Add tasks to see a breakdown</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <aside className="w-64 flex-shrink-0 flex flex-col gap-5 py-0 pb-8">
        <div className="rounded-2xl p-5 flex flex-col items-center gap-3" style={{ background: "#160b38", border: "1px solid #2a1868" }}>
          <div className="flex items-center justify-between w-full">
            <span className="text-sm font-semibold">Pomodoro</span>
          </div>
          <div className="relative my-2">
            <PomodoroRing seconds={secs} total={total} size={148} stroke={10} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold tabular-nums">{fmt(secs)}</span>
              <span className="text-purple-400 text-sm">Focus Time</span>
            </div>
          </div>
        </div>
        <div className="rounded-2xl p-5 flex flex-col gap-3 flex-1" style={{ background: "#160b38", border: "1px solid #2a1868", minHeight: 280 }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm">Today's Schedule</h3>
              <p className="text-xs text-gray-500">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</p>
            </div>
            <button onClick={() => setShowEventForm((v) => !v)} className="text-purple-400 text-sm hover:text-purple-300 transition flex-shrink-0">
              {showEventForm ? "Cancel" : "+ Add"}
            </button>
          </div>
          {showEventForm && (
            <div className="flex flex-col gap-2">
              <input autoFocus placeholder="Event title" value={eventDraft.title}
                onChange={(e) => setEventDraft({ ...eventDraft, title: e.target.value })}
                className="rounded-lg px-3 py-1.5 text-sm text-white outline-none" style={{ background: "#2a1868" }} />
              <div className="flex gap-2">
                <input placeholder="Time, e.g. 2:00 PM" value={eventDraft.time}
                  onChange={(e) => setEventDraft({ ...eventDraft, time: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && addEvent()}
                  className="flex-1 rounded-lg px-3 py-1.5 text-sm text-white outline-none" style={{ background: "#2a1868" }} />
                <button onClick={addEvent} className="px-3 rounded-lg text-sm font-semibold text-white" style={{ background: "#7c3aed" }}>Add</button>
              </div>
            </div>
          )}
          {schedule.length === 0 && !showEventForm ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center py-6">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg" style={{ background: "#2a1868" }}>🗓️</div>
              <p className="text-sm text-gray-400 font-medium">Your day is wide open</p>
              <p className="text-xs text-gray-600 max-w-[180px]">Add a meeting, deadline, or reminder to plan out today.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {schedule.map((ev) => (
                <div key={ev.id} className="group flex items-center justify-between text-sm rounded-xl px-3 py-2.5" style={{ background: "#1f1050" }}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#a78bfa" }} />
                    <span className="text-gray-200 font-medium truncate">{ev.title}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {ev.time && <span className="text-gray-400 text-xs">{ev.time}</span>}
                    <button onClick={() => removeEvent(ev.id)} className="text-gray-600 hover:text-red-400 transition opacity-0 group-hover:opacity-100">✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

// ── Root ─────────────────────────────────────────────────────────────────────
export default function Dashboard({ userName }) {
  const [settingsState, setSettingsState] = useState(() => loadFromStorage("settingsState", {
    fullName: (userName || "User").trim(),
    username: "@" + (userName || "user").toLowerCase().replace(/\s+/g, ""),
    email: "",
    bio: "",
    avatar: null,
    theme: "Dark",
    accentColor: "purple",
    font: "Inter",
    lang: "English",
    timezone: "(GMT+05:30) Asia/Kolkata",
    dateFormat: "May 25, 2024",
    timeFormat: "12-Hour",
    weekStart: "Monday",
    focusTime: 25,
    shortBreak: 5,
    longBreak: 15,
    breakInterval: 4,
    autoStart: true,
    longBreakRemind: true,
    focusSound: true,
    dailyGoal: false,
  }));

  const displayName = (settingsState.fullName || userName || "User").trim();
  const greetingName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const [pomType, setPomType] = useState(() => loadFromStorage("pomType", "focus"));
  const [pomSettings, setPomSettings] = useState(() => loadFromStorage("pomSettings", DEFAULT_POMODORO_SETTINGS));
  const TOTAL = pomSettings[pomType];
  const [secs, setSecs] = useState(TOTAL);
  const [running, setRunning] = useState(false);
  const [pomSessions, setPomSessions] = useState(() => loadFromStorage("pomSessions", 0));
  const [activeNav, setActiveNav] = useState("Dashboard");
  const timerRef = useRef(null);

  const [tasks, setTasks] = useState(() => loadFromStorage("tasks", []));
  const [schedule, setSchedule] = useState(() => loadFromStorage("schedule", []));
  const [sessionLog, setSessionLog] = useState(() => loadFromStorage("sessionLog", []));
  const [searchQuery, setSearchQuery] = useState("");

  const prevPomType = useRef(pomType);
  useEffect(() => {
    if (prevPomType.current === pomType) return;
    prevPomType.current = pomType;
    setSecs(pomSettings[pomType]);
    setRunning(false);
  }, [pomType, pomSettings]);

  const prevPomSettings = useRef(pomSettings);
  useEffect(() => {
    if (!running && prevPomSettings.current[pomType] !== pomSettings[pomType]) {
      setSecs(pomSettings[pomType]);
    }
    prevPomSettings.current = pomSettings;
  }, [pomSettings]); // eslint-disable-line

  useEffect(() => { saveToStorage("tasks", tasks); }, [tasks]);
  useEffect(() => { saveToStorage("schedule", schedule); }, [schedule]);
  useEffect(() => { saveToStorage("sessionLog", sessionLog); }, [sessionLog]);
  useEffect(() => { saveToStorage("pomSessions", pomSessions); }, [pomSessions]);
  useEffect(() => { saveToStorage("pomSettings", pomSettings); }, [pomSettings]);
  useEffect(() => { saveToStorage("pomType", pomType); }, [pomType]);
  useEffect(() => { saveToStorage("settingsState", settingsState); }, [settingsState]);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setSecs((s) => {
          if (s <= 1) {
            clearInterval(timerRef.current);
            setRunning(false);
            if (pomType === "focus") {
              setPomSessions((n) => n + 1);
              const now = new Date();
              const dayIdx = (now.getDay() + 6) % 7;
              const h = now.getHours();
              const slotIdx = h < 4 ? 0 : h < 8 ? 1 : h < 12 ? 2 : h < 16 ? 3 : h < 20 ? 4 : 5;
              setSessionLog(prev => [...prev, { dayIdx, slotIdx, mins: Math.round(pomSettings.focus / 60) }]);
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [running, pomType, pomSettings]);

  const PAGE_TITLES = {
    Calendar:  { icon: "📅", title: "Calendar",  sub: "Plan your tasks, focus sessions and deadlines." },
    Task:      { icon: "✓",  title: "Tasks",     sub: "Manage and track all your tasks." },
    Pomodoro:  { icon: "◷",  title: "Pomodoro",  sub: "Stay focused. One pomodoro at a time." },
    Analytics: { icon: "📈", title: "Analytics", sub: "Track your productivity and improve every day." },
    Settings:  { icon: "⚙",  title: "Settings",  sub: "Customize your experience and preferences." },
  };

  const focusedSecs = Math.floor((TOTAL - secs)) + (pomSessions * pomSettings.focus);

  const streak = (() => {
    if (sessionLog.length === 0 && pomSessions === 0) return 0;
    const daysWithSession = new Set(sessionLog.map((s) => s.dayIdx));
    if (pomSessions > 0) daysWithSession.add(todayIdx);
    let count = 0;
    let idx = todayIdx;
    for (let i = 0; i < 7; i++) {
      if (daysWithSession.has(idx)) { count++; idx = (idx + 6) % 7; }
      else break;
    }
    return count;
  })();

  const handleSettingsUpdate = (patch) => {
    setSettingsState((prev) => ({ ...prev, ...patch }));
    const pomPatch = {};
    if (patch.focusTime     !== undefined) pomPatch.focus    = patch.focusTime    * 60;
    if (patch.shortBreak    !== undefined) pomPatch.short    = patch.shortBreak   * 60;
    if (patch.longBreak     !== undefined) pomPatch.long     = patch.longBreak    * 60;
    if (patch.breakInterval !== undefined) pomPatch.interval = patch.breakInterval;
    if (Object.keys(pomPatch).length > 0) setPomSettings((prev) => ({ ...prev, ...pomPatch }));
  };

  const renderPage = () => {
    switch (activeNav) {
      case "Task":
        return <TaskPage tasks={tasks} setTasks={setTasks} currentUser={greetingName} />;
      case "Pomodoro":
        return (
          <PomodoroPage
            secs={secs} setSecs={setSecs}
            running={running} setRunning={setRunning}
            type={pomType} setType={setPomType}
            settings={pomSettings} setSettings={setPomSettings}
            pomSessions={pomSessions} setPomSessions={setPomSessions}
            tasks={tasks}
          />
        );
      case "Calendar":
        return <CalendarPage />;
      case "Analytics":
        return (
          <AnalyticsPage
            tasks={tasks}
            pomSessions={pomSessions}
            focusedSecs={focusedSecs}
            sessionLog={sessionLog}
          />
        );
      case "Settings":
        return (
          <SettingsPage
            settings={settingsState}
            onUpdate={handleSettingsUpdate}
          />
        );
      case "Dashboard":
        return (
          <DashboardContent
            secs={secs} total={TOTAL} pomSessions={pomSessions}
            tasks={tasks} setTasks={setTasks}
            schedule={schedule} setSchedule={setSchedule}
            focusedSecs={focusedSecs} sessionLog={sessionLog} streak={streak}
          />
        );
      default:
        return (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 pb-20">
            <div className="text-6xl">🚧</div>
            <p className="text-white text-xl font-semibold">{activeNav}</p>
            <p className="text-gray-400 text-sm">This page is coming soon.</p>
          </div>
        );
    }
  };

  const pageInfo = PAGE_TITLES[activeNav];
  const avatarEl = settingsState.avatar
    ? <img src={settingsState.avatar} alt="avatar" className="w-full h-full object-cover rounded-full" />
    : <span className="text-sm font-bold">{greetingName[0]?.toUpperCase() || "?"}</span>;

  return (
    <div className="flex min-h-screen text-white" style={{ background: "#0a0520", fontFamily: "'Inter',sans-serif" }}>
      <Sidebar
        activeNav={activeNav} setActiveNav={setActiveNav}
        secs={secs} total={TOTAL} running={running} setRunning={setRunning} setSecs={setSecs}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-auto">
        <header className="flex items-center gap-4 px-8 py-5">
          {activeNav === "Dashboard" ? (
            <div className="flex-1">
              <h1 className="text-4xl font-light">
                {greeting} <span className="font-bold">{greetingName}!</span>
              </h1>
              <p className="text-gray-400 text-sm mt-0.5">Let's get started</p>
            </div>
          ) : pageInfo ? (
            <div className="flex-1 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: "#2a1868" }}>
                {pageInfo.icon}
              </div>
              <div>
                <h1 className="text-xl font-bold leading-tight">{pageInfo.title}</h1>
                <p className="text-gray-400 text-xs">{pageInfo.sub}</p>
              </div>
            </div>
          ) : (
            <div className="flex-1" />
          )}
          <div className="relative flex items-center gap-2 px-4 py-2 rounded-xl w-56" style={{ background: "#160b38", border: "1px solid #2a1868" }}>
            <span className="text-gray-500">🔍</span>
            <input
              placeholder="Search…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  const q = searchQuery.trim().toLowerCase();
                  const inTasks = tasks.some((t) => t.title?.toLowerCase().includes(q) || t.desc?.toLowerCase().includes(q));
                  const inSchedule = schedule.some((s) => s.title?.toLowerCase().includes(q));
                  if (inTasks) setActiveNav("Task");
                  else if (inSchedule) setActiveNav("Calendar");
                  setSearchQuery("");
                }
                if (e.key === "Escape") setSearchQuery("");
              }}
              className="bg-transparent outline-none text-sm text-gray-300 w-full placeholder-gray-600"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-gray-600 hover:text-gray-400 text-xs flex-shrink-0">✕</button>
            )}
          </div>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold overflow-hidden flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#7c3aed,#4f1fb8)" }}>
            {avatarEl}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{greetingName}</span>
            <span className="text-xs text-purple-400">{pomSessions} sessions today</span>
          </div>
        </header>

        {renderPage()}
      </main>

      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a1868; border-radius: 4px; }
      `}</style>
    </div>
  );
}