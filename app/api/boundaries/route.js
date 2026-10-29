import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const maxDuration = 30;
export const dynamic = "force-dynamic";

// Administrative boundary lines around a city, from OpenStreetMap via the Overpass API.
// Cached in memory so the same city is fetched only once per server instance.
const cache = new Map();
const OVERPASS = "https://overpass-api.de/api/interpreter";

function simplify(points, maxPoints) {
  if (points.length <= maxPoints) return points;
  const step = Math.ceil(points.length / maxPoints);
  const out = points.filter((_, i) => i % step === 0);
  out.push(points[points.length - 1]);
  return out;
}

export async function POST(req) {
  const ip = (req.headers.get("x-forwarded-for") || "local").split(",")[0].trim();
  if (!checkRateLimit(`bounds:${ip}`).ok) return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Send JSON." }, { status: 400 }); }
  const lat = Number(body?.lat), lon = Number(body?.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 85 || Math.abs(lon) > 180) {
    return NextResponse.json({ error: "Send lat and lon." }, { status: 400 });
  }
  const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  if (cache.has(key)) return NextResponse.json(cache.get(key));

  // About 25 km around the centre
  const dLat = 0.23, dLon = 0.23 / Math.max(Math.cos((lat * Math.PI) / 180), 0.2);
  const bbox = [lat - dLat, lon - dLon, lat + dLat, lon + dLon].map((v) => v.toFixed(4)).join(",");
  const query = `[out:json][timeout:20];relation["boundary"="administrative"]["admin_level"~"^(6|7|8|9)$"](${bbox});out geom;`;

  try {
    const res = await fetch(OVERPASS, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "FindMarket/1.0 (Qloo hackathon demo)" },
      body: `data=${encodeURIComponent(query)}`,
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Overpass returned ${res.status}`);
    const json = await res.json();
    const rels = (json.elements || []).filter((e) => e.type === "relation" && e.members);

    // Pick the admin level that splits the area into a useful number of cities or districts
    const byLevel = {};
    rels.forEach((r) => { const l = r.tags?.admin_level; (byLevel[l] = byLevel[l] || []).push(r); });
    const level = ["8", "7", "9", "6"].find((l) => (byLevel[l] || []).length >= 3 && byLevel[l].length <= 60)
      || Object.keys(byLevel).sort((a, b) => (byLevel[b]?.length || 0) - (byLevel[a]?.length || 0))[0];

    const areas = (byLevel[level] || []).slice(0, 60).map((r) => ({
      name: r.tags?.["name:en"] || r.tags?.name || "",
      lines: r.members
        .filter((m) => m.type === "way" && (m.role === "outer" || m.role === "") && Array.isArray(m.geometry))
        .map((m) => simplify(m.geometry.map((g) => [Number(g.lat.toFixed(5)), Number(g.lon.toFixed(5))]), 120)),
    })).filter((a) => a.lines.length);

    const out = { level, areas };
    cache.set(key, out);
    return NextResponse.json(out);
  } catch (err) {
    console.error("Boundaries error:", err.message);
    return NextResponse.json({ error: "Boundaries are not available right now.", areas: [] }, { status: 502 });
  }
}
