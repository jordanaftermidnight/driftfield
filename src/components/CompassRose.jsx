import { useRef, useEffect } from "react";

export function CompassRose({ bearing, magnitude, polarity }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const size = 180;
    canvas.width = size;
    canvas.height = size;
    const cx = size / 2, cy = size / 2, r = size * 0.38;
    const color = polarity === "positive" ? [0, 229, 200] : [255, 60, 80];

    let animId;
    const draw = () => {
      frameRef.current++;
      const t = frameRef.current * 0.015;
      ctx.clearRect(0, 0, size, size);

      // Outer ring
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},0.15)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Inner rings
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, r * (i / 4), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},0.06)`;
        ctx.stroke();
      }

      // Cardinal directions
      const dirs = ["N", "E", "S", "W"];
      dirs.forEach((d, i) => {
        const a = (i * Math.PI) / 2 - Math.PI / 2;
        ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},0.2)`;
        ctx.font = "8px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(d, cx + Math.cos(a) * (r + 12), cy + Math.sin(a) * (r + 12));
      });

      // Scan line
      const scanAngle = t * 0.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(scanAngle) * r, cy + Math.sin(scanAngle) * r);
      ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},0.08)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Bearing arrow
      if (bearing !== undefined) {
        const ba = (bearing * Math.PI) / 180 - Math.PI / 2;
        const al = r * (0.3 + magnitude * 0.6);
        const fa = ba;
        const ax = cx + Math.cos(fa) * al;
        const ay = cy + Math.sin(fa) * al;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(ax, ay);
        ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},0.7)`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Arrowhead
        const hl = 8;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax - Math.cos(fa - 0.4) * hl, ay - Math.sin(fa - 0.4) * hl);
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax - Math.cos(fa + 0.4) * hl, ay - Math.sin(fa + 0.4) * hl);
        ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},0.9)`;
        ctx.stroke();

        // Center
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},0.8)`;
        ctx.fill();
      }

      // Orbiting dots
      for (let i = 0; i < 6; i++) {
        const a = t * (0.3 + i * 0.12) + (i * Math.PI * 2) / 6;
        const d = r * (0.3 + 0.4 * (0.5 + 0.5 * Math.sin(t * 0.5 + i)));
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 1 + magnitude * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${0.15 + magnitude * 0.3})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, [bearing, magnitude, polarity]);

  return <canvas ref={canvasRef} style={{ width: 180, height: 180, display: "block", margin: "0 auto" }} />;
}
