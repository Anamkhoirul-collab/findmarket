"use client";

import { useEffect, useState } from "react";
import { Icon, Card, Bars, Badge } from "../components";
import { citySlug, findCity, saveCity, loadCities } from "../store";

const CATS = ["food", "fashion", "craft", "beauty"];

function peakAge(demo) {
  const rows = Array.isArray(demo) ? demo.filter((d) => d && typeof d.label === "string" && typeof d.value === "number") : [];
  return rows.length ? rows.reduce((a, b) => (Math.abs(b.value) > Math.abs(a.value) ? b : a)).label : "–";
}

export default function Compare({ t, lang, go, initial, featured, briefs, exploreCity, onCached, defaults = [] }) {
  const [names, setNames] = useState(() => (initial ? [initial, ...defaults.filter((d) => d.toLowerCase() !== initial.toLowerCase())].slice(0, 2) : defaults.slice(0, 2)));
  const [profiles, setProfiles] = useState({});
  const [errors, setErrors] = useState({});
  const [pick, setPick] = useState("");
  const [savedCities, setSavedCities] = useState([]);
  useEffect(() => { setSavedCities(loadCities().map((c) => c.profile.city)); }, []);

  const options = [...new Set([
    ...featured,
    ...savedCities,
    ...briefs.flatMap((b) => (b.report?.markets || []).map((m) => m.name)),
  ])].filter((c) => !names.includes(c));

  useEffect(() => {
    names.forEach(async (n) => {
      if (profiles[n] || errors[n] === "loading") return;
      const cached = findCity(citySlug(n), lang);
      if (cached) { setProfiles((p) => ({ ...p, [n]: cached })); return; }
      setErrors((e) => ({ ...e, [n]: "loading" }));
      try {
        const p = await exploreCity({ city: n, language: lang });
        setProfiles((x) => ({ ...x, [n]: p }));
        onCached(saveCity(p, lang));
        setErrors((e) => ({ ...e, [n]: "" }));
      } catch (err) {
        setErrors((e) => ({ ...e, [n]: err.message || String(err) }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [names, lang]);

  const add = (n) => { const c = n.trim(); if (c && !names.includes(c) && names.length < 3) setNames([...names, c]); setPick(""); };
  const remove = (n) => setNames(names.filter((x) => x !== n));
  const cols = names.length;

  return (
    <>
      <div className="compare-bar">
        <div>
          <h2 style={{ margin: 0, fontWeight: 600, fontSize: 18, letterSpacing: "-0.03em" }}>{t.compareTitle}</h2>
        </div>
        {names.length < 3 && (
          <form className="filters" onSubmit={(e) => { e.preventDefault(); add(pick); }}>
            <label className="select-btn">
              <span className="sr-only">{t.addCity}</span>
              <select value="" onChange={(e) => e.target.value && add(e.target.value)}>
                <option value="">{t.addCity}</option>
                {options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              {Icon.chevron}
            </label>
            <label className="search" style={{ display: "flex", width: 180, height: 38 }}>
              {Icon.search}<span className="sr-only">{t.orTypeCity}</span>
              <input value={pick} onChange={(e) => setPick(e.target.value)} placeholder={t.orTypeCity} />
            </label>
            <button className="btn btn-primary btn-lg" type="submit" disabled={pick.trim().length < 2}>{Icon.plus}{t.add}</button>
          </form>
        )}
      </div>

      {!cols ? (
        <div className="card"><div className="empty"><h3>{t.compareEmpty}</h3><p>{t.compareEmptySub}</p>
          <div className="row">{featured.slice(0, 3).map((c) => <button key={c} className="chip" onClick={() => add(c)}>{c}</button>)}</div></div></div>
      ) : (
        <div className="compare-grid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {names.map((n) => {
            const p = profiles[n];
            const err = errors[n];
            const tags = (p?.taste_tags || []).slice(0, 5);
            const max = Math.max(...tags.map((x) => x.affinity || 0), 0.0001);
            return (
              <section className="card compare-col" key={n}>
                <div className="compare-col-head">
                  <div><strong>{p?.city || n}</strong><span className="muted">{p?.country || ""}</span></div>
                  {p && (p.mocked ? <Badge kind="warn">{t.sample}</Badge> : <Badge kind="success">{t.live}</Badge>)}
                  <button className="icon-btn ghost" onClick={() => remove(n)} aria-label={`${t.removeCity} ${n}`}>{Icon.close}</button>
                </div>
                {!p ? (
                  <div className="card-body">{err === "loading" || err === undefined ? <div className="progress"><div className="progress-row now"><span className="p-dot" />{t.loadingCity}</div></div> : <p className="hint">{err}</p>}</div>
                ) : (
                  <div className="card-body compare-body">
                    <p className="compare-summary">{p.summary}</p>
                    <div className="compare-facts">
                      <div><span>{t.factTopTaste}</span><strong>{tags[0]?.name || "–"}</strong></div>
                      <div><span>{t.factAge}</span><strong>{peakAge(p.demographics)}</strong></div>
                      <div><span>{t.factTrending}</span><strong>{p.trending_brands?.[0] || "–"}</strong></div>
                    </div>
                    <div className="sub-label">{t.qLike}</div>
                    {tags.map((x) => (
                      <div className="compare-mini" key={x.name}>
                        <div className="bars-top"><span>{x.name}</span><span className="mono muted">{Math.round(((x.affinity || 0) / max) * 100)}%</span></div>
                        <Bars percent={((x.affinity || 0) / max) * 100} height={12} />
                      </div>
                    ))}
                    <div className="sub-label" style={{ marginTop: 12 }}>{t.bestIdeas}</div>
                    <ul className="compare-ideas">
                      {CATS.map((c) => {
                        const o = (p.opportunities || []).find((x) => x.category === c);
                        return <li key={c}><span className="muted">{t.cats[c]}</span><strong>{o?.title || "–"}</strong></li>;
                      })}
                    </ul>
                    <button className="btn btn-secondary wide" onClick={() => go(`city-${citySlug(p.city)}`, p.city)}>{t.viewCity}</button>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
