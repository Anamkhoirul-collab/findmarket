"use client";

import { useEffect, useRef, useState } from "react";

// Vertical hatched bar chart in the style of the kit's "Inbound vs Outbound" card.
// bars: [{ key, label, value (0-100), color, note }]
export default function FitBarChart({ bars, height = 260, label, unit = "%" }) {
  const ref = useRef(null);
  const [w, setW] = useState(340);
  const [hover, setHover] = useState(null); // tooltip only while hovering
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(220, e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pad = { l: 40, r: 12, t: 16, b: 30 };
  const ticks = [0, 20, 40, 60, 80, 100];
  const plotW = w - pad.l - pad.r, plotH = height - pad.t - pad.b;
  const y = (v) => pad.t + (1 - v / 100) * plotH;
  const slot = plotW / bars.length;
  const bw = Math.min(140, slot * 0.62);
  const x = (i) => pad.l + slot * i + (slot - bw) / 2;
  const hb = hover !== null ? bars[hover] : null;

  return (
    <div ref={ref} className="fit-chart">
      <svg width={w} height={height} role="img" aria-label={label}>
        <defs>
          {bars.map((b) => (
            <pattern key={b.key} id={`hatch-${b.key}`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="7" stroke={b.color} strokeWidth="2" opacity="0.55" />
            </pattern>
          ))}
        </defs>
        {ticks.map((tk) => (
          <g key={tk}>
            <line x1={pad.l} x2={w - pad.r} y1={y(tk)} y2={y(tk)} className="fc-grid" />
            <text x={pad.l - 8} y={y(tk) + 4} textAnchor="end" className="fc-axis">{tk}</text>
          </g>
        ))}
        {bars.map((_, i) => i > 0 && <line key={"v" + i} x1={pad.l + slot * i} x2={pad.l + slot * i} y1={pad.t} y2={height - pad.b} className="fc-grid" />)}
        {hb && typeof hb.value === "number" && (
          <g>
            <line x1={pad.l} x2={w - pad.r} y1={y(hb.value)} y2={y(hb.value)} className="fc-marker" />
            <rect x={2} y={y(hb.value) - 9} width={pad.l - 8} height={18} rx={9} className="fc-pill" />
            <text x={2 + (pad.l - 8) / 2} y={y(hb.value) + 4} textAnchor="middle" className="fc-pill-text">{Math.round(hb.value)}</text>
          </g>
        )}
        {bars.map((b, i) => {
          const v = typeof b.value === "number" ? b.value : 0;
          const top = y(v), h = Math.max(4, height - pad.b - top);
          return (
            <g key={b.key} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} tabIndex={0} aria-label={`${b.label}: ${Math.round(v)}${unit}`}>
              <rect x={x(i)} y={top} width={bw} height={h} rx={10} fill={b.color} fillOpacity={hover === i ? 0.14 : 0.08} />
              <rect x={x(i)} y={top} width={bw} height={h} rx={10} fill={`url(#hatch-${b.key})`} />
              <rect x={x(i) + 0.75} y={top + 0.75} width={bw - 1.5} height={h - 1.5} rx={9.5} fill="none" stroke={b.color} strokeWidth="1.5" />
              {hover === i && <rect x={x(i) - 3} y={top - 3} width={bw + 6} height={h + 6} rx={13} fill="none" stroke={b.color} strokeOpacity="0.25" strokeWidth="4" />}
              <text x={x(i) + bw / 2} y={height - 10} textAnchor="middle" className={`fc-axis label${hover === i ? " on" : ""}`}>{b.label.toUpperCase()}</text>
            </g>
          );
        })}
      </svg>
      {hb && typeof hb.value === "number" && (
        <div className="fc-tip" style={{ left: Math.min(Math.max(x(hover) + bw / 2, 70), w - 70), top: y(hb.value) }}>
          <span><i style={{ background: hb.color }} />{hb.label}</span>
          <strong>{Math.round(hb.value)}<small>{unit}</small></strong>
        </div>
      )}
      <ul className="fc-legend">
        {bars.map((b) => (
          <li key={b.key}><span><i style={{ background: b.color }} />{b.label}</span><span className="muted">{b.note}</span></li>
        ))}
      </ul>
    </div>
  );
}
