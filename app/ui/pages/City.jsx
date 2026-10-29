"use client";

import { useEffect, useState } from "react";
import { Icon, Card, Bars, Badge, EmptyArt } from "../components";
import { findCity, saveCity } from "../store";
import { fmtDate } from "./Dashboard";
import { coordsFor } from "../geo";
import RealHeatMap from "../RealHeatMap";
import ExpandableMap from "../ExpandableMap";

const CATS = ["food", "fashion", "craft", "beauty"];

// Qloo demographics can come in different shapes; turn them into label/value rows.
function demoRows(demo) {
  if (!demo) return [];
  const list = Array.isArray(demo) ? demo : [demo];
  if (list.every((d) => d && typeof d.label === "string" && typeof d.value === "number")) return list;
  const rows = [];
  const walk = (obj, prefix) => {
    for (const [k, v] of Object.entries(obj || {})) {
      if (typeof v === "number") rows.push({ label: `${prefix}${k}`.replace(/_/g, " "), value: v });
      else if (v && typeof v === "object" && !Array.isArray(v) && prefix.length < 30) walk(v, prefix ? `${prefix}${k} · ` : `${k} · `);
    }
  };
  list.forEach((d) => walk(d, ""));
  return rows.filter((r) => !/query|id|count/i.test(r.label)).slice(0, 8);
}

function SelectBtn({ label, value, onChange, options }) {
  return (
    <label className="select-btn">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      {Icon.chevron}
    </label>
  );
}

// Card in the style of the kit's "Zone utilization comparison".
function CompareCard({ icon, title, big, bigLabel, select, rows, note }) {
  return (
    <section className="card compare">
      <div className="card-head"><h3 className="card-title">{icon}{title}</h3></div>
      <div className="card-body">
        <div className="compare-top">
          <div><strong>{big}</strong><span>{bigLabel}</span></div>
          {select}
        </div>
        {rows.map((r) => (
          <div className={`compare-row${r.highlight ? " hl" : ""}`} key={r.label}>
            <div className="bars-top"><span>{r.label}</span><span className="mono">{Math.round(r.value)}%</span></div>
            <Bars percent={r.value} />
            <div className="bars-scale mono"><span>0</span><span>20</span><span>40</span><span>60</span><span>80</span><span>100</span></div>
          </div>
        ))}
        {note}
      </div>
    </section>
  );
}

export default function City({ t, lang, slug, nameHint, exploreCity, go, onCached, onAnalyse, realMaps = false, fetchBoundaries = null }) {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState(0);
  const [cat, setCat] = useState("all");
  const [likeTop, setLikeTop] = useState("5");
  const [ageOrder, setAgeOrder] = useState("age");
  const [aud, setAud] = useState({ age: "", gender: "" });
  const [audError, setAudError] = useState("");

  async function load(force, audience = aud) {
    const hasAud = !!(audience.age || audience.gender);
    const cached = !force && !hasAud && findCity(slug, lang);
    if (cached) { setProfile(cached); return; }
    setLoading(true); setError(""); setPhase(0);
    const id = setInterval(() => setPhase((p) => Math.min(p + 1, t.cityPhases.length - 1)), 2500);
    try {
      const name = nameHint || profile?.city || slug.replace(/-/g, " ");
      const p = await exploreCity({ city: name, language: lang, audience: hasAud ? audience : undefined });
      setProfile(p);
      if (!hasAud) onCached(saveCity(p, lang));
    } catch (err) {
      if (hasAud && profile) { setAudError(err.message === "AUDIENCE_LIVE_ONLY" ? t.audienceLiveOnly : (err.message || String(err))); setAud({ age: "", gender: "" }); return; }
      setError(err.message || String(err));
    } finally {
      clearInterval(id);
      setLoading(false);
    }
  }
  useEffect(() => { setProfile(null); load(false); /* eslint-disable-next-line */ }, [slug, lang]);
  function changeAudience(patch) {
    const next = { ...aud, ...patch };
    setAud(next); setAudError("");
    load(true, next);
  }

  if (loading) {
    return (
      <div className="flow"><div className="form-card">
        <h2>{nameHint || slug.replace(/-/g, " ")}</h2>
        <p className="sub">{t.loadingCity}</p>
        <div className="progress" aria-live="polite">
          {t.cityPhases.map((ph, i) => (
            <div key={ph} className={`progress-row ${i < phase ? "done" : i === phase ? "now" : ""}`}><span className="p-dot">{i < phase ? Icon.check : null}</span>{ph}</div>
          ))}
        </div>
      </div></div>
    );
  }
  const p = profile;
  if (error || !p) {
    return (
      <div className="card"><div className="empty">
        <EmptyArt /><h3>{t.cityNotFound}</h3><p>{error}</p>
        <div className="row">
          <button className="btn btn-secondary btn-lg" onClick={() => go("markets")}>{Icon.arrowLeft}{t.backToExplore}</button>
          {error && <button className="btn btn-primary btn-lg" onClick={() => load(true)}>{t.tryAgain}</button>}
        </div>
      </div></div>
    );
  }

  const tags = (p.taste_tags || []).slice(0, Number(likeTop));
  const maxAff = Math.max(...tags.map((x) => x.affinity || 0), 0.0001);
  const strength = (a) => (typeof a === "number" ? (a / maxAff) * 100 : 60);
  const demo = demoRows(p.demographics);
  const dMax = Math.max(...demo.map((d) => Math.abs(d.value)), 0.0001);
  const peak = demo.length ? demo.reduce((a, b) => (Math.abs(b.value) > Math.abs(a.value) ? b : a)) : null;
  const ideas = (p.opportunities || []).filter((o) => cat === "all" || o.category === cat);
  const trending = p.trending_brands || [];
  const extras = [[t.musicLiked, p.artists], [t.placesIn, p.places]].filter(([, l]) => (l || []).length);

  return (
    <div className="report city-page">
      <div className="detail-head">
        <div className="detail-title">
          <div className="detail-icon">{Icon.pin}</div>
          <div style={{ minWidth: 0 }}>
            <h2>{p.city}</h2>
            <div className="meta">
              {p.country && <><span>{p.country}</span><span className="sep" /></>}
              <span>{t.updated} {fmtDate(p.fetchedAt, lang, true)}</span>
              {p.mocked ? <Badge kind="warn">{t.sample}</Badge> : <Badge kind="success">{t.live}</Badge>}
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary btn-lg" onClick={() => go(`compare-${slug}`)}>{Icon.layers}{t.compare}</button>
          <button className="icon-btn" style={{ width: 38, height: 38 }} onClick={() => load(true)} aria-label={t.refresh} title={t.refresh}>{Icon.clock}</button>
        </div>
      </div>

      <details className="audience-fold" open={!!(aud.age || aud.gender) || undefined}>
        <summary>{Icon.users}{t.narrowAudience}{(aud.age || aud.gender) && <Badge kind="info">{t.filtered}</Badge>}</summary>
      <div className="audience-bar">
        <SelectBtn label={t.gender} value={aud.gender} onChange={(v) => changeAudience({ gender: v })} options={[["", t.everyone], ["female", t.women], ["male", t.men]]} />
        <SelectBtn label={t.ageGroup} value={aud.age} onChange={(v) => changeAudience({ age: v })} options={[["", t.allAges], ["24_and_younger", "≤24"], ["25_to_29", "25–29"], ["30_to_34", "30–34"], ["35_to_44", "35–44"], ["45_to_54", "45–54"], ["55_and_older", "55+"]]} />
        {audError && <span className="hint">{audError}</span>}
      </div>
      </details>

      {/* 1. Who this audience is, in plain words */}
      <section className="card summary-card">
        <div className="card-body">
          <h3 className="card-title">{Icon.users}{t.qWho}</h3>
          <p className="summary-text">{p.summary}</p>
          <div className="key-facts">
            <div className="key-fact"><span>{t.factTopTaste}</span><strong>{tags[0]?.name || "–"}</strong></div>
            {peak && <div className="key-fact"><span>{t.factAge}</span><strong>{peak.label}</strong></div>}
            <div className="key-fact"><span>{t.factTrending}</span><strong>{trending[0] || "–"}</strong></div>
          </div>
        </div>
      </section>

      {/* 2. What could I make for them */}
      <section className="card">
        <div className="card-head">
          <h3 className="card-title">{Icon.sparkle}{t.qMake}</h3>
        </div>
        <div className="card-body">
          <div className="chips" style={{ marginBottom: 12 }}>
            <button className="chip" aria-pressed={cat === "all"} onClick={() => setCat("all")}>{t.filterAll}</button>
            {CATS.map((c) => <button key={c} className="chip" aria-pressed={cat === c} onClick={() => setCat(c)}>{t.cats[c]}</button>)}
          </div>
          {ideas.length ? (
            <div className="opp-grid">
              {ideas.map((o, i) => (
                <article className="idea-card" key={o.title + i}>
                  <span className="muted" style={{ fontSize: 12 }}>{t.cats[o.category] || t.cats.other}</span>
                  <h4>{o.title}</h4>
                  <p>{o.idea}</p>
                  <p className="idea-why">{Icon.check}<span>{o.why}</span></p>
                </article>
              ))}
            </div>
          ) : <p className="hint">{t.noMatch}</p>}
        </div>
      </section>

      {/* 3. What they like and who is most interested */}
      <div className={demo.length ? "grid-2" : ""}>
        <CompareCard
          icon={Icon.tag} title={t.qLike}
          big={`${tags.length ? Math.round(tags.reduce((a, x) => a + strength(x.affinity), 0) / tags.length) : 0}%`}
          bigLabel={t.avgStrength}
          select={<SelectBtn label={t.showTop} value={likeTop} onChange={setLikeTop} options={[["5", t.topN(5)], ["8", t.topN(8)]]} />}
          rows={tags.map((x, i) => ({ label: x.name, value: strength(x.affinity), highlight: i === 0 }))}
        />
        {demo.length > 0 && (
        <CompareCard
            icon={Icon.users} title={t.qInterested}
            big={peak ? peak.label : "–"}
            bigLabel={t.mostInterestedAge}
            select={demo.length ? <SelectBtn label={t.sortBy} value={ageOrder} onChange={setAgeOrder} options={[["age", t.byAge], ["high", t.highestFirst]]} /> : null}
            rows={(ageOrder === "high" ? [...demo].sort((a, b) => Math.abs(b.value) - Math.abs(a.value)) : demo).map((d) => ({ label: d.label, value: (Math.abs(d.value) / dMax) * 100, highlight: peak && d.label === peak.label }))}
            note={demo.length ? <p className="hint" style={{ margin: "10px 0 0" }}>{t.ageNote}</p> : <span className="hint">{t.noDemo}</span>}
          />
        )}
      </div>

      {((p.brands || []).length > 0 || trending.length > 0) && (
        <section className="card">
          <div className="card-body brand-strip">
            {(p.brands || []).length > 0 && (
              <div><div className="sub-label">{t.brandsLiked}</div><div className="tags">{p.brands.slice(0, 8).map((b) => <span className="tag" key={b}>{b}</span>)}</div></div>
            )}
            {trending.length > 0 && (
              <div><div className="sub-label">{t.trendingBrands}</div><div className="tags">{trending.map((b) => <span className="tag trend" key={b}>{b}</span>)}</div></div>
            )}
          </div>
        </section>
      )}

      {/* Where they are in the city, and how to reach them (more Qloo) */}
      <div className="grid-2-1">
        <section className="card">
          <div className="card-head"><h3 className="card-title">{Icon.pin}{t.whereTheyAre(p.city)}</h3></div>
          <div className="card-body">
            {(p.heatmap || []).length && coordsFor(p.city) ? (
              <>
                <ExpandableMap title={t.whereTheyAre(p.city)} expandLabel={t.enlargeMap} closeLabel={t.close}>
                  {(large) => <RealHeatMap large={large} enabled={realMaps} fetchBoundaries={fetchBoundaries} center={coordsFor(p.city)} points={p.heatmap} label={t.whereTheyAre(p.city)} cityName={p.city} />}
                </ExpandableMap>
                <div className="heat-legend"><span>{t.fewer}</span><i /><span>{t.more}</span></div>
              </>
            ) : <span className="hint">{t.noHeat}</span>}
          </div>
        </section>
        <Card icon={Icon.store} title={t.reachThrough}>
          {[[t.podcasts, p.podcasts], [t.tvShows, p.tv_shows], [t.books, p.books]].map(([title, list]) => (
            <div key={title} className="reach-row">
              <div className="sub-label">{title}</div>
              {(list || []).length ? <div className="tags">{list.map((b) => <span className="tag" key={b}>{b}</span>)}</div> : <span className="hint">{t.noData}</span>}
            </div>
          ))}
        </Card>
      </div>

      {/* 4. What to do next */}
      <section className="card next-card">
        <div className="card-body">
          <h3 className="card-title">{Icon.route}{t.qNext}</h3>
          <ol className="next-steps">
            <li>
              <span className="mono">01</span>
              <div><strong>{t.nsAnalyse}</strong><p>{t.nsAnalyseSub(p.city)}</p></div>
              <button className="btn btn-primary" onClick={onAnalyse}>{t.analyseHere}</button>
            </li>
            <li>
              <span className="mono">02</span>
              <div><strong>{t.nsDemand}</strong><p>{t.nsDemandSub}</p></div>
              <a className="btn btn-secondary" href="https://www.trademap.org/" target="_blank" rel="noopener noreferrer">{Icon.external}ITC Trade Map</a>
            </li>
            <li>
              <span className="mono">03</span>
              <div><strong>{t.nsTariff}</strong><p>{t.nsTariffSub(p.country || p.city)}</p></div>
              <a className="btn btn-secondary" href="https://www.macmap.org/" target="_blank" rel="noopener noreferrer">{Icon.external}Market Access Map</a>
            </li>
          </ol>
        </div>
      </section>

      {/* Details for the curious: extra signals and how the page was made */}
      <details className="card more">
        <summary>{Icon.layers}{t.howMade}</summary>
        <div className="more-body">
          {extras.length > 0 && (
            <div className="grid-2" style={{ marginBottom: 12 }}>
              {extras.map(([title, list]) => (
                <div key={title}><div className="sub-label">{title}</div><div className="tags">{list.map((b) => <span className="tag" key={b}>{b}</span>)}</div></div>
              ))}
            </div>
          )}
          <div className="timeline">
            {(p.trace || []).map((s, i) => (
              <div className="tl-item" key={i}>
                <span className={`tl-dot ${s.ok ? "ok" : "fail"}`}>{s.ok ? Icon.check : Icon.close}</span>
                <div><div className="tl-title">{s.name}</div><div className="tl-tool">{s.tool}</div><div className="tl-sub">{s.detail}</div></div>
              </div>
            ))}
          </div>
        </div>
      </details>
    </div>
  );
}
