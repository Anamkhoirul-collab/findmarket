"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MAP } from "./worldMap";
import { project, getOrigin, homeName } from "./geo";
import { Icon } from "./components";

const COLORS = ["var(--primary-700)", "var(--cyan)", "var(--purple)", "#f59e0b", "#64748b"];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const reduceMotion = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export default function MarketMap({ homeCode, t, markets, selected, onSelect }) {
  const svgRef = useRef(null);
  const origin = useMemo(() => project(getOrigin(homeCode)[0], getOrigin(homeCode)[1]), []);
  const points = useMemo(() => markets.map((m) => (m.coords ? project(m.coords[0], m.coords[1]) : null)), [markets]);

  const fitAll = useMemo(() => {
    const pts = [origin, ...points.filter(Boolean)];
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const bw = Math.max(maxX - minX, 60), bh = Math.max(maxY - minY, 40);
    const k = clamp(Math.min(MAP.W / bw, MAP.H / bh) * 0.7, 1, 4);
    return { cx: (minX + maxX) / 2, cy: (minY + maxY) / 2, k };
  }, [origin, points]);

  const [view, setView] = useState(fitAll);
  const [size, setSize] = useState({ w: 700, h: 520 });
  useEffect(() => {
    const el = svgRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width || 700, h: e.contentRect.height || 520 }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const viewRef = useRef(view);
  viewRef.current = view;
  const anim = useRef(0);

  function animateTo(target) {
    cancelAnimationFrame(anim.current);
    const from = { ...viewRef.current };
    if (reduceMotion()) { setView(target); return; }
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / 380);
      const e = 1 - Math.pow(1 - p, 3);
      setView({ cx: from.cx + (target.cx - from.cx) * e, cy: from.cy + (target.cy - from.cy) * e, k: from.k + (target.k - from.k) * e });
      if (p < 1) anim.current = requestAnimationFrame(tick);
    };
    anim.current = requestAnimationFrame(tick);
  }

  useEffect(() => { setView(fitAll); }, [fitAll]);
  useEffect(() => {
    const p = points[selected];
    if (p) animateTo({ cx: p[0], cy: p[1], k: Math.max(viewRef.current.k, 2.4) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);
  useEffect(() => () => cancelAnimationFrame(anim.current), []);

  // Drag to pan
  const drag = useRef(null);
  function onPointerDown(e) {
    if (e.button !== 0) return;
    drag.current = { x: e.clientX, y: e.clientY, v: viewRef.current, moved: false };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }
  function onPointerMove(e) {
    const d = drag.current;
    if (!d) return;
    const rect = svgRef.current.getBoundingClientRect();
    const unit = (MAP.W / d.v.k) / rect.width;
    const dx = (e.clientX - d.x) * unit, dy = (e.clientY - d.y) * unit;
    if (Math.abs(e.clientX - d.x) + Math.abs(e.clientY - d.y) > 3) d.moved = true;
    setView({ ...d.v, cx: d.v.cx - dx, cy: d.v.cy - dy });
  }
  function onPointerUp() { drag.current = null; }
  const zoom = (f) => animateTo({ ...viewRef.current, k: clamp(viewRef.current.k * f, 1, 8) });

  const w = MAP.W / view.k, h = MAP.H / view.k;
  const vb = `${view.cx - w / 2} ${view.cy - h / 2} ${w} ${h}`;
  // One screen pixel in map units, so markers and labels keep the same size at any zoom or screen width.
  const s = Math.max(w / size.w, h / size.h) * 0.9;
  const arc = (p) => {
    const mx = (origin[0] + p[0]) / 2, my = (origin[1] + p[1]) / 2;
    const dist = Math.hypot(p[0] - origin[0], p[1] - origin[1]);
    return `M${origin[0]},${origin[1]} Q${mx},${my - dist * 0.28} ${p[0]},${p[1]}`;
  };
  const go = (dir) => onSelect((selected + dir + markets.length) % markets.length);

  return (
    <div className="map-wrap">
      <svg
        ref={svgRef} className="map-svg" viewBox={vb} preserveAspectRatio="xMidYMid meet" role="img" aria-label={t.mapLabel}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}
      >
        <rect x={-MAP.W} y={-MAP.H} width={MAP.W * 3} height={MAP.H * 3} className="map-sea" />
        <path d={MAP.land} className="map-land" />
        <path d={MAP.borders} className="map-border" strokeWidth={0.6 * s} />
        {points.map((p, i) => p && (
          <path key={"a" + i} d={arc(p)} className={`map-arc${i === selected ? " on" : ""}`} strokeWidth={(i === selected ? 2 : 1.2) * s} strokeDasharray={i === selected ? "none" : `${4 * s} ${4 * s}`} />
        ))}
        <g transform={`translate(${origin[0]},${origin[1]})`}>
          <circle r={9 * s} className="map-origin-halo" />
          <circle r={4.5 * s} className="map-origin" />
          <text y={-12 * s} fontSize={10 * s} className="map-label" textAnchor="middle">{homeName(homeCode)}</text>
        </g>
        {points.map((p, i) => p && (
          <g key={"m" + i} transform={`translate(${p[0]},${p[1]})`} className="map-marker" onClick={() => { if (!drag.current?.moved) onSelect(i); }}>
            {i === selected && <circle r={16 * s} className="map-pulse" fill={COLORS[i % 5]} />}
            <circle r={(i === selected ? 10 : 8) * s} fill={COLORS[i % 5]} stroke="var(--panel)" strokeWidth={2 * s} />
            <text fontSize={(i === selected ? 9 : 8) * s} y={3 * s} textAnchor="middle" className="map-num">{i + 1}</text>
            <title>{`${i + 1}. ${markets[i].name}`}</title>
            {(i === selected || markets.length <= 6) && (
              <text y={-15 * s} fontSize={11 * s} textAnchor="middle" className={`map-label${i === selected ? " strong" : ""}`}>{markets[i].name}</text>
            )}
          </g>
        ))}
      </svg>

      <div className="map-bl">
        <button className="icon-btn" onClick={() => animateTo(fitAll)} aria-label={t.mapReset} title={t.mapReset}>{Icon.target}</button>
        <div className="map-zoom">
          <button onClick={() => zoom(1 / 1.5)} aria-label={t.zoomOut}>−</button>
          <span className="mono">{Math.round(view.k * 100)}%</span>
          <button onClick={() => zoom(1.5)} aria-label={t.zoomIn}>+</button>
        </div>
      </div>
      <div className="map-br">
        <button className="icon-btn" onClick={() => go(-1)} aria-label={t.prevMarket}>{Icon.arrowLeft}</button>
        <button className="icon-btn" onClick={() => go(1)} aria-label={t.nextMarket} style={{ transform: "scaleX(-1)" }}>{Icon.arrowLeft}</button>
      </div>
    </div>
  );
}
