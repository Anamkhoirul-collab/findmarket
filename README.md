# FindMarket

**Find where in the world your product will feel at home.**

FindMarket is an agent that helps Indonesian small businesses (UMKM) choose export markets by taste, not just by trade statistics. A batik maker, coffee cooperative or rattan workshop describes its product in plain language (Indonesian or English). FindMarket uses Qloo's taste graph to find the cities abroad where people with matching taste live, what else that audience loves, and how to tell the product's story to them.

## Why it needs Qloo

Existing export tools answer "which country imports this product category?" using customs data and tariffs (for example ITC Export Potential Map) or connect sellers with buyers (Kemendag InaExport). None of them answer "which audience will love this specific product, where do they live, and what else do they like?" A general LLM can only guess at that. FindMarket grounds every market, brand and taste word in Qloo results, and code checks the final markets against Qloo's destination list. Without Qloo, the app has nothing to say.

## What's inside

- **Dashboard:** every brief at a glance, top cities across briefs, categories, recent activity.
- **Markets:** featured cities with their top taste words and trending brands, plus search for any city.
- **City profile:** taste words, brands, music, places, age tendencies and product opportunity ideas for Indonesian makers. Labelled as taste data, not sales data.
- **New analysis:** type a product name, pick one of three descriptions, review, run.
- **Results:** world map on the left, ranked markets on the right, and a detail page for each market.
- **Compare cities:** up to three city profiles side by side.
- **Export:** download a brief as PDF (print-ready layout) or copy a plain-text summary for email or business matching forms.
- **My briefs, Settings, Help.** Briefs and city profiles are saved only in the browser.

## How the agent works

1. **Understand.** Claude (with optional Groq, Cerebras and Gemini backups) turns the description into taste concepts (e.g. "specialty coffee", "sustainable") and reference brands whose fans would likely love the product.
2. **Resolve.** Qloo `GET /v2/tags` and `GET /search` turn those words into real Qloo IDs.
3. **Decide.** Several tags share a name but differ by type (a music genre vs. a place genre). The agent chooses the types that describe buyers of this product, and code drops any ID that Qloo did not return.
4. **Explore.** Parallel `GET /v2/insights` calls for destinations, brands, artists, taste tags and demographics, then local places in the top city (`filter.location.query`).
5. **Write.** Gemini writes a market brief that may only mention names found in the Qloo data.
6. **Verify.** Each recommended market is checked against Qloo's destination results and marked in the interface.

Every step is shown in the "How the agent worked" panel, including failures.

### City and Markets agents

- `POST /api/city` (`lib/cityAgent.js`): Qloo insights with a location signal for taste tags, brands, artists and places, an optional trending pass, and demographics for the top tags. Gemini turns them into product ideas; code drops any signal Qloo did not return.
- `POST /api/markets` (`lib/marketsAgent.js`): light overview for many cities at once (taste tags and trending brands only, no AI), cached in the browser for a day.
- `POST /api/where`: "Where to sell". Qloo places in the city ranked for the brief's own taste signals, plus a Qloo heatmap of where that audience concentrates.
- City profiles also use the Qloo **heatmap**, **cross-domain** insights (podcasts, TV shows, books) for marketing channels, and optional **demographic signals** (`signal.demographics.age`, `signal.demographics.gender`) to narrow the audience.
- `POST /api/suggest`: turns a product name into three descriptions that share the same facts and differ only in positioning.

### Official market data and confidence

- The agent picks the product's HS code. For every recommended country it fetches **UN Comtrade** imports (five-year trend, growth, top suppliers, Indonesia's rank) when `COMTRADE_API_KEY` is set, and **World Bank** population and GDP per person (no key).
- Each market gets a **confidence level** from seven independent checks (taste match, Qloo signals, local venues, imports, import growth, purchasing power, audience profile), shown with sources and the retrieval date.

## Qloo usage rules we follow

- The Qloo key lives only in server environment variables. All Qloo calls go through `app/api/analyze/route.js`; the browser never sees the key. `.env.local` is git-ignored.
- No personal data is sent. The interface asks for a product description only, and `lib/sanitize.js` strips emails, phone numbers, URLs and social handles before anything leaves the server.
- Results are phrased as group tendencies, never as predictions about one person.
- Simple per-IP rate limiting protects the API quota.

## Run it locally

Requires Node.js 18.18 or newer.

```bash
npm install
cp .env.example .env.local   # then fill in your keys
npm run dev                  # open http://localhost:3000
```

Set `MOCK_MODE=true` in `.env.local` to try the interface with sample data before you have keys.

| Variable | Required | Purpose |
| --- | --- | --- |
| `QLOO_API_KEY` | yes | Your Qloo hackathon key |
| `QLOO_BASE_URL` | yes | `https://hackathon.api.qloo.com` |
| `ANTHROPIC_API_KEY` | yes | Claude: main model for every AI step |
| `ANTHROPIC_MODEL` / `ANTHROPIC_FAST_MODEL` | no | Default `claude-haiku-5-5`; use `claude-sonnet-5-5` for higher quality briefs |
| `COMTRADE_API_KEY` | optional | UN Comtrade key for official import data per country |
| `GROQ_API_KEY` | optional | Automatic backup if Claude is unavailable |
| `CEREBRAS_API_KEY` | optional | Second backup |
| `GEMINI_API_KEY` | optional | Last text backup |
| `GEMINI_MODEL` | no | Defaults to `gemini-3.0-flash` |
| `GEMINI_FAST_MODEL` | no | Light model for small steps (description options, planning, tag choice) |
| `GEMINI_FALLBACK_MODEL` | no | Used if the chosen model stays busy |
| `MOCK_MODE` | no | `true` uses sample data |

## Deploy

Import the repository into Vercel, add the environment variables above, and deploy. The API route allows up to 60 seconds per request.

## Project structure

```
app/page.js               Connects the interface to the server routes
app/ui/                   Interface: App shell, pages, map, strings (English and Indonesian)
app/api/analyze/route.js  Market brief agent endpoint
app/api/suggest/route.js  Description options from a product name
app/api/city/route.js     City taste profile and product ideas
app/api/markets/route.js  Light multi-city overview
app/api/where/route.js    Where to sell: places and heatmap for a brief's signals
lib/agent.js              The market brief agent loop
lib/cityAgent.js          City taste profile agent
lib/marketsAgent.js       Markets overview
lib/qloo.js               Qloo client (server only)
lib/llm.js                Gemini client (server only)
lib/sanitize.js           Personal data removal
lib/mock.js               Sample data for MOCK_MODE
app/ui/worldMap.js        World map paths from Natural Earth (public domain)
```

## Map data

Street maps use the Esri World Light Gray canvas (English place names), drawn with Leaflet (Tiles © Esri — Esri, HERE, Garmin, © OpenStreetMap contributors). Place names sit on a separate layer above the Qloo heatmap so they stay readable. City and district boundary lines come from OpenStreetMap through the Overpass API (`POST /api/boundaries`, cached per server instance). The world map on the results page is drawn from Natural Earth (public domain).

## License

MIT. See [LICENSE](LICENSE).
