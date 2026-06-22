import { useState } from "react";

// ── helpers ───────────────────────────────────────────────────────────────────
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];
const DAYS_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

const EVENT_COLORS = {
  focus:    { bg: "#3b1d8a", text: "#c4b5fd", dot: "#7c3aed" },
  standup:  { bg: "#1a3a5c", text: "#93c5fd", dot: "#3b82f6" },
  design:   { bg: "#3d1f00", text: "#fcd34d", dot: "#f59e0b" },
  deadline: { bg: "#1f3b2a", text: "#6ee7b7", dot: "#10b981" },
  call:     { bg: "#2d1f5c", text: "#c4b5fd", dot: "#8b5cf6" },
  planning: { bg: "#1a3a5c", text: "#93c5fd", dot: "#3b82f6" },
  review:   { bg: "#2a1868", text: "#c4b5fd", dot: "#7c3aed" },
  docs:     { bg: "#3d1f00", text: "#fcd34d", dot: "#f59e0b" },
  research: { bg: "#2d1f5c", text: "#c4b5fd", dot: "#8b5cf6" },
  pomodoro: { bg: "#3b1d8a", text: "#c4b5fd", dot: "#7c3aed" },
};

// No pre-filled events — clean slate for new users

// ── Mini month picker (right sidebar) ────────────────────────────────────────
function MiniCalendar({ year, month, selectedDay, onSelectDay, onPrev, onNext, events = {} }) {
  const firstDay = getFirstDayOfMonth(year, month);
  const daysInMonth = getDaysInMonth(year, month);
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="rounded-2xl p-4" style={{ background: "#160b38", border: "1px solid #2a1868" }}>
      <div className="flex items-center justify-between mb-3">
        <button onClick={onPrev} className="text-gray-400 hover:text-white transition w-6 h-6 flex items-center justify-center rounded-lg hover:bg-purple-900/40">‹</button>
        <span className="text-sm font-semibold text-white">{MONTHS[month]} {year}</span>
        <button onClick={onNext} className="text-gray-400 hover:text-white transition w-6 h-6 flex items-center justify-center rounded-lg hover:bg-purple-900/40">›</button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {["S","M","T","W","T","F","S"].map((d,i) => (
          <div key={i} className="text-center text-xs text-gray-500 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`} />;
          const isToday = isCurrentMonth && today.getDate() === d;
          const isSelected = selectedDay === d;
          const key = `${year}-${month+1}-${d}`;
          const hasEvent = !!events[key];
          return (
            <button
              key={d}
              onClick={() => onSelectDay(d)}
              className="relative flex items-center justify-center h-7 w-7 mx-auto rounded-full text-xs transition"
              style={
                isSelected
                  ? { background: "#7c3aed", color: "#fff", fontWeight: 700 }
                  : isToday
                  ? { background: "#3b1d8a", color: "#fff", fontWeight: 700 }
                  : { color: "#ccc" }
              }
            >
              {d}
              {hasEvent && !isSelected && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Upcoming events sidebar list ──────────────────────────────────────────────
function UpcomingEvents({ events, year, month }) {
  // flatten all events and sort
  const flat = [];
  Object.entries(events).forEach(([key, evs]) => {
    const [y, m, d] = key.split("-").map(Number);
    evs.forEach(ev => flat.push({ ...ev, year: y, month: m, day: d, key }));
  });
  flat.sort((a, b) => new Date(a.year, a.month-1, a.day) - new Date(b.year, b.month-1, b.day));
  // only show future/current month
  const upcoming = flat.filter(e => e.month === month+1 && e.year === year);

  const dayLabel = (d, m, y) => {
    const today = new Date();
    const ev = new Date(y, m-1, d);
    const diff = Math.round((ev - new Date(today.getFullYear(), today.getMonth(), today.getDate())) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    return `${MONTHS[m-1].slice(0,3)} ${d}`;
  };

  return (
    <div className="rounded-2xl p-4 flex flex-col gap-3 flex-1 min-h-0" style={{ background: "#160b38", border: "1px solid #2a1868" }}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-white">Upcoming Events</span>
        {upcoming.length > 0 && (
          <span className="text-xs text-gray-500">{upcoming.length} this month</span>
        )}
      </div>
      <div className="flex flex-col gap-3 overflow-y-auto">
        {upcoming.length === 0 && (
          <p className="text-xs text-gray-500 text-center py-4">No upcoming events</p>
        )}
        {upcoming.map(ev => {
          const col = EVENT_COLORS[ev.type] || EVENT_COLORS.focus;
          return (
            <div key={`${ev.key}-${ev.id}`} className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: col.dot }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">{ev.title}</p>
                <p className="text-xs text-gray-400">{dayLabel(ev.day, ev.month, ev.year)}, {ev.time}</p>
              </div>
              {ev.recurring && (
                <span className="text-gray-500 text-xs flex-shrink-0">↻</span>
              )}
            </div>
          );
        })}
      </div>
      <button
        className="mt-1 flex items-center justify-center gap-1.5 text-sm text-purple-400 hover:text-purple-300 transition py-2 rounded-xl"
        style={{ border: "1px dashed #3b1d8a" }}
      >
        <span className="text-base leading-none">+</span> Add Event
      </button>
    </div>
  );
}

// ── Add Event Modal ───────────────────────────────────────────────────────────
function AddEventModal({ date, onAdd, onClose }) {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState("focus");

  const submit = () => {
    if (!title.trim()) return;
    onAdd({ title: title.trim(), time: time.trim() || "All day", type, recurring: false });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
      <div className="rounded-2xl p-6 w-80 flex flex-col gap-4" style={{ background: "#160b38", border: "1px solid #2a1868" }}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white">Add Event — {MONTHS[date.month]} {date.day}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition">✕</button>
        </div>
        <input
          autoFocus
          placeholder="Event title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="rounded-xl px-4 py-2.5 text-sm text-white outline-none"
          style={{ background: "#2a1868" }}
        />
        <input
          placeholder="Time (e.g. 2:00 PM)"
          value={time}
          onChange={e => setTime(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          className="rounded-xl px-4 py-2.5 text-sm text-white outline-none"
          style={{ background: "#2a1868" }}
        />
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(EVENT_COLORS).map(([t, col]) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className="rounded-lg px-2 py-1.5 text-xs capitalize flex items-center gap-1.5 transition"
              style={{
                background: type === t ? col.bg : "#2a1868",
                color: type === t ? col.text : "#888",
                border: type === t ? `1px solid ${col.dot}` : "1px solid transparent"
              }}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: col.dot }} />
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl py-2 text-sm text-gray-400 transition"
            style={{ background: "#2a1868" }}
          >Cancel</button>
          <button
            onClick={submit}
            className="flex-1 rounded-xl py-2 text-sm font-semibold text-white transition"
            style={{ background: "#7c3aed" }}
          >Add Event</button>
        </div>
      </div>
    </div>
  );
}

// ── Calendar Page ─────────────────────────────────────────────────────────────
export default function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [viewMode, setViewMode] = useState("Month");
  const [selectedDay, setSelectedDay] = useState(now.getDate());
  const [events, setEvents] = useState({});
  const [modal, setModal] = useState(null); // { day, month, year }

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };
  const goToday = () => {
    setYear(now.getFullYear());
    setMonth(now.getMonth());
    setSelectedDay(now.getDate());
  };

  const addEvent = (ev) => {
    if (!modal) return;
    const key = `${modal.year}-${modal.month+1}-${modal.day}`;
    setEvents(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), { ...ev, id: Date.now() }]
    }));
  };

  // Build calendar grid
  const firstDay = getFirstDayOfMonth(year, month);
  const daysInMonth = getDaysInMonth(year, month);
  const prevDays = getDaysInMonth(year, month === 0 ? 11 : month - 1);

  const cells = [];
  // prev month overflow
  for (let i = 0; i < firstDay; i++) {
    cells.push({ day: prevDays - firstDay + 1 + i, current: false, overflow: "prev" });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, current: true });
  }
  // next month overflow
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, current: false, overflow: "next" });
  }

  const todayDate = new Date();
  const isToday = (d) =>
    d === todayDate.getDate() &&
    month === todayDate.getMonth() &&
    year === todayDate.getFullYear();

  return (
    <div className="flex flex-1 min-w-0 px-8 gap-6 pb-8">
      {/* ── Main calendar ── */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <button
            onClick={goToday}
            className="px-4 py-2 rounded-xl text-sm font-medium transition"
            style={{ background: "#160b38", border: "1px solid #2a1868", color: "#ccc" }}
          >Today</button>
          <button onClick={prevMonth} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition" style={{ background: "#160b38", border: "1px solid #2a1868" }}>‹</button>
          <button onClick={nextMonth} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition" style={{ background: "#160b38", border: "1px solid #2a1868" }}>›</button>

          <div className="relative">
            <button
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition"
              style={{ background: "#160b38", border: "1px solid #2a1868" }}
            >
              {MONTHS[month]} {year}
              <span className="text-gray-500 text-xs">▾</span>
            </button>
          </div>

          <div className="ml-auto flex items-center rounded-xl overflow-hidden" style={{ border: "1px solid #2a1868" }}>
            {["Month","Week","Day"].map(v => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className="px-4 py-2 text-sm font-medium transition"
                style={viewMode === v
                  ? { background: "#7c3aed", color: "#fff" }
                  : { background: "#160b38", color: "#888" }}
              >{v}</button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 rounded-2xl overflow-hidden" style={{ background: "#0f0630", border: "1px solid #1e1050" }}>
          {/* Day headers */}
          <div className="grid grid-cols-7" style={{ borderBottom: "1px solid #1e1050" }}>
            {DAYS_SHORT.map(d => (
              <div key={d} className="py-3 text-center text-sm font-medium text-gray-400">{d}</div>
            ))}
          </div>

          {/* Cells */}
          <div className="grid grid-cols-7" style={{ gridTemplateRows: "repeat(6, minmax(100px, 1fr))" }}>
            {cells.map((cell, i) => {
              const key = `${year}-${month+1}-${cell.day}`;
              const dayEvents = cell.current ? (events[key] || []) : [];
              const isSelected = cell.current && selectedDay === cell.day;
              const isTodayCell = cell.current && isToday(cell.day);

              return (
                <div
                  key={i}
                  onClick={() => {
                    if (cell.current) setSelectedDay(cell.day);
                  }}
                  onDoubleClick={() => {
                    if (cell.current) setModal({ day: cell.day, month, year });
                  }}
                  className="relative flex flex-col p-2 cursor-pointer transition group"
                  style={{
                    borderRight: (i % 7 !== 6) ? "1px solid #1e1050" : "none",
                    borderBottom: i < 35 ? "1px solid #1e1050" : "none",
                    background: isSelected ? "#1a0d45" : "transparent",
                  }}
                >
                  {/* Day number */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium transition"
                      style={
                        isTodayCell
                          ? { background: "#7c3aed", color: "#fff", fontWeight: 700 }
                          : cell.current
                          ? { color: "#e2e8f0" }
                          : { color: "#3d3d5c" }
                      }
                    >
                      {cell.day}
                    </span>
                    {cell.current && (
                      <button
                        onClick={e => { e.stopPropagation(); setModal({ day: cell.day, month, year }); }}
                        className="opacity-0 group-hover:opacity-100 text-purple-400 text-lg leading-none transition"
                      >+</button>
                    )}
                  </div>

                  {/* Events */}
                  <div className="flex flex-col gap-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map(ev => {
                      const col = EVENT_COLORS[ev.type] || EVENT_COLORS.focus;
                      return (
                        <div
                          key={ev.id}
                          className="flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs truncate"
                          style={{ background: col.bg, color: col.text }}
                        >
                          {ev.type === "docs" && (
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: col.dot }} />
                          )}
                          <span className="truncate font-medium">{ev.title}</span>
                          <span className="ml-auto flex-shrink-0 text-gray-400"
                            style={{ fontSize: 10 }}
                          >{ev.time}</span>
                          {ev.recurring && <span className="flex-shrink-0 text-gray-400" style={{ fontSize: 10 }}>↻</span>}
                        </div>
                      );
                    })}
                    {dayEvents.length > 2 && (
                      <span className="text-xs text-purple-400 px-2">+{dayEvents.length - 2} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Right sidebar ── */}
      <aside className="w-60 flex-shrink-0 flex flex-col gap-4">
        <MiniCalendar
          year={year} month={month}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
          onPrev={prevMonth}
          onNext={nextMonth}
          events={events}
        />
        <UpcomingEvents events={events} year={year} month={month} />
      </aside>

      {/* ── Add Event Modal ── */}
      {modal && (
        <AddEventModal
          date={modal}
          onAdd={addEvent}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}