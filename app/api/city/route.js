import { NextResponse } from "next/server";
import { runCityAgent } from "@/lib/cityAgent";
import { hasLLM } from "@/lib/llm";
import { sampleCityFull as sampleCity, SAMPLE_CITY_NAMES } from "@/app/ui/sampleCities";
import { sanitizeText } from "@/lib/sanitize";
import { checkRateLimit } from "@/lib/ratelimit";

const titleCase = (c) => c.replace(/(^|[\s-])(\p{L})/gu, (m, a, b) => a + b.toUpperCase());

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function POST(req) {
  const ip = (req.headers.get("x-forwarded-for") || "local").split(",")[0].trim();
  const limit = checkRateLimit(`city:${ip}`);
  if (!limit.ok) {
    return NextResponse.json({ error: `Too many requests. Try again in ${Math.ceil(limit.retryAfterSec / 60)} minutes.` }, { status: 429 });
  }
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Send a city as JSON." }, { status: 400 }); }
  const city = titleCase(sanitizeText(body?.city || "").replace(/[^\p{L}\p{N}\s,.'-]/gu, "").slice(0, 60).trim());
  const language = body?.language === "id" ? "id" : "en";
  const AGES = ["24_and_younger", "25_to_29", "30_to_34", "35_to_44", "45_to_54", "55_and_older"];
  const audience = {
    age: AGES.includes(body?.audience?.age) ? body.audience.age : undefined,
    gender: ["male", "female"].includes(body?.audience?.gender) ? body.audience.gender : undefined,
  };
  if (city.length < 2) return NextResponse.json({ error: "Type a city name." }, { status: 400 });

  if (process.env.MOCK_MODE === "true" || !process.env.QLOO_API_KEY || !hasLLM()) {
    if (audience.age || audience.gender) return NextResponse.json({ error: "AUDIENCE_LIVE_ONLY" }, { status: 400 });
    const s = sampleCity(city, language);
    if (!s) return NextResponse.json({ error: `Sample mode has profiles for ${SAMPLE_CITY_NAMES.join(", ")} only.` }, { status: 404 });
    return NextResponse.json(s);
  }
  try {
    const home = typeof body?.home?.name === "string" && /^[A-Z]{2}$/.test(body?.home?.code || "") ? { code: body.home.code, name: body.home.name.replace(/[^\p{L}\s.,'()-]/gu, "").slice(0, 60) } : undefined;
    return NextResponse.json(await runCityAgent({ city, language, audience, home }));
  } catch (err) {
    console.error("City agent error:", err);
    return NextResponse.json({ error: err.message || "Something went wrong.", trace: err.trace || [] }, { status: 502 });
  }
}
