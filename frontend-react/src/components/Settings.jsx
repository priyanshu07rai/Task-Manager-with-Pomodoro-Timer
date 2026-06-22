import { useState, useRef } from "react";
const THEME_PALETTES = {
  Dark: {
    page: "#070318", card: "#0f0630", input: "#1a0d42",
    border: "#1e1050", border2: "#2a1868",
    text: "#ffffff", textDim: "#9ca3af", textMute: "#6b7280",
  },
  Purple: {
    page: "#120a33", card: "#1d1149", input: "#2a1868",
    border: "#3b1d8a", border2: "#4f1fb8",
    text: "#ffffff", textDim: "#c4b5fd", textMute: "#9f8fd6",
  },
  Light: {
    page: "#f5f3ff", card: "#ffffff", input: "#f1eefc",
    border: "#e5e0fa", border2: "#d8d0f7",
    text: "#1e1b3a", textDim: "#5b5577", textMute: "#8b85a8",
  },
};

const ACCENT_COLORS = [
  { id: "purple", hex: "#7c3aed" },
  { id: "blue",   hex: "#3b82f6" },
  { id: "green",  hex: "#10b981" },
  { id: "amber",  hex: "#f59e0b" },
  { id: "rose",   hex: "#f43f5e" },
];

const LANGS      = ["English", "Hindi", "Spanish", "French", "German", "Japanese"];
const TIMEZONES  = [
  "(GMT+05:30) Asia/Kolkata",
  "(GMT+00:00) UTC",
  "(GMT-05:00) America/New_York",
  "(GMT-08:00) America/Los_Angeles",
  "(GMT+01:00) Europe/London",
  "(GMT+08:00) Asia/Singapore",
];
const DATE_FORMATS = ["May 25, 2024", "25/05/2024", "2024-05-25", "05-25-2024"];
const WEEK_STARTS  = ["Monday", "Sunday", "Saturday"];

function Toggle({ checked, onChange, accent }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200"
      style={{ background: checked ? accent : "#2a1868" }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200"
        style={{ transform: checked ? "translateX(20px)" : "translateX(0)" }}
      />
    </button>
  );
}

function Select({ value, onChange, options, p }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none w-full rounded-xl px-4 py-2.5 text-sm outline-none pr-9"
        style={{ background: p.input, border: `1px solid ${p.border2}`, color: p.text }}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: p.textMute }}>▾</span>
    </div>
  );
}

function SectionHeader({ title, sub, icon, p }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      {icon && (
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0" style={{ background: p.border2 }}>
          {icon}
        </div>
      )}
      <div>
        <h2 className="text-base font-semibold" style={{ color: p.text }}>{title}</h2>
        {sub && <p className="text-xs mt-0.5" style={{ color: p.textMute }}>{sub}</p>}
      </div>
    </div>
  );
}

function Card({ children, className = "", p }) {
  return (
    <div className={`rounded-2xl p-6 ${className}`} style={{ background: p.card, border: `1px solid ${p.border}` }}>
      {children}
    </div>
  );
}

// ── Settings receives state from Dashboard and writes back via onUpdate.
//    Dashboard owns persistence (localStorage) — this file stays a pure controlled component. ──
export default function SettingsPage({ settings, onUpdate }) {
  const fileRef = useRef(null);
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const p = THEME_PALETTES[settings.theme] || THEME_PALETTES.Dark;
  const accentHex = (ACCENT_COLORS.find(c => c.id === settings.accentColor) || ACCENT_COLORS[0]).hex;

  const set = (key) => (val) => onUpdate({ [key]: val });

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onUpdate({ avatar: ev.target.result });
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div
      className="flex flex-1 min-w-0 px-8 gap-6 pb-8"
      style={{ background: p.page, fontFamily: `"${settings.font}", system-ui, sans-serif` }}
    >
      {/* ── Left column ── */}
      <div className="flex-1 min-w-0 flex flex-col gap-5">

        {/* Profile Information */}
        <Card p={p}>
          <SectionHeader title="Profile Information" p={p} />
          <div className="flex gap-6">
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden relative group cursor-pointer"
                style={{ background: `linear-gradient(135deg, ${accentHex}, ${p.border2})` }}
                onClick={() => fileRef.current?.click()}
              >
                {settings.avatar
                  ? <img src={settings.avatar} alt="avatar" className="w-full h-full object-cover" />
                  : <span className="text-3xl font-bold text-white">{settings.fullName?.[0]?.toUpperCase() || "U"}</span>
                }
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-full">
                  <span className="text-white text-xl">📷</span>
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              <button onClick={() => fileRef.current?.click()} className="text-xs hover:opacity-80 transition" style={{ color: accentHex }}>
                Change Photo
              </button>
              <p className="text-xs text-center" style={{ color: p.textMute }}>JPG, PNG or GIF. Max 2MB.</p>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs" style={{ color: p.textDim }}>Full Name</label>
                <input
                  value={settings.fullName}
                  onChange={e => onUpdate({ fullName: e.target.value })}
                  className="rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={{ background: p.input, border: `1px solid ${p.border2}`, color: p.text }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs" style={{ color: p.textDim }}>Username</label>
                <input
                  value={settings.username}
                  onChange={e => onUpdate({ username: e.target.value })}
                  className="rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={{ background: p.input, border: `1px solid ${p.border2}`, color: p.text }}
                />
              </div>
              <div className="flex flex-col gap-1.5 col-span-2">
                <label className="text-xs" style={{ color: p.textDim }}>Email Address</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={e => onUpdate({ email: e.target.value })}
                  placeholder="you@example.com"
                  className="rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={{ background: p.input, border: `1px solid ${p.border2}`, color: p.text }}
                />
              </div>
              <div className="flex flex-col gap-1.5 col-span-2">
                <label className="text-xs" style={{ color: p.textDim }}>Bio</label>
                <textarea
                  value={settings.bio}
                  onChange={e => onUpdate({ bio: e.target.value.slice(0, 160) })}
                  placeholder="Tell your team a little about yourself…"
                  rows={3}
                  className="rounded-xl px-4 py-2.5 text-sm outline-none resize-none"
                  style={{ background: p.input, border: `1px solid ${p.border2}`, color: p.text }}
                />
                <p className="text-xs text-right" style={{ color: p.textMute }}>{settings.bio.length}/160</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition"
              style={{ background: saved ? "#22c55e" : accentHex }}
            >
              {saved ? "✓ Saved!" : "Save Changes"}
            </button>
          </div>
        </Card>

        {/* Preferences */}
        <Card p={p}>
          <SectionHeader title="Preferences" p={p} />
          <div className="flex flex-col gap-4">
            {[
              { icon: "🌐", label: "Language",       sub: "Choose your preferred language",      key: "lang",       options: LANGS        },
              { icon: "🕐", label: "Time Zone",      sub: "Set your local time zone",            key: "timezone",   options: TIMEZONES    },
              { icon: "📅", label: "Date Format",    sub: "Choose how you want dates to appear", key: "dateFormat", options: DATE_FORMATS },
              { icon: "📆", label: "Week Starts On", sub: "Choose the first day of the week",    key: "weekStart",  options: WEEK_STARTS  },
            ].map(({ icon, label, sub, key, options }) => (
              <div key={label} className="flex items-center justify-between gap-4 py-3" style={{ borderBottom: `1px solid ${p.border}` }}>
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-base w-5 text-center flex-shrink-0">{icon}</span>
                  <div>
                    <p className="text-sm font-medium" style={{ color: p.text }}>{label}</p>
                    <p className="text-xs" style={{ color: p.textMute }}>{sub}</p>
                  </div>
                </div>
                <div className="w-52 flex-shrink-0">
                  <Select value={settings[key]} onChange={set(key)} options={options} p={p} />
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between gap-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-base w-5 text-center flex-shrink-0">🕑</span>
                <div>
                  <p className="text-sm font-medium" style={{ color: p.text }}>Time Format</p>
                  <p className="text-xs" style={{ color: p.textMute }}>Choose 12 or 24 hour format</p>
                </div>
              </div>
              <div className="flex rounded-xl overflow-hidden flex-shrink-0" style={{ border: `1px solid ${p.border2}` }}>
                {["12-Hour", "24-Hour"].map(f => (
                  <button key={f} onClick={() => onUpdate({ timeFormat: f })}
                    className="px-4 py-2 text-xs font-semibold transition"
                    style={{ background: settings.timeFormat === f ? accentHex : p.input, color: settings.timeFormat === f ? "#fff" : p.textMute }}
                  >{f}</button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Focus Preferences */}
        <Card p={p}>
          <div className="flex items-center justify-between mb-5">
            <SectionHeader title="Focus Preferences" sub="Customize your focus sessions and environment." icon="🎯" p={p} />
            <button className="text-xs hover:opacity-80 transition px-3 py-1.5 rounded-lg flex-shrink-0 self-start" style={{ background: p.border2, color: accentHex }}>
              Manage Presets ›
            </button>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Default Focus Time",  sub: "min",      key: "focusTime"     },
              { label: "Short Break",         sub: "min",      key: "shortBreak"    },
              { label: "Long Break",          sub: "min",      key: "longBreak"     },
              { label: "Long Break Interval", sub: "sessions", key: "breakInterval" },
            ].map(({ label, sub, key }) => (
              <div key={label} className="flex flex-col gap-2 rounded-xl p-3" style={{ background: p.input, border: `1px solid ${p.border2}` }}>
                <p className="text-xs leading-snug" style={{ color: p.textDim }}>{label}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold tabular-nums" style={{ color: p.text }}>{settings[key]}</span>
                  <span className="text-xs" style={{ color: p.textMute }}>{sub}</span>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => onUpdate({ [key]: Math.max(1, settings[key] - 1) })}
                    className="flex-1 py-1 rounded-lg text-sm transition hover:opacity-80"
                    style={{ background: p.border2, color: p.textDim }}>−</button>
                  <button
                    onClick={() => onUpdate({ [key]: settings[key] + 1 })}
                    className="flex-1 py-1 rounded-lg text-sm transition hover:opacity-80"
                    style={{ background: p.border2, color: p.textDim }}>+</button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Right column ── */}
      <div className="w-72 flex-shrink-0 flex flex-col gap-5">

        {/* Quick Settings */}
        <Card p={p}>
          <SectionHeader title="Quick Settings" p={p} />
          <div className="flex flex-col gap-4">
            {[
              { icon: "⏱", label: "Auto start next Pomodoro", sub: "Automatically start next session", key: "autoStart"       },
              { icon: "☕", label: "Long break reminder",      sub: "Get reminded before long breaks",  key: "longBreakRemind" },
              { icon: "🎯", label: "Daily goal reminder",     sub: "Remind me to complete daily goal", key: "dailyGoal"       },
            ].map(({ icon, label, sub, key }) => (
              <div key={label} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-base flex-shrink-0">{icon}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: p.text }}>{label}</p>
                    <p className="text-xs truncate" style={{ color: p.textMute }}>{sub}</p>
                  </div>
                </div>
                <Toggle checked={settings[key]} onChange={set(key)} accent={accentHex} />
              </div>
            ))}
          </div>
        </Card>

        {/* Account */}
        <Card p={p}>
          <SectionHeader title="Account" p={p} />
          <div className="flex flex-col gap-2">
            <button className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm transition hover:opacity-80"
              style={{ background: p.input, border: `1px solid ${p.border2}`, color: p.text }}>
              <div className="flex items-center gap-3">
                <span>⬇️</span>
                <div className="text-left">
                  <p className="font-medium">Export My Data</p>
                  <p className="text-xs" style={{ color: p.textMute }}>Download all your data</p>
                </div>
              </div>
              <span style={{ color: p.textMute }}>›</span>
            </button>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm transition hover:opacity-80"
                style={{ background: p.input, border: "1px solid #3f1212" }}
              >
                <div className="flex items-center gap-3">
                  <span>🗑️</span>
                  <div className="text-left">
                    <p className="font-medium text-red-400">Delete Account</p>
                    <p className="text-xs" style={{ color: p.textMute }}>Permanently delete your account</p>
                  </div>
                </div>
                <span style={{ color: p.textMute }}>›</span>
              </button>
            ) : (
              <div className="rounded-xl p-4 flex flex-col gap-3" style={{ background: "#1a0808", border: "1px solid #7f1d1d" }}>
                <p className="text-sm text-red-300 font-semibold">Are you sure?</p>
                <p className="text-xs text-gray-400">This will permanently delete your account and all data. This cannot be undone.</p>
                <div className="flex gap-2">
                  <button onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-2 rounded-lg text-xs font-semibold"
                    style={{ background: p.border2, color: p.textDim }}>Cancel</button>
                  <button className="flex-1 py-2 rounded-lg text-xs font-semibold text-white" style={{ background: "#dc2626" }}>
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}