"use client";

import { MAP } from "./worldMap";
import { project } from "./geo";

const VW = 640, VH = 400;

// City-level heatmap. Points are drawn in local pixel space (not tiny map units)
// so browsers render circles and labels crisply at city zoom.
export default function HeatMap({ center, points = [], places = [], label, cityName, large = false }) {
  if (!center) return null;
  const c = project(center[0], center[1]);
  const raw = points.map((p) => { const [x, y] = project(p.lon, p.lat); return { dx: x - c[0], dy: y - c[1], v: p.value }; });
  const ext = raw.length ? Math.max(...raw.map((p) => Math.max(Math.abs(p.dx), Math.abs(p.dy) * (VW / VH))), 0.02) : 0.2;
  const k = (VW / 2) / (ext * 1.25); // map units -> pixels
  const toPx = (x, y) => [VW / 2 + (x - c[0]) * k, VH / 2 + (y - c[1]) * k];
  const max = Math.max(...raw.map((p) => p.v), 0.0001);
  const placePts = places.filter((p) => typeof p.lat === "number" && typeof p.lon === "number").map((p) => ({ ...p, xy: toPx(...project(p.lon, p.lat)) }));
  return (
    <svg className="heat-map" viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid slice" role="img" aria-label={label}>
      <defs>
        <radialGradient id="heat-g">
          <stop offset="0" stopColor="var(--cyan)" stopOpacity="0.85" />
          <stop offset="0.55" stopColor="var(--primary)" stopOpacity="0.35" />
          <stop offset="1" stopColor="var(--primary)" stopOpacity="0" />
        </radialGradient>
        <pattern id="heat-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--g150)" strokeWidth="1" opacity="0.6" />
        </pattern>
        <clipPath id="heat-clip"><rect width={VW} height={VH} /></clipPath>
      </defs>
      <rect width={VW} height={VH} className="map-sea" />
      <g clipPath="url(#heat-clip)">
        <g transform={`translate(${VW / 2} ${VH / 2}) scale(${k}) translate(${-c[0]} ${-c[1]})`}>
          <path d={MAP.land} className="map-land" />
        </g>
        <rect width={VW} height={VH} fill="url(#heat-grid)" />
        {raw.map((p, i) => (
          <circle key={i} cx={VW / 2 + p.dx * k} cy={VH / 2 + p.dy * k} r={10 + 20 * (p.v / max)} fill="url(#heat-g)" opacity={0.12 + 0.6 * (p.v / max)} />
        ))}
        {placePts.map((p) => <circle key={p.name} cx={p.xy[0]} cy={p.xy[1]} r="5" fill="var(--panel)" stroke="var(--primary)" strokeWidth="2.5" />)}
        <circle cx={VW / 2} cy={VH / 2} r="5" fill="var(--g900)" />
        <text x={VW / 2} y={VH / 2 - 12} fontSize="14" textAnchor="middle" className="map-label strong">{cityName}</text>
      </g>
    </svg>
  );
}
