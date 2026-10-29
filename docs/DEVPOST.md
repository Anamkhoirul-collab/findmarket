# FindMarket: Devpost submission

Copy each section into the matching Devpost field. Replace everything in [square brackets] before submitting.

---

## Project name

FindMarket

## Tagline (short description)

Find where your product feels at home. An AI agent that uses Qloo's taste graph and official trade data to show small exporters which cities abroad will love their product.

---

## Inspiration

Millions of small businesses make products that could sell abroad: a carved chair from Jepara, single-origin coffee from Gayo, a hand-drawn batik scarf. Existing export tools answer one question: *which country imports this product category?* That is useful, but it says nothing about **who** will love the product, **where** those people live, or **how** to speak to them.

We wanted to give a small maker the kind of market insight that big brands pay agencies for, in under a minute, starting from nothing more than a product name.

## What it does

A user types a product name. FindMarket's agent then:

1. **Writes three product descriptions** to choose from, using only facts in the name.
2. **Finds the audience's taste in Qloo:** turns the product into Qloo tags and reference brands, picks the right tag types, and ranks destinations by audience affinity.
3. **Scores every city with two Qloo signals:** *taste match* (destination affinity) and *local venues* (how well the city's shops and places match the product), combined into one audience fit score.
4. **Checks official data:** for each country, UN Comtrade imports of the product's HS code (five-year trend, growth, top suppliers and the user's own country's rank), plus World Bank population and income.
5. **Writes an export brief** that only uses names returned by Qloo, then verifies every recommended city against Qloo's results.

The result is a brief with:

- A **best-market verdict** at the top, with fit, imports and a confidence level.
- A **world map** of recommended cities, ranked by audience fit.
- For every city: **why this market**, an **import trend** and **supplier share**, **where to sell** (Qloo places on a real street map with a Qloo heatmap of where the audience concentrates), **who the audience is** (Qloo demographics), **how to pitch** and **next steps**.
- A **"Why you can trust this"** panel: seven independent checks with sources and retrieval dates, so exporters can see exactly what each recommendation rests on.

Users can also explore any city's taste profile (what people like, product ideas, podcasts, TV and books for marketing), compare up to three cities side by side, download a brief as PDF, and share it as a link.

FindMarket works for exporters anywhere: it detects the user's country, starts routes from there, skips home-country cities and shows the user's own position among suppliers.

## How we built it

- **Frontend and API:** Next.js 14 (App Router), deployed on Vercel. All API keys stay on the server.
- **Taste data:** Qloo Insights API: `/v2/tags`, `/search`, and `/v2/insights` with destinations, brands, artists, tags, places, demographics, heatmaps, podcasts, TV shows and books, plus location and demographic signals.
- **AI:** Claude (Anthropic) for understanding the product, choosing Qloo tag types and writing the brief, with automatic failover to Groq and Cerebras.
- **Official data:** UN Comtrade (imports by HS code) and World Bank (population, GDP per person).
- **Maps:** Natural Earth for the results map, Leaflet with Esri grey canvas tiles (English labels) and OpenStreetMap boundaries for city heatmaps.
- **Live agent view:** the analysis endpoint streams each finished step to the browser, so users watch the agent work with Qloo in real time.

## How we use Qloo

Qloo is the core of FindMarket, not a decoration:

- **Resolve:** product keywords become Qloo tags (`/v2/tags`) and reference brands become entities (`/search`).
- **Decide:** the agent chooses the right tag types for the product (for example, the right kind of "craft"), and code drops any ID Qloo did not return.
- **Rank:** `/v2/insights` with `urn:entity:destination` ranks cities by audience affinity.
- **Explore:** brands, artists, taste tags and demographics for the same audience shape the audience portrait and pitch.
- **Locate:** `urn:entity:place` with a location filter finds venues in each city that match the product, used both for "where to sell" and for the local-venue half of the fit score.
- **Map:** `urn:heatmap` shows where in each city the audience concentrates.
- **City profiles:** location signals give each city's taste words, brands, places and cross-domain picks (podcasts, TV, books) for marketing ideas.

Every brand, city and taste word in a brief comes from Qloo results; the agent is not allowed to invent signals, and each recommended city is verified against Qloo's destination list.

## Challenges we ran into

- **Tourism-shaped destinations:** Qloo destinations lean toward travel spots, so early results included resort islands. We now request more candidates and instruct the agent to prefer trading cities, only keeping resorts when the product suits hospitality.
- **Flat or generic signals:** some city taste scores came back identical, and generic tags like "Tourist attraction" crowded the list. We filter generic tags and fall back to Qloo's ranking when scores are flat.
- **Trust:** a single affinity score was not enough for an exporter to act on. We added a second Qloo signal, official trade data and a transparent confidence panel.
- **Reliability:** AI models can be busy or out of quota. The client retries briefly and fails over between providers.

## Accomplishments that we're proud of

- A full agentic pipeline that users can **watch live**, step by step, as it calls Qloo.
- Recommendations an exporter can **verify**: every number shows its source and date.
- Combining **taste data with trade data** in one view, which existing export tools don't do.
- A product that works for **any exporting country**, not just one.

## What we learned

- Taste data is most persuasive when paired with hard numbers; together they answer both "will people love it?" and "do they already buy it?"
- Showing an agent's steps builds more trust than hiding them behind a spinner.
- Guardrails matter: keeping the AI to names Qloo actually returned made the briefs far more credible.

## What's next for FindMarket

- Short share links and team workspaces.
- Tariff and import-rule data per product and country.
- Buyer and distributor matching, starting with the venues Qloo already finds.
- More languages for the interface and briefs.

## Built with

nextjs, react, javascript, qloo, claude, anthropic, un-comtrade, world-bank, leaflet, openstreetmap, natural-earth, vercel

## Try it out

- Live demo: [https://your-project.vercel.app]
- Code: [https://github.com/your-username/findmarket]

---

## Testing instructions for judges (optional field)

1. Open the live demo. On first visit, choose **See an example** to view a full brief instantly, or **Analyse my product** to run the agent.
2. To run the agent, type a product name (for example "Hand-carved teak chair") or tap an example, press **Find markets**, pick a description and run it. Watch the agent's Qloo steps appear live.
3. On the results page, open a city to see the import trend, supplier share, where to sell, the heatmap and "Why you can trust this".
4. Try **Markets** to explore any city's taste profile, and **Compare** to put cities side by side.

Taste data shows group tendencies, not individual behaviour, and no personal data is sent to Qloo.
