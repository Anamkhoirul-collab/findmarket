"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon, Card, Bars, Badge, EmptyArt } from "../components";
import { citySlug } from "../store";
import { coordsFor, fitFor } from "../geo";
import MiniMap from "../MiniMap";
import RealHeatMap from "../RealHeatMap";
import ExpandableMap from "../ExpandableMap";
import FitBarChart from "../FitBarChart";
import AudienceCard from "../AudienceCard";
import CountUp from "../CountUp";
import TradeCard from "../TradeCard";
import EvidenceCard, { ConfidenceBadge } from "../EvidenceCard";


export default function MarketDetail({ t, lang, brief, slug, go, exploreCity, onCached, whereToSell, realMaps = false, fetchBoundaries = null }) {
  const [where, setWhere] = useState(null);
  const [whereState, setWhereState] = useState("idle");

  const markets = useMemo(() => (brief?.report?.markets || []).map((m) => {
    const { fit, dest, destination, venues, venueCount } = fitFor(brief, m.name);
    const coords = coordsFor(m.name, typeof m.lat === "number" && typeof m.lon === "number" && (m.lat || m.lon) ? m : dest);
    return { ...m, fit, coords, destination, venues, venueCount, extra: !!m.extra };
  }).sort((a, b) => (a.extra ? 1 : 0) - (b.extra ? 1 : 0) || (b.fit ?? -1) - (a.fit ?? -1)), [brief]);
  const idx = markets.findIndex((m) => citySlug(m.name) === slug);
  const m = markets[idx];

  useEffect(() => {
    if (!m || !whereToSell) return;
    let alive = true;
    setWhere(null); setWhereState("loading");
    const tagIds = (brief.signals?.tags || []).map((x) => x.id).filter(Boolean);
    const entityIds = (brief.signals?.entities || []).map((x) => x.id).filter(Boolean);
    whereToSell({ city: m.name, tagIds, entityIds })
      .then((r) => { if (alive) { setWhere(r); setWhereState("done"); } })
      .catch(() => alive && setWhereState("error"));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, brief?.id]);

  if (!brief || !m) {
    return (
      <div className="card"><div className="empty">
        <EmptyArt /><h3>{t.notFound}</h3>
        <div className="row"><button className="btn btn-secondary btn-lg" onClick={() => go("briefs")}>{Icon.arrowLeft}{t.backToBriefs}</button></div>
      </div></div>
    );
  }

  const r = brief.report || {};
  const [kind, tierLabel] = m.fit === null ? (m.verified ? ["success", t.verified] : ["neutral", "–"]) : m.fit >= 90 ? ["success", t.tierTop] : m.fit >= 80 ? ["info", t.tierStrong] : ["neutral", t.tierGood];
  const goMarket = (i) => go(`market-${brief.id}~${citySlug(markets[i].name)}`, markets[i].name);

  return (
    <>
      <div className="detail-head">
        <div className="detail-title">
          <div className="detail-icon">{Icon.pin}</div>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>{m.name} <Badge kind={kind}>{tierLabel}</Badge><ConfidenceBadge t={t} brief={brief} market={m} /></h2>
            <div className="meta">
              <span>{m.country}</span><span className="sep" />
              <span>{t.marketFor} {brief.name}</span>
              {brief.mocked ? <Badge kind="warn">{t.sample}</Badge> : <Badge kind="success">{t.live}</Badge>}
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button className="icon-btn" onClick={() => goMarket((idx - 1 + markets.length) % markets.length)} aria-label={t.prevMarket} disabled={markets.length < 2}>{Icon.arrowLeft}</button>
          <span className="mono muted" style={{ fontSize: 12 }}>{idx + 1}/{markets.length}</span>
          <button className="icon-btn" onClick={() => goMarket((idx + 1) % markets.length)} aria-label={t.nextMarket} disabled={markets.length < 2} style={{ transform: "scaleX(-1)" }}>{Icon.arrowLeft}</button>
          <span className="vsep" />
          <button className="btn btn-secondary btn-lg" onClick={() => go(`city-${citySlug(m.name)}`, m.name)}>{Icon.globe}{t.viewCity}</button>
        </div>
      </div>

      <section className="card why-card">
        <div className="why-grid">
          <div className="why-map"><MiniMap coords={m.coords} name={m.name} label={t.mapLabel} homeCode={brief.home?.code} /></div>
          <div className="why-side">
            <h3 className="card-title">{Icon.route}{t.whyMarket}</h3>
            <div className="why-fit">
              <span className="muted">{t.fit}</span>
              <strong className="mono">{m.fit !== null ? <CountUp value={m.fit} format={(v) => `${Math.round(v)}%`} /> : "–"}</strong>
            </div>
            {m.destination !== null && m.destination !== undefined && (
              <FitBarChart
                label={t.fit}
                height={220}
                bars={[
                  { key: "taste", label: t.fitTaste, value: m.destination, color: "var(--cyan)", note: t.fitTasteNote(m.destination) },
                  ...(m.venues !== null && m.venues !== undefined
                    ? [{ key: "venues", label: t.fitVenues, value: m.venues, color: "var(--purple)", note: t.fitVenuesNote(m.venues, m.venueCount) }]
                    : []),
                ]}
              />
            )}
            <p className="why-text">{m.why}</p>
            {m.signals?.length > 0 && <div className="tags">{m.signals.map((x) => <span className="tag" key={x}>{x}</span>)}</div>}
          </div>
        </div>
      </section>

      <TradeCard t={t} brief={brief} country={m.country} />

      <section className="card where-card">
        {whereState === "loading" && <div className="card-body"><div className="progress"><div className="progress-row now"><span className="p-dot" />{t.findingPlaces}</div></div></div>}
        {whereState === "error" && <div className="card-body"><p className="hint" style={{ margin: 0 }}>{t.noPlaces}</p></div>}
        {whereState === "done" && where && (() => {
          const places = (where.places || []).slice(0, 8).map((pl) => ({ ...pl, score: typeof pl.affinity === "number" ? Math.round(pl.affinity <= 1 ? pl.affinity * 100 : pl.affinity) : null }));
          const scored = places.filter((p) => p.score !== null);
          const avg = scored.length ? Math.round(scored.reduce((a, p) => a + p.score, 0) / scored.length) : null;
          const tier = (v) => (v === null ? ["neutral", "–"] : v >= 85 ? ["success", t.tierTop] : v >= 70 ? ["info", t.tierStrong] : ["neutral", t.tierGood]);
          return (
            <div className="where-grid">
              <div className="where-panel">
                <div className="list-head">
                  <h3>{Icon.store}{t.whereToSell(m.name)}</h3>
                  {where.mocked ? <Badge kind="warn">{t.sample}</Badge> : <span className="mono muted" style={{ fontSize: 12 }}>{String(places.length).padStart(2, "0")}</span>}
                </div>
                <div className="sel">
                  <div className="sel-top">
                    <div>
                      <h4>{m.name}</h4>
                      <div className="meta"><span>{t.venuesMatched(scored.length)}</span></div>
                    </div>
                    {avg !== null && <span className="ring"><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6" fill="none" stroke="var(--g100)" strokeWidth="2.5" /><circle cx="8" cy="8" r="6" fill="none" stroke="var(--g900)" strokeWidth="2.5" strokeDasharray={`${(avg / 100) * 37.7} 37.7`} strokeLinecap="round" /></svg>{avg}%</span>}
                  </div>
                </div>
                <div className="list-scroll">
                  {places.length ? places.map((pl) => {
                    const [kind, label] = tier(pl.score);
                    return (
                      <div className="mcard venue-card" key={pl.name}>
                        <span className="mcard-top">
                          <span className="mcard-icon">{Icon.store}</span>
                          <span style={{ flex: 1, minWidth: 0 }}><strong>{pl.name}</strong><span className="muted venue-sub">{[pl.address, ...(pl.tags || [])].filter(Boolean).slice(0, 2).join(" • ") || "–"}</span></span>
                          <Badge kind={kind}>{label}</Badge>
                        </span>
                        {pl.score !== null && (
                          <span className="mcard-fit">
                            <span className="bars-top"><span>{t.match}</span><b>{pl.score}%</b></span>
                            <span className="progress-bar"><span style={{ width: `${pl.score}%` }} /></span>
                          </span>
                        )}
                      </div>
                    );
                  }) : <p className="hint">{t.noPlaces}</p>}
                </div>
              </div>
              <div className="where-map">
                {(where.heatmap || []).length && m.coords ? (
                  <ExpandableMap title={t.whereToSell(m.name)} expandLabel={t.enlargeMap} closeLabel={t.close}>
                    {(large) => <RealHeatMap large={large} enabled={realMaps} fetchBoundaries={fetchBoundaries} center={m.coords} points={where.heatmap} places={where.places} label={t.whereTheyAre(m.name)} cityName={m.name} />}
                  </ExpandableMap>
                ) : <div className="card-body"><span className="hint">{t.noHeat}</span></div>}
              </div>
            </div>
          );
        })()}
      </section>

      <EvidenceCard t={t} brief={brief} market={m} lang={lang} />

      <div className="grid-3">
        <AudienceCard t={t} brief={brief} />
        <Card icon={Icon.quote} title={t.pitchHere}>
          {r.story?.pitch_line && <blockquote className="quote">{r.story.pitch_line}</blockquote>}
          <ul className="list">{(r.channels || []).slice(0, 3).map((x) => <li key={x}>{Icon.store}{x}</li>)}</ul>
        </Card>
        <Card icon={Icon.checkCircle} title={t.nextSteps}>
          <ul className="list note-box">
            {(r.next_steps || []).map((x) => <li key={x}>{Icon.checkCircle}{x}</li>)}
            <li>{Icon.external}<a href="https://www.macmap.org/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)" }}>{t.checkTariffs} {m.country}</a></li>
          </ul>
        </Card>
      </div>

    </>
  );
}
