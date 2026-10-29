import { NextResponse } from "next/server";
import { runMarketsOverview } from "@/lib/marketsAgent";
import { sampleOverview } from "@/app/ui/sampleCities";
import { sanitizeText } from "@/lib/sanitize";
import { checkRateLimit } from "@/lib/ratelimit";

const titleCase = (c) => c.replace(/(^|[\s-])(\p{L})/gu, (m, a, b) => a + b.toUpperCase());

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const clean = (c) => titleCase(sanitizeText(String(c || "")).replace(/[^\p{L}\p{N}\s,.'-]/gu, "").slice(0, 60).trim());

export async function POST(req) {
  const ip = (req.headers.get("x-forwarded-for") || "local").split(",")[0].trim();
  const limit = checkRateLimit(`markets:${ip}`);
  if (!limit.ok) {
    return NextResponse.json({ error: `Too many requests. Try again in ${Math.ceil(limit.retryAfterSec / 60)} minutes.` }, { status: 429 });
  }
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Send a list of cities." }, { status: 400 }); }
  const cities = [...new Set((body?.cities || []).map(clean).filter((c) => c.length >= 2))].slice(0, 12);
  if (!cities.length) return NextResponse.json({ markets: [] });

  if (process.env.MOCK_MODE === "true" || !process.env.QLOO_API_KEY) {
    return NextResponse.json({ mocked: true, markets: cities.map((c) => sampleOverview(c) || { city: c, ok: false, taste_tags: [], trending_brands: [] }) });
  }
  try {
    return NextResponse.json({ mocked: false, markets: await runMarketsOverview(cities) });
  } catch (err) {
    console.error("Markets error:", err);
    return NextResponse.json({ error: "Markets could not be loaded." }, { status: 502 });
  }
}
