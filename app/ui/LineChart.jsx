"use client";

import { useEffect, useRef, useState } from "react";

// Line chart in the kit's style: dashed grid, cyan line, soft area, black tooltip.
export default function LineChart({ points, height: fixedHeight = 300, fill = false, format = (v) => Math.round(v), label, axisLabel = (l) => l, initial = null, tickFormat = null, padLeft = 34 }) {
  const ref = useRef(null);
  const [w, setW] = useState(320);
  const [fh, setFh] = useState(fixedHeight);
  const [hover, setHover] = useState(initial !== null ? initial : points.length ? points.length - 1 : null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([e]) => {
      setW(Math.max(220, e.contentRect.width));
      if (fill) setFh(Math.max(220, e.contentRect.height));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [fill]);
  if (!points.length) return null;
  const height = fill ? fh : fixedHeight;

  const pad = { l: padLeft, r: 14, t: 16, b: 30 };
  const vals = points.map((p) => p.value);
  // "Nice" axis steps (1, 2 or 5 times a power of ten) so labels read cleanly at any scale.
  const rawLo = Math.min(...vals), rawHi = Math.max(...vals);
  const range = rawHi - rawLo || Math.abs(rawHi) || 1;
  const rough = range / 5, mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const tickStep = (rough / mag <= 1 ? 1 : rough / mag <= 2 ? 2 : rough / mag <= 5 ? 5 : 10) * mag;
  const lo = Math.floor(rawLo / tickStep) * tickStep, hi = Math.max(Math.ceil(rawHi / tickStep) * tickStep, lo + tickStep);
  const span = hi - lo;
  const ticks = Array.from({ length: Math.round(span / tickStep) + 1 }, (_, i) => lo + tickStep * i);
  const x = (i) => pad.l + (points.length === 1 ? (w - pad.l - pad.r) / 2 : (i / (points.length - 1)) * (w - pad.l - pad.r));
  const y = (v) => pad.t + (1 - (v - lo) / span) * (height - pad.t - pad.b);
  const line = points.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p.value)}`).join("");
  const area = `${line}L${x(points.length - 1)},${height - pad.b}L${x(0)},${height - pad.b}Z`;
  const hp = hover !== null ? points[hover] : null;
  const colW = (w - pad.l - pad.r) / Math.max(points.length - 1, 1);
  const step = Math.max(1, Math.ceil(68 / colW)); // thin out axis labels on narrow screens

  return (
    <div ref={ref} className={`line-chart${fill ? " fill" : ""}`}>
      <svg width={w} height={height} role="img" aria-label={label}>
        <defs>
          <linearGradient id="lc-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--cyan)" stopOpacity="0.18" />
            <stop offset="1" stopColor="var(--cyan)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((tk) => (
          <g key={tk}>
            <line x1={pad.l} x2={w - pad.r} y1={y(tk)} y2={y(tk)} className="lc-grid" />
            <text x={pad.l - 8} y={y(tk) + 4} textAnchor="end" className="lc-axis">{tickFormat ? tickFormat(tk) : Math.round(tk)}</text>
          </g>
        ))}
        {points.map((p, i) => <line key={"v" + i} x1={x(i)} x2={x(i)} y1={pad.t} y2={height - pad.b} className="lc-grid" />)}
        <path d={area} fill="url(#lc-area)" />
        <path d={line} className="lc-line" />
        {hp && <line x1={pad.l} x2={w - pad.r} y1={y(hp.value)} y2={y(hp.value)} className="lc-marker" />}
        {hp && (
          <g transform={`translate(${pad.l - 4},${y(hp.value)})`}>
            <rect x={-(pad.l - 6)} y={-9} width={pad.l - 8} height={18} rx={9} className="lc-pill" />
            <text x={-(pad.l - 6) + (pad.l - 8) / 2} y={4} textAnchor="middle" className="lc-pill-text">{tickFormat ? tickFormat(hp.value) : format(hp.value)}</text>
          </g>
        )}
        {points.map((p, i) => (
          <g key={"p" + i} onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} tabIndex={0} aria-label={`${p.label}: ${format(p.value)}`}>
            <circle cx={x(i)} cy={y(p.value)} r={14} fill="transparent" />
            <circle cx={x(i)} cy={y(p.value)} r={4.5} className={`lc-dot${i === hover ? " on" : ""}`} />
          </g>
        ))}
        {points.map((p, i) => (i % step === 0 || i === hover) && (i === hover || hover === null || Math.abs(i - hover) >= step || i % step === 0 && Math.abs(i - hover) >= step) && (
          <text key={"l" + i} x={x(i)} y={height - 8} textAnchor="middle" className={`lc-axis${i === hover ? " on" : ""}`}>{axisLabel(p.label, i)}</text>
        ))}
      </svg>
      {hp && (
        <div className="lc-tip" style={{ left: Math.min(Math.max(x(hover), 50), w - 50), top: y(hp.value) }}>
          <span>{hp.label}</span><strong>{format(hp.value)}</strong>
        </div>
      )}
    </div>
  );
}
