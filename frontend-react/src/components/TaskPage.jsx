import React, { useState, useMemo } from "react";

const PRIORITY_STYLE = {
  High: { color: "#f97316", bg: "#431407" },
  Medium: { color: "#f59e0b", bg: "#422006" },
  Low: { color: "#4ade80", bg: "#052e16" },
};

const PRIORITY_DOT = { High: "#ef4444", Medium: "#f97316", Low: "#22c55e" };

const STATUS_STYLE = {
  "In Progress": { color: "#818cf8" },
  "To Do": { color: "#94a3b8" },
  "Completed": { color: "#4ade80" },
};

const STATUS_COLUMNS = [
  { key: "To Do", label: "To Do", color: "#a78bfa" },
  { key: "In Progress", label: "In Progress", color: "#fb923c" },
  { key: "Completed", label: "Completed", color: "#4ade80" },
];

const AVATAR_PALETTE = ["#7c3aed", "#db2777", "#0891b2", "#d97706", "#16a34a", "#e11d48"];
const avatarColor = (name) => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[h];
};

const fmtDate = (iso) => {
  if (!iso) return null;
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const emptyDraft = { title: "", desc: "", priority: "Medium", assignee: "", due: "" };

function Dropdown({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-xl px-3 py-2 text-sm text-white outline-none cursor-pointer"
      style={{ background: "#160b38", border: "1px solid #2a1868" }}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

// ── Single task card inside a column ────────────────────────────────────────
function TaskCard({ task, onMoveStatus, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const NEXT_STATUS = { "To Do": "In Progress", "In Progress": "Completed", "Completed": "To Do" };
  const PREV_STATUS = { "To Do": null, "In Progress": "To Do", "Completed": "In Progress" };

  return (
    <div
      className="rounded-xl p-3 flex flex-col gap-2 relative group"
      style={{ background: "#1f1050", border: "1px solid #2a1868" }}
    >
      {/* top row: priority dot + title + menu */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-0.5" style={{ background: PRIORITY_DOT[task.priority] }} />
          <span className={`text-sm font-medium leading-snug ${task.status === "Completed" ? "line-through text-gray-500" : "text-white"}`}>
            {task.title}
          </span>
        </div>
        <div className="relative flex-shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
            className="text-gray-600 hover:text-gray-300 transition text-lg leading-none opacity-0 group-hover:opacity-100"
          >
            ⋯
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-6 z-20 rounded-xl overflow-hidden shadow-xl"
              style={{ background: "#1b0d45", border: "1px solid #3b1d8a", minWidth: 140 }}
              onClick={(e) => e.stopPropagation()}
            >
              {NEXT_STATUS[task.status] && (
                <button
                  onClick={() => { onMoveStatus(task.id, NEXT_STATUS[task.status]); setMenuOpen(false); }}
                  className="block w-full text-left px-4 py-2 text-xs text-purple-300 hover:bg-purple-950 transition whitespace-nowrap"
                >
                  → Move to {NEXT_STATUS[task.status]}
                </button>
              )}
              {PREV_STATUS[task.status] && (
                <button
                  onClick={() => { onMoveStatus(task.id, PREV_STATUS[task.status]); setMenuOpen(false); }}
                  className="block w-full text-left px-4 py-2 text-xs text-gray-400 hover:bg-gray-900 transition whitespace-nowrap"
                >
                  ← Move to {PREV_STATUS[task.status]}
                </button>
              )}
              <button
                onClick={() => { onDelete(task.id); setMenuOpen(false); }}
                className="block w-full text-left px-4 py-2 text-xs text-red-300 hover:bg-red-950 transition whitespace-nowrap"
              >
                Delete task
              </button>
            </div>
          )}
        </div>
      </div>

      {/* description */}
      {task.desc && <p className="text-xs text-gray-500 truncate">{task.desc}</p>}

      {/* bottom row: priority badge + due + assignee */}
      <div className="flex items-center justify-between gap-2 mt-0.5">
        <span
          className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium"
          style={{ color: PRIORITY_STYLE[task.priority]?.color, background: PRIORITY_STYLE[task.priority]?.bg }}
        >
          {task.priority}
        </span>
        <div className="flex items-center gap-2">
          {task.due && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              📅 {fmtDate(task.due)}
            </span>
          )}
          {task.assignee && (
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              title={task.assignee}
              style={{ background: avatarColor(task.assignee) }}
            >
              {task.assignee[0].toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* move-to-next quick action (visible on hover) */}
      {task.status !== "Completed" && (
        <button
          onClick={() => onMoveStatus(task.id, NEXT_STATUS[task.status])}
          className="w-full mt-1 py-1 rounded-lg text-xs font-medium transition opacity-0 group-hover:opacity-100"
          style={{ background: "#2a1868", color: "#a78bfa" }}
        >
          {task.status === "To Do" ? "▶ Start" : "✓ Complete"}
        </button>
      )}
      {task.status === "Completed" && (
        <button
          onClick={() => onMoveStatus(task.id, "To Do")}
          className="w-full mt-1 py-1 rounded-lg text-xs font-medium transition opacity-0 group-hover:opacity-100"
          style={{ background: "#1a0d3a", color: "#94a3b8" }}
        >
          ↩ Reopen
        </button>
      )}
    </div>
  );
}

// ── Column ───────────────────────────────────────────────────────────────────
function KanbanColumn({ colKey, label, color, cards, onMoveStatus, onDelete, onAdd }) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");

  const submit = () => {
    if (!title.trim()) return;
    onAdd(colKey, title.trim());
    setTitle("");
    setAdding(false);
  };

  return (
    <div className="flex-1 min-w-0 flex flex-col gap-3" style={{ minWidth: 240 }}>
      {/* column header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: color }} />
          <span className="text-sm font-semibold text-white">{label}</span>
          <span
            className="px-1.5 py-0.5 rounded-md text-xs font-bold"
            style={{ background: "#2a1868", color: "#a78bfa" }}
          >
            {cards.length}
          </span>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="text-gray-600 hover:text-purple-400 transition text-lg leading-none"
          title="Add task"
        >
          ⊕
        </button>
      </div>

      {/* divider with color */}
      <div className="h-0.5 rounded-full" style={{ background: `linear-gradient(90deg, ${color}55, transparent)` }} />

      {/* cards */}
      <div className="flex flex-col gap-2 flex-1">
        {cards.length === 0 && !adding && (
          <div className="rounded-xl py-8 flex flex-col items-center gap-2 text-center"
            style={{ background: "#160b38", border: "1px dashed #2a1868" }}>
            <p className="text-gray-600 text-xs">No tasks here</p>
          </div>
        )}
        {cards.map((t) => (
          <TaskCard key={t.id} task={t} onMoveStatus={onMoveStatus} onDelete={onDelete} />
        ))}

        {/* inline add */}
        {adding && (
          <div className="rounded-xl p-3 flex flex-col gap-2" style={{ background: "#1f1050", border: "1px solid #3b1d8a" }}>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
                if (e.key === "Escape") { setAdding(false); setTitle(""); }
              }}
              placeholder="Task title…"
              className="rounded-lg px-3 py-2 text-sm text-white outline-none"
              style={{ background: "#2a1868" }}
            />
            <div className="flex gap-2">
              <button onClick={submit} className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: "#7c3aed" }}>Add</button>
              <button onClick={() => { setAdding(false); setTitle(""); }} className="flex-1 py-1.5 rounded-lg text-xs text-gray-400" style={{ background: "#2a1868" }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main TaskPage ─────────────────────────────────────────────────────────────
export default function TaskPage({ tasks, setTasks, currentUser }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState(emptyDraft);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [sortByDue, setSortByDue] = useState(false);

  const moveStatus = (id, newStatus) => {
    setTasks((ts) =>
      ts.map((t) =>
        t.id === id
          ? { ...t, status: newStatus, done: newStatus === "Completed", prevStatus: t.status }
          : t
      )
    );
  };

  const deleteTask = (id) => setTasks((ts) => ts.filter((t) => t.id !== id));

  const addTask = () => {
    if (!newTask.title.trim()) return;
    setTasks((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: newTask.title.trim(),
        desc: newTask.desc.trim(),
        priority: newTask.priority,
        status: "To Do",
        due: newTask.due,
        assignee: newTask.assignee.trim() || currentUser,
        done: false,
      },
    ]);
    setNewTask(emptyDraft);
    setShowAddModal(false);
  };

  const addQuickTask = (status, title) => {
    setTasks((prev) => [
      ...prev,
      {
        id: Date.now(),
        title,
        desc: "",
        priority: "Medium",
        status,
        due: "",
        assignee: currentUser,
        done: status === "Completed",
      },
    ]);
  };

  const filtered = useMemo(() => {
    let list = tasks.filter((t) => {
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (
          !t.title?.toLowerCase().includes(q) &&
          !t.desc?.toLowerCase().includes(q) &&
          !t.assignee?.toLowerCase().includes(q)
        ) return false;
      }
      if (priorityFilter && t.priority !== priorityFilter) return false;
      return true;
    });
    if (sortByDue) {
      list = [...list].sort((a, b) => {
        if (!a.due && !b.due) return 0;
        if (!a.due) return 1;
        if (!b.due) return -1;
        return new Date(a.due) - new Date(b.due);
      });
    }
    return list;
  }, [tasks, search, priorityFilter, sortByDue]);

  const grouped = {
    "To Do": filtered.filter((t) => t.status === "To Do"),
    "In Progress": filtered.filter((t) => t.status === "In Progress"),
    "Completed": filtered.filter((t) => t.status === "Completed"),
  };

  const total = tasks.length;
  const todo = tasks.filter((t) => t.status === "To Do").length;
  const inprog = tasks.filter((t) => t.status === "In Progress").length;
  const completed = tasks.filter((t) => t.status === "Completed").length;
  const dueSoon = tasks.filter((t) => {
    if (!t.due || t.status === "Completed") return false;
    const days = (new Date(t.due + "T00:00:00") - new Date()) / 86400000;
    return days <= 2;
  }).length;

  const hasFilters = search.trim() || priorityFilter || sortByDue;

  return (
    <div
      className="flex-1 flex flex-col min-h-0 px-8 py-6 overflow-auto"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#2a1868" }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 5h12M3 9h12M3 13h8" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="15" cy="13" r="2" stroke="#4ade80" strokeWidth="1.5" />
              <path d="M14 13l.7.7 1.3-1.4" stroke="#4ade80" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h1 className="text-white text-2xl font-bold">Task</h1>
            <p className="text-gray-400 text-xs">Organize, prioritize and get things done.</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition hover:opacity-90"
          style={{ background: "linear-gradient(135deg,#7c3aed,#4f1fb8)" }}
        >
          + Add Task
        </button>
      </div>

      {/* Stat pills */}
      <div className="flex gap-3 mb-5 flex-wrap">
        {[
          { icon: "📋", label: "Total", value: String(total).padStart(2, "0"), iconColor: "#a78bfa" },
          { icon: "○", label: "To Do", value: String(todo).padStart(2, "0"), iconColor: "#94a3b8" },
          { icon: "⏳", label: "In Progress", value: String(inprog).padStart(2, "0"), iconColor: "#f59e0b" },
          { icon: "●", label: "Due Soon", value: String(dueSoon).padStart(2, "0"), iconColor: "#f87171" },
          { icon: "✓", label: "Completed", value: String(completed).padStart(2, "0"), iconColor: "#4ade80" },
        ].map(({ icon, label, value, iconColor }) => (
          <div
            key={label}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{ background: "#160b38", border: "1px solid #2a1868" }}
          >
            <span style={{ color: iconColor }}>{icon}</span>
            <div>
              <p className="text-gray-400 text-xs">{label}</p>
              <p className="text-white font-bold text-base leading-tight">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search / filter toolbar */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl flex-1 min-w-[200px]"
          style={{ background: "#160b38", border: "1px solid #2a1868" }}
        >
          <span className="text-gray-500">🔍</span>
          <input
            placeholder="Search tasks…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm text-gray-200 w-full placeholder-gray-600"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-gray-600 hover:text-gray-400 text-xs flex-shrink-0">✕</button>
          )}
        </div>
        <Dropdown value={priorityFilter} onChange={setPriorityFilter} options={["High", "Medium", "Low"]} placeholder="All Priorities" />
        <button
          onClick={() => setSortByDue((v) => !v)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition"
          style={
            sortByDue
              ? { background: "#3b1d8a", color: "#fff", border: "1px solid #5b2fc4" }
              : { background: "#160b38", color: "#a3a3a3", border: "1px solid #2a1868" }
          }
        >
          📅 Sort by due
        </button>
        {hasFilters && (
          <button onClick={() => { setSearch(""); setPriorityFilter(""); setSortByDue(false); }} className="text-xs text-gray-500 hover:text-gray-300 transition px-2">
            Clear
          </button>
        )}
      </div>

      {/* Kanban board */}
      {tasks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20 text-center rounded-2xl"
          style={{ background: "#160b38", border: "1px solid #2a1868" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ background: "#2a1868" }}>📋</div>
          <p className="text-white font-semibold text-base">No tasks yet</p>
          <p className="text-gray-500 text-sm max-w-xs">Add your first task to start tracking what needs to get done.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#7c3aed,#4f1fb8)" }}
          >
            + Add Task
          </button>
        </div>
      ) : (
        <div className="flex gap-5 flex-1 overflow-x-auto pb-2">
          {STATUS_COLUMNS.map(({ key, label, color }) => (
            <KanbanColumn
              key={key}
              colKey={key}
              label={label}
              color={color}
              cards={grouped[key]}
              onMoveStatus={moveStatus}
              onDelete={deleteTask}
              onAdd={addQuickTask}
            />
          ))}
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false); }}
        >
          <div className="rounded-2xl p-6 w-96 flex flex-col gap-4" style={{ background: "#1b0d45", border: "1px solid #3b1d8a" }}>
            <h2 className="text-white font-bold text-lg">Add New Task</h2>
            <input
              placeholder="Task title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="rounded-xl px-4 py-2.5 text-sm text-white outline-none"
              style={{ background: "#2a1868" }}
            />
            <input
              placeholder="Description (optional)"
              value={newTask.desc}
              onChange={(e) => setNewTask({ ...newTask, desc: e.target.value })}
              className="rounded-xl px-4 py-2.5 text-sm text-white outline-none"
              style={{ background: "#2a1868" }}
            />
            <div className="flex gap-3">
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                className="flex-1 rounded-xl px-3 py-2.5 text-sm text-white outline-none"
                style={{ background: "#2a1868" }}
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
              <input
                placeholder="Assignee"
                value={newTask.assignee}
                onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                className="flex-1 rounded-xl px-3 py-2.5 text-sm text-white outline-none placeholder-gray-500"
                style={{ background: "#2a1868" }}
              />
            </div>
            <input
              type="date"
              value={newTask.due}
              onChange={(e) => setNewTask({ ...newTask, due: e.target.value })}
              className="rounded-xl px-4 py-2.5 text-sm text-white outline-none"
              style={{ background: "#2a1868", colorScheme: "dark" }}
            />
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => { setShowAddModal(false); setNewTask(emptyDraft); }}
                className="flex-1 py-2.5 rounded-xl text-gray-400 text-sm hover:text-white transition"
                style={{ background: "#2a1868" }}
              >
                Cancel
              </button>
              <button
                onClick={addTask}
                disabled={!newTask.title.trim()}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#7c3aed,#4f1fb8)" }}
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}