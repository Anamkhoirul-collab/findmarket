"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./components";

// Wraps a map so it can be opened full screen. Press Esc or the close button to return.
export default function ExpandableMap({ title, children, expandLabel = "Enlarge map", closeLabel = "Close" }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open]);

  return (
    <>
      <div className="heat-wrap expandable">
        {!open && children(false)}
        <button className="map-expand" onClick={() => setOpen(true)} aria-label={expandLabel} title={expandLabel}>{Icon.expand}<span>{expandLabel}</span></button>
      </div>
      {open && typeof document !== "undefined" && createPortal(
        <div className="map-overlay" role="dialog" aria-modal="true" aria-label={title}>
          <div className="map-overlay-head">
            <strong>{title}</strong>
            <button className="btn btn-secondary" onClick={() => setOpen(false)} autoFocus>{Icon.close}{closeLabel}</button>
          </div>
          <div className="map-overlay-body heat-wrap">{children(true)}</div>
        </div>,
        document.body
      )}
    </>
  );
}
