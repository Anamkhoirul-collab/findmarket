import { NextResponse } from "next/server";
import { runAgent } from "@/lib/agent";
import { sanitizeText } from "@/lib/sanitize";
import { checkRateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function POST(req) {
  const ip = (req.headers.get("x-forwarded-for") || "local").split(",")[0].trim();
  const limit = checkRateLimit(ip);
  if (!limit.ok) {
    return NextResponse.json(
      { error: `Too many requests. Try again in ${Math.ceil(limit.retryAfterSec / 60)} minutes.` },
      { status: 429 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON body with a description." }, { status: 400 });
  }

  const description = sanitizeText(body?.description || "");
  const language = body?.language === "id" ? "id" : "en";

  if (description.length < 20) {
    return NextResponse.json({ error: "Describe your product in at least one full sentence." }, { status: 400 });
  }
  if (description.length > 1200) {
    return NextResponse.json({ error: "Keep the description under 1,200 characters." }, { status: 400 });
  }

  try {
    const code = typeof body?.home?.code === "string" && /^[A-Z]{2}$/.test(body.home.code) ? body.home.code : "ID";
    const hname = typeof body?.home?.name === "string" ? body.home.name.replace(/[^\p{L}\s.,'()-]/gu, "").slice(0, 60) : "Indonesia";
    const homeObj = { code, name: hname || "Indonesia" };
    // Streaming mode: one JSON object per line, {type:"step"} as the agent works, then {type:"result"}.
    if (body?.stream) {
      const enc = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const send = (obj) => controller.enqueue(enc.encode(JSON.stringify(obj) + "\n"));
          try {
            const result = await runAgent({ description, language, home: homeObj, onStep: (st) => send({ type: "step", step: st }) });
            send({ type: "result", result });
          } catch (err) {
            console.error("Agent error:", err);
            send({ type: "error", error: err.message || "Something went wrong.", trace: err.trace || [] });
          }
          controller.close();
        },
      });
      return new Response(stream, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-cache, no-transform" } });
    }
    const result = await runAgent({ description, language, home: homeObj });
    return NextResponse.json(result);
  } catch (err) {
    console.error("Agent error:", err);
    return NextResponse.json({ error: err.message || "Something went wrong.", trace: err.trace || [] }, { status: 502 });
  }
}
