// Instruction for turning a product name and/or photo into description options.
// Options must share the same facts and differ only in positioning,
// so the user never picks a description that claims things the product lacks.
export function suggestPrompt({ name, hasImage, language, home = "Indonesia" }) {
  const lang = language === "id" ? "Indonesian (Bahasa Indonesia)" : "English";
  return `A small business owner in ${home} wants to describe a product for export.
${name ? `Product name they typed: """${name}"""` : "They gave no name."}
${hasImage ? "A photo of the product is attached." : "No photo was given."}

Write everything in ${lang}. Return JSON only, in this shape:
{
  "product": "short product name",
  "category": "one of: food, fashion, craft, beauty, other",
  "known_facts": ["2-6 short facts that are stated in the name or clearly visible in the photo"],
  "options": [
    {"label": "2-4 word name of the positioning angle", "summary": "one short line on what this angle emphasises", "description": "2-3 sentences"}
  ],
  "questions": [
    {"id": "short_snake_case_id", "question": "short question", "type": "choice or text", "choices": ["2-4 short answers, only for choice"], "prefix": "short label used when adding the answer, e.g. Origin"}
  ]
}

Rules:
- Give exactly 3 options. All three use the SAME facts. They differ only in positioning, for example heritage and craft, modern everyday lifestyle, premium gift or collectible. Pick the three angles that suit this product best.
- Never invent facts that are not in the name or photo: no origin region, materials, process, certifications, awards or quantities unless stated or clearly visible. Use "appears to" for things that are visible but uncertain.
- Give 0 to 2 questions, only for facts that would change who buys the product and that you could not tell (for example where it is made, or handmade versus machine-made). Do not ask about anything already known. Never ask for names, contact details or prices.
- Never mention people, faces, names, or contact details seen in the photo.
- If there is no name and the photo does not clearly show a product, return {"error": "NO_PRODUCT"}.`;
}
