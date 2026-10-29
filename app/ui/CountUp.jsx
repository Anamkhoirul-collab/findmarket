"use client";

import { useEffect, useRef, useState } from "react";

// Counts a number up from 0 when it first appears. Respects reduced-motion settings.
export default function CountUp({ value, format = (v) => Math.round(v), duration = 900 }) {
  const [shown, setShown] = useState(value);
  const started = useRef(false);
  useEffect(() => {
    if (typeof value !== "number" || started.current) { setShown(value); return; }
    started.current = true;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) { setShown(value); return; }
    let raf, t0;
    const tick = (t) => {
      if (!t0) t0 = t;
      const p = Math.min(1, (t - t0) / duration);
      setShown(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    setShown(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <>{typeof shown === "number" ? format(shown) : shown}</>;
}
