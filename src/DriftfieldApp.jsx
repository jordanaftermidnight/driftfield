import { useState, useEffect, useCallback, useRef, useMemo, Component } from "react";
import { shareProbeCard, shareScoreCard } from "./probeCard.js";
import { useAuth } from "./hooks/useAuth";
import { useTheme } from "./hooks/useTheme";
import { AuthModal } from "./components/auth/AuthModal";
import { PremiumModal } from "./components/auth/PremiumModal";
import { canFireProbe, hasFeature } from "./lib/premium";
import { trackAppOpen, trackTabView } from "./lib/analytics";
import { fullEntropyAnalysis } from "./lib/entropy";
import { biorhythm, lunarPhase, temporalGate, zodiacSign, calculateField } from "./lib/astro";
import { CompassRose } from "./components/CompassRose";
import { ArcanaTab } from "./components/ArcanaTab";
import "./theme.css";

const GOLD_HEX = "#C9A84C";

/*
  DRIFTFIELD — Serendipity Engine

  Three signal layers:
  1. ENTROPY ENGINE — Cryptographic entropy sampling + statistical analysis.
  2. CYCLE LAYER — Biorhythm, lunar phase, temporal gates.
  3. BEHAVIORAL LAYER — Surface area scoring, synchronicity logging, pattern detection.
*/

// ─── Error Boundary ───
class ArcanaErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err) { console.error('ArcanaTab crashed:', err); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--df-text-muted)' }}>
          <p style={{ fontSize: 18, marginBottom: 12 }}>Something went wrong with the reading engine.</p>
          <button onClick={() => this.setState({ hasError: false })}
            style={{ background: 'none', border: '1px solid var(--df-gold)', color: 'var(--df-gold)', padding: '8px 20px', cursor: 'pointer', fontFamily: 'inherit' }}>
            TRY AGAIN
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Storage ───
function load(key, fallback) {
  try {
    const v = localStorage.getItem('df_' + key);
    return v !== null ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}
function save(key, data) {
  try { localStorage.setItem('df_' + key, JSON.stringify(data)); } catch {}
}

// Entropy + Astro functions imported from lib/entropy.js and lib/astro.js
// CompassRose imported from components/CompassRose.jsx

// ═══════════════════════════════════════════
// BEHAVIORAL LAYER
// ═══════════════════════════════════════════

function scoreSurface(entry) {
  let score = 0, factors = [];
  if (entry.novelty >= 3) { score += 30; factors.push("High novelty exposure"); }
  else if (entry.novelty >= 2) { score += 20; factors.push("Moderate novelty"); }
  else if (entry.novelty >= 1) { score += 10; factors.push("Some novelty"); }
  else { factors.push("Routine — low chance surface"); }
  if (entry.weakTies >= 2) { score += 25; factors.push("Multiple weak-tie interactions"); }
  else if (entry.weakTies >= 1) { score += 15; factors.push("Weak-tie contact"); }
  if (entry.strongTies >= 1) { score += 5; factors.push("Strong-tie contact"); }
  if (entry.saidYes) { score += 20; factors.push("Said yes to the unexpected"); }
  if (entry.noticed) { score += 15; factors.push("Peripheral attention active"); }
  if (entry.shared) { score += 10; factors.push("Shared publicly"); }
  return { score: Math.min(score, 100), factors };
}

function calculateMomentum(probeHistory, events, dayScore) {
  const weekAgo = Date.now() - 7 * 86400000;
  const weekProbes = probeHistory.filter(p => p.timestamp > weekAgo);
  const weekEvents = events.filter(e => e.timestamp > weekAgo);

  // Surface area component (0.25): daily score normalized
  const surfaceWeight = dayScore ? (dayScore.score / 100) * 25 : 0;

  // Probe follow-through (0.30): % of recent probes followed
  const followedCount = weekProbes.filter(p => p.followed).length;
  const followWeight = weekProbes.length > 0 ? (followedCount / weekProbes.length) * 30 : 0;

  // Reading frequency (0.20): readings this week, capped at 5
  let weekReadings = 0;
  try {
    const readings = JSON.parse(localStorage.getItem('df_df_readings') || '[]');
    weekReadings = readings.filter(r => r.timestamp > weekAgo).length;
  } catch {}
  const readingWeight = Math.min(weekReadings / 5, 1) * 20;

  // Logging consistency (0.25): days with activity this week
  const activeDays = new Set();
  weekEvents.forEach(e => activeDays.add(new Date(e.timestamp).toDateString()));
  weekProbes.filter(p => p.followed).forEach(p => activeDays.add(new Date(p.timestamp).toDateString()));
  const logWeight = Math.min(activeDays.size / 5, 1) * 25;

  return Math.round(surfaceWeight + followWeight + readingWeight + logWeight);
}

function analyzePatterns(events) {
  if (events.length < 3) return { patterns: [], insight: "Log 3+ events to detect patterns." };
  const patterns = [];

  const hourCounts = {};
  events.forEach(e => {
    const h = new Date(e.timestamp).getHours();
    const bucket = h < 6 ? "night" : h < 12 ? "morning" : h < 18 ? "afternoon" : "evening";
    hourCounts[bucket] = (hourCounts[bucket] || 0) + 1;
  });
  const topTime = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
  if (topTime?.[1] >= 2) patterns.push({ type: "temporal", label: `${topTime[1]}/${events.length} events in the ${topTime[0]}`, suggestion: `Your ${topTime[0]} is a high-signal window. Protect this time for exploration.`, strength: topTime[1] / events.length });

  const catCounts = {};
  events.forEach(e => { if (e.category) catCounts[e.category] = (catCounts[e.category] || 0) + 1; });
  const topCat = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0];
  if (topCat?.[1] >= 2) patterns.push({ type: "thematic", label: `"${topCat[0]}" × ${topCat[1]}`, suggestion: `Recurring theme. Lean into "${topCat[0]}" deliberately.`, strength: topCat[1] / events.length });

  let streak = 1, maxStreak = 1, sPolarity = events[0]?.polarity;
  for (let i = 1; i < events.length; i++) {
    if (events[i].polarity === events[i - 1].polarity) { streak++; if (streak > maxStreak) { maxStreak = streak; sPolarity = events[i].polarity; } } else streak = 1;
  }
  if (maxStreak >= 3) patterns.push({ type: "streak", label: `${maxStreak}× ${sPolarity} streak`, suggestion: sPolarity === "positive" ? "Positive current — increase exposure." : "Friction streak — broaden environment.", strength: maxStreak / events.length });

  if (events.length >= 4) {
    const gaps = [];
    for (let i = 1; i < events.length; i++) gaps.push(events[i].timestamp - events[i - 1].timestamp);
    const recent = gaps.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const all = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    if (recent < all * 0.5) patterns.push({ type: "acceleration", label: "Frequency increasing", suggestion: "Synchronicities clustering. Cancel routine, leave space.", strength: 0.8 });
  }

  return { patterns, insight: patterns.length ? "Active patterns in field." : "No strong patterns yet." };
}

function evaluateDecision(a, b, fieldState) {
  const sc = (o) => {
    let s = 0, n = [];
    if (o.isNovel) { s += 30; n.push("Novel — expands possibility space"); } else { s += 5; n.push("Familiar — predictable"); }
    if (o.meetsNew) { s += 25; n.push("New people = new weak ties"); }
    if (o.opens) { s += 25; n.push("Opens future paths"); }
    if (o.gut === "excited") { s += 20; n.push("Intuition says yes"); }
    else if (o.gut === "anxious") { s += 10; n.push("Growth-edge anxiety"); }
    else n.push("No intuition signal");
    return { score: s, notes: n };
  };
  const ra = sc(a), rb = sc(b), d = ra.score - rb.score;
  let fieldVerdict = null;

  // Field tiebreaker: only activates when scores are within 10 points
  if (fieldState && Math.abs(d) < 10) {
    const bonus = Math.round(Math.abs(fieldState.resonance || 0) * 5);
    if (bonus > 0) {
      if (fieldState.polarity > 0) {
        // Positive field rewards the more open option
        const moreOpen = (a.opens && !b.opens) ? "A" : (b.opens && !a.opens) ? "B"
          : (a.isNovel && !b.isNovel) ? "A" : (b.isNovel && !a.isNovel) ? "B" : null;
        if (moreOpen === "A") { ra.score += bonus; fieldVerdict = `Field is positive — nudging toward A (+${bonus})`; }
        else if (moreOpen === "B") { rb.score += bonus; fieldVerdict = `Field is positive — nudging toward B (+${bonus})`; }
        else { fieldVerdict = "Field is positive but both options are equally open."; }
      } else {
        // Negative field rewards the less novel option
        const moreCautious = (!a.isNovel && b.isNovel) ? "A" : (!b.isNovel && a.isNovel) ? "B" : null;
        if (moreCautious === "A") { ra.score += bonus; fieldVerdict = `Field is contracting — favoring caution in A (+${bonus})`; }
        else if (moreCautious === "B") { rb.score += bonus; fieldVerdict = `Field is contracting — favoring caution in B (+${bonus})`; }
        else { fieldVerdict = "Field is contracting — proceed carefully with either."; }
      }
    }
  }

  const finalD = ra.score - rb.score;
  const verdict = Math.abs(finalD) < 10 ? "Near-equal. Flip a coin — both expand surface area."
    : finalD > 0 ? `Option A: +${finalD} serendipity potential.`
    : `Option B: +${Math.abs(finalD)} serendipity potential.`;
  return { a: ra, b: rb, diff: finalD, verdict, fieldVerdict };
}

// ═══════════════════════════════════════════
// PROBE SYSTEM (Randonautica-style)
// ═══════════════════════════════════════════

const PROBE_ACTIONS = [
  { id: 0, label: "Seek Novelty", desc: "Go somewhere unfamiliar. The entropy points toward unexplored territory.", icon: "🧭" },
  { id: 1, label: "Talk to a Stranger", desc: "Weak ties are probability bridges. Start a conversation with someone new.", icon: "🗣" },
  { id: 2, label: "Follow the Thread", desc: "Something caught your attention recently. Follow it one step further.", icon: "🧵" },
  { id: 3, label: "Share Something", desc: "Put an idea, creation, or question into the world. Luck needs witnesses.", icon: "📡" },
  { id: 4, label: "Break a Pattern", desc: "Do the opposite of your default. Entropy favors deviation.", icon: "⚡" },
  { id: 5, label: "Wait & Receive", desc: "Don't push. Soften your focus. What comes to you uninvited?", icon: "🌊" },
  { id: 6, label: "Revisit Old Ground", desc: "Return to somewhere meaningful. The field has shifted since you were last there.", icon: "🔄" },
  { id: 7, label: "Say Yes", desc: "The next invitation, suggestion, or opportunity — take it without analysis.", icon: "✦" },
];

function weightActions(field) {
  const w = new Array(8).fill(1);
  if (!field) return w;
  const { lunar, temporal, bio, resonance } = field;
  const ln = lunar?.normalized ?? 0.5;
  const te = temporal?.energy ?? 0.5;
  const tn = temporal?.name ?? "";
  const waxing = ln < 0.5;
  const fullish = ln > 0.4 && ln < 0.6;
  const waning = ln >= 0.5;

  // Seek Novelty — high temporal energy, waxing moon
  if (te > 0.7) w[0] += 0.5;
  if (waxing) w[0] += 0.3;

  // Talk to Stranger — morning/twilight, waxing
  if (tn === "Morning Ascent" || tn === "Twilight Gate") w[1] += 0.6;
  if (waxing) w[1] += 0.3;

  // Follow the Thread — afternoon drift, intuitive peak
  if (tn === "Afternoon Drift") w[2] += 0.6;
  if (bio?.intuitive?.value > 0.5) w[2] += 0.4;

  // Share Something — full moon, solar apex, physical peak
  if (fullish) w[3] += 0.5;
  if (tn === "Solar Apex") w[3] += 0.5;
  if (bio?.physical?.value > 0.5) w[3] += 0.3;

  // Break a Pattern — emotional peak
  if (bio?.emotional?.value > 0.5) w[4] += 0.5;

  // Wait & Receive — waning moon, night/void
  if (waning) w[5] += 0.5;
  if (tn === "Deep Void" || tn === "Night Descent") w[5] += 0.5;

  // Revisit Old Ground — waning crescent, intellectual peak
  if (ln > 0.75) w[6] += 0.5;
  if (bio?.intellectual?.value > 0.5) w[6] += 0.4;

  // Say Yes — dawn gate, emotional peak, high resonance
  if (tn === "Dawn Gate") w[7] += 0.5;
  if (bio?.emotional?.value > 0.5) w[7] += 0.3;
  if (resonance > 0.7) w[7] += 0.4;

  return w;
}

function generateProbe(intention, entropy, field) {
  // Cycle-weighted action selection
  const weights = weightActions(field);
  const seeds = Array.from(entropy.rawData.slice(4, 12));
  const scored = weights.map((w, i) => w * (seeds[i] / 255));
  const actionIdx = scored.indexOf(Math.max(...scored));
  const action = PROBE_ACTIONS[actionIdx];

  const bearing = entropy.direction.angle;
  const strength = entropy.anomalyScore;

  const compass = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const compassDir = compass[Math.floor(bearing / 22.5) % 16];

  const confidence = strength > 0.3 ? "Strong signal" : strength > 0.15 ? "Moderate signal" : "Weak signal";

  return {
    intention,
    action,
    bearing: bearing.toFixed(1),
    compassDir,
    strength,
    confidence,
    polarity: entropy.polarity,
    polarityRaw: entropy.polarityRaw,
    fieldMagnitude: field.magnitude,
    timestamp: Date.now(),
    followed: false,
    followedAt: null,
    entropyDetail: {
      shannon: entropy.shannon.toFixed(4),
      chi2: entropy.chi.normalized.toFixed(4),
      serial: entropy.corr.toFixed(4),
      piDev: (entropy.mc.deviation * 100).toFixed(2),
      anomaly: (entropy.anomalyScore * 100).toFixed(1),
    }
  };
}

// ═══════════════════════════════════════════
// VISUALIZATION COMPONENTS
// ═══════════════════════════════════════════

function EntropyVis({ data, polarity, isDark = true }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.offsetWidth;
    const h = 80;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    const color = isDark
      ? (polarity === "positive" ? [0, 229, 200] : [255, 60, 80])
      : (polarity === "positive" ? [12, 100, 90] : [170, 45, 50]);
    const barW = w / data.length;
    const am = isDark ? 1 : 1.8;
    for (let i = 0; i < data.length; i++) {
      const val = data[i] / 255;
      const barH = val * h * 0.8;
      const alpha = Math.min((0.3 + val * 0.5) * am, 1);
      ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${alpha})`;
      ctx.fillRect(i * barW, h - barH, barW - 0.5, barH);
    }
    // Mean line
    const mean = [...data].reduce((a, b) => a + b, 0) / data.length;
    const meanY = h - (mean / 255) * h * 0.8;
    ctx.beginPath();
    ctx.moveTo(0, meanY);
    ctx.lineTo(w, meanY);
    ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},${Math.min(0.6 * am, 1)})`;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.stroke();
  }, [data, polarity, isDark]);
  return <canvas ref={canvasRef} style={{ width: "100%", height: 80, display: "block", borderRadius: 4 }} />;
}

function BioWave({ bio, isDark = true }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !bio) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.offsetWidth;
    const h = 70;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    const mid = h / 2;
    const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#c084fc"];
    const channels = [bio.physical, bio.emotional, bio.intellectual, bio.intuitive];

    channels.forEach((ch, ci) => {
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const dayOff = (x / w) * 60 - 30;
        const y = mid - Math.sin((2 * Math.PI * dayOff) / ch.cycle) * (mid - 8);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = colors[ci] + (isDark ? "40" : "60");
      ctx.lineWidth = 1;
      ctx.stroke();

      // Current position dot
      const nowX = w / 2;
      const nowY = mid - ch.value * (mid - 8);
      ctx.beginPath();
      ctx.arc(nowX, nowY, 3, 0, Math.PI * 2);
      ctx.fillStyle = colors[ci];
      ctx.fill();
    });

    // Now line
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.strokeStyle = isDark ? "#ffffff15" : "#00000015";
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 3]);
    ctx.stroke();
  }, [bio, isDark]);
  return <canvas ref={canvasRef} style={{ width: "100%", height: 70, display: "block" }} />;
}

// ═══════════════════════════════════════════
// UI HELPERS
// ═══════════════════════════════════════════

function Toggle({ checked, onChange, label }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 11, color: "var(--df-text-secondary)" }}>
      <div onClick={() => onChange(!checked)} style={{
        width: 34, height: 18, borderRadius: 9, flexShrink: 0,
        background: checked ? `${GOLD_HEX}25` : "var(--df-border-subtle)", border: `1px solid ${checked ? `${GOLD_HEX}60` : "var(--df-border-input)"}`,
        position: "relative", transition: "all 0.2s", cursor: "pointer",
      }}>
        <div style={{
          width: 12, height: 12, borderRadius: 6,
          background: checked ? "var(--df-gold)" : "var(--df-text-faint)", position: "absolute", top: 2,
          left: checked ? 18 : 3, transition: "all 0.2s",
        }} />
      </div>
      {label}
    </label>
  );
}

function Stat({ label, value, sub, color }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 9, color: "var(--df-gold)", opacity: 0.55, letterSpacing: 1, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 200, color: color || "var(--df-text)" }}>{value}</div>
      {sub && <div style={{ fontSize: 9, color: "var(--df-text-faint)" }}>{sub}</div>}
    </div>
  );
}

function Section({ title, children, style: s }) {
  return (
    <div style={{ background: "var(--df-surface)", border: `1.5px solid var(--df-border-warm)`, borderRadius: 8, padding: 14, marginBottom: 12, ...s }}>
      {title && <div style={{ fontSize: 10, letterSpacing: 2, color: "var(--df-gold)", opacity: 0.7, marginBottom: 10 }}>{title}</div>}
      {children}
    </div>
  );
}

function Btn({ children, onClick, color, colorHex = "#00e5c8", full, small, dim }) {
  return (
    <button onClick={onClick} style={{
      width: full ? "100%" : "auto",
      padding: small ? "6px 12px" : "10px 20px",
      borderRadius: 5, background: dim ? "transparent" : `${colorHex}12`,
      border: `1.5px solid ${dim ? GOLD_HEX + "25" : colorHex + "40"}`,
      color: dim ? "var(--df-text-dim)" : (color || colorHex),
      fontSize: small ? 10 : 11, letterSpacing: small ? 1 : 2,
      cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
    }}>{children}</button>
  );
}

// ═══════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════

export default function DriftfieldApp() {
  const { isAuthenticated, user, session, profile, isPremium, signOut, supabaseConfigured } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [showAuth, setShowAuth] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [view, setView] = useState("field");
  const [loaded, setLoaded] = useState(false);

  // Config
  const [birthDate, setBirthDate] = useState(null);
  const [birthInput, setBirthInput] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthLoc, setBirthLoc] = useState("");
  const [birthChart, setBirthChart] = useState(null);

  // Entropy
  const [entropy, setEntropy] = useState(null);
  const [field, setField] = useState(null);
  const [scanning, setScanning] = useState(false);
  const scanRef = useRef(null);

  // Probe
  const [intention, setIntention] = useState("");
  const [probe, setProbe] = useState(null);
  const [probeHistory, setProbeHistory] = useState([]);

  // Events
  const [events, setEvents] = useState([]);
  const [eventText, setEventText] = useState("");
  const [eventPol, setEventPol] = useState("positive");
  const [eventCat, setEventCat] = useState("");

  // Daily
  const [daily, setDaily] = useState(null);
  const [dayScore, setDayScore] = useState(null);
  const [nov, setNov] = useState(0);
  const [wt, setWt] = useState(0);
  const [st, setSt] = useState(0);
  const [yes, setYes] = useState(false);
  const [noticed, setNoticed] = useState(false);
  const [shared, setShared] = useState(false);

  // Decision
  const [optA, setOptA] = useState({ label: "", isNovel: false, meetsNew: false, opens: false, gut: "neutral" });
  const [optB, setOptB] = useState({ label: "", isNovel: false, meetsNew: false, opens: false, gut: "neutral" });
  const [decResult, setDecResult] = useState(null);

  // Cross-tab interconnection
  const [arcanaInitialQuestion, setArcanaInitialQuestion] = useState(null);
  const [logPrefill, setLogPrefill] = useState(null);
  const [lastSavedReading, setLastSavedReading] = useState(null);

  // UX: collapsible sections
  const [showDailyExpanded, setShowDailyExpanded] = useState(false);
  const [showProbeExpanded, setShowProbeExpanded] = useState(false);
  const [probeMode, setProbeMode] = useState("single");

  // Load
  useEffect(() => {
    const b = load("df_birth", null);
    if (b) { setBirthDate(new Date(b.date)); setBirthLoc(b.loc || ""); setBirthTime(b.time || ""); if (b.chart) setBirthChart(b.chart); }
    setEvents(load("df_events", []));
    setProbeHistory(load("df_probes", []));
    const d = load("df_daily", null);
    if (d?.date === new Date().toDateString()) { setDaily(d); setDayScore(scoreSurface(d)); }
    setLoaded(true);
  }, []);

  // Save
  useEffect(() => { if (loaded) save("df_events", events); }, [events, loaded]);
  useEffect(() => { if (loaded) save("df_probes", probeHistory); }, [probeHistory, loaded]);

  // Apply log prefill
  useEffect(() => {
    if (logPrefill) {
      setEventText(logPrefill.text || "");
      if (logPrefill.category) setEventCat(logPrefill.category);
      setLogPrefill(null);
    }
  }, [logPrefill]);

  // Analytics
  useEffect(() => { trackAppOpen(); }, []);

  // Scan
  const doScan = useCallback(() => {
    const e = fullEntropyAnalysis(2048);
    setEntropy(e);
    setField(calculateField(e, birthDate, new Date()));
  }, [birthDate]);

  const startScan = () => { setScanning(true); doScan(); scanRef.current = setInterval(doScan, 3000); };
  const stopScan = () => { setScanning(false); clearInterval(scanRef.current); };
  useEffect(() => () => clearInterval(scanRef.current), []);

  // One-shot scan on load
  useEffect(() => { if (loaded) doScan(); }, [loaded, birthDate]);

  const saveBirth = async () => {
    const parts = birthInput.split("-");
    if (parts.length === 3) {
      const d = new Date(birthInput + (birthTime ? "T" + birthTime : "T12:00"));
      if (!isNaN(d.getTime())) {
        setBirthDate(d);

        let lat = 0, lng = 0;
        if (birthLoc.trim()) {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(birthLoc)}&format=json&limit=1`,
              { headers: { "User-Agent": "Driftfield/1.0" } }
            );
            const geo = await res.json();
            if (geo.length > 0) { lat = parseFloat(geo[0].lat); lng = parseFloat(geo[0].lon); }
          } catch (e) { console.warn("Geocoding failed:", e); }
        }

        try {
          const { calculateBirthChart } = await import("./arcana/astro/birth-chart");
          const chart = calculateBirthChart({ date: d, time: birthTime || undefined, latitude: lat, longitude: lng }, !!isPremium);
          setBirthChart(chart);
          save("df_birth", { date: d.toISOString(), loc: birthLoc, time: birthTime, lat, lng, chart });
        } catch (e) {
          console.warn("Birth chart calculation failed:", e);
          save("df_birth", { date: d.toISOString(), loc: birthLoc, time: birthTime });
        }
      }
    }
  };

  const fireProbe = () => {
    if (!entropy || !field) doScan();
    const e = fullEntropyAnalysis(4096); // Extra entropy for probes
    const f = calculateField(e, birthDate, new Date());
    const p = generateProbe(intention, e, f);
    setProbe(p);
    setEntropy(e);
    setField(f);
    setProbeHistory(prev => [...prev.slice(-29), p]);
  };

  const markProbeFollowed = (timestamp) => {
    setProbeHistory(prev => prev.map(p =>
      p.timestamp === timestamp ? { ...p, followed: true, followedAt: Date.now() } : p
    ));
    if (probe && probe.timestamp === timestamp) {
      setProbe(prev => ({ ...prev, followed: true, followedAt: Date.now() }));
    }
  };

  // Linked probe for event logging
  const [linkedProbeId, setLinkedProbeId] = useState(null);

  const addEvent = () => {
    if (!eventText.trim()) return;
    // Auto-link to most recent unfollowed probe within 24h
    const autoLink = linkedProbeId || (() => {
      const recent = probeHistory.filter(p => !p.followed && Date.now() - p.timestamp < 86400000);
      return recent.length > 0 ? recent[recent.length - 1].timestamp : null;
    })();
    setEvents(prev => [...prev, { text: eventText.trim(), polarity: eventPol, category: eventCat.trim() || null, linkedProbeId: autoLink, timestamp: Date.now(), id: Date.now() }]);
    setEventText(""); setEventCat(""); setLinkedProbeId(null);
  };

  const submitDaily = () => {
    const entry = { novelty: nov, weakTies: wt, strongTies: st, saidYes: yes, noticed, shared, date: new Date().toDateString() };
    setDaily(entry); setDayScore(scoreSurface(entry)); save("df_daily", entry);
  };

  const patterns = analyzePatterns(events);

  const sessionContext = useMemo(() => {
    // Active probe intention + action
    const lastProbe = probeHistory[probeHistory.length - 1];
    const activeProbeIntention = lastProbe?.intention || null;
    const activeProbeAction = lastProbe?.action?.label || null;

    // Last reading cards from localStorage
    let lastReadingCards = null;
    try {
      const readings = JSON.parse(localStorage.getItem('df_df_readings') || '[]');
      if (readings.length > 0) {
        lastReadingCards = readings[readings.length - 1].cards;
      }
    } catch {}

    // Recent patterns
    const recentPatterns = patterns.patterns.length > 0
      ? patterns.patterns.map(p => `${p.type}: ${p.label}`)
      : null;

    // Top 3 event categories
    const catCounts = {};
    events.forEach(e => { if (e.category) catCounts[e.category] = (catCounts[e.category] || 0) + 1; });
    const topEventCategories = Object.entries(catCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => cat);

    // Recent journal excerpt
    let recentJournalExcerpt = null;
    try {
      const readings = JSON.parse(localStorage.getItem('df_df_readings') || '[]');
      const withJournal = readings.filter(r => r.journal);
      if (withJournal.length > 0) {
        recentJournalExcerpt = withJournal[withJournal.length - 1].journal.slice(0, 200);
      }
    } catch {}

    return {
      activeProbeIntention,
      activeProbeAction,
      lastReadingCards,
      recentPatterns,
      topEventCategories,
      recentJournalExcerpt,
      fieldPolarity: field?.polarity || null,
      fieldResonance: field?.resonance || null,
      fieldMagnitude: field?.magnitude || null,
    };
  }, [probeHistory, events, patterns.patterns, field]);

  const momentum = calculateMomentum(probeHistory, events, dayScore);

  const pc = (field?.polarity === "positive" || !field) ? "var(--df-accent)" : "var(--df-negative)";
  // Raw hex values needed for opacity suffixes and canvas rendering
  const pcHex = (field?.polarity === "positive" || !field) ? "#00e5c8" : "#ff3c50";
  const pColors = { positive: "var(--df-accent)", negative: "var(--df-negative)", neutral: "var(--df-purple)" };
  const pColorsHex = { positive: "#00e5c8", negative: "#ff3c50", neutral: "#7a7aff" };

  const navItems = [
    { id: "field", label: "SCAN", icon: "\u25C9" },
    { id: "arcana", label: "ARCANA", icon: "\u2727" },
    { id: "config", label: "SETUP", icon: "\u2699" },
  ];

  if (!loaded) return <div style={{ background: "var(--df-bg)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--df-text-ghost)", fontFamily: "'JetBrains Mono','Fira Code','Courier New',monospace" }}>Loading...</div>;

  return (
    <div data-theme={theme} style={{ background: "var(--df-bg)", minHeight: "100vh", color: "var(--df-text)", fontFamily: "'JetBrains Mono','Fira Code','Courier New',monospace", transition: "background 0.3s, color 0.3s" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "12px 14px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 2, position: "relative" }}>
            {/* Theme toggle — right-aligned */}
            <button onClick={toggleTheme} style={{
              position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)",
              display: "flex", alignItems: "center", gap: 4,
              background: "transparent", border: `1px solid ${GOLD_HEX}30`,
              borderRadius: 14, padding: "4px 10px", cursor: "pointer", fontFamily: "inherit",
              fontSize: 9, color: "var(--df-text-dim)", letterSpacing: 1, transition: "all 0.2s",
            }}>
              <span style={{ fontSize: 12 }}>{isDark ? "\u263D" : "\u2600"}</span>
              {isDark ? "DARK" : "LIGHT"}
            </button>
            <svg width="32" height="32" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
              {/* Outer ring */}
              <circle cx="120" cy="120" r="105" fill="none" stroke={isDark ? "#C9A84C50" : "#8a7030"} strokeWidth="4"/>
              {/* Tick marks */}
              {[0, 90, 180, 270].map(a => {
                const rad = (a * Math.PI) / 180;
                const x1 = 120 + Math.cos(rad) * 95, y1 = 120 - Math.sin(rad) * 95;
                const x2 = 120 + Math.cos(rad) * 105, y2 = 120 - Math.sin(rad) * 105;
                return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke={isDark ? "#C9A84C70" : "#7a6525"} strokeWidth="5" strokeLinecap="round"/>;
              })}
              {/* Inner ring */}
              <circle cx="120" cy="120" r="70" fill="none" stroke={isDark ? "#C9A84C35" : "#a08a45"} strokeWidth="3"/>
              {/* Needle */}
              <path d="M120 120 L120 38" stroke={isDark ? "#00e5c8" : "#0a7a6e"} strokeWidth="8" strokeLinecap="round"/>
              <path d="M120 38 L130 60 M120 38 L110 60" stroke={isDark ? "#00e5c8" : "#0a7a6e"} strokeWidth="5" fill="none" strokeLinecap="round"/>
              {/* Center dot */}
              <circle cx="120" cy="120" r="10" fill={isDark ? "#C9A84C" : "#8a7030"} opacity="0.6"/>
              <circle cx="120" cy="120" r="6" fill={isDark ? "#00e5c8" : "#0a7a6e"}/>
            </svg>
            <h1 style={{ fontSize: 16, fontWeight: 300, letterSpacing: 4, color: "var(--df-text-bright)", margin: 0 }}>
              DRIFTFIELD
            </h1>
          </div>
          <div style={{ fontSize: 9, color: "var(--df-gold)", letterSpacing: 3, opacity: isDark ? 0.6 : 0.85, textAlign: "center" }}>
            SERENDIPITY ENGINE
          </div>
          {(() => {
            const allDates = new Set();
            probeHistory.filter(p => p.followed).forEach(p => allDates.add(new Date(p.followedAt || p.timestamp).toDateString()));
            events.forEach(e => allDates.add(new Date(e.timestamp).toDateString()));
            if (allDates.size < 2) return null;
            let streak = 0;
            const d = new Date();
            while (true) {
              if (allDates.has(d.toDateString())) { streak++; d.setDate(d.getDate() - 1); }
              else break;
            }
            if (streak < 2) return null;
            return <div style={{ fontSize: 9, color: "var(--df-warning)", opacity: 0.5, marginTop: 2, letterSpacing: 1, textAlign: "center" }}>{"\u25CF"} {streak}-DAY STREAK</div>;
          })()}
          {momentum > 0 && (
            <div style={{ fontSize: 9, color: "var(--df-text-dim)", marginTop: 2, letterSpacing: 1, opacity: 0.6, textAlign: "center" }}>
              {"\u25C8"} {momentum} MOMENTUM
            </div>
          )}
          {/* Auth button */}
          {supabaseConfigured && (
            <div style={{ marginTop: 6, textAlign: "center" }}>
              {isAuthenticated ? (
                <button onClick={signOut} style={{
                  background: "transparent", border: `1px solid ${GOLD_HEX}25`, borderRadius: 4,
                  color: "var(--df-text-dim)", fontSize: 9, padding: "4px 12px", cursor: "pointer",
                  fontFamily: "inherit", letterSpacing: 1,
                }}>SIGN OUT</button>
              ) : (
                <button onClick={() => setShowAuth(true)} style={{
                  background: `${pcHex}12`, border: `1px solid ${pcHex}40`, borderRadius: 4,
                  color: pc, fontSize: 9, padding: "4px 12px", cursor: "pointer",
                  fontFamily: "inherit", letterSpacing: 1,
                }}>TUNE IN</button>
              )}
            </div>
          )}
        </div>

        {/* ═══ SCAN TAB ═══ */}
        {view === "field" && (
          <>
            {/* Onboarding hint */}
            {!birthDate && events.length === 0 && probeHistory.length === 0 && (
              <div style={{ padding: "14px 16px", marginBottom: 12, background: "var(--df-surface)", borderRadius: 6, border: `1.5px solid ${GOLD_HEX}30` }}>
                <div style={{ fontSize: 11, color: "var(--df-text-secondary)", lineHeight: 1.7 }}>
                  Welcome to Driftfield. Start by entering your birth date in <span style={{ color: pc, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 2 }} onClick={() => setView("config")}>Setup</span>, then scan the field or fire a probe.
                </div>
              </div>
            )}

            {/* Compass */}
            <CompassRose
              bearing={entropy ? parseFloat(entropy.direction.angle.toFixed(1)) : 0}
              magnitude={field?.magnitude || 0}
              polarity={field?.polarity || "positive"}
              isDark={isDark}
            />

            <div style={{ textAlign: "center", marginTop: -4, marginBottom: 12 }}>
              <div style={{ fontSize: 32, fontWeight: 200, color: pc }}>
                {field ? (field.polarity === "positive" ? "+" : "\u2212") + (field.magnitude * 100).toFixed(0) : "\u2014"}
              </div>
              <div style={{ fontSize: 9, color: "var(--df-gold)", opacity: 0.5, letterSpacing: 2 }}>COMPOSITE FIELD STRENGTH</div>
              {field?.resonance > 0.75 && (
                <>
                  <div style={{ fontSize: 10, color: "var(--df-warning)", marginTop: 4, letterSpacing: 1 }}>
                    {"\u25C8"} HIGH RESONANCE — optimal probe window
                  </div>
                  <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 6 }}>
                    <Btn onClick={() => setShowProbeExpanded(true)} color="var(--df-warning)" colorHex="#ffd93d" small>FIRE PROBE</Btn>
                    <Btn onClick={() => setView("arcana")} color="var(--df-warning)" colorHex="#ffd93d" small>DRAW CARDS</Btn>
                  </div>
                </>
              )}
              {field?.resonance > 0.6 && field?.resonance <= 0.75 && (
                <div style={{ fontSize: 10, color: "var(--df-warning)", opacity: 0.5, marginTop: 4, letterSpacing: 1 }}>
                  {"\u25C8"} RISING — good conditions
                </div>
              )}
            </div>

            {/* Scan controls */}
            <div style={{ textAlign: "center", marginBottom: 14 }}>
              <Btn onClick={scanning ? stopScan : startScan} color={pc} colorHex={pcHex}>
                {scanning ? "◉ SCANNING LIVE" : "◈ SCAN FIELD"}
              </Btn>
            </div>

            {/* ── Probe (collapsible) ── */}
            <div style={{ background: "var(--df-surface)", border: `1.5px solid var(--df-border-warm)`, borderRadius: 8, marginBottom: 12, overflow: "hidden" }}>
              <button onClick={() => setShowProbeExpanded(!showProbeExpanded)} style={{
                width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "12px 14px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit",
              }}>
                <span style={{ fontSize: 10, letterSpacing: 2, color: "var(--df-gold)", opacity: 0.7 }}>
                  {probe ? `\u27D0 PROBE — ${probe.action.label.toUpperCase()}` : "\u27D0 ENTROPY PROBE"}
                </span>
                <span style={{ fontSize: 10, color: "var(--df-text-ghost)", transform: showProbeExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>{"\u25BC"}</span>
              </button>
              {showProbeExpanded && (
                <div style={{ padding: "0 14px 14px" }}>
                  {/* Mode toggle */}
                  <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 12 }}>
                    {[
                      { id: "single", label: "\u25C9 SINGLE" },
                      { id: "compare", label: "\u27C1 COMPARE" },
                    ].map(m => (
                      <button key={m.id} onClick={() => setProbeMode(m.id)} style={{
                        padding: "6px 16px", borderRadius: 4, fontSize: 10, letterSpacing: 1,
                        background: probeMode === m.id ? `${GOLD_HEX}15` : "transparent",
                        border: `1.5px solid ${probeMode === m.id ? GOLD_HEX + "50" : "var(--df-border-input)"}`,
                        color: probeMode === m.id ? "var(--df-gold)" : "var(--df-text-dim)",
                        cursor: "pointer", fontFamily: "inherit",
                      }}>{m.label}</button>
                    ))}
                  </div>

                  {probeMode === "single" ? (
                    <>
                      <div style={{ fontSize: 11, color: "var(--df-text-muted)", marginBottom: 10, lineHeight: 1.7 }}>
                        Set an intention — the probe reads the entropy field and gives you a direction.
                      </div>
                      <textarea
                        value={intention}
                        onChange={e => setIntention(e.target.value)}
                        placeholder="What are you looking for?"
                        style={{
                          width: "100%", boxSizing: "border-box", minHeight: 50, resize: "vertical",
                          background: "var(--df-surface-alt)", border: `1.5px solid ${GOLD_HEX}20`, borderRadius: 5,
                          color: "var(--df-text)", padding: "10px 12px", fontSize: 11, fontFamily: "inherit",
                          marginBottom: 10,
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 11, color: "var(--df-text-muted)", marginBottom: 10, lineHeight: 1.7 }}>
                        Compare two options — which opens more possibility?
                      </div>
                      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                        {[
                          { label: "OPTION A", opt: optA, set: setOptA, color: "#45b7d1" },
                          { label: "OPTION B", opt: optB, set: setOptB, color: "#c084fc" },
                        ].map(({ label, opt, set, color }) => (
                          <div key={label} style={{ flex: 1, padding: 10, border: `1.5px solid ${GOLD_HEX}25`, borderRadius: 5, background: `${color}05` }}>
                            <div style={{ fontSize: 9, color, letterSpacing: 1, marginBottom: 6 }}>{label}</div>
                            <input value={opt.label} onChange={e => set({ ...opt, label: e.target.value })}
                              placeholder="Describe..."
                              style={{ width: "100%", boxSizing: "border-box", background: "var(--df-surface-alt)", border: `1px solid ${GOLD_HEX}18`, borderRadius: 4, color: "var(--df-text)", padding: "7px 9px", fontSize: 10, fontFamily: "inherit", marginBottom: 8 }}
                            />
                            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                              <Toggle checked={opt.isNovel} onChange={v => set({ ...opt, isNovel: v })} label="New / unfamiliar" />
                              <Toggle checked={opt.meetsNew} onChange={v => set({ ...opt, meetsNew: v })} label="Meet new people" />
                              <Toggle checked={opt.opens} onChange={v => set({ ...opt, opens: v })} label="Opens possibilities" />
                            </div>
                            <div style={{ marginTop: 6 }}>
                              <div style={{ fontSize: 9, color: "var(--df-gold)", opacity: 0.5, marginBottom: 3, letterSpacing: 1 }}>GUT</div>
                              <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                                {["excited", "anxious", "neutral"].map(f => (
                                  <button key={f} onClick={() => set({ ...opt, gut: f })} style={{
                                    padding: "3px 8px", borderRadius: 3, fontSize: 9,
                                    background: opt.gut === f ? `${color}20` : "var(--df-surface-alt)",
                                    border: `1px solid ${opt.gut === f ? color + "50" : GOLD_HEX + "18"}`,
                                    color: opt.gut === f ? color : "var(--df-text-dim)", cursor: "pointer", fontFamily: "inherit", textTransform: "capitalize",
                                  }}>{f}</button>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  {field?.resonance > 0.7 && (
                    <div style={{ fontSize: 10, color: "var(--df-warning)", opacity: 0.5, marginBottom: 8, textAlign: "center" }}>
                      {"\u25C8"} Field resonance is high
                    </div>
                  )}
                  <Btn onClick={() => {
                    if (supabaseConfigured && !isAuthenticated) { setShowAuth(true); return; }
                    if (probeMode === "compare") {
                      setIntention(`${optA.label || "A"} vs ${optB.label || "B"}`);
                      setDecResult(evaluateDecision(optA, optB, field ? { polarity: field.polarity === "positive" ? field.magnitude : -field.magnitude, resonance: field.resonance } : null));
                    }
                    fireProbe();
                  }} color={pc} colorHex={pcHex} full>{"\u27D0"} FIRE PROBE</Btn>
                </div>
              )}
            </div>

            {/* Probe result */}
            {probe && (
              <>
                <Section style={{ borderColor: `${pColorsHex[probe.polarity]}25`, boxShadow: `0 0 30px ${pColorsHex[probe.polarity]}08` }}>
                  <CompassRose bearing={parseFloat(probe.bearing)} magnitude={probe.strength} polarity={probe.polarity} isDark={isDark} />
                  <div style={{ textAlign: "center", marginTop: 4 }}>
                    <div style={{ fontSize: 24, marginBottom: 4 }}>{probe.action.icon}</div>
                    <div style={{ fontSize: 14, color: pColors[probe.polarity], fontWeight: 600, letterSpacing: 2 }}>
                      {probe.action.label.toUpperCase()}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--df-text-secondary)", marginTop: 4, lineHeight: 1.7, maxWidth: 400, margin: "4px auto 0" }}>
                      {probe.action.desc}
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 14, paddingTop: 12, borderTop: `1px solid ${GOLD_HEX}18` }}>
                    <Stat label="BEARING" value={`${probe.compassDir}`} sub={`${probe.bearing}°`} color={pColors[probe.polarity]} />
                    <Stat label="POLARITY" value={probe.polarity === "positive" ? "\uFF0B" : "\u2212"} sub={probe.polarity} color={pColors[probe.polarity]} />
                    <Stat label="SIGNAL" value={`${(probe.strength * 100).toFixed(0)}%`} sub={probe.confidence} color={probe.strength > 0.2 ? "var(--df-warning)" : "var(--df-text-dim)"} />
                  </div>
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${GOLD_HEX}18` }}>
                    <div style={{ fontSize: 9, color: "var(--df-gold)", opacity: 0.5, letterSpacing: 1, marginBottom: 4 }}>ENTROPY DETAIL</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 4 }}>
                      {Object.entries(probe.entropyDetail).map(([k, v]) => (
                        <div key={k} style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 10, color: "var(--df-text-secondary)" }}>{v}</div>
                          <div style={{ fontSize: 9, color: "var(--df-text-faint)" }}>{k.toUpperCase()}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Section>

                {probe.intention && (
                  <Section>
                    <div style={{ fontSize: 10, color: "var(--df-text-dim)", letterSpacing: 1, marginBottom: 4 }}>INTENTION</div>
                    <div style={{ fontSize: 11, color: "var(--df-text-secondary)", fontStyle: "italic" }}>"{probe.intention}"</div>
                  </Section>
                )}

                <div style={{ textAlign: "center", marginBottom: 12, display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
                  <Btn onClick={() => shareProbeCard(probe)} color={pColors[probe.polarity]} colorHex={pColorsHex[probe.polarity]} small>
                    SHARE PROBE
                  </Btn>
                  {probe.followed ? (
                    <Btn color={pColors[probe.polarity]} colorHex={pColorsHex[probe.polarity]} small dim>{"\u2713"} DID IT</Btn>
                  ) : (
                    <Btn onClick={() => markProbeFollowed(probe.timestamp)} color="#ffd93d" small>
                      DID IT
                    </Btn>
                  )}
                  <Btn onClick={() => {
                    setArcanaInitialQuestion(probe.intention || probe.action.label);
                    setView("arcana");
                  }} color="var(--df-gold)" colorHex="#C9A84C" small>DRAW A CARD ON THIS</Btn>
                </div>
              </>
            )}

            {/* Compare mode decision result */}
            {probeMode === "compare" && decResult && (
              <Section>
                <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                  {[
                    { l: optA.label || "A", s: decResult.a.score, c: "#45b7d1" },
                    { l: optB.label || "B", s: decResult.b.score, c: "#c084fc" },
                  ].map(x => (
                    <div key={x.l} style={{ flex: 1, textAlign: "center" }}>
                      <div style={{ fontSize: 26, fontWeight: 200, color: x.c }}>{x.s}</div>
                      <div style={{ fontSize: 9, color: "var(--df-text-dim)" }}>{x.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: "10px 14px", background: `${pcHex}10`, borderRadius: 6, fontSize: 11, color: "var(--df-text)", lineHeight: 1.6, marginBottom: 10 }}>
                  {decResult.verdict}
                </div>
                {decResult.fieldVerdict && (
                  <div style={{ padding: "8px 12px", background: `${pcHex}08`, borderRadius: 5, fontSize: 10, color: "var(--df-text-muted)", lineHeight: 1.5, marginBottom: 10, borderLeft: `2px solid ${pcHex}40` }}>
                    {"\u25C8"} {decResult.fieldVerdict}
                  </div>
                )}
                {[{ l: "A", n: decResult.a.notes, c: "#45b7d1" }, { l: "B", n: decResult.b.notes, c: "#c084fc" }].map(x => (
                  <div key={x.l} style={{ marginBottom: 6 }}>
                    <div style={{ fontSize: 9, color: x.c, letterSpacing: 1, marginBottom: 2 }}>OPTION {x.l}</div>
                    {x.n.map((n, i) => <div key={i} style={{ fontSize: 10, color: "var(--df-text-muted)", padding: "2px 0" }}><span style={{ color: x.c + "60", marginRight: 5 }}>{"\u00B7"}</span>{n}</div>)}
                  </div>
                ))}
              </Section>
            )}

            {/* Probe history (compact) */}
            {probeHistory.length > 0 && (
              <Section title={`PROBE HISTORY \u00B7 ${probeHistory.length}`}>
                {[...probeHistory].reverse().slice(0, 5).map((p, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: `1px solid ${GOLD_HEX}12`, fontSize: 10 }}>
                    <div>
                      <span style={{ color: pColors[p.polarity], marginRight: 6 }}>{p.action.icon}</span>
                      <span style={{ color: "var(--df-text-secondary)" }}>{p.action.label}</span>
                      <span style={{ color: "var(--df-text-faint)", marginLeft: 6 }}>{p.compassDir} {p.bearing}°</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {p.followed ? (
                        <span style={{ fontSize: 9, color: "var(--df-warning)", opacity: 0.5 }}>{"\u2713"}</span>
                      ) : (
                        <button onClick={() => markProbeFollowed(p.timestamp)} style={{
                          background: "transparent", border: `1px solid ${GOLD_HEX}40`, borderRadius: 3,
                          color: "var(--df-warning)", fontSize: 9, padding: "2px 8px", cursor: "pointer",
                          fontFamily: "inherit", letterSpacing: 1, opacity: 0.7,
                        }}>DID IT</button>
                      )}
                      <span style={{ color: "var(--df-text-ghost)", fontSize: 9 }}>{new Date(p.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  </div>
                ))}
              </Section>
            )}

            {/* Quick Log */}
            <Section title="QUICK LOG">
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input value={eventText} onChange={e => setEventText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addEvent()}
                  placeholder="What happened?"
                  style={{ flex: 1, background: "var(--df-surface-alt)", border: `1.5px solid ${GOLD_HEX}20`, borderRadius: 5, color: "var(--df-text)", padding: "8px 10px", fontSize: 11, fontFamily: "inherit" }}
                />
                <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
                  {["positive", "negative", "neutral"].map(p => (
                    <button key={p} onClick={() => setEventPol(p)} style={{
                      width: 28, height: 28, borderRadius: 4, fontSize: 12,
                      background: eventPol === p ? `${pColorsHex[p]}20` : "var(--df-surface-alt)",
                      border: `1.5px solid ${eventPol === p ? pColorsHex[p] + "50" : GOLD_HEX + "20"}`,
                      color: eventPol === p ? pColors[p] : "var(--df-text-dim)", cursor: "pointer", fontFamily: "inherit",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>{p === "positive" ? "\uFF0B" : p === "negative" ? "\u2212" : "\u25CB"}</button>
                  ))}
                </div>
                <Btn onClick={addEvent} color={pc} colorHex={pcHex} small>LOG</Btn>
              </div>
            </Section>

            {/* Signal readout */}
            {entropy && (
              <Section title="SIGNAL ANALYSIS">
                <div style={{ fontSize: 11, color: "var(--df-text-secondary)", marginBottom: 8, lineHeight: 1.6 }}>
                  {entropy.anomalyScore > 0.3 ? "Strong signal detected \u2014 the noise is deviating from pure randomness." :
                   entropy.anomalyScore > 0.15 ? "Moderate signal \u2014 slight deviations from baseline randomness." :
                   "Baseline \u2014 the field is close to pure randomness right now."}
                </div>
                <EntropyVis data={entropy.rawData} polarity={field?.polarity} isDark={isDark} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 10 }}>
                  <Stat label="ENTROPY" value={entropy.shannon.toFixed(3)} sub="/ 8.000 bits" color={pc} />
                  <Stat label="DEVIATION" value={entropy.chi.normalized.toFixed(3)} sub="from expected" color={pc} />
                  <Stat label="ANOMALY" value={(entropy.anomalyScore * 100).toFixed(1) + "%"} sub={entropy.anomalyScore > 0.2 ? "SIGNAL" : "baseline"} color={entropy.anomalyScore > 0.2 ? "var(--df-warning)" : pc} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 6 }}>
                  <Stat label="CORRELATION" value={entropy.corr.toFixed(4)} sub="serial" />
                  <Stat label="π EST." value={entropy.mc.piEstimate.toFixed(4)} sub={`dev: ${(entropy.mc.deviation * 100).toFixed(2)}%`} />
                  <Stat label="LONGEST RUN" value={entropy.runs.maxRun} sub={`of ${entropy.runs.runs} runs`} />
                </div>
              </Section>
            )}

            {/* Astro layer */}
            {field && (
              <Section title={`CYCLE LAYER${field.sign ? " \u00B7 " + field.sign.symbol + " " + field.sign.name : ""}`}>
                {/* Lunar */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div>
                    <span style={{ fontSize: 20, marginRight: 8 }}>{field.lunar.symbol}</span>
                    <span style={{ fontSize: 11, color: "var(--df-text)" }}>{field.lunar.name}</span>
                    <span style={{ fontSize: 10, color: "var(--df-text-dim)", marginLeft: 6 }}>Day {field.lunar.daysInCycle}</span>
                  </div>
                  <div style={{ fontSize: 11, color: pc }}>{(field.lunar.energy * 100).toFixed(0)}% energy</div>
                </div>
                <div style={{ fontSize: 11, color: "var(--df-text-muted)", marginBottom: 12, lineHeight: 1.6 }}>
                  {field.lunar.quality}
                </div>

                {/* Temporal gate */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: "var(--df-text)" }}>{field.temporal.name}</span>
                  <span style={{ fontSize: 11, color: pc }}>{(field.temporal.energy * 100).toFixed(0)}% gate energy</span>
                </div>
                <div style={{ fontSize: 11, color: "var(--df-text-muted)", marginBottom: 12, lineHeight: 1.6 }}>
                  {field.temporal.quality}
                </div>

                {/* Biorhythm */}
                {field.bio && (
                  <>
                    <div style={{ fontSize: 10, color: "var(--df-gold)", opacity: 0.55, letterSpacing: 1, marginBottom: 4 }}>BIORHYTHM · 60-DAY WINDOW</div>
                    <BioWave bio={field.bio} isDark={isDark} />
                    <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 6 }}>
                      {[
                        { c: "#ff6b6b", l: "Phys", v: field.bio.physical.value },
                        { c: "#4ecdc4", l: "Emot", v: field.bio.emotional.value },
                        { c: "#45b7d1", l: "Intl", v: field.bio.intellectual.value },
                        { c: "#c084fc", l: "Intu", v: field.bio.intuitive.value },
                      ].map(x => (
                        <div key={x.l} style={{ textAlign: "center" }}>
                          <div style={{ width: 6, height: 6, borderRadius: 3, background: x.c, margin: "0 auto 2px" }} />
                          <div style={{ fontSize: 9, color: "var(--df-text-dim)" }}>{x.l}</div>
                          <div style={{ fontSize: 10, color: x.v > 0 ? x.c : "var(--df-text-dim)" }}>{(x.v * 100).toFixed(0)}%</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </Section>
            )}

            {/* Daily surface — collapsible */}
            <div style={{ background: "var(--df-surface)", border: `1.5px solid var(--df-border-warm)`, borderRadius: 8, marginBottom: 12, overflow: "hidden" }}>
              <button onClick={() => setShowDailyExpanded(!showDailyExpanded)} style={{
                width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "12px 14px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit",
              }}>
                <span style={{
                  fontSize: 10, letterSpacing: 2, color: "var(--df-gold)", opacity: 0.7,
                  ...(!daily && !showDailyExpanded ? { animation: "pulse 2s ease-in-out infinite" } : {}),
                }}>
                  {daily ? `\u25C8 SURFACE AREA: ${dayScore.score}/100` : "\u25C8 DAILY CHECK-IN"}
                </span>
                <span style={{ fontSize: 10, color: "var(--df-text-ghost)", transform: showDailyExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>{"\u25BC"}</span>
              </button>
              {showDailyExpanded && (
                <div style={{ padding: "0 14px 14px" }}>
                  {!daily ? (
                    <>
                      <div style={{ fontSize: 11, color: "var(--df-text-muted)", marginBottom: 12, lineHeight: 1.6 }}>Quick daily check-in {"\u2014"} how open were you to the unexpected today?</div>
                      {[
                        { label: "New or unfamiliar things you did today", val: nov, set: setNov, max: 4 },
                        { label: "Conversations with acquaintances or strangers", val: wt, set: setWt, max: 3 },
                        { label: "Conversations with close friends or family", val: st, set: setSt, max: 3 },
                      ].map(({ label, val, set, max }) => (
                        <div key={label} style={{ marginBottom: 10 }}>
                          <div style={{ fontSize: 11, color: "var(--df-text-secondary)", marginBottom: 4 }}>{label}</div>
                          <div style={{ display: "flex", gap: 5 }}>
                            {Array.from({ length: max + 1 }, (_, n) => (
                              <button key={n} onClick={() => set(n)} style={{
                                width: 34, height: 34, borderRadius: 5, fontSize: 12, fontFamily: "inherit",
                                background: val === n ? `${GOLD_HEX}15` : "var(--df-surface-alt)",
                                border: `1px solid ${val === n ? GOLD_HEX + "50" : "var(--df-border-input)"}`,
                                color: val === n ? "var(--df-gold)" : "var(--df-text-dim)", cursor: "pointer",
                              }}>{n === max ? `${max}+` : n}</button>
                            ))}
                          </div>
                        </div>
                      ))}
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                        <Toggle checked={yes} onChange={setYes} label="Said yes to something unexpected" />
                        <Toggle checked={noticed} onChange={setNoticed} label="Noticed something unusual" />
                        <Toggle checked={shared} onChange={setShared} label="Shared an idea publicly" />
                      </div>
                      <Btn onClick={submitDaily} color={pc} colorHex={pcHex} full>CALIBRATE</Btn>
                    </>
                  ) : (
                    <>
                      {dayScore.factors.map((f, i) => (
                        <div key={i} style={{ fontSize: 10, color: "var(--df-text-secondary)", padding: "3px 0" }}>
                          <span style={{ color: pc, marginRight: 6 }}>·</span>{f}
                        </div>
                      ))}
                      <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                        <Btn onClick={() => shareScoreCard(dayScore.score, dayScore.factors)} color={pc} colorHex={pcHex} small>SHARE SCORE</Btn>
                        <Btn onClick={() => { setDaily(null); setDayScore(null); }} dim small>RECALIBRATE</Btn>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Weekly drift report */}
            {(() => {
              const weekAgo = Date.now() - 7 * 86400000;
              const weekProbes = probeHistory.filter(p => p.timestamp > weekAgo);
              const weekEvents = events.filter(e => e.timestamp > weekAgo);
              if (weekProbes.length + weekEvents.length < 1) return null;

              const dayCounts = {};
              [...weekProbes, ...weekEvents].forEach(item => {
                const day = new Date(item.timestamp).toLocaleDateString(undefined, { weekday: 'short' });
                dayCounts[day] = (dayCounts[day] || 0) + 1;
              });
              const topDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0];

              const weekPatterns = analyzePatterns(weekEvents);
              const topPattern = weekPatterns.patterns[0];

              return (
                <Section title="WEEKLY DRIFT REPORT">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
                    <Stat label="PROBES" value={weekProbes.length} sub="this week" color={pc} />
                    <Stat label="EVENTS" value={weekEvents.length} sub="logged" color={pc} />
                    <Stat label="PEAK DAY" value={topDay?.[0] || "—"} sub={topDay ? `${topDay[1]} activity` : ""} color={pc} />
                  </div>
                  {topPattern && (
                    <div style={{ padding: "8px 10px", background: `${GOLD_HEX}08`, borderRadius: 4, fontSize: 10, color: "var(--df-text-secondary)", lineHeight: 1.6, border: `1px solid ${GOLD_HEX}12` }}>
                      <span style={{ color: pc, fontSize: 8, letterSpacing: 1, textTransform: "uppercase" }}>{topPattern.type}</span>
                      <span style={{ margin: "0 6px", color: "var(--df-text-ghost)" }}>{"\u00B7"}</span>
                      {topPattern.label}
                    </div>
                  )}
                </Section>
              );
            })()}

            {/* Feedback loop */}
            {(() => {
              const followed = probeHistory.filter(p => p.followed);
              const linked = events.filter(e => e.linkedProbeId);
              if (followed.length === 0 && linked.length === 0) return null;

              // Group by action type
              const byAction = {};
              followed.forEach(p => {
                const key = p.action.label;
                if (!byAction[key]) byAction[key] = { icon: p.action.icon, followed: 0, total: 0, outcomes: { positive: 0, negative: 0, neutral: 0 } };
                byAction[key].followed++;
              });
              probeHistory.forEach(p => {
                const key = p.action.label;
                if (!byAction[key]) byAction[key] = { icon: p.action.icon, followed: 0, total: 0, outcomes: { positive: 0, negative: 0, neutral: 0 } };
                byAction[key].total++;
              });
              linked.forEach(e => {
                const p = probeHistory.find(pr => pr.timestamp === e.linkedProbeId);
                if (p && byAction[p.action.label]) {
                  byAction[p.action.label].outcomes[e.polarity || "neutral"]++;
                }
              });

              return (
                <Section title="FEEDBACK LOOP">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                    <Stat label="FOLLOW-THROUGH" value={`${followed.length}/${probeHistory.length}`} sub={probeHistory.length > 0 ? `${(followed.length / probeHistory.length * 100).toFixed(0)}%` : ""} color={pc} />
                    <Stat label="LINKED OUTCOMES" value={linked.length} sub="events → probes" color={pc} />
                  </div>
                  {Object.entries(byAction).filter(([, v]) => v.followed > 0).map(([label, v]) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderBottom: `1px solid ${GOLD_HEX}12`, fontSize: 10 }}>
                      <span style={{ color: "var(--df-text-secondary)" }}>{v.icon} {label}</span>
                      <span style={{ color: "var(--df-text-dim)" }}>
                        {v.followed}/{v.total}
                        {v.outcomes.positive > 0 && <span style={{ color: "var(--df-accent)", marginLeft: 6 }}>+{v.outcomes.positive}</span>}
                        {v.outcomes.negative > 0 && <span style={{ color: "var(--df-negative)", marginLeft: 4 }}>-{v.outcomes.negative}</span>}
                      </span>
                    </div>
                  ))}
                </Section>
              );
            })()}

            {/* Activity Feed — merged timeline */}
            {(() => {
              const linkedEventIds = new Set();
              const followedProbes = probeHistory.filter(p => p.followed).slice(-20);
              const items = [];

              followedProbes.forEach(p => {
                const linkedEvts = events.filter(e => e.linkedProbeId === p.timestamp);
                linkedEvts.forEach(e => linkedEventIds.add(e.id));
                items.push({ type: "probe", data: p, linkedEvents: linkedEvts, ts: p.timestamp });
              });

              events.filter(e => !linkedEventIds.has(e.id)).forEach(e => {
                items.push({ type: "event", data: e, ts: e.timestamp });
              });

              try {
                const readings = JSON.parse(localStorage.getItem("df_df_readings") || "[]");
                readings.slice(-20).forEach(r => {
                  items.push({ type: "reading", data: r, ts: r.timestamp });
                });
              } catch {}

              items.sort((a, b) => b.ts - a.ts);
              const display = items.slice(0, 15);

              if (display.length === 0) return null;

              return (
                <>
                  <div style={{ fontSize: 10, color: "var(--df-gold)", opacity: 0.6, letterSpacing: 1, marginBottom: 6 }}>ACTIVITY FEED</div>
                  {display.map((item, i) => {
                    if (item.type === "reading") {
                      return (
                        <div key={`r-${item.data.readingId || i}`} style={{
                          padding: "7px 10px", marginBottom: 4,
                          borderLeft: "2px solid #C9A84C35",
                          background: "var(--df-surface)", borderRadius: "0 5px 5px 0",
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "var(--df-text-faint)", marginBottom: 1 }}>
                            <span style={{ color: "var(--df-gold)" }}>{"\u2727"} {item.data.spreadName}</span>
                            <span>{new Date(item.data.timestamp).toLocaleDateString()} {new Date(item.data.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                          <div style={{ fontSize: 10, color: "var(--df-text-secondary)" }}>
                            {item.data.cards.map(c => c.name).join(" \u00B7 ")}
                          </div>
                          {item.data.question && <div style={{ fontSize: 10, color: "var(--df-text-muted)", fontStyle: "italic", marginTop: 2 }}>"{item.data.question}"</div>}
                          {item.data.isCharged && <div style={{ fontSize: 9, color: "var(--df-gold)", marginTop: 2 }}>{"\u26A1"} Charged reading</div>}
                        </div>
                      );
                    }
                    if (item.type === "probe") {
                      return (
                        <div key={`p-${item.data.timestamp}`} style={{ marginBottom: 6 }}>
                          <div style={{
                            padding: "6px 10px", background: "var(--df-surface)", borderRadius: "5px",
                            borderLeft: `2px solid ${pColorsHex[item.data.polarity]}35`,
                          }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "var(--df-text-faint)", marginBottom: 2 }}>
                              <span style={{ color: pColors[item.data.polarity] }}>
                                {item.data.action.icon} {item.data.action.label} — {item.data.compassDir} {item.data.bearing}°
                              </span>
                              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <span style={{ color: "var(--df-warning)", opacity: 0.38 }}>{"\u2713"}</span>
                                {new Date(item.data.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            {item.data.intention && (
                              <div style={{ fontSize: 10, color: "var(--df-text-muted)", fontStyle: "italic" }}>"{item.data.intention}"</div>
                            )}
                          </div>
                          {item.linkedEvents.map(evt => (
                            <div key={evt.id} style={{
                              marginLeft: 16, padding: "5px 10px", marginTop: 2,
                              borderLeft: `2px solid ${pColorsHex[evt.polarity]}25`,
                              background: "var(--df-surface-alt)", borderRadius: "0 4px 4px 0",
                            }}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "var(--df-text-faint)" }}>
                                <span style={{ color: pColors[evt.polarity] }}>{evt.polarity === "positive" ? "\uFF0B" : evt.polarity === "negative" ? "\u2212" : "\u25CB"}{evt.category ? ` \u00B7 ${evt.category}` : ""}</span>
                                <span>{new Date(evt.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                              </div>
                              <div style={{ fontSize: 10, color: "var(--df-text-secondary)" }}>{evt.text}</div>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return (
                      <div key={`e-${item.data.id}`} style={{
                        padding: "7px 10px", marginBottom: 4,
                        borderLeft: `2px solid ${pColorsHex[item.data.polarity]}35`,
                        background: "var(--df-surface)", borderRadius: "0 5px 5px 0",
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "var(--df-text-faint)", marginBottom: 1 }}>
                          <span style={{ color: pColors[item.data.polarity] }}>{item.data.polarity === "positive" ? "\uFF0B" : item.data.polarity === "negative" ? "\u2212" : "\u25CB"}{item.data.category ? ` \u00B7 ${item.data.category}` : ""}</span>
                          <span>{new Date(item.data.timestamp).toLocaleDateString()} {new Date(item.data.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        <div style={{ fontSize: 10, color: "var(--df-text-secondary)" }}>{item.data.text}</div>
                      </div>
                    );
                  })}
                  {events.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <Btn onClick={() => { setEvents([]); save("df_events", []); }} dim small>CLEAR EVENTS</Btn>
                    </div>
                  )}
                </>
              );
            })()}
          </>
        )}

        {/* ═══ ARCANA TAB ═══ */}
        {view === "arcana" && (
          <ArcanaErrorBoundary>
            <ArcanaTab
              isPremium={isPremium}
              onUpgrade={() => setShowPremium(true)}
              field={field && entropy ? {
                polarity: field.polarity === "positive" ? field.magnitude : -field.magnitude,
                bearing: (entropy.chiSquared?.statistic ?? 0) % 360,
                anomalySigma: entropy.anomalyScore ?? 0,
                bearingElement: field.sign?.element || "",
                isCharged: (entropy.anomalyScore ?? 0) > 2,
                entropy: { shannon: entropy.shannon ?? 0 },
              } : null}
              initialQuestion={arcanaInitialQuestion}
              onInitialQuestionConsumed={() => setArcanaInitialQuestion(null)}
              sessionContext={sessionContext}
              onReadingSaved={(summary) => {
                setLastSavedReading(summary);
                // Auto-log reading as event and navigate to Scan
                const readingText = `Reading: ${summary.cards?.map(c => c.name).join(", ") || summary.spreadName}`;
                setEvents(prev => [...prev, { text: readingText, polarity: "neutral", category: "reading", linkedProbeId: null, timestamp: Date.now(), id: Date.now() }]);
              }}
            />
          </ArcanaErrorBoundary>
        )}


        {/* ═══ CONFIG TAB ═══ */}
        {view === "config" && (
          <>
            <Section title="YOUR BIRTH DATE">
              <div style={{ fontSize: 11, color: "var(--df-text-muted)", marginBottom: 12, lineHeight: 1.6 }}>
                Your birth date personalizes your natural rhythm cycles. Without it, the engine uses general patterns only.
              </div>
              {birthDate && (
                <div style={{ padding: "10px 14px", background: `${GOLD_HEX}08`, borderRadius: 6, marginBottom: 12, border: `1px solid ${GOLD_HEX}15` }}>
                  <div style={{ fontSize: 10, color: "var(--df-gold)", opacity: 0.55, marginBottom: 2 }}>CURRENT ANCHOR</div>
                  <div style={{ fontSize: 12, color: "var(--df-text)" }}>
                    {birthDate.toLocaleDateString()}
                    {birthLoc && <span style={{ color: "var(--df-text-muted)" }}> {"\u00B7"} {birthLoc}</span>}
                    {field?.sign && <span style={{ color: pc }}> {"\u00B7"} {field.sign.symbol} {field.sign.name}</span>}
                  </div>
                  {birthChart && (
                    <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                      <div>
                        <div style={{ fontSize: 9, color: "var(--df-text-faint)", letterSpacing: 1 }}>SUN</div>
                        <div style={{ fontSize: 11, color: pc }}>{birthChart.sunSign}</div>
                      </div>
                      {birthChart.moonSign && (
                        <div>
                          <div style={{ fontSize: 9, color: "var(--df-text-faint)", letterSpacing: 1 }}>MOON</div>
                          <div style={{ fontSize: 11, color: "var(--df-text-secondary)" }}>{birthChart.moonSign}</div>
                        </div>
                      )}
                      {birthChart.risingSign && (
                        <div>
                          <div style={{ fontSize: 9, color: "var(--df-text-faint)", letterSpacing: 1 }}>RISING</div>
                          <div style={{ fontSize: 11, color: "var(--df-text-secondary)" }}>{birthChart.risingSign}</div>
                        </div>
                      )}
                    </div>
                  )}
                  {birthChart && !birthChart.moonSign && (
                    <div style={{ fontSize: 10, color: "var(--df-text-faint)", marginTop: 4 }}>Add birth time + location for moon &amp; rising signs</div>
                  )}
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 9, color: "var(--df-gold)", opacity: 0.5, marginBottom: 3, letterSpacing: 1 }}>BIRTH DATE</div>
                  <input type="date" value={birthInput} onChange={e => setBirthInput(e.target.value)}
                    style={{ width: "100%", boxSizing: "border-box", background: "var(--df-surface-alt)", border: `1.5px solid ${GOLD_HEX}20`, borderRadius: 5, color: "var(--df-text)", padding: "8px 10px", fontSize: 11, fontFamily: "inherit" }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 9, color: "var(--df-gold)", opacity: 0.5, marginBottom: 3, letterSpacing: 1 }}>BIRTH TIME (optional)</div>
                  <input type="time" value={birthTime} onChange={e => setBirthTime(e.target.value)}
                    style={{ width: "100%", boxSizing: "border-box", background: "var(--df-surface-alt)", border: `1.5px solid ${GOLD_HEX}20`, borderRadius: 5, color: "var(--df-text)", padding: "8px 10px", fontSize: 11, fontFamily: "inherit" }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 9, color: "var(--df-gold)", opacity: 0.5, marginBottom: 3, letterSpacing: 1 }}>BIRTH LOCATION (optional)</div>
                  <input value={birthLoc} onChange={e => setBirthLoc(e.target.value)}
                    placeholder="City, Country"
                    style={{ width: "100%", boxSizing: "border-box", background: "var(--df-surface-alt)", border: `1.5px solid ${GOLD_HEX}20`, borderRadius: 5, color: "var(--df-text)", padding: "8px 10px", fontSize: 11, fontFamily: "inherit" }}
                  />
                </div>
                <Btn onClick={saveBirth} color={pcHex} full>SAVE</Btn>
              </div>
            </Section>

            <Section title="HOW IT WORKS">
              <div style={{ fontSize: 11, color: "var(--df-text-muted)", lineHeight: 1.7 }}>
                <p style={{ margin: "0 0 10px" }}>
                  <span style={{ color: pc }}>Entropy Engine</span> {"\u2014"} Reads random data from your device and analyzes it
                  for patterns. When the randomness deviates from what's expected, that's a signal.
                </p>
                <p style={{ margin: "0 0 10px" }}>
                  <span style={{ color: pc }}>Cycle Layer</span> {"\u2014"} Tracks your personal biorhythm cycles based on your
                  birth date, the current moon phase, and time-of-day energy windows.
                </p>
                <p style={{ margin: "0 0 10px" }}>
                  <span style={{ color: pc }}>Probe System</span> {"\u2014"} You set an intention, then fire a probe. The probe
                  reads the entropy field and gives you a compass direction and a suggested action.
                </p>
                <p style={{ margin: "0 0 10px" }}>
                  <span style={{ color: pc }}>Surface Area</span> {"\u2014"} Based on research into what makes people "lucky."
                  Tracks how open you are to new experiences, chance encounters, and the unexpected.
                </p>
                <p style={{ margin: 0 }}>
                  <span style={{ color: "var(--df-purple)" }}>The Loop</span> {"\u2014"} Notice {"\u2192"} Log {"\u2192"} Pattern {"\u2192"} Act {"\u2192"} Notice more.
                  The more you pay attention, the more you see. This tool helps train that muscle.
                </p>
              </div>
            </Section>

            {/* Account */}
            {supabaseConfigured && isAuthenticated && (
              <Section title="ACCOUNT">
                <div style={{ fontSize: 11, color: "var(--df-text-muted)", marginBottom: 8 }}>
                  {user?.email}
                  {isPremium && <span style={{ color: "var(--df-warning)", marginLeft: 8 }}>{"\u25C6"} PREMIUM</span>}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {isPremium ? (
                    <Btn onClick={async () => {
                      const res = await fetch('/api/create-portal-session', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${session.access_token}`,
                        },
                      });
                      const data = await res.json();
                      if (data.url) window.location.href = data.url;
                    }} color="#ffd93d" small>MANAGE SUBSCRIPTION</Btn>
                  ) : (
                    <Btn onClick={() => setShowPremium(true)} color="#ffd93d" small>UPGRADE TO PREMIUM</Btn>
                  )}
                  <Btn onClick={signOut} dim small>SIGN OUT</Btn>
                </div>
              </Section>
            )}

            <Section title="DATA">
              <div style={{ fontSize: 11, color: "var(--df-text-muted)", marginBottom: 8 }}>
                {events.length} events {"\u00B7"} {probeHistory.length} probes {"\u00B7"} {daily ? "Calibrated today" : "Not calibrated today"}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <Btn onClick={() => { setEvents([]); save("df_events", []); }} dim small>CLEAR EVENTS</Btn>
                <Btn onClick={() => { setProbeHistory([]); save("df_probes", []); }} dim small>CLEAR PROBES</Btn>
                <Btn onClick={() => { setBirthDate(null); save("df_birth", null); }} dim small>CLEAR BIRTH</Btn>
              </div>
            </Section>

            <div style={{ textAlign: "center", padding: "16px 0 4px", fontSize: 9, color: "var(--df-text-ghost)" }}>
              <a href="mailto:jordanaftermidnight@gmail.com" style={{ color: "var(--df-text-dim)", textDecoration: "none", letterSpacing: 1 }}>CONTACT</a>
              <span style={{ margin: "0 8px", opacity: 0.3 }}>{"\u00B7"}</span>
              <span style={{ letterSpacing: 1, fontSize: 9 }}>v2.0</span>
            </div>
          </>
        )}
      </div>

      {/* Nav */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "var(--df-nav-bg)", borderTop: `1px solid ${GOLD_HEX}20`,
        display: "flex", justifyContent: "center",
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        zIndex: 100,
      }}>
        <div style={{ display: "flex", maxWidth: 600, width: "100%", justifyContent: "space-around" }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setView(item.id); trackTabView(item.id); }} style={{
              flex: 1, padding: "10px 0 8px",
              background: view === item.id ? (isDark ? `${GOLD_HEX}08` : `${GOLD_HEX}0c`) : "transparent",
              border: "none", cursor: "pointer", outline: "none",
              borderTop: view === item.id ? `2px solid ${GOLD_HEX}80` : "2px solid transparent",
              transition: "background 0.2s",
            }}>
              <div style={{ fontSize: 15, color: view === item.id ? pc : "var(--df-nav-inactive)", transition: "color 0.2s" }}>{item.icon}</div>
              <div style={{ fontSize: 8, letterSpacing: 2, color: view === item.id ? pc : "var(--df-text-ghost)", marginTop: 2, transition: "color 0.2s" }}>{item.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Auth & Premium Modals */}
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      <PremiumModal isOpen={showPremium} onClose={() => setShowPremium(false)} triggerLocation="probe_limit" />
    </div>
  );
}
