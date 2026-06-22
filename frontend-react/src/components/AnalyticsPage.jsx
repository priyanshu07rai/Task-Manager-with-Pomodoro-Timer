import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, CartesianGrid,
} from "recharts";

// ── helpers ───────────────────────────────────────────────────────────────────
const fmtHm = (secs) => {
  if (!secs) return "0m";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const WEEK_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const todayIdx = (new Date().getDay() + 6) % 7; // Mon=0

// ── FIX 1: Real streak from date-stamped session log ────────────────────────
// sessionLog entries must have a `date` field (YYYY-MM-DD string).
const getStreakFromLog = (sessionLog) => {
  if (!sessionLog.length) return 0;
  const uniqueDays = [...new Set(sessionLog.map((s) => s.date).filter(Boolean))].sort().reverse();
  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  for (const day of uniqueDays) {
    const d = new Date(day);
    const diff = Math.round((cursor - d) / 86400000);
    if (diff === 0 || diff === 1) {
      streak++;
      cursor = d;
    } else {
      break;
    }
  }
  return streak;
};

// FIX 2: Build per-day focus minutes from the actual session log,
// not from a single "total" that only applies to today.
const buildWeekFocusData = (sessionLog) => {
  const counts = {}; // dayIdx -> total minutes
  sessionLog.forEach(({ dayIdx, mins }) => {
    counts[dayIdx] = (counts[dayIdx] || 0) + (mins || 0);
  });
  return WEEK_LABELS.map((day, i) => {
    const today = new Date(Date.now() - (todayIdx - i) * 86400000);
    return {
      day: `${day} ${today.getDate()}`,
      hours: Math.round(((counts[i] || 0) / 60) * 100) / 100,
    };
  });
};

// ── Donut chart ───────────────────────────────────────────────────────────────
function Donut({ data, total, cx = 80, cy = 80, inner = 50, outer = 72 }) {
  const isEmpty = !total;
  const emptyData = [{ value: 1 }];
  return (
    <PieChart width={cx * 2} height={cy * 2}>
      <Pie
        data={isEmpty ? emptyData : data}
        cx={cx - 2} cy={cy - 2}
        innerRadius={inner} outerRadius={outer}
        dataKey="value" strokeWidth={0} startAngle={90} endAngle={-270}
      >
        {isEmpty
          ? <Cell fill="#1e1050" />
          : data.map((d, i) => <Cell key={i} fill={d.color} />)
        }
      </Pie>
    </PieChart>
  );
}

// ── Heatmap ───────────────────────────────────────────────────────────────────
const HEATMAP_ROWS = ["12 AM", "4 AM", "8 AM", "12 PM", "4 PM", "8 PM"];
const HEATMAP_COLS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function FocusHeatmap({ sessionLog }) {
  const grid = {};
  sessionLog.forEach(({ dayIdx, slotIdx, mins }) => {
    const key = `${slotIdx}-${dayIdx}`;
    grid[key] = (grid[key] || 0) + (mins || 0);
  });
  const max = Math.max(1, ...Object.values(grid));

  const cellColor = (mins) => {
    if (!mins) return "#1e1050";
    const t = mins / max;
    if (t < 0.25) return "#3b1d8a";
    if (t < 0.5)  return "#5b21b6";
    if (t < 0.75) return "#7c3aed";
    return "#a78bfa";
  };

  return (
    <div>
      <div className="grid mb-1" style={{ gridTemplateColumns: "40px repeat(7, 1fr)", gap: 3 }}>
        <div />
        {HEATMAP_COLS.map(d => (
          <div key={d} className="text-center text-xs text-gray-500">{d}</div>
        ))}
      </div>
      {HEATMAP_ROWS.map((row, ri) => (
        <div key={row} className="grid mb-1" style={{ gridTemplateColumns: "40px repeat(7, 1fr)", gap: 3 }}>
          <div className="text-xs text-gray-500 flex items-center">{row}</div>
          {HEATMAP_COLS.map((_, ci) => {
            const mins = grid[`${ri}-${ci}`] || 0;
            return (
              <div
                key={ci}
                title={mins ? `${mins}m` : "No activity"}
                className="rounded-sm"
                style={{ height: 18, background: cellColor(mins) }}
              />
            );
          })}
        </div>
      ))}
      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs text-gray-500">Less</span>
        {["#1e1050","#3b1d8a","#5b21b6","#7c3aed","#a78bfa"].map(c => (
          <div key={c} className="w-3 h-3 rounded-sm" style={{ background: c }} />
        ))}
        <span className="text-xs text-gray-500">More</span>
      </div>
    </div>
  );
}

// ── Custom tooltip ────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label, unit = "" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-xs" style={{ background: "#1b0d45", border: "1px solid #2a1868", color: "#fff" }}>
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || "#a78bfa" }}>{p.name}: {p.value}{unit}</p>
      ))}
    </div>
  );
};

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ icon, msg }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
      <span className="text-3xl">{icon}</span>
      <p className="text-xs text-gray-500 max-w-[160px]">{msg}</p>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, subColor = "#22c55e" }) {
  return (
    <div className="rounded-2xl px-5 py-4 flex items-center gap-4" style={{ background: "#160b38", border: "1px solid #2a1868" }}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: "#2a1868" }}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-2xl font-bold leading-tight">{value}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: subColor }}>{sub}</p>}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AnalyticsPage({
  tasks = [],
  pomSessions = 0,
  focusedSecs = 0,
  sessionLog = [],
  // FIX 1: Accept pre-computed streak from Dashboard (single source of truth)
  streak,
}) {
  // ── Derived stats ─────────────────────────────────────────────────────────
  // tasks is the single source of truth; Kanban status is just a field on each task.
  const allTasks = tasks;
  const doneTasks = tasks.filter((t) => t.status === "Completed").length;
  const inProgressTasks = tasks.filter((t) => t.status === "In Progress").length;
  const pendingTasks = tasks.filter((t) => t.status === "To Do").length;
  const totalTasks = allTasks.length;

  // FIX 3: Productivity score formula is explicit and named
  const TASK_WEIGHT = 0.6;   // 60% of score from task completion rate
  const SESSION_WEIGHT = 5;  // each session contributes up to 40 points (capped)
  const prodScore = totalTasks > 0
    ? Math.min(100, Math.round(
        (doneTasks / totalTasks) * 100 * TASK_WEIGHT +
        Math.min(40, pomSessions * SESSION_WEIGHT)
      ))
    : pomSessions > 0
      ? Math.min(100, pomSessions * SESSION_WEIGHT)
      : 0;

  // FIX 2: Weekly bar chart from real session log data (all days, not just today)
  const weekBarData = buildWeekFocusData(sessionLog);
  const hasFocusData = weekBarData.some((d) => d.hours > 0);

  // FIX 2: Productivity trend also from real per-day data
  // We derive a per-day score proxy: sessions completed that day * SESSION_WEIGHT
  const sessionsByDay = {};
  sessionLog.forEach(({ dayIdx }) => {
    sessionsByDay[dayIdx] = (sessionsByDay[dayIdx] || 0) + 1;
  });
  const trendData = WEEK_LABELS.map((day, i) => {
    const today = new Date(Date.now() - (todayIdx - i) * 86400000);
    const daySessions = sessionsByDay[i] || 0;
    return {
      day: `${day} ${today.getDate()}`,
      score: i === todayIdx ? prodScore : Math.min(100, daySessions * SESSION_WEIGHT),
    };
  });

  // FIX 4: Remove fabricated Focus Time Distribution.
  // Instead show a real breakdown: total sessions vs today's sessions.
  const todaySessions = sessionLog.filter(
    (s) => s.date === new Date().toISOString().slice(0, 10)
  ).length;
  const todayMins = sessionLog
    .filter((s) => s.date === new Date().toISOString().slice(0, 10))
    .reduce((acc, s) => acc + (s.mins || 0), 0);
  const totalMins = sessionLog.reduce((acc, s) => acc + (s.mins || 0), 0);

  // Category donut — based on task priorities as proxy
  const priorityMap = { High: "High", Medium: "Medium", Low: "Low" };
  const catColors = { High: "#ec4899", Medium: "#7c3aed", Low: "#3b82f6", Other: "#f59e0b" };
  const catCounts = {};
  allTasks.forEach(t => {
    const cat = priorityMap[t.priority] || "Other";
    catCounts[cat] = (catCounts[cat] || 0) + 1;
  });
  const catTotal = Object.values(catCounts).reduce((s, v) => s + v, 0);
  const catData = Object.entries(catCounts).map(([name, value]) => ({
    name, value,
    pct: catTotal > 0 ? Math.round((value / catTotal) * 100) : 0,
    color: catColors[name] || "#a78bfa",
  }));

  // FIX 1: Use real streak (passed from Dashboard or computed here as fallback)
  const currentStreak = streak !== undefined ? streak : getStreakFromLog(sessionLog);
  const streakDays = WEEK_LABELS.map((_, i) => {
    // A day is "active" if the sessionLog has any entry for it this week
    return (sessionsByDay[i] || 0) > 0;
  });

  // Focus insights
  const bestDayEntry = weekBarData.reduce((best, d) => d.hours > best.hours ? d : best, weekBarData[0]);
  const avgSession = pomSessions > 0 ? Math.round(totalMins / pomSessions) : 0;

  // Task completion progress
  const completionPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="flex flex-1 min-w-0 px-8 gap-6 pb-8">
      {/* ── Left: main content ── */}
      <div className="flex-1 min-w-0 flex flex-col gap-5">

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard icon="🕐" label="Total Focus Time"    value={fmtHm(totalMins * 60)}   sub={pomSessions > 0 ? `${pomSessions} sessions` : "Start a session"} />
          <StatCard icon="🎯" label="Sessions Completed"  value={String(pomSessions)}      sub={pomSessions > 0 ? "Keep it up!" : "No sessions yet"} subColor={pomSessions > 0 ? "#22c55e" : "#6b7280"} />
          <StatCard icon="✅" label="Tasks Completed"     value={String(doneTasks)}        sub={totalTasks > 0 ? `of ${totalTasks} total` : "Add some tasks"} subColor={doneTasks > 0 ? "#22c55e" : "#6b7280"} />
          <StatCard icon="🔥" label="Productivity Score"  value={prodScore > 0 ? `${prodScore}%` : "—"} sub={prodScore > 0 ? "Based on your activity" : "Complete tasks to score"} subColor={prodScore >= 70 ? "#22c55e" : "#f59e0b"} />
        </div>

        {/* Bar chart + Session breakdown */}
        <div className="grid grid-cols-2 gap-5">
          {/* FIX 2: Bar chart uses real per-day data from sessionLog */}
          <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: "#160b38", border: "1px solid #2a1868" }}>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-sm text-white">Focus Time This Week</p>
              <span className="text-xs text-gray-400 px-3 py-1 rounded-lg" style={{ background: "#2a1868" }}>Hours</span>
            </div>
            {hasFocusData ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={weekBarData} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1050" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: "#666", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#666", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}h`} />
                  <Tooltip content={<ChartTooltip unit="h" />} />
                  <Bar dataKey="hours" name="Focus" fill="#7c3aed" radius={[6, 6, 0, 0]}>
                    {weekBarData.map((_, i) => (
                      <Cell key={i} fill={i === todayIdx ? "#7c3aed" : "#3b1d8a"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon="📊" msg="Run a focus session to see your weekly focus chart." />
            )}
          </div>

          {/* FIX 4: Replace fake distribution with real session breakdown */}
          <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: "#160b38", border: "1px solid #2a1868" }}>
            <p className="font-semibold text-sm text-white">Session Summary</p>
            {pomSessions > 0 ? (
              <div className="flex flex-col gap-4 justify-center flex-1">
                {[
                  { label: "Total sessions", value: pomSessions, color: "#7c3aed" },
                  { label: "Sessions today", value: todaySessions, color: "#a78bfa" },
                  { label: "Total focus time", value: fmtHm(totalMins * 60), color: "#22c55e", isText: true },
                  { label: "Focus today", value: fmtHm(todayMins * 60), color: "#3b82f6", isText: true },
                  { label: "Avg session", value: avgSession > 0 ? `${avgSession}m` : "—", color: "#f59e0b", isText: true },
                ].map(({ label, value, color, isText }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{label}</span>
                    <span className="text-sm font-bold tabular-nums" style={{ color }}>
                      {isText ? value : value}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon="📋" msg="Complete a Pomodoro session to see your stats here." />
            )}
          </div>
        </div>

        {/* Trend + Category donut */}
        <div className="grid grid-cols-2 gap-5">
          {/* FIX 2: Trend chart uses real per-day session data */}
          <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: "#160b38", border: "1px solid #2a1868" }}>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-sm text-white">Productivity Trend</p>
              <span className="text-xs text-gray-400 px-3 py-1 rounded-lg" style={{ background: "#2a1868" }}>Score</span>
            </div>
            {prodScore > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1050" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: "#666", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#666", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                  <Tooltip content={<ChartTooltip unit="%" />} />
                  <Line type="monotone" dataKey="score" name="Score" stroke="#7c3aed" strokeWidth={2.5} dot={{ fill: "#7c3aed", r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon="📈" msg="Complete tasks and sessions to see your productivity trend." />
            )}
          </div>

          <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: "#160b38", border: "1px solid #2a1868" }}>
            <p className="font-semibold text-sm text-white">Tasks by Priority</p>
            {catData.length > 0 ? (
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <Donut data={catData} total={catTotal} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-lg font-bold">{totalTasks}</span>
                    <span className="text-xs text-gray-400">Tasks</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {catData.map(d => (
                    <div key={d.name} className="flex items-center gap-2 text-xs">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                      <span className="text-gray-300 w-16">{d.name}</span>
                      <span className="text-gray-400 font-medium">{d.value} ({d.pct}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState icon="🗂️" msg="Add tasks with different priorities to see a breakdown." />
            )}
          </div>
        </div>

        {/* Focus Insights */}
        <div className="rounded-2xl p-5" style={{ background: "#160b38", border: "1px solid #2a1868" }}>
          <p className="font-semibold text-sm text-white mb-4">Focus Insights</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: "#0f0630", border: "1px solid #1e1050" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#1a3a2a" }}>
                <span className="text-green-400 text-base">↗</span>
              </div>
              <div>
                <p className="text-xs text-gray-400">Most productive day</p>
                {hasFocusData
                  ? <>
                      <p className="text-sm font-bold text-white">{bestDayEntry.day.split(" ")[0]}</p>
                      <p className="text-xs text-gray-500">{bestDayEntry.hours}h focus</p>
                    </>
                  : <p className="text-xs text-gray-600 mt-1">No data yet</p>
                }
              </div>
            </div>
            <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: "#0f0630", border: "1px solid #1e1050" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#1a2a3a" }}>
                <span className="text-blue-400 text-base">⏱</span>
              </div>
              <div>
                <p className="text-xs text-gray-400">Avg session length</p>
                {pomSessions > 0
                  ? <>
                      <p className="text-sm font-bold text-white">{avgSession}m</p>
                      <p className="text-xs text-gray-500">across {pomSessions} sessions</p>
                    </>
                  : <p className="text-xs text-gray-600 mt-1">No sessions yet</p>
                }
              </div>
            </div>
            <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: "#0f0630", border: "1px solid #1e1050" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#2d1f00" }}>
                <span className="text-yellow-400 text-base">🎉</span>
              </div>
              <div>
                <p className="text-xs text-gray-400">Tasks completed</p>
                {doneTasks > 0
                  ? <>
                      <p className="text-sm font-bold text-white">{doneTasks} done</p>
                      <p className="text-xs text-gray-500">of {totalTasks} total</p>
                    </>
                  : <p className="text-xs text-gray-600 mt-1">Start completing tasks</p>
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right sidebar ── */}
      <aside className="w-64 flex-shrink-0 flex flex-col gap-5">

        {/* Heatmap */}
        <div className="rounded-2xl p-4" style={{ background: "#160b38", border: "1px solid #2a1868" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-white">Focus Heatmap</p>
            <span className="text-xs text-gray-400">This Week</span>
          </div>
          <FocusHeatmap sessionLog={sessionLog} />
        </div>

        {/* FIX 1: Streak from real date-stamped session log */}
        <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: "#160b38", border: "1px solid #2a1868" }}>
          <div className="flex items-center gap-2">
            <span className="text-lg">🔥</span>
            <p className="text-sm font-semibold text-white">Productivity Streak</p>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-white">{currentStreak}</span>
            <span className="text-lg text-gray-300 mb-1">Days</span>
          </div>
          <p className="text-xs text-gray-400">
            {currentStreak > 0 ? "Keep it up! You're on fire! 🔥" : "Complete a session to start your streak."}
          </p>
          <div className="flex gap-1.5 mt-1">
            {WEEK_LABELS.map((day, i) => (
              <div key={day} className="flex flex-col items-center gap-1">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs"
                  style={{
                    background: streakDays[i] ? "#7c3aed" : "#2a1868",
                    color: streakDays[i] ? "#fff" : "#555",
                    border: i === todayIdx ? "2px solid #a78bfa" : "2px solid transparent",
                  }}
                >
                  {streakDays[i] ? "✓" : ""}
                </div>
                <span className="text-xs text-gray-500">{day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Task completion */}
        <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: "#160b38", border: "1px solid #2a1868" }}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white">Task Completion</p>
            <span className="text-xs text-gray-400">All Time</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-white">{doneTasks}</span>
            <span className="text-gray-400 text-sm mb-0.5">/ {totalTasks} tasks</span>
            <span className="ml-auto text-sm font-bold" style={{ color: completionPct >= 70 ? "#22c55e" : "#a78bfa" }}>
              {completionPct}%
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "#2a1868" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${completionPct}%`, background: "linear-gradient(90deg,#7c3aed,#a78bfa)" }}
            />
          </div>
          <div className="flex flex-col gap-1.5 mt-1">
            {[
              { label: "Completed",   value: doneTasks,       color: "#22c55e" },
              { label: "In Progress", value: inProgressTasks, color: "#3b82f6" },
              { label: "Pending",     value: pendingTasks,    color: "#f59e0b" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                <span className="text-gray-300 flex-1">{label}</span>
                <span className="text-gray-400 font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}