"use client";

import { useEffect, useRef, useState } from "react";

const S = (d, extra) => <svg className="ic" viewBox="0 0 24 24" aria-hidden="true" {...extra}>{d}</svg>;

export const Icon = {
  dashboard: S(<><path d="M3 10.5L12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></>),
  plus: S(<path d="M12 5v14M5 12h14"/>),
  briefs: S(<><path d="M4 5a2 2 0 0 1 2-2h8l6 6v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></>),
  settings: S(<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></>),
  help: S(<><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17v.01"/></>),
  search: S(<><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></>),
  globe: S(<><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/></>),
  pin: S(<><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></>),
  check: S(<path d="M5 12.5l4.5 4.5L19 7.5"/>),
  checkCircle: S(<><circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/></>),
  alert: S(<><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.01"/></>),
  trash: S(<><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></>),
  external: S(<><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></>),
  dots: S(<><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></>),
  sparkle: S(<><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/></>),
  image: S(<><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.8"/><path d="M21 16l-5-5-8 9"/></>),
  pen: S(<><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></>),
  users: S(<><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/></>),
  store: S(<><path d="M4 9l1.5-5h13L20 9M4 9h16v11H4zM9 20v-6h6v6"/></>),
  route: S(<><circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="6" r="2.2"/><path d="M8 17.2c6-1 2-9 8-10.4"/></>),
  menu: S(<path d="M4 7h16M4 12h16M4 17h16"/>),
  close: S(<path d="M6 6l12 12M18 6L6 18"/>),
  moon: S(<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>),
  sun: S(<><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>),
  layers: S(<><path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/></>),
  target: S(<><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></>),
  tag: S(<><path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="8" cy="8" r="1.5"/></>),
  clock: S(<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>),
  shield: S(<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/>),
  quote: S(<path d="M5 11h4v6H4v-4c0-3 1-5 4-6M15 11h4v6h-5v-4c0-3 1-5 4-6"/>),
  arrowLeft: S(<path d="M19 12H5M11 6l-6 6 6 6"/>),
  chevron: S(<path d="M6 9l6 6 6-6"/>),
  database: S(<><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/></>),
  calendar: S(<><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></>),
  expand: S(<><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/></>),
  cup: S(<><path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M17 11h1.5a2.5 2.5 0 0 1 0 5H17M8 3v3M12 3v3"/></>),
  shirt: S(<path d="M8 3l-5 3 2 4 3-1v12h8V9l3 1 2-4-5-3a4 4 0 0 1-8 0z"/>),
  lamp: S(<><path d="M9 3h6l3 8H6z"/><path d="M12 11v7M8 21h8"/></>),
  drop: S(<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>),
  book: S(<><path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z"/><path d="M20 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z"/></>),
};

export const Mark = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="M15.5 8.5l-2 5-5 2 2-5z" /></svg>
);

export function Badge({ kind = "neutral", children, icon }) {
  return <span className={`badge ${kind}`}>{icon}{children}</span>;
}

export function Stat({ icon, label, value, unit, note }) {
  return (
    <div className="stat">
      <div className="stat-label">{icon}{label}</div>
      <div className="stat-main">
        <div className="stat-value">{value}{unit && <small>{unit}</small>}</div>
        {note && <div className="stat-note">{note}</div>}
      </div>
    </div>
  );
}

export function Card({ icon, title, action, children, className = "", bodyClass = "" }) {
  return (
    <section className={`card ${className}`}>
      {(title || action) && (
        <div className="card-head">
          <h3 className="card-title">{icon}{title}</h3>
          {action}
        </div>
      )}
      <div className={`card-body ${bodyClass}`}>{children}</div>
    </section>
  );
}

// Percentage bar used everywhere: 6px pills with 4px gaps, teal fill.
// The number of pills follows the available width, so spacing stays exact.
export function Bars({ percent, height = 20 }) {
  const ref = useRef(null);
  const [n, setN] = useState(30);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([e]) => setN(Math.max(6, Math.floor((e.contentRect.width + 4) / 10))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const v = Math.max(0, Math.min(100, percent || 0));
  const on = Math.round((v / 100) * n);
  return (
    <div ref={ref} className="pill-bars" style={{ height }} role="img" aria-label={`${Math.round(v)}%`}>
      {Array.from({ length: n }, (_, i) => <span key={i} className={i < on ? "on" : ""} />)}
    </div>
  );
}

export function Donut({ parts, center, sub }) {
  const total = parts.reduce((a, p) => a + p.value, 0) || 1;
  const r = 42, c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="donut">
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--g100)" strokeWidth="9" />
        {parts.filter((p) => p.value > 0).map((p) => {
          const len = (p.value / total) * c;
          const el = <circle key={p.key} cx="50" cy="50" r={r} fill="none" stroke={p.color} strokeWidth="9" strokeDasharray={`${Math.max(len - 1.5, 0)} ${c}`} strokeDashoffset={-offset} strokeLinecap="round" />;
          offset += len;
          return el;
        })}
      </svg>
      <div className="donut-center"><div><strong>{center}</strong><span>{sub}</span></div></div>
    </div>
  );
}

export function Modal({ icon, title, text, confirmLabel, cancelLabel, onConfirm, onCancel, danger }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);
  return (
    <div className="overlay" onClick={onCancel}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        {icon && <div className="modal-icon">{icon}</div>}
        <h3>{title}</h3>
        <p>{text}</p>
        <div className="row">
          <button className="btn btn-secondary" onClick={onCancel} autoFocus>{cancelLabel}</button>
          <button className={`btn ${danger ? "btn-danger" : "btn-primary"}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

export const EmptyArt = () => (
  <svg className="empty-art" viewBox="0 0 120 84" aria-hidden="true">
    <defs><linearGradient id="ea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3b82f6" stopOpacity=".35"/><stop offset="1" stopColor="#3b82f6" stopOpacity="0"/></linearGradient></defs>
    <path d="M10 60 L60 34 L110 60 L60 84 Z" fill="url(#ea)" />
    <path d="M38 46 L60 35 L82 46 L60 57 Z" fill="#3b82f6" opacity=".85" />
    <path d="M38 46 L60 57 L60 70 L38 59 Z" fill="#2a4a9a" opacity=".9" />
    <path d="M82 46 L60 57 L60 70 L82 59 Z" fill="#2f4f9e" opacity=".9" />
    <circle cx="60" cy="18" r="9" fill="none" stroke="#2a4a9a" strokeWidth="2" />
    <path d="M63 15 l-2 5 -5 2 2-5z" fill="#2a4a9a" />
  </svg>
);

export const PromoArt = () => (
  <svg viewBox="0 0 208 92" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <g stroke="#3b82f6" strokeOpacity=".25" fill="none">
      {Array.from({ length: 9 }, (_, i) => <path key={"a" + i} d={`M${-40 + i * 32} 92 L${40 + i * 32} 40`} />)}
      {Array.from({ length: 9 }, (_, i) => <path key={"b" + i} d={`M${i * 32 - 20} 40 L${i * 32 + 60} 92`} />)}
    </g>
    <path d="M70 52 L104 36 L138 52 L104 68 Z" fill="#3b82f6" opacity=".85" />
    <path d="M70 52 L104 68 L104 80 L70 64 Z" fill="#2a4a9a" />
    <path d="M138 52 L104 68 L104 80 L138 64 Z" fill="#2f4f9e" />
    <path d="M104 14 c10 0 16 8 16 16 0 12 -16 22 -16 22 s-16-10-16-22 c0-8 6-16 16-16z" fill="#fff" stroke="#2a4a9a" strokeWidth="2" />
    <circle cx="104" cy="30" r="5" fill="#3b82f6" />
  </svg>
);

// Ring chart from the kit's "Pie Chart": thin dark outer arcs over a pale inner band,
// with small gaps between segments and a large mono number in the centre.
export const RING_COLORS = ["#1e3a8a", "#2f4f9e", "#4566b0", "#6280c2", "#859dd3", "#a9bbe3"];
export function RingChart({ parts, center, sub, size = 200 }) {
  const vis = parts.filter((p) => p.value > 0);
  const total = vis.reduce((a, p) => a + p.value, 0) || 1;
  const c = size / 2, gap = vis.length > 1 ? 1.6 : 0;
  const arc = (r, a0, a1) => {
    const rad = (a) => ((a - 90) * Math.PI) / 180;
    const [x0, y0] = [c + r * Math.cos(rad(a0)), c + r * Math.sin(rad(a0))];
    const [x1, y1] = [c + r * Math.cos(rad(a1)), c + r * Math.sin(rad(a1))];
    return `M${x0},${y0} A${r},${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1},${y1}`;
  };
  let a = 0;
  const segs = vis.map((p, i) => {
    const sweep = (p.value / total) * 360;
    const s = { ...p, color: p.color || RING_COLORS[i % RING_COLORS.length], a0: a + gap / 2, a1: a + sweep - gap / 2 };
    a += sweep;
    return s;
  });
  return (
    <div className="ring-chart" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={c} cy={c} r={c - 10} fill="none" stroke="var(--g5)" strokeWidth="16" />
        {segs.map((s) => (
          <g key={s.key}>
            <path d={arc(c - 10, s.a0, s.a1 === s.a0 + 360 ? s.a1 - 0.01 : s.a1)} fill="none" stroke={s.color} strokeOpacity="0.14" strokeWidth="16" />
            <path d={arc(c - 1.5, s.a0, s.a1)} fill="none" stroke={s.color} strokeWidth="3" strokeLinecap="butt" />
          </g>
        ))}
      </svg>
      <div className="ring-center">
        <strong>{center}</strong>
        <span>{sub}</span>
      </div>
    </div>
  );
}
