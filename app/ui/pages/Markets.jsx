"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon, Badge } from "../components";
import { citySlug, loadOverviews, saveOverviews } from "../store";

// country (en, id) and region for cities we know
const PLACE = {
  Tokyo: ["Japan", "Jepang", "asia"], Kyoto: ["Japan", "Jepang", "asia"], Osaka: ["Japan", "Jepang", "asia"], Seoul: ["South Korea", "Korea Selatan", "asia"],
  Singapore: ["Singapore", "Singapura", "asia"], "Hong Kong": ["Hong Kong", "Hong Kong", "asia"], Bangkok: ["Thailand", "Thailand", "asia"], Taipei: ["Taiwan", "Taiwan", "asia"],
  Melbourne: ["Australia", "Australia", "oceania"], Sydney: ["Australia", "Australia", "oceania"], Auckland: ["New Zealand", "Selandia Baru", "oceania"],
  Dubai: ["United Arab Emirates", "Uni Emirat Arab", "mideast"], Doha: ["Qatar", "Qatar", "mideast"], "Tel Aviv": ["Israel", "Israel", "mideast"], Riyadh: ["Saudi Arabia", "Arab Saudi", "mideast"],
  Amsterdam: ["Netherlands", "Belanda", "europe"], London: ["United Kingdom", "Inggris", "europe"], Paris: ["France", "Prancis", "europe"], Berlin: ["Germany", "Jerman", "europe"],
  Copenhagen: ["Denmark", "Denmark", "europe"], Barcelona: ["Spain", "Spanyol", "europe"], Madrid: ["Spain", "Spanyol", "europe"], Milan: ["Italy", "Italia", "europe"], Stockholm: ["Sweden", "Swedia", "europe"],
  "Los Angeles": ["United States", "Amerika Serikat", "americas"], "New York": ["United States", "Amerika Serikat", "americas"], Portland: ["United States", "Amerika Serikat", "americas"],
  "San Francisco": ["United States", "Amerika Serikat", "americas"], Toronto: ["Canada", "Kanada", "americas"], Vancouver: ["Canada", "Kanada", "americas"],
};
const REGIONS = ["asia", "oceania", "mideast", "europe", "americas"];
const REGION_OF = {
  Japan: "asia", "South Korea": "asia", Singapore: "asia", Thailand: "asia", Malaysia: "asia", Vietnam: "asia", Philippines: "asia", China: "asia", "Hong Kong": "asia", Taiwan: "asia", India: "asia", Maldives: "asia", "Sri Lanka": "asia",
  Australia: "oceania", "New Zealand": "oceania",
  "United Arab Emirates": "mideast", Qatar: "mideast", "Saudi Arabia": "mideast", Israel: "mideast", Turkey: "mideast", Oman: "mideast", Kuwait: "mideast",
  Netherlands: "europe", "United Kingdom": "europe", France: "europe", Germany: "europe", Denmark: "europe", Spain: "europe", Italy: "europe", Sweden: "europe", Norway: "europe", Finland: "europe", Belgium: "europe", Switzerland: "europe", Austria: "europe", Portugal: "europe", Ireland: "europe", Greece: "europe", Poland: "europe", "Czech Republic": "europe",
  "United States": "americas", Canada: "americas", Mexico: "americas", Brazil: "americas", Argentina: "americas", Chile: "americas", Colombia: "americas",
};
const aff = (a) => (typeof a === "number" ? Math.round(a <= 1 ? a * 100 : a) : null);

function SelectBtn({ icon, label, value, onChange, options }) {
  return (
    <label className="select-btn">
      {icon}
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      {Icon.chevron}
    </label>
  );
}

export default function Markets({ t, lang, go, briefs, featured, marketsOverview, sampleNote }) {
  const [q, setQ] = useState("");
  const [data, setData] = useState({});
  const [error, setError] = useState("");
  const [sort, setSort] = useState("affinity");
  const [region, setRegion] = useState("all");
  const [taste, setTaste] = useState("all");
  const [source, setSource] = useState("all");
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [banner, setBanner] = useState(true);

  const briefCountry = useMemo(() => {
    const c = {};
    briefs.forEach((b) => (b.report?.markets || []).forEach((m) => { if (m.country && !c[m.name]) c[m.name] = m.country; }));
    return c;
  }, [briefs]);
  const briefCount = useMemo(() => {
    const c = {};
    briefs.forEach((b) => new Set((b.report?.markets || []).map((m) => m.name)).forEach((n) => { c[n] = (c[n] || 0) + 1; }));
    return c;
  }, [briefs]);
  const fromBriefs = useMemo(() => Object.keys(briefCount).filter((c) => !featured.includes(c)).slice(0, 8), [briefCount, featured]);
  const all = useMemo(() => [...featured, ...fromBriefs], [featured, fromBriefs]);

  useEffect(() => {
    const cached = loadOverviews();
    const have = {};
    all.forEach((c) => { const v = cached[citySlug(c)]; if (v) have[c] = v.data; });
    setData(have);
    const missing = all.filter((c) => !have[c]);
    if (!missing.length || !marketsOverview) return;
    let alive = true;
    marketsOverview({ cities: missing })
      .then((res) => {
        if (!alive) return;
        const next = { ...cached }, add = {};
        (res.markets || []).forEach((m) => {
          const key = missing.find((c) => c.toLowerCase() === (m.city || "").toLowerCase()) || m.city;
          const rec = { ...m, mocked: !!res.mocked };
          add[key] = rec;
          if (m.ok) next[citySlug(key)] = { at: Date.now(), data: rec };
        });
        missing.forEach((c) => { if (!add[c]) add[c] = { city: c, ok: false }; });
        saveOverviews(next);
        setData((d) => ({ ...d, ...add }));
      })
      .catch((err) => alive && setError(err.message || String(err)));
    return () => { alive = false; };
  }, [all, marketsOverview]);

  const rows = useMemo(() => all.map((c) => {
    const m = data[c];
    const p = PLACE[c] || [];
    const top = m?.taste_tags?.[0];
    return {
      city: c, loading: !m, ok: m ? m.ok : true, mocked: !!m?.mocked,
      country: (lang === "id" ? p[1] : p[0]) || briefCountry[c], region: p[2] || REGION_OF[p[0] || briefCountry[c]] || "other",
      top: top?.name || "", affinity: aff(top?.affinity), tastes: m?.taste_tags || [], trending: m?.trending_brands || [],
      briefs: briefCount[c] || 0,
    };
  }).filter((r) => r.loading || r.ok), [all, data, lang, briefCount, briefCountry]);

  const loaded = rows.filter((r) => !r.loading);
  const tasteCounts = {};
  loaded.forEach((r) => r.tastes.slice(0, 3).forEach((x) => { tasteCounts[x.name] = (tasteCounts[x.name] || 0) + 1; }));
  const tasteList = Object.entries(tasteCounts).sort((a, b) => b[1] - a[1]);
  const trendingTotal = loaded.reduce((s, r) => s + r.trending.length, 0);
  const withTrend = loaded.filter((r) => r.trending.length).length;
  const inBriefs = loaded.filter((r) => r.briefs > 0).length;
  const avgAff = loaded.filter((r) => r.affinity !== null);
  const avg = avgAff.length ? Math.round(avgAff.reduce((s, r) => s + r.affinity, 0) / avgAff.length) : null;

  const ql = q.trim().toLowerCase();
  let filtered = rows.filter((r) =>
    (region === "all" || r.region === region) &&
    (taste === "all" || r.tastes.some((x) => x.name === taste)) &&
    (source === "all" || (source === "briefs" ? r.briefs > 0 : source === "trending" ? r.trending.length > 0 : true)) &&
    (!ql || [r.city, r.country, ...r.tastes.map((x) => x.name), ...r.trending].join(" ").toLowerCase().includes(ql))
  );
  filtered = [...filtered].sort((a, b) => {
    if (sort === "name") return a.city.localeCompare(b.city);
    if (sort === "trending") return b.trending.length - a.trending.length;
    if (sort === "briefs") return b.briefs - a.briefs;
    return (b.affinity ?? -1) - (a.affinity ?? -1);
  });
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const cur = Math.min(page, pages);
  const shown = filtered.slice((cur - 1) * perPage, cur * perPage);
  useEffect(() => { setPage(1); }, [q, region, taste, source, perPage, sort]);

  const openCity = (name) => { const s = citySlug(name); if (s) go(`city-${s}`, name); };
  const exactRow = rows.some((r) => r.city.toLowerCase() === ql);
  const canExplore = q.trim().length >= 2 && !exactRow;
  const pageNums = pages <= 5 ? Array.from({ length: pages }, (_, i) => i + 1) : [1, 2, 3, "…", pages];

  return (
    <>
      {banner && (
        <div className="notice">
          <span className="notice-text">{Icon.alert}<span><strong>{t.important}</strong> {t.tasteNotSales}{sampleNote ? ` ${sampleNote}` : ""}</span></span>
          <button className="btn btn-secondary" onClick={() => go("help")}>{t.learnMore}</button>
          <button className="notice-close" onClick={() => setBanner(false)} aria-label={t.dismiss}>{Icon.close}</button>
        </div>
      )}

      <div className="toolbar">
        <div className="filters">
          <SelectBtn icon={Icon.layers} label={t.sortBy} value={sort} onChange={setSort} options={[["affinity", t.sortAffinity], ["trending", t.sortTrending], ["briefs", t.sortBriefs], ["name", t.sortName]]} />
          <span className="vsep" />
          <SelectBtn label={t.region} value={region} onChange={setRegion} options={[["all", t.allRegions], ...REGIONS.map((r) => [r, t.regions[r]])]} />
        </div>
        <div className="filters">
          <form className="search filter-search" onSubmit={(e) => { e.preventDefault(); if (canExplore) openCity(q.trim()); }} role="search">
            {Icon.search}<label htmlFor="msearch" className="sr-only">{t.marketSearchPh}</label>
            <input id="msearch" value={q} maxLength={60} placeholder={t.marketSearchShort} onChange={(e) => setQ(e.target.value)} />
          </form>
          <button className="btn btn-secondary btn-lg" onClick={() => go("compare")}>{Icon.layers}{t.compare}</button>
          <button className="btn btn-primary btn-lg" onClick={() => canExplore && openCity(q.trim())} disabled={!canExplore}>{Icon.globe}{canExplore ? t.exploreCity(q.trim()) : t.exploreAny}</button>
        </div>
      </div>
      {error && <p className="error-text">{error}</p>}

      <div className="card table-card">
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>{t.colCity}</th><th>{t.colCountry}</th><th>{t.region}</th><th>{t.topTaste}</th><th>{t.colAffinity}</th>
                <th>{t.colTastes}</th><th>{t.trendingNow}</th><th>{t.colInBriefs}</th><th>{t.colStatus}</th><th><span className="sr-only">{t.open}</span></th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => r.loading ? (
                <tr key={r.city}><td className="cell-title">{r.city}</td>{Array.from({ length: 9 }, (_, i) => <td key={i}><span className="sk-line" style={{ display: "block", width: i === 8 ? 20 : "70%" }} /></td>)}</tr>
              ) : (
                <tr key={r.city} className="clickable" onClick={() => openCity(r.city)}>
                  <td className="cell-title">{r.city}</td>
                  <td className="muted">{r.country || "–"}</td>
                  <td className="muted">{t.regions[r.region] || "–"}</td>
                  <td>{r.top || "–"}</td>
                  <td className="mono">{r.affinity !== null ? `${r.affinity}%` : "–"}</td>
                  <td className="mono">{String(r.tastes.length).padStart(2, "0")}</td>
                  <td>{r.trending.length ? <span className="muted">{r.trending.slice(0, 2).join(", ")}{r.trending.length > 2 ? ` +${r.trending.length - 2}` : ""}</span> : <span className="muted">–</span>}</td>
                  <td className="mono">{r.briefs ? String(r.briefs).padStart(2, "0") : "–"}</td>
                  <td>{r.mocked ? <Badge kind="warn">{t.sample}</Badge> : <Badge kind="success">{t.live}</Badge>}</td>
                  <td style={{ width: 40 }}><button className="icon-btn ghost" aria-label={`${t.open} ${r.city}`} onClick={(e) => { e.stopPropagation(); openCity(r.city); }}>{Icon.dots}</button></td>
                </tr>
              ))}
              {!shown.length && (
                <tr><td colSpan={10} style={{ textAlign: "center", padding: "32px 12px" }}>
                  <span className="muted">{t.noMatch}</span>
                  {canExplore && <><br /><button className="link-btn" style={{ marginTop: 8 }} onClick={() => openCity(q.trim())}>{t.exploreCity(q.trim())}</button></>}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="table-foot">
          <div className="filters" style={{ alignItems: "center" }}>
            <span className="muted" style={{ fontSize: 13 }}>{t.showItems}</span>
            <SelectBtn label={t.showItems} value={String(perPage)} onChange={(v) => setPerPage(Number(v))} options={[["5", "5"], ["10", "10"], ["15", "15"]]} />
          </div>
          <div className="pager">
            {pageNums.map((n, i) => n === "…"
              ? <span key={"e" + i}>…</span>
              : <button key={n} aria-current={n === cur ? "page" : undefined} onClick={() => setPage(n)}>{n}</button>)}
          </div>
          <div className="filters">
            <button className="icon-btn" onClick={() => setPage(Math.max(1, cur - 1))} disabled={cur <= 1} aria-label={t.prevPage}>{Icon.arrowLeft}</button>
            <button className="icon-btn" onClick={() => setPage(Math.min(pages, cur + 1))} disabled={cur >= pages} aria-label={t.nextPage} style={{ transform: "scaleX(-1)" }}>{Icon.arrowLeft}</button>
          </div>
        </div>
      </div>
    </>
  );
}
