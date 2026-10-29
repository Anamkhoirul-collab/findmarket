import { NextResponse } from "next/server";
import { generateJSONWithImage, hasLLM } from "@/lib/llm";
import { suggestPrompt } from "@/lib/suggestPrompt";
import { sanitizeText } from "@/lib/sanitize";
import { checkRateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const maxDuration = 30;
export const dynamic = "force-dynamic";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BASE64 = 4 * 1024 * 1024;

// Keep only the expected fields, cleaned of personal data.
function clean(result) {
  const str = (v, n) => sanitizeText(typeof v === "string" ? v : "").slice(0, n);
  return {
    product: str(result.product, 120),
    category: ["food", "fashion", "craft", "beauty", "other"].includes(result.category) ? result.category : "other",
    known_facts: (result.known_facts || []).slice(0, 6).map((f) => str(f, 80)).filter(Boolean),
    options: (result.options || []).slice(0, 3).map((o) => ({
      label: str(o.label, 40), summary: str(o.summary, 120), description: str(o.description, 600),
    })).filter((o) => o.description),
    questions: (result.questions || []).slice(0, 2).map((q, i) => ({
      id: str(q.id, 40) || `q${i}`,
      question: str(q.question, 100),
      type: q.type === "choice" ? "choice" : "text",
      choices: (q.choices || []).slice(0, 4).map((c) => str(c, 40)).filter(Boolean),
      prefix: str(q.prefix, 40),
    })).filter((q) => q.question),
  };
}

export async function POST(req) {
  const ip = (req.headers.get("x-forwarded-for") || "local").split(",")[0].trim();
  const limit = checkRateLimit(`suggest:${ip}`);
  if (!limit.ok) {
    return NextResponse.json({ error: `Too many requests. Try again in ${Math.ceil(limit.retryAfterSec / 60)} minutes.` }, { status: 429 });
  }

  let body;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Send the product as JSON." }, { status: 400 });
  }
  const language = body?.language === "id" ? "id" : "en";
  const name = sanitizeText(body?.name || "").slice(0, 120);
  const { image, mimeType } = body || {};
  const hasImage = typeof image === "string" && image.length > 0;

  if (!name && !hasImage) {
    return NextResponse.json({ error: "Type a product name or add a photo." }, { status: 400 });
  }
  if (hasImage && (!ALLOWED.has(mimeType) || image.length > MAX_BASE64)) {
    return NextResponse.json({ error: "Choose a JPG, PNG or WebP photo under 10 MB." }, { status: 400 });
  }

  if (process.env.MOCK_MODE === "true" || !hasLLM()) {
    await new Promise((r) => setTimeout(r, 800));
    const id = language === "id";
    return NextResponse.json({
      mocked: true,
      product: name || (id ? "Produk dari foto" : "Product from photo"),
      category: "other",
      known_facts: [name || (id ? "Terlihat di foto" : "Seen in photo")],
      options: [
        { label: id ? "Warisan & kerajinan" : "Heritage & craft", summary: id ? "Menonjolkan proses dan tradisi" : "Highlights process and tradition", description: id ? `Contoh: ${name || "produk ini"} dibuat dengan perhatian pada detail dan membawa cerita tradisi Indonesia.` : `Sample: ${name || "this product"} is made with care for detail and carries a story of Indonesian tradition.` },
        { label: id ? "Gaya hidup modern" : "Modern lifestyle", summary: id ? "Cocok untuk keseharian" : "Fits everyday life", description: id ? `Contoh: ${name || "produk ini"} dirancang untuk dipakai sehari-hari dengan tampilan yang bersih dan modern.` : `Sample: ${name || "this product"} is designed for everyday use with a clean, modern look.` },
        { label: id ? "Hadiah premium" : "Premium gift", summary: id ? "Bernilai sebagai hadiah" : "Valued as a gift", description: id ? `Contoh: ${name || "produk ini"} menjadi hadiah istimewa yang terasa personal dan berkesan.` : `Sample: ${name || "this product"} makes a special gift that feels personal and memorable.` },
      ],
      questions: [{ id: "made_by", question: id ? "Bagaimana dibuatnya?" : "How is it made?", type: "choice", choices: id ? ["Buatan tangan", "Mesin", "Campuran"] : ["Handmade", "Machine-made", "Mixed"], prefix: id ? "Cara pembuatan" : "Made" }],
    });
  }

  try {
    const result = await generateJSONWithImage({
      prompt: suggestPrompt({ name, hasImage, language, home: typeof body?.home === "string" ? body.home.replace(/[^\p{L}\s.,'()-]/gu, "").slice(0, 60) || "Indonesia" : "Indonesia" }),
      base64: hasImage ? image : null,
      mimeType,
      fast: true,
    });
    if (result?.error === "NO_PRODUCT") return NextResponse.json({ error: "NO_PRODUCT" });
    const cleaned = clean(result || {});
    if (!cleaned.options.length) return NextResponse.json({ error: "NO_PRODUCT" });
    return NextResponse.json(cleaned);
  } catch (err) {
    console.error("Suggest error:", err);
    return NextResponse.json({ error: "The descriptions could not be written. Try again or write it yourself." }, { status: 502 });
  }
}
