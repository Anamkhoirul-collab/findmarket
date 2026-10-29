"use client";

import { MAP } from "./worldMap";
import { project, getOrigin, homeName } from "./geo";

// Small static map centred between Indonesia and one city.
export default function MiniMap({ coords, name, label, homeCode }) {
  const o = project(getOrigin(homeCode)[0], getOrigin(homeCode)[1]);
  const p = coords ? project(coords[0], coords[1]) : null;
  const pts = p ? [o, p] : [o];
  const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
  const bw = Math.max(Math.max(...xs) - Math.min(...xs), 80) * 1.6;
  const bh = Math.max(Math.max(...ys) - Math.min(...ys), 60) * 1.8;
  const ratio = 16 / 9;
  const w = Math.max(bw, bh * ratio), h = w / ratio;
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const s = w / 640;
  const arc = p ? (() => {
    const mx = (o[0] + p[0]) / 2, my = (o[1] + p[1]) / 2, d = Math.hypot(p[0] - o[0], p[1] - o[1]);
    return `M${o[0]},${o[1]} Q${mx},${my - d * 0.28} ${p[0]},${p[1]}`;
  })() : null;
  return (
    <svg className="mini-map" viewBox={`${cx - w / 2} ${cy - h / 2} ${w} ${h}`} preserveAspectRatio="xMidYMid slice" role="img" aria-label={label}>
      <rect x={-MAP.W} y={-MAP.H} width={MAP.W * 3} height={MAP.H * 3} className="map-sea" />
      <path d={MAP.land} className="map-land" />
      <path d={MAP.borders} className="map-border" strokeWidth={0.8 * s} />
      {arc && <path d={arc} className="map-arc on" strokeWidth={2.4 * s} />}
      <circle cx={o[0]} cy={o[1]} r={5 * s} className="map-origin" />
      <text x={o[0]} y={o[1] - 12 * s} fontSize={12 * s} textAnchor="middle" className="map-label">{homeName(homeCode)}</text>
      {p && (
        <g transform={`translate(${p[0]},${p[1]})`}>
          <circle r={18 * s} className="map-pulse" fill="var(--cyan)" />
          <circle r={9 * s} fill="var(--primary-700)" stroke="var(--panel)" strokeWidth={2.5 * s} />
          <text y={-17 * s} fontSize={14 * s} textAnchor="middle" className="map-label strong">{name}</text>
        </g>
      )}
    </svg>
  );
}
