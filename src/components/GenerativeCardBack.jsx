import { useRef, useEffect, memo } from "react";

// Deterministic PRNG (mulberry32)
function createRng(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function fieldToSeed(field) {
  if (!field) return 42;
  return Math.floor(
    (field.bearing || 0) * 1000 +
      ((field.polarity || 0) + 1) * 5000 +
      (field.anomalySigma || 0) * 100 +
      (field.shannon || field.entropy?.shannon || 0) * 10000
  );
}

export const GenerativeCardBack = memo(function GenerativeCardBack({
  width = 80,
  height,
  field,
}) {
  const h = height || Math.round(width * 1.56);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    const seed = fieldToSeed(field);
    const rng = createRng(seed);

    const cx = width / 2;
    const cy = h / 2;
    const r = Math.min(width, h) * 0.35;

    // Polarity shifts gold hue (warm when positive, cool when negative)
    const pol = field?.polarity || 0;
    const gR = Math.max(0, Math.min(255, 201 + Math.round(pol * 25)));
    const gG = Math.max(0, Math.min(255, 168 - Math.round(Math.abs(pol) * 12)));
    const gB = Math.max(0, Math.min(255, 76 - Math.round(pol * 25)));
    const gold = (a) => `rgba(${gR},${gG},${gB},${a})`;

    // ── Background ──────────────────────────────────────────────
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(width, h));
    grad.addColorStop(0, "#16213e");
    grad.addColorStop(0.6, "#141a30");
    grad.addColorStop(1, "#0e0e1a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, h);

    // ── Border frame ────────────────────────────────────────────
    const inset = 3;
    ctx.strokeStyle = gold(0.2);
    ctx.lineWidth = 0.5;
    ctx.strokeRect(inset, inset, width - inset * 2, h - inset * 2);

    // Corner accents
    const cLen = Math.min(width, h) * 0.13;
    ctx.strokeStyle = gold(0.4);
    ctx.lineWidth = 1;
    for (const [x, y, dx, dy] of [
      [inset, inset, 1, 1],
      [width - inset, inset, -1, 1],
      [inset, h - inset, 1, -1],
      [width - inset, h - inset, -1, -1],
    ]) {
      ctx.beginPath();
      ctx.moveTo(x, y + dy * cLen);
      ctx.lineTo(x, y);
      ctx.lineTo(x + dx * cLen, y);
      ctx.stroke();
    }

    // ── Radial grid ─────────────────────────────────────────────
    const bearing = ((field?.bearing || 0) * Math.PI) / 180;
    const gridLines = 8 + Math.floor(rng() * 8);
    ctx.strokeStyle = gold(0.06);
    ctx.lineWidth = 0.5;
    for (let i = 0; i < gridLines; i++) {
      const a = bearing + (i * Math.PI * 2) / gridLines;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * r * 1.4, cy + Math.sin(a) * r * 1.4);
      ctx.stroke();
    }

    // Concentric rings
    const rings = 3 + Math.floor(rng() * 3);
    for (let i = 1; i <= rings; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, r * (i / rings), 0, Math.PI * 2);
      ctx.strokeStyle = gold(0.07 + rng() * 0.06);
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // ── Central polygon ─────────────────────────────────────────
    const sides = 3 + Math.floor(rng() * 6); // 3–8
    const polyRot = bearing - Math.PI / 2;

    // Outer polygon
    ctx.beginPath();
    for (let i = 0; i <= sides; i++) {
      const a = polyRot + (i * Math.PI * 2) / sides;
      const px = cx + Math.cos(a) * r * 0.85;
      const py = cy + Math.sin(a) * r * 0.85;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.strokeStyle = gold(0.3);
    ctx.lineWidth = 1;
    ctx.stroke();

    // Inner polygon (rotated offset)
    const innerSides = sides < 5 ? sides * 2 : sides;
    const innerRot = polyRot + Math.PI / innerSides;
    ctx.beginPath();
    for (let i = 0; i <= innerSides; i++) {
      const a = innerRot + (i * Math.PI * 2) / innerSides;
      const px = cx + Math.cos(a) * r * 0.5;
      const py = cy + Math.sin(a) * r * 0.5;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.strokeStyle = gold(0.2);
    ctx.lineWidth = 0.75;
    ctx.stroke();

    // Connect outer → inner vertices
    ctx.strokeStyle = gold(0.1);
    ctx.lineWidth = 0.5;
    for (let i = 0; i < sides; i++) {
      const outerA = polyRot + (i * Math.PI * 2) / sides;
      const innerA = innerRot + (i * Math.PI * 2) / innerSides;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(outerA) * r * 0.85, cy + Math.sin(outerA) * r * 0.85);
      ctx.lineTo(cx + Math.cos(innerA) * r * 0.5, cy + Math.sin(innerA) * r * 0.5);
      ctx.stroke();
    }

    // Vertex dots
    for (let i = 0; i < sides; i++) {
      const a = polyRot + (i * Math.PI * 2) / sides;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * r * 0.85, cy + Math.sin(a) * r * 0.85, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = gold(0.4);
      ctx.fill();
    }

    // ── Scattered constellation dots ────────────────────────────
    const dotCount = 4 + Math.floor(rng() * 8);
    for (let i = 0; i < dotCount; i++) {
      const a = rng() * Math.PI * 2;
      const d = r * (0.55 + rng() * 0.4);
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 0.6 + rng() * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = gold(0.12 + rng() * 0.18);
      ctx.fill();
    }

    // ── Center mark ─────────────────────────────────────────────
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.15, 0, Math.PI * 2);
    ctx.strokeStyle = gold(0.2);
    ctx.lineWidth = 0.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fillStyle = gold(0.5);
    ctx.fill();
  }, [width, h, field?.bearing, field?.polarity, field?.anomalySigma]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height: h, display: "block", borderRadius: 4 }}
    />
  );
});
