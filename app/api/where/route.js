import { NextResponse } from "next/server";
import { placesFor, heatmap } from "@/lib/qloo";
import { sampleWhere } from "@/app/ui/sampleCities";
import { sanitizeText } from "@/lib/sanitize";
import { checkRateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const maxDuration = 30;
export const dynamic = "force-dynamic";

// "Where to sell": places in a city whose audience matches the product's taste signals.
export async function POST(req) {
  const ip = (req.headers.get("x-forwarded-for") || "local").split(",")[0].trim();
  if (!checkRateLimit(`where:${ip}`).ok) return NextResponse.json({ error: "Too many requests. Try again in a few minutes." }, { status: 429 });
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Send JSON." }, { status: 400 }); }
  const city = sanitizeText(body?.city || "").replace(/[^\p{L}\p{N}\s,.'-]/gu, "").slice(0, 60).trim();
  const ids = (a) => (Array.isArray(a) ? a.filter((x) => typeof x === "string" && x.length < 200).slice(0, 6) : []);
  const tagIds = ids(body?.tagIds), entityIds = ids(body?.entityIds);
  if (city.length < 2) return NextResponse.json({ error: "Type a city." }, { status: 400 });

  if (process.env.MOCK_MODE === "true" || !process.env.QLOO_API_KEY) {
    const s = sampleWhere(city);
    return s ? NextResponse.json(s) : NextResponse.json({ error: "Sample mode has no places for this city." }, { status: 404 });
  }
  const trace = [];
  const run = async (name, tool, fn) => {
    try { const r = await fn(); trace.push({ name, tool, ok: true, detail: `${r.length} results` }); return r; }
    catch (e) { trace.push({ name, tool, ok: false, detail: String(e.message || e).slice(0, 200) }); return []; }
  };
  const [places, heat] = await Promise.all([
    run(`Places in ${city} for this audience`, "Qloo /v2/insights (place)", () => placesFor({ location: city, tagIds, entityIds, take: 10 })),
    run(`Where this audience is in ${city}`, "Qloo /v2/insights (heatmap)", () => heatmap({ location: city, tagIds, entityIds })),
  ]);
  return NextResponse.json({ mocked: false, city, places, heatmap: heat, trace });
}
