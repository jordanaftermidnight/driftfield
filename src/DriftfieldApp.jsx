import { useState, useEffect, useCallback, useRef, Component } from "react";
import { shareProbeCard, shareScoreCard } from "./probeCard.js";
import { useAuth } from "./hooks/useAuth";
import { AuthModal } from "./components/auth/AuthModal";
import { PremiumModal } from "./components/auth/PremiumModal";
import { canFireProbe, hasFeature } from "./lib/premium";
import { trackAppOpen, trackTabView } from "./lib/analytics";
import { fullEntropyAnalysis } from "./lib/entropy";
import { biorhythm, lunarPhase, temporalGate, zodiacSign, calculateField } from "./lib/astro";
import { CompassRose } from "./components/CompassRose";
import { ArcanaTab } from "./components/ArcanaTab";

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
        <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>
          <p style={{ fontSize: 18, marginBottom: 12 }}>Something went wrong with the reading engine.</p>
          <button onClick={() => this.setState({ hasError: false })}
            style={{ background: 'none', border: '1px solid #C9A84C', color: '#C9A84C', padding: '8px 20px', cursor: 'pointer', fontFamily: 'inherit' }}>
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

function evaluateDecision(a, b) {
  const sc = (o) => {
    let s = 0, n = [];
    if (o.isNovel) { s += 25; n.push("Novel — expands possibility space"); } else { s += 5; n.push("Familiar — predictable"); }
    if (o.meetsNew) { s += 20; n.push("New people = new weak ties"); }
    if (o.crowd) { s += 10; n.push("Crowd exposure"); }
    if (o.reversible) { s += 15; n.push("Reversible — low risk"); } else { s += 5; n.push("Irreversible — higher stakes"); }
    if (o.opens) { s += 20; n.push("Opens future paths"); }
    if (o.closes) { s -= 10; n.push("Closes paths"); }
    if (o.gut === "excited") { s += 15; n.push("Intuition says yes"); }
    else if (o.gut === "anxious") { s += 10; n.push("Growth-edge anxiety"); }
    else if (o.gut === "dread") { s -= 5; n.push("Dread signal"); }
    else n.push("No intuition signal");
    return { score: s, notes: n };
  };
  const ra = sc(a), rb = sc(b), d = ra.score - rb.score;
  const verdict = Math.abs(d) < 10 ? "Near-equal. Flip a coin — both expand surface area."
    : d > 0 ? `Option A: +${d} serendipity potential.`
    : `Option B: +${Math.abs(d)} serendipity potential.`;
  return { a: ra, b: rb, diff: d, verdict };
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

function EntropyVis({ data, polarity }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width = canvas.offsetWidth;
    const h = canvas.height = 80;
    ctx.clearRect(0, 0, w, h);
    const color = polarity === "positive" ? [0, 229, 200] : [255, 60, 80];
    const barW = w / data.length;
    for (let i = 0; i < data.length; i++) {
      const val = data[i] / 255;
      const barH = val * h * 0.8;
      const alpha = 0.3 + val * 0.5;
      ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${alpha})`;
      ctx.fillRect(i * barW, h - barH, barW - 0.5, barH);
    }
    // Mean line
    const mean = [...data].reduce((a, b) => a + b, 0) / data.length;
    const meanY = h - (mean / 255) * h * 0.8;
    ctx.beginPath();
    ctx.moveTo(0, meanY);
    ctx.lineTo(w, meanY);
    ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},0.6)`;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.stroke();
  }, [data, polarity]);
  return <canvas ref={canvasRef} style={{ width: "100%", height: 80, display: "block", borderRadius: 4 }} />;
}

function BioWave({ bio }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !bio) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width = canvas.offsetWidth;
    const h = canvas.height = 70;
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
      ctx.strokeStyle = colors[ci] + "40";
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
    ctx.strokeStyle = "#ffffff15";
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 3]);
    ctx.stroke();
  }, [bio]);
  return <canvas ref={canvasRef} style={{ width: "100%", height: 70, display: "block" }} />;
}

// ═══════════════════════════════════════════
// UI HELPERS
// ═══════════════════════════════════════════

function Toggle({ checked, onChange, label }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 11, color: "#999" }}>
      <div onClick={() => onChange(!checked)} style={{
        width: 34, height: 18, borderRadius: 9, flexShrink: 0,
        background: checked ? "#00e5c825" : "#1a1a2e", border: `1px solid ${checked ? "#00e5c850" : "#2a2a45"}`,
        position: "relative", transition: "all 0.2s", cursor: "pointer",
      }}>
        <div style={{
          width: 12, height: 12, borderRadius: 6,
          background: checked ? "#00e5c8" : "#444", position: "absolute", top: 2,
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
      <div style={{ fontSize: 9, color: "#555", letterSpacing: 1, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 200, color: color || "#ccc" }}>{value}</div>
      {sub && <div style={{ fontSize: 8, color: "#444" }}>{sub}</div>}
    </div>
  );
}

function Section({ title, children, style: s }) {
  return (
    <div style={{ background: "#12121e", border: "1px solid #1e1e35", borderRadius: 8, padding: 14, marginBottom: 12, ...s }}>
      {title && <div style={{ fontSize: 9, letterSpacing: 2, color: "#555", marginBottom: 10 }}>{title}</div>}
      {children}
    </div>
  );
}

function Btn({ children, onClick, color = "#00e5c8", full, small, dim }) {
  return (
    <button onClick={onClick} style={{
      width: full ? "100%" : "auto",
      padding: small ? "5px 12px" : "9px 20px",
      borderRadius: 5, background: dim ? "transparent" : `${color}12`,
      border: `1px solid ${color}${dim ? "30" : "40"}`,
      color: dim ? "#555" : color,
      fontSize: small ? 9 : 10, letterSpacing: small ? 1 : 2,
      cursor: "pointer", fontFamily: "monospace", transition: "all 0.2s",
    }}>{children}</button>
  );
}

// ═══════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════

export default function DriftfieldApp() {
  const { isAuthenticated, user, profile, isPremium, signOut, supabaseConfigured } = useAuth();
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
  const [optA, setOptA] = useState({ label: "", isNovel: false, meetsNew: false, crowd: false, reversible: true, opens: false, closes: false, gut: "neutral" });
  const [optB, setOptB] = useState({ label: "", isNovel: false, meetsNew: false, crowd: false, reversible: true, opens: false, closes: false, gut: "neutral" });
  const [decResult, setDecResult] = useState(null);

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
    setEvents(prev => [...prev, { text: eventText.trim(), polarity: eventPol, category: eventCat.trim() || null, linkedProbeId: linkedProbeId || null, timestamp: Date.now(), id: Date.now() }]);
    setEventText(""); setEventCat(""); setLinkedProbeId(null);
  };

  const submitDaily = () => {
    const entry = { novelty: nov, weakTies: wt, strongTies: st, saidYes: yes, noticed, shared, date: new Date().toDateString() };
    setDaily(entry); setDayScore(scoreSurface(entry)); save("df_daily", entry);
  };

  const patterns = analyzePatterns(events);
  const pc = (field?.polarity === "positive" || !field) ? "#00e5c8" : "#ff3c50";
  const pColors = { positive: "#00e5c8", negative: "#ff3c50", neutral: "#7a7aff" };

  const navItems = [
    { id: "field", label: "SCAN", icon: "\u25C9" },
    { id: "probe", label: "PROBE", icon: "\u27D0" },
    { id: "arcana", label: "ARCANA", icon: "\u2727" },
    { id: "log", label: "LOG", icon: "\u25C8" },
    { id: "decide", label: "DECIDE", icon: "\u27C1" },
    { id: "config", label: "SETUP", icon: "\u2699" },
  ];

  if (!loaded) return <div style={{ background: "#0a0a12", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#333", fontFamily: "monospace" }}>Loading...</div>;

  return (
    <div style={{ background: "#0a0a12", minHeight: "100vh", color: "#c8c8d8", fontFamily: "'JetBrains Mono','Fira Code','Courier New',monospace" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "12px 14px 80px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 2 }}>
            <svg width="24" height="24" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
              <circle cx="120" cy="120" r="90" fill="none" stroke="#1a3a4a" strokeWidth="2" strokeDasharray="4 10"/>
              <circle cx="120" cy="120" r="55" fill="none" stroke="#0d2a35" strokeWidth="2"/>
              <path d="M120 120 L120 50" stroke="#00e5c8" strokeWidth="6" strokeLinecap="round"/>
              <path d="M120 50 Q132 68 126 80" stroke="#00e5c8" strokeWidth="4.5" fill="none" strokeLinecap="round"/>
              <circle cx="120" cy="120" r="8" fill="#00e5c8" opacity="0.5"/>
              <circle cx="120" cy="120" r="5" fill="#00e5c8"/>
            </svg>
            <h1 style={{ fontSize: 16, fontWeight: 300, letterSpacing: 4, color: "#d0d0e8", margin: 0 }}>
              DRIFTFIELD
            </h1>
          </div>
          <div style={{ fontSize: 7, color: "#00e5c8", letterSpacing: 3, opacity: 0.4 }}>
            ENTROPY-DRIVEN SERENDIPITY
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
            return <div style={{ fontSize: 8, color: "#ffd93d80", marginTop: 2, letterSpacing: 1 }}>● {streak}-DAY STREAK</div>;
          })()}
          {/* Auth button */}
          {supabaseConfigured && (
            <div style={{ marginTop: 6 }}>
              {isAuthenticated ? (
                <button onClick={signOut} style={{
                  background: "transparent", border: "1px solid #2a2a45", borderRadius: 4,
                  color: "#555", fontSize: 8, padding: "3px 10px", cursor: "pointer",
                  fontFamily: "monospace", letterSpacing: 1,
                }}>SIGN OUT</button>
              ) : (
                <button onClick={() => setShowAuth(true)} style={{
                  background: `${pc}12`, border: `1px solid ${pc}40`, borderRadius: 4,
                  color: pc, fontSize: 8, padding: "3px 10px", cursor: "pointer",
                  fontFamily: "monospace", letterSpacing: 1,
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
              <div style={{ padding: "12px 14px", marginBottom: 12, background: "#12121e", borderRadius: 5, border: "1px solid #1a1a2e" }}>
                <div style={{ fontSize: 11, color: "#999", lineHeight: 1.6 }}>
                  Welcome to Driftfield. Start by entering your birth date in <span style={{ color: pc, cursor: "pointer" }} onClick={() => setView("config")}>Setup</span>, then scan the field or fire a probe.
                </div>
              </div>
            )}

            {/* Compass */}
            <CompassRose
              bearing={entropy ? parseFloat(entropy.direction.angle.toFixed(1)) : 0}
              magnitude={field?.magnitude || 0}
              polarity={field?.polarity || "positive"}
            />

            <div style={{ textAlign: "center", marginTop: -4, marginBottom: 12 }}>
              <div style={{ fontSize: 32, fontWeight: 200, color: pc }}>
                {field ? (field.polarity === "positive" ? "+" : "−") + (field.magnitude * 100).toFixed(0) : "—"}
              </div>
              <div style={{ fontSize: 8, color: "#555", letterSpacing: 2 }}>COMPOSITE FIELD STRENGTH</div>
              {field?.resonance > 0.75 && (
                <div style={{ fontSize: 9, color: "#ffd93d", marginTop: 4, letterSpacing: 1 }}>
                  ◈ HIGH RESONANCE — optimal probe window
                </div>
              )}
              {field?.resonance > 0.6 && field?.resonance <= 0.75 && (
                <div style={{ fontSize: 9, color: "#ffd93d80", marginTop: 4, letterSpacing: 1 }}>
                  ◈ RISING — good conditions
                </div>
              )}
            </div>

            {/* Scan controls */}
            <div style={{ textAlign: "center", marginBottom: 14 }}>
              <Btn onClick={scanning ? stopScan : startScan} color={pc}>
                {scanning ? "◉ SCANNING LIVE" : "◈ SCAN FIELD"}
              </Btn>
            </div>

            {/* Signal readout */}
            {entropy && (
              <Section title="SIGNAL ANALYSIS">
                <div style={{ fontSize: 10, color: "#888", marginBottom: 8, lineHeight: 1.5 }}>
                  {entropy.anomalyScore > 0.3 ? "Strong signal detected — the noise is deviating from pure randomness." :
                   entropy.anomalyScore > 0.15 ? "Moderate signal — slight deviations from baseline randomness." :
                   "Baseline — the field is close to pure randomness right now."}
                </div>
                <EntropyVis data={entropy.rawData} polarity={field?.polarity} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 10 }}>
                  <Stat label="ENTROPY" value={entropy.shannon.toFixed(3)} sub="/ 8.000 bits" color={pc} />
                  <Stat label="DEVIATION" value={entropy.chi.normalized.toFixed(3)} sub="from expected" color={pc} />
                  <Stat label="ANOMALY" value={(entropy.anomalyScore * 100).toFixed(1) + "%"} sub={entropy.anomalyScore > 0.2 ? "SIGNAL" : "baseline"} color={entropy.anomalyScore > 0.2 ? "#ffd93d" : pc} />
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
              <Section title={`CYCLE LAYER${field.sign ? " · " + field.sign.symbol + " " + field.sign.name : ""}`}>
                {/* Lunar */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div>
                    <span style={{ fontSize: 20, marginRight: 8 }}>{field.lunar.symbol}</span>
                    <span style={{ fontSize: 11, color: "#bbb" }}>{field.lunar.name}</span>
                    <span style={{ fontSize: 9, color: "#555", marginLeft: 6 }}>Day {field.lunar.daysInCycle}</span>
                  </div>
                  <div style={{ fontSize: 11, color: pc }}>{(field.lunar.energy * 100).toFixed(0)}% energy</div>
                </div>
                <div style={{ fontSize: 10, color: "#777", marginBottom: 12, lineHeight: 1.5 }}>
                  {field.lunar.quality}
                </div>

                {/* Temporal gate */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: "#bbb" }}>{field.temporal.name}</span>
                  <span style={{ fontSize: 11, color: pc }}>{(field.temporal.energy * 100).toFixed(0)}% gate energy</span>
                </div>
                <div style={{ fontSize: 10, color: "#777", marginBottom: 12, lineHeight: 1.5 }}>
                  {field.temporal.quality}
                </div>

                {/* Biorhythm */}
                {field.bio && (
                  <>
                    <div style={{ fontSize: 9, color: "#555", letterSpacing: 1, marginBottom: 4 }}>BIORHYTHM · 60-DAY WINDOW</div>
                    <BioWave bio={field.bio} />
                    <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 6 }}>
                      {[
                        { c: "#ff6b6b", l: "Phys", v: field.bio.physical.value },
                        { c: "#4ecdc4", l: "Emot", v: field.bio.emotional.value },
                        { c: "#45b7d1", l: "Intl", v: field.bio.intellectual.value },
                        { c: "#c084fc", l: "Intu", v: field.bio.intuitive.value },
                      ].map(x => (
                        <div key={x.l} style={{ textAlign: "center" }}>
                          <div style={{ width: 6, height: 6, borderRadius: 3, background: x.c, margin: "0 auto 2px" }} />
                          <div style={{ fontSize: 8, color: "#555" }}>{x.l}</div>
                          <div style={{ fontSize: 9, color: x.v > 0 ? x.c : "#555" }}>{(x.v * 100).toFixed(0)}%</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </Section>
            )}

            {/* Daily surface */}
            {!daily ? (
              <Section title="DAILY SURFACE AREA">
                <div style={{ fontSize: 10, color: "#777", marginBottom: 12 }}>Quick daily check-in — how open were you to the unexpected today?</div>
                {[
                  { label: "New or unfamiliar things you did today", val: nov, set: setNov, max: 4 },
                  { label: "Conversations with acquaintances or strangers", val: wt, set: setWt, max: 3 },
                  { label: "Conversations with close friends or family", val: st, set: setSt, max: 3 },
                ].map(({ label, val, set, max }) => (
                  <div key={label} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 10, color: "#888", marginBottom: 4 }}>{label}</div>
                    <div style={{ display: "flex", gap: 5 }}>
                      {Array.from({ length: max + 1 }, (_, n) => (
                        <button key={n} onClick={() => set(n)} style={{
                          width: 32, height: 32, borderRadius: 4, fontSize: 12, fontFamily: "monospace",
                          background: val === n ? `${pc}20` : "#0a0a16",
                          border: `1px solid ${val === n ? pc + "50" : "#2a2a45"}`,
                          color: val === n ? pc : "#555", cursor: "pointer",
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
                <Btn onClick={submitDaily} color={pc} full>CALIBRATE</Btn>
              </Section>
            ) : (
              <Section title={`SURFACE AREA: ${dayScore.score}/100`}>
                {dayScore.factors.map((f, i) => (
                  <div key={i} style={{ fontSize: 10, color: "#888", padding: "3px 0" }}>
                    <span style={{ color: pc, marginRight: 6 }}>·</span>{f}
                  </div>
                ))}
                <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                  <Btn onClick={() => shareScoreCard(dayScore.score, dayScore.factors)} color={pc} small>SHARE SCORE</Btn>
                  <Btn onClick={() => { setDaily(null); setDayScore(null); }} dim small>RECALIBRATE</Btn>
                </div>
              </Section>
            )}

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
                    <div style={{ padding: "8px 10px", background: `${pc}08`, borderRadius: 4, fontSize: 10, color: "#888", lineHeight: 1.5 }}>
                      <span style={{ color: pc, fontSize: 8, letterSpacing: 1, textTransform: "uppercase" }}>{topPattern.type}</span>
                      <span style={{ margin: "0 6px", color: "#333" }}>·</span>
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
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderBottom: "1px solid #1a1a2e", fontSize: 9 }}>
                      <span style={{ color: "#888" }}>{v.icon} {label}</span>
                      <span style={{ color: "#555" }}>
                        {v.followed}/{v.total}
                        {v.outcomes.positive > 0 && <span style={{ color: "#00e5c8", marginLeft: 6 }}>+{v.outcomes.positive}</span>}
                        {v.outcomes.negative > 0 && <span style={{ color: "#ff3c50", marginLeft: 4 }}>-{v.outcomes.negative}</span>}
                      </span>
                    </div>
                  ))}
                </Section>
              );
            })()}
          </>
        )}

        {/* ═══ PROBE TAB ═══ */}
        {view === "probe" && (
          <>
            <Section title="ENTROPY PROBE">
              <div style={{ fontSize: 10, color: "#777", marginBottom: 12, lineHeight: 1.6 }}>
                Set an intention — a question or curiosity. The probe reads the entropy field
                and gives you a direction and an action to follow.
              </div>
              <textarea
                value={intention}
                onChange={e => setIntention(e.target.value)}
                placeholder="Set your intention... What are you looking for? What do you want to find?"
                style={{
                  width: "100%", boxSizing: "border-box", minHeight: 60, resize: "vertical",
                  background: "#0a0a16", border: "1px solid #2a2a45", borderRadius: 4,
                  color: "#c8c8d8", padding: "10px 12px", fontSize: 11, fontFamily: "monospace",
                  marginBottom: 10,
                }}
              />
              {field?.resonance > 0.7 && (
                <div style={{ fontSize: 9, color: "#ffd93d80", marginBottom: 8, textAlign: "center" }}>
                  ◈ Field resonance is high
                </div>
              )}
              <Btn onClick={() => {
                if (supabaseConfigured && !isAuthenticated) { setShowAuth(true); return; }
                fireProbe();
              }} color={pc} full>⟐ FIRE PROBE</Btn>
            </Section>

            {probe && (
              <>
                <Section style={{ borderColor: `${pColors[probe.polarity]}25`, boxShadow: `0 0 30px ${pColors[probe.polarity]}08` }}>
                  <CompassRose bearing={parseFloat(probe.bearing)} magnitude={probe.strength} polarity={probe.polarity} />

                  <div style={{ textAlign: "center", marginTop: 4 }}>
                    <div style={{ fontSize: 24, marginBottom: 4 }}>{probe.action.icon}</div>
                    <div style={{ fontSize: 14, color: pColors[probe.polarity], fontWeight: 600, letterSpacing: 2 }}>
                      {probe.action.label.toUpperCase()}
                    </div>
                    <div style={{ fontSize: 11, color: "#999", marginTop: 4, lineHeight: 1.5, maxWidth: 400, margin: "4px auto 0" }}>
                      {probe.action.desc}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 14, paddingTop: 12, borderTop: "1px solid #1a1a2e" }}>
                    <Stat label="BEARING" value={`${probe.compassDir}`} sub={`${probe.bearing}°`} color={pColors[probe.polarity]} />
                    <Stat label="POLARITY" value={probe.polarity === "positive" ? "＋" : "−"} sub={probe.polarity} color={pColors[probe.polarity]} />
                    <Stat label="SIGNAL" value={`${(probe.strength * 100).toFixed(0)}%`} sub={probe.confidence} color={probe.strength > 0.2 ? "#ffd93d" : "#555"} />
                  </div>

                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #1a1a2e" }}>
                    <div style={{ fontSize: 8, color: "#444", letterSpacing: 1, marginBottom: 4 }}>ENTROPY DETAIL</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 4 }}>
                      {Object.entries(probe.entropyDetail).map(([k, v]) => (
                        <div key={k} style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 10, color: "#999" }}>{v}</div>
                          <div style={{ fontSize: 7, color: "#444" }}>{k.toUpperCase()}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Section>

                {probe.intention && (
                  <Section>
                    <div style={{ fontSize: 9, color: "#555", letterSpacing: 1, marginBottom: 4 }}>INTENTION</div>
                    <div style={{ fontSize: 11, color: "#888", fontStyle: "italic" }}>"{probe.intention}"</div>
                  </Section>
                )}

                <div style={{ textAlign: "center", marginBottom: 12, display: "flex", justifyContent: "center", gap: 8 }}>
                  <Btn onClick={() => shareProbeCard(probe)} color={pColors[probe.polarity]} small>
                    SHARE PROBE
                  </Btn>
                  {probe.followed ? (
                    <Btn color={pColors[probe.polarity]} small dim>✓ DID IT</Btn>
                  ) : (
                    <Btn onClick={() => markProbeFollowed(probe.timestamp)} color="#ffd93d" small>
                      DID IT
                    </Btn>
                  )}
                </div>
              </>
            )}

            {/* Probe history */}
            {probeHistory.length > 0 && (
              <Section title={`PROBE HISTORY · ${probeHistory.length}`}>
                {[...probeHistory].reverse().slice(0, 10).map((p, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "1px solid #1a1a2e", fontSize: 10 }}>
                    <div>
                      <span style={{ color: pColors[p.polarity], marginRight: 6 }}>{p.action.icon}</span>
                      <span style={{ color: "#888" }}>{p.action.label}</span>
                      <span style={{ color: "#444", marginLeft: 6 }}>{p.compassDir} {p.bearing}°</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {p.followed ? (
                        <span style={{ fontSize: 8, color: "#ffd93d60" }}>✓</span>
                      ) : (
                        <button onClick={() => markProbeFollowed(p.timestamp)} style={{
                          background: "transparent", border: "1px solid #ffd93d30", borderRadius: 3,
                          color: "#ffd93d", fontSize: 7, padding: "2px 6px", cursor: "pointer",
                          fontFamily: "monospace", letterSpacing: 1,
                        }}>DID IT</button>
                      )}
                      <span style={{ color: "#333", fontSize: 8 }}>{new Date(p.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  </div>
                ))}
              </Section>
            )}
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
            />
          </ArcanaErrorBoundary>
        )}

        {/* ═══ LOG TAB ═══ */}
        {view === "log" && (
          <>
            <Section title="LOG SYNCHRONICITY">
              <div style={{ fontSize: 10, color: "#666", marginBottom: 10 }}>
                Coincidences, unexpected encounters, repeating numbers, meaningful accidents, déjà vu.
              </div>
              <input value={eventText} onChange={e => setEventText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addEvent()}
                placeholder="What happened?"
                style={{ width: "100%", boxSizing: "border-box", background: "#0a0a16", border: "1px solid #2a2a45", borderRadius: 4, color: "#c8c8d8", padding: "9px 11px", fontSize: 11, fontFamily: "monospace", marginBottom: 8 }}
              />
              <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 8, color: "#444", marginBottom: 3 }}>POLARITY</div>
                  <div style={{ display: "flex", gap: 3 }}>
                    {["positive", "negative", "neutral"].map(p => (
                      <button key={p} onClick={() => setEventPol(p)} style={{
                        padding: "4px 10px", borderRadius: 3, fontSize: 9,
                        background: eventPol === p ? `${pColors[p]}20` : "#0a0a16",
                        border: `1px solid ${eventPol === p ? pColors[p] + "50" : "#2a2a45"}`,
                        color: eventPol === p ? pColors[p] : "#555", cursor: "pointer", fontFamily: "monospace",
                      }}>{p === "positive" ? "＋" : p === "negative" ? "−" : "○"}</button>
                    ))}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 100 }}>
                  <div style={{ fontSize: 8, color: "#444", marginBottom: 3 }}>CATEGORY</div>
                  <input value={eventCat} onChange={e => setEventCat(e.target.value)}
                    placeholder="work, social, creative..."
                    style={{ width: "100%", boxSizing: "border-box", background: "#0a0a16", border: "1px solid #2a2a45", borderRadius: 3, color: "#c8c8d8", padding: "4px 8px", fontSize: 9, fontFamily: "monospace" }}
                  />
                </div>
              </div>
              {/* Link to recent probe */}
              {(() => {
                const recent = probeHistory.filter(p => Date.now() - p.timestamp < 86400000);
                if (recent.length === 0) return null;
                return (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 8, color: "#444", marginBottom: 4, letterSpacing: 1 }}>LINK TO PROBE (optional)</div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {recent.slice(-5).reverse().map(p => (
                        <button key={p.timestamp} onClick={() => setLinkedProbeId(linkedProbeId === p.timestamp ? null : p.timestamp)} style={{
                          padding: "3px 8px", borderRadius: 3, fontSize: 8,
                          background: linkedProbeId === p.timestamp ? `${pColors[p.polarity]}20` : "#0a0a16",
                          border: `1px solid ${linkedProbeId === p.timestamp ? pColors[p.polarity] + "50" : "#2a2a45"}`,
                          color: linkedProbeId === p.timestamp ? pColors[p.polarity] : "#555",
                          cursor: "pointer", fontFamily: "monospace",
                        }}>
                          {p.action.icon} {p.action.label} · {new Date(p.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}
              <Btn onClick={addEvent} color={pc} full>LOG</Btn>
            </Section>

            {/* Patterns */}
            {patterns.patterns.length > 0 && (
              <Section title="DETECTED PATTERNS">
                {patterns.patterns.map((p, i) => (
                  <div key={i} style={{ padding: "8px 0", borderBottom: i < patterns.patterns.length - 1 ? "1px solid #1a1a2e" : "none" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 8, color: pc, letterSpacing: 1, textTransform: "uppercase" }}>{p.type}</span>
                      <span style={{ fontSize: 8, color: "#444" }}>{(p.strength * 100).toFixed(0)}%</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#bbb", marginTop: 2 }}>{p.label}</div>
                    <div style={{ fontSize: 10, color: "#777", marginTop: 2, lineHeight: 1.4 }}>{p.suggestion}</div>
                  </div>
                ))}
              </Section>
            )}

            {/* Drift Timeline */}
            <div style={{ fontSize: 9, color: "#444", letterSpacing: 1, marginBottom: 6 }}>DRIFT TIMELINE</div>
            {events.length === 0 && probeHistory.filter(p => p.followed).length === 0 ? (
              <div style={{ color: "#2a2a40", fontSize: 10, textAlign: "center", padding: 24 }}>No events yet. Start noticing.</div>
            ) : (() => {
              // Build merged timeline: followed probes + all events
              const linkedEventIds = new Set();
              const followedProbes = probeHistory.filter(p => p.followed).slice(-20);
              const items = [];

              // Add probes with their linked events nested
              followedProbes.forEach(p => {
                const linkedEvts = events.filter(e => e.linkedProbeId === p.timestamp);
                linkedEvts.forEach(e => linkedEventIds.add(e.id));
                items.push({ type: "probe", data: p, linkedEvents: linkedEvts, ts: p.timestamp });
              });

              // Add unlinked events
              events.filter(e => !linkedEventIds.has(e.id)).forEach(e => {
                items.push({ type: "event", data: e, ts: e.timestamp });
              });

              // Add arcana readings from localStorage
              try {
                const readings = JSON.parse(localStorage.getItem("df_df_readings") || "[]");
                readings.slice(-20).forEach(r => {
                  items.push({ type: "reading", data: r, ts: r.timestamp });
                });
              } catch {}


              items.sort((a, b) => b.ts - a.ts);

              return items.slice(0, 25).map((item, i) => {
                if (item.type === "reading") {
                  return (
                    <div key={`r-${item.data.readingId}`} style={{
                      padding: "7px 10px", marginBottom: 4,
                      borderLeft: "2px solid #C9A84C35",
                      background: "#12121e", borderRadius: "0 5px 5px 0",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "#444", marginBottom: 1 }}>
                        <span style={{ color: "#C9A84C" }}>{"\u2727"} {item.data.spreadName}</span>
                        <span>{new Date(item.data.timestamp).toLocaleDateString()} {new Date(item.data.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <div style={{ fontSize: 10, color: "#999" }}>
                        {item.data.cards.map(c => c.name).join(" \u00B7 ")}
                      </div>
                      {item.data.question && <div style={{ fontSize: 9, color: "#666", fontStyle: "italic", marginTop: 2 }}>"{item.data.question}"</div>}
                      {item.data.isCharged && <div style={{ fontSize: 8, color: "#C9A84C", marginTop: 2 }}>{"\u26A1"} Charged reading</div>}
                    </div>
                  );
                }
                if (item.type === "probe") {
                  return (
                    <div key={`p-${item.data.timestamp}`} style={{ marginBottom: 6 }}>
                      <div style={{
                        padding: "6px 10px", background: "#12121e", borderRadius: "5px",
                        borderLeft: `2px solid ${pColors[item.data.polarity]}35`,
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "#444", marginBottom: 2 }}>
                          <span style={{ color: pColors[item.data.polarity] }}>
                            {item.data.action.icon} {item.data.action.label} — {item.data.compassDir} {item.data.bearing}°
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{ color: "#ffd93d60" }}>✓</span>
                            {new Date(item.data.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        {item.data.intention && (
                          <div style={{ fontSize: 9, color: "#666", fontStyle: "italic" }}>"{item.data.intention}"</div>
                        )}
                      </div>
                      {item.linkedEvents.map(evt => (
                        <div key={evt.id} style={{
                          marginLeft: 16, padding: "5px 10px", marginTop: 2,
                          borderLeft: `2px solid ${pColors[evt.polarity]}25`,
                          background: "#0e0e1a", borderRadius: "0 4px 4px 0",
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "#444" }}>
                            <span style={{ color: pColors[evt.polarity] }}>{evt.polarity === "positive" ? "＋" : evt.polarity === "negative" ? "−" : "○"}{evt.category ? ` · ${evt.category}` : ""}</span>
                            <span>{new Date(evt.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                          <div style={{ fontSize: 10, color: "#999" }}>{evt.text}</div>
                        </div>
                      ))}
                    </div>
                  );
                }
                return (
                  <div key={`e-${item.data.id}`} style={{
                    padding: "7px 10px", marginBottom: 4,
                    borderLeft: `2px solid ${pColors[item.data.polarity]}35`,
                    background: "#12121e", borderRadius: "0 5px 5px 0",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "#444", marginBottom: 1 }}>
                      <span style={{ color: pColors[item.data.polarity] }}>{item.data.polarity === "positive" ? "＋" : item.data.polarity === "negative" ? "−" : "○"}{item.data.category ? ` · ${item.data.category}` : ""}</span>
                      <span>{new Date(item.data.timestamp).toLocaleDateString()} {new Date(item.data.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <div style={{ fontSize: 10, color: "#999" }}>{item.data.text}</div>
                  </div>
                );
              });
            })()}
            {events.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <Btn onClick={() => { setEvents([]); save("df_events", []); }} dim small>CLEAR EVENTS</Btn>
              </div>
            )}
          </>
        )}

        {/* ═══ DECIDE TAB ═══ */}
        {view === "decide" && (
          <>
            <Section title="DECISION EVALUATOR">
              <div style={{ fontSize: 10, color: "#666", marginBottom: 12 }}>
                Compare two choices — which one opens you up to more possibility?
              </div>
              {[
                { label: "OPTION A", opt: optA, set: setOptA, color: "#45b7d1" },
                { label: "OPTION B", opt: optB, set: setOptB, color: "#c084fc" },
              ].map(({ label, opt, set, color }) => (
                <div key={label} style={{ marginBottom: 14, padding: 10, border: `1px solid ${color}20`, borderRadius: 5, background: `${color}05` }}>
                  <div style={{ fontSize: 9, color, letterSpacing: 1, marginBottom: 6 }}>{label}</div>
                  <input value={opt.label} onChange={e => set({ ...opt, label: e.target.value })}
                    placeholder="Describe..."
                    style={{ width: "100%", boxSizing: "border-box", background: "#0a0a16", border: "1px solid #2a2a45", borderRadius: 3, color: "#c8c8d8", padding: "7px 9px", fontSize: 10, fontFamily: "monospace", marginBottom: 8 }}
                  />
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <Toggle checked={opt.isNovel} onChange={v => set({ ...opt, isNovel: v })} label="New / unfamiliar" />
                    <Toggle checked={opt.meetsNew} onChange={v => set({ ...opt, meetsNew: v })} label="Meet new people" />
                    <Toggle checked={opt.crowd} onChange={v => set({ ...opt, crowd: v })} label="Around strangers" />
                    <Toggle checked={opt.reversible} onChange={v => set({ ...opt, reversible: v })} label="Reversible" />
                    <Toggle checked={opt.opens} onChange={v => set({ ...opt, opens: v })} label="Opens possibilities" />
                    <Toggle checked={opt.closes} onChange={v => set({ ...opt, closes: v })} label="Closes paths" />
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 8, color: "#444", marginBottom: 3 }}>GUT</div>
                    <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                      {["excited", "anxious", "neutral", "dread"].map(f => (
                        <button key={f} onClick={() => set({ ...opt, gut: f })} style={{
                          padding: "3px 9px", borderRadius: 3, fontSize: 8,
                          background: opt.gut === f ? `${color}20` : "#0a0a16",
                          border: `1px solid ${opt.gut === f ? color + "50" : "#2a2a45"}`,
                          color: opt.gut === f ? color : "#555", cursor: "pointer", fontFamily: "monospace", textTransform: "capitalize",
                        }}>{f}</button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              <Btn onClick={() => setDecResult(evaluateDecision(optA, optB))} color={pc} full>EVALUATE</Btn>
            </Section>

            {decResult && (
              <Section>
                <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                  {[
                    { l: optA.label || "A", s: decResult.a.score, c: "#45b7d1" },
                    { l: optB.label || "B", s: decResult.b.score, c: "#c084fc" },
                  ].map(x => (
                    <div key={x.l} style={{ flex: 1, textAlign: "center" }}>
                      <div style={{ fontSize: 26, fontWeight: 200, color: x.c }}>{x.s}</div>
                      <div style={{ fontSize: 8, color: "#555" }}>{x.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: "8px 12px", background: `${pc}10`, borderRadius: 4, fontSize: 11, color: "#bbb", lineHeight: 1.5, marginBottom: 10 }}>
                  {decResult.verdict}
                </div>
                {[{ l: "A", n: decResult.a.notes, c: "#45b7d1" }, { l: "B", n: decResult.b.notes, c: "#c084fc" }].map(x => (
                  <div key={x.l} style={{ marginBottom: 6 }}>
                    <div style={{ fontSize: 8, color: x.c, letterSpacing: 1, marginBottom: 2 }}>OPTION {x.l}</div>
                    {x.n.map((n, i) => <div key={i} style={{ fontSize: 9, color: "#777", padding: "1px 0" }}><span style={{ color: x.c + "60", marginRight: 5 }}>·</span>{n}</div>)}
                  </div>
                ))}
              </Section>
            )}
          </>
        )}

        {/* ═══ CONFIG TAB ═══ */}
        {view === "config" && (
          <>
            <Section title="YOUR BIRTH DATE">
              <div style={{ fontSize: 10, color: "#777", marginBottom: 12, lineHeight: 1.5 }}>
                Your birth date personalizes your natural rhythm cycles. Without it, the engine uses general patterns only.
              </div>
              {birthDate && (
                <div style={{ padding: "8px 12px", background: `${pc}08`, borderRadius: 4, marginBottom: 12 }}>
                  <div style={{ fontSize: 9, color: "#555", marginBottom: 2 }}>CURRENT ANCHOR</div>
                  <div style={{ fontSize: 12, color: "#bbb" }}>
                    {birthDate.toLocaleDateString()}
                    {birthLoc && <span style={{ color: "#666" }}> · {birthLoc}</span>}
                    {field?.sign && <span style={{ color: pc }}> · {field.sign.symbol} {field.sign.name}</span>}
                  </div>
                  {birthChart && (
                    <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                      <div>
                        <div style={{ fontSize: 7, color: "#444", letterSpacing: 1 }}>SUN</div>
                        <div style={{ fontSize: 11, color: pc }}>{birthChart.sunSign}</div>
                      </div>
                      {birthChart.moonSign && (
                        <div>
                          <div style={{ fontSize: 7, color: "#444", letterSpacing: 1 }}>MOON</div>
                          <div style={{ fontSize: 11, color: "#aaa" }}>{birthChart.moonSign}</div>
                        </div>
                      )}
                      {birthChart.risingSign && (
                        <div>
                          <div style={{ fontSize: 7, color: "#444", letterSpacing: 1 }}>RISING</div>
                          <div style={{ fontSize: 11, color: "#aaa" }}>{birthChart.risingSign}</div>
                        </div>
                      )}
                    </div>
                  )}
                  {birthChart && !birthChart.moonSign && (
                    <div style={{ fontSize: 8, color: "#444", marginTop: 4 }}>Add birth time + location for moon &amp; rising signs</div>
                  )}
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 8, color: "#444", marginBottom: 3 }}>BIRTH DATE</div>
                  <input type="date" value={birthInput} onChange={e => setBirthInput(e.target.value)}
                    style={{ width: "100%", boxSizing: "border-box", background: "#0a0a16", border: "1px solid #2a2a45", borderRadius: 3, color: "#c8c8d8", padding: "7px 10px", fontSize: 11, fontFamily: "monospace" }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 8, color: "#444", marginBottom: 3 }}>BIRTH TIME (optional)</div>
                  <input type="time" value={birthTime} onChange={e => setBirthTime(e.target.value)}
                    style={{ width: "100%", boxSizing: "border-box", background: "#0a0a16", border: "1px solid #2a2a45", borderRadius: 3, color: "#c8c8d8", padding: "7px 10px", fontSize: 11, fontFamily: "monospace" }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 8, color: "#444", marginBottom: 3 }}>BIRTH LOCATION (optional)</div>
                  <input value={birthLoc} onChange={e => setBirthLoc(e.target.value)}
                    placeholder="City, Country"
                    style={{ width: "100%", boxSizing: "border-box", background: "#0a0a16", border: "1px solid #2a2a45", borderRadius: 3, color: "#c8c8d8", padding: "7px 10px", fontSize: 11, fontFamily: "monospace" }}
                  />
                </div>
                <Btn onClick={saveBirth} color={pc} full>SAVE</Btn>
              </div>
            </Section>

            <Section title="HOW IT WORKS">
              <div style={{ fontSize: 10, color: "#777", lineHeight: 1.6 }}>
                <p style={{ margin: "0 0 8px" }}>
                  <span style={{ color: pc }}>Entropy Engine</span> — Reads random data from your device and analyzes it
                  for patterns. When the randomness deviates from what's expected, that's a signal.
                </p>
                <p style={{ margin: "0 0 8px" }}>
                  <span style={{ color: pc }}>Cycle Layer</span> — Tracks your personal biorhythm cycles based on your
                  birth date, the current moon phase, and time-of-day energy windows.
                </p>
                <p style={{ margin: "0 0 8px" }}>
                  <span style={{ color: pc }}>Probe System</span> — You set an intention, then fire a probe. The probe
                  reads the entropy field and gives you a compass direction and a suggested action.
                </p>
                <p style={{ margin: "0 0 8px" }}>
                  <span style={{ color: pc }}>Surface Area</span> — Based on research into what makes people "lucky."
                  Tracks how open you are to new experiences, chance encounters, and the unexpected.
                </p>
                <p style={{ margin: 0 }}>
                  <span style={{ color: "#c084fc" }}>The Loop</span> — Notice → Log → Pattern → Act → Notice more.
                  The more you pay attention, the more you see. This tool helps train that muscle.
                </p>
              </div>
            </Section>

            {/* Account */}
            {supabaseConfigured && isAuthenticated && (
              <Section title="ACCOUNT">
                <div style={{ fontSize: 10, color: "#777", marginBottom: 8 }}>
                  {user?.email}
                  {isPremium && <span style={{ color: "#ffd93d", marginLeft: 8 }}>◆ PREMIUM</span>}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {isPremium ? (
                    <Btn onClick={async () => {
                      const res = await fetch('/api/create-portal-session', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ customerId: profile?.stripe_customer_id }),
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
              <div style={{ fontSize: 10, color: "#777", marginBottom: 8 }}>
                {events.length} events · {probeHistory.length} probes · {daily ? "Calibrated today" : "Not calibrated today"}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <Btn onClick={() => { setEvents([]); save("df_events", []); }} dim small>Clear Events</Btn>
                <Btn onClick={() => { setProbeHistory([]); save("df_probes", []); }} dim small>Clear Probes</Btn>
                <Btn onClick={() => { setBirthDate(null); save("df_birth", null); }} dim small>Clear Birth</Btn>
              </div>
            </Section>

            <div style={{ textAlign: "center", padding: "12px 0 4px", fontSize: 9, color: "#2a2a40" }}>
              <a href="mailto:jordanaftermidnight@gmail.com" style={{ color: "#3a3a55", textDecoration: "none", letterSpacing: 1 }}>CONTACT</a>
            </div>
          </>
        )}
      </div>

      {/* Nav */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "#0a0a12ee", borderTop: "1px solid #1a1a2e",
        display: "flex", justifyContent: "center",
        backdropFilter: "blur(10px)",
      }}>
        <div style={{ display: "flex", maxWidth: 600, width: "100%", justifyContent: "space-around" }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setView(item.id); trackTabView(item.id); }} style={{
              flex: 1, padding: "9px 0 7px", background: "transparent",
              border: "none", cursor: "pointer",
              borderTop: view === item.id ? `2px solid ${pc}` : "2px solid transparent",
            }}>
              <div style={{ fontSize: 14, color: view === item.id ? pc : "#2a2a40" }}>{item.icon}</div>
              <div style={{ fontSize: 6, letterSpacing: 2, color: view === item.id ? pc : "#333", marginTop: 1 }}>{item.label}</div>
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
