"use client";

import { useEffect, useRef, useState } from "react";
import HeatMap from "./HeatMap";

// Real street map (OpenStreetMap data, CARTO basemap) with the Qloo heatmap on top.
// Leaflet is loaded only in the browser. If the map can't load (offline, or a page
// that blocks map images such as the Claude preview), the simple vector map is shown.
export default function RealHeatMap({ center, points = [], places = [], cityName, label, enabled = true, fetchBoundaries = null, large = false }) {
  const box = useRef(null);
  const map = useRef(null);
  const [failed, setFailed] = useState(!enabled);

  useEffect(() => {
    if (!enabled || !center || !box.current) return;
    let cancelled = false;
    (async () => {
      try {
        const L = (await import("leaflet")).default;
        if (typeof window !== "undefined") window.L = L;
        await import("leaflet.heat");
        if (cancelled || !box.current) return;

        const dark = document.documentElement.dataset.theme === "dark";
        const m = L.map(box.current, { zoomControl: true, attributionControl: true, scrollWheelZoom: large });
        setTimeout(() => m.invalidateSize(), 50);
        map.current = m;
        // Esri grey canvas: English place names, no API key. The base goes under the heatmap and
        // the label layer goes above it, so names stay readable.
        m.createPane("bounds");
        m.getPane("bounds").style.zIndex = 640;
        m.createPane("labels");
        m.getPane("labels").style.zIndex = 650;
        m.getPane("labels").style.pointerEvents = "none";
        const theme = dark ? "Dark_Gray" : "Light_Gray";
        const esri = (layer) => `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_${theme}_${layer}/MapServer/tile/{z}/{y}/{x}`;
        const tiles = L.tileLayer(esri("Base"), {
          maxZoom: 16,
          attribution: 'Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(m);
        L.tileLayer(esri("Reference"), { maxZoom: 16, pane: "labels" }).addTo(m);
        let loaded = 0;
        tiles.on("tileload", () => { loaded += 1; });
        setTimeout(() => { if (!cancelled && loaded === 0) setFailed(true); }, 6000);

        const max = Math.max(...points.map((p) => p.value), 0.0001);
        const heatPts = points.map((p) => [p.lat, p.lon, Math.max(0.05, p.value / max)]);
        if (heatPts.length) {
          L.heatLayer(heatPts, {
            radius: 28, blur: 22, maxZoom: 14, minOpacity: 0.25,
            gradient: { 0.2: "#a9bbe3", 0.45: "#3b82f6", 0.7: "#1e3a8a", 1: "#0f1f4d" },
          }).addTo(m);
        }

        const pin = (color) => L.divIcon({ className: "", html: `<span class="lf-pin" style="--c:${color}"></span>`, iconSize: [14, 14], iconAnchor: [7, 7] });
        L.marker([center[1], center[0]], { icon: pin("#030712") }).addTo(m)
          .bindTooltip(cityName, { permanent: true, direction: "top", offset: [0, -8], className: "lf-label" });
        places.filter((p) => typeof p.lat === "number" && typeof p.lon === "number").forEach((p) => {
          L.marker([p.lat, p.lon], { icon: pin("#1e3a8a") }).addTo(m).bindTooltip(p.name, { direction: "top", offset: [0, -8], className: "lf-label" });
        });

        // City and district boundary lines (OpenStreetMap), drawn when available
        if (fetchBoundaries) {
          fetchBoundaries({ lat: center[1], lon: center[0] }).then((res) => {
            if (cancelled || !map.current || !res?.areas?.length) return;
            const target = (cityName || "").toLowerCase();
            res.areas.forEach((a) => {
              const main = a.name && (a.name.toLowerCase().includes(target) || target.includes(a.name.toLowerCase()));
              const line = L.polyline(a.lines, {
                pane: "bounds", color: dark ? "#93b4ff" : "#1e3a8a", weight: main ? 2.6 : 1.2,
                opacity: main ? 0.95 : 0.55, dashArray: main ? null : "4 4", interactive: true,
              }).addTo(m);
              if (a.name) line.bindTooltip(a.name, { sticky: true, className: "lf-label" });
            });
          }).catch(() => {});
        }

        const bounds = L.latLngBounds([[center[1], center[0]], ...heatPts.map((h) => [h[0], h[1]])]);
        if (heatPts.length) m.fitBounds(bounds.pad(0.15), { maxZoom: 13 });
        else m.setView([center[1], center[0]], 11);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => { cancelled = true; map.current?.remove(); map.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, large, center?.[0], center?.[1], points.length, places.length, cityName]);

  if (failed) return <HeatMap center={center} points={points} places={places} cityName={cityName} label={label} large={large} />;
  return <div ref={box} className="real-map" role="img" aria-label={label} />;
}
