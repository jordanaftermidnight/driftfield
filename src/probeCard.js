/**
 * Generates a shareable probe card as a canvas image.
 * Returns a canvas element (1080x1080) that can be converted to blob/PNG.
 */
export function generateProbeCard(probe) {
  const size = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  const color = probe.polarity === "positive" ? [0, 229, 200] : [255, 60, 80];
  const accentHex = probe.polarity === "positive" ? "#00e5c8" : "#ff3c50";

  // Background
  ctx.fillStyle = "#0a0a12";
  ctx.fillRect(0, 0, size, size);

  // Subtle grid
  ctx.strokeStyle = "#ffffff06";
  ctx.lineWidth = 1;
  for (let i = 0; i < size; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
    ctx.stroke();
  }

  // --- Compass visualization (centered, top half) ---
  const cx = size / 2;
  const cy = 340;
  const r = 180;

  // Outer ring
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},0.15)`;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Inner rings
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath();
    ctx.arc(cx, cy, r * (i / 4), 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},0.06)`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Cardinal directions
  const dirs = ["N", "E", "S", "W"];
  ctx.font = "16px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  dirs.forEach((d, i) => {
    const a = (i * Math.PI * 2) / 4 - Math.PI / 2;
    ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},0.25)`;
    ctx.fillText(d, cx + Math.cos(a) * (r + 24), cy + Math.sin(a) * (r + 24));
  });

  // Bearing arrow
  const bearing = parseFloat(probe.bearing);
  const ba = (bearing * Math.PI / 180) - Math.PI / 2;
  const len = r * (0.3 + probe.strength * 0.6);
  const ax = cx + Math.cos(ba) * len;
  const ay = cy + Math.sin(ba) * len;

  const grad = ctx.createLinearGradient(cx, cy, ax, ay);
  grad.addColorStop(0, `rgba(${color[0]},${color[1]},${color[2]},0.1)`);
  grad.addColorStop(1, `rgba(${color[0]},${color[1]},${color[2]},0.9)`);
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(ax, ay);
  ctx.strokeStyle = grad;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.stroke();

  // Arrowhead
  const hl = 16;
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(ax - Math.cos(ba - 0.4) * hl, ay - Math.sin(ba - 0.4) * hl);
  ctx.moveTo(ax, ay);
  ctx.lineTo(ax - Math.cos(ba + 0.4) * hl, ay - Math.sin(ba + 0.4) * hl);
  ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},0.9)`;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Center dot
  ctx.beginPath();
  ctx.arc(cx, cy, 5, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},0.8)`;
  ctx.fill();

  // Orbiting dots (static positions for the card)
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI * 2) / 6 + bearing * 0.01;
    const d = r * (0.4 + 0.3 * Math.sin(i * 1.2));
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 2 + probe.strength * 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${0.15 + probe.strength * 0.25})`;
    ctx.fill();
  }

  // --- Action icon + label ---
  ctx.font = "64px sans-serif";
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(probe.action.icon, cx, 600);

  ctx.font = "bold 28px monospace";
  ctx.fillStyle = accentHex;
  ctx.letterSpacing = "6px";
  ctx.fillText(probe.action.label.toUpperCase(), cx, 650);

  // Action description
  ctx.font = "18px monospace";
  ctx.fillStyle = "#888888";
  ctx.letterSpacing = "0px";
  wrapText(ctx, probe.action.desc, cx, 690, 700, 26);

  // --- Stats row ---
  const statsY = 810;
  const stats = [
    { label: "BEARING", value: `${probe.compassDir} ${probe.bearing}°` },
    { label: "POLARITY", value: probe.polarity === "positive" ? "+POS" : "-NEG" },
    { label: "SIGNAL", value: `${(probe.strength * 100).toFixed(0)}%` },
    { label: "ANOMALY", value: `${probe.entropyDetail.anomaly}%` },
  ];

  const statWidth = size / stats.length;
  stats.forEach((s, i) => {
    const sx = statWidth * i + statWidth / 2;
    ctx.font = "11px monospace";
    ctx.fillStyle = "#555555";
    ctx.textAlign = "center";
    ctx.fillText(s.label, sx, statsY);

    ctx.font = "24px monospace";
    ctx.fillStyle = accentHex;
    ctx.fillText(s.value, sx, statsY + 32);
  });

  // Divider
  ctx.beginPath();
  ctx.moveTo(60, statsY + 56);
  ctx.lineTo(size - 60, statsY + 56);
  ctx.strokeStyle = "#1a1a2e";
  ctx.lineWidth = 1;
  ctx.stroke();

  // --- Intention (if set) ---
  if (probe.intention) {
    ctx.font = "italic 16px monospace";
    ctx.fillStyle = "#666666";
    ctx.textAlign = "center";
    const truncated = probe.intention.length > 80 ? probe.intention.slice(0, 77) + "..." : probe.intention;
    ctx.fillText(`"${truncated}"`, cx, statsY + 86);
  }

  // --- Branding ---
  ctx.font = "12px monospace";
  ctx.fillStyle = "#2a2a40";
  ctx.textAlign = "center";
  ctx.letterSpacing = "4px";
  ctx.fillText("DRIFTFIELD", cx - 20, size - 50);

  ctx.font = "9px monospace";
  ctx.fillStyle = "#1a1a30";
  ctx.letterSpacing = "2px";
  ctx.fillText("ENTROPY × CYCLE × ATTENTION × ACTION", cx, size - 30);

  return canvas;
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;
  for (const word of words) {
    const test = line + word + " ";
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line.trim(), x, currentY);
      line = word + " ";
      currentY += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
}

/**
 * Generates a shareable daily score card as a canvas image.
 * Returns a canvas element (1080x1080).
 */
export function generateScoreCard(score, factors) {
  const size = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const cx = size / 2;

  const color = score >= 60 ? [0, 229, 200] : score >= 30 ? [255, 217, 61] : [255, 60, 80];
  const accentHex = score >= 60 ? "#00e5c8" : score >= 30 ? "#ffd93d" : "#ff3c50";

  // Background
  ctx.fillStyle = "#0a0a12";
  ctx.fillRect(0, 0, size, size);

  // Grid
  ctx.strokeStyle = "#ffffff06";
  ctx.lineWidth = 1;
  for (let i = 0; i < size; i += 40) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, size); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(size, i); ctx.stroke();
  }

  // Title
  ctx.font = "12px monospace";
  ctx.textAlign = "center";
  ctx.fillStyle = "#555555";
  ctx.letterSpacing = "6px";
  ctx.fillText("DAILY SURFACE AREA", cx, 200);

  // Score ring
  ctx.beginPath();
  ctx.arc(cx, 420, 160, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},0.12)`;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Score arc (filled portion)
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + (score / 100) * Math.PI * 2;
  ctx.beginPath();
  ctx.arc(cx, 420, 160, startAngle, endAngle);
  ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},0.6)`;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.stroke();

  // Score number
  ctx.font = "bold 96px monospace";
  ctx.fillStyle = accentHex;
  ctx.letterSpacing = "0px";
  ctx.textAlign = "center";
  ctx.fillText(score.toString(), cx, 440);

  ctx.font = "24px monospace";
  ctx.fillStyle = "#555555";
  ctx.fillText("/ 100", cx, 480);

  // Factors
  ctx.font = "16px monospace";
  ctx.fillStyle = "#888888";
  ctx.textAlign = "center";
  let fy = 620;
  factors.forEach(f => {
    ctx.fillStyle = accentHex + "60";
    ctx.fillText("·", cx - 120, fy);
    ctx.fillStyle = "#888888";
    ctx.fillText(f, cx, fy);
    fy += 30;
  });

  // Date
  ctx.font = "11px monospace";
  ctx.fillStyle = "#444444";
  ctx.fillText(new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), cx, fy + 30);

  // Branding
  ctx.font = "12px monospace";
  ctx.fillStyle = "#2a2a40";
  ctx.letterSpacing = "4px";
  ctx.fillText("DRIFTFIELD", cx - 20, size - 50);

  ctx.font = "9px monospace";
  ctx.fillStyle = "#1a1a30";
  ctx.letterSpacing = "2px";
  ctx.fillText("ENTROPY × CYCLE × ATTENTION × ACTION", cx, size - 30);

  return canvas;
}

/**
 * Share or download a daily score card.
 */
export async function shareScoreCard(score, factors) {
  const canvas = generateScoreCard(score, factors);
  const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
  const file = new File([blob], "driftfield-score.png", { type: "image/png" });

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        title: `Surface Area: ${score}/100`,
        text: `My luck surface area today: ${score}/100`,
        files: [file],
      });
      return "shared";
    } catch (e) {
      if (e.name === "AbortError") return "cancelled";
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "driftfield-score.png";
  a.click();
  URL.revokeObjectURL(url);
  return "downloaded";
}

/**
 * Share or download a probe card.
 */
export async function shareProbeCard(probe) {
  const canvas = generateProbeCard(probe);

  const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
  const file = new File([blob], "driftfield-probe.png", { type: "image/png" });

  // Try Web Share API (mobile-first)
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        title: `${probe.action.label} — ${probe.compassDir} ${probe.bearing}°`,
        text: probe.intention || "Entropy probe from Driftfield",
        files: [file],
      });
      return "shared";
    } catch (e) {
      if (e.name === "AbortError") return "cancelled";
      // Fall through to download
    }
  }

  // Fallback: download
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "driftfield-probe.png";
  a.click();
  URL.revokeObjectURL(url);
  return "downloaded";
}
