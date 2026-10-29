"use client";

import { Fragment, useMemo, useState } from "react";
import { Icon, Card, Bars, Badge, Modal, EmptyArt } from "../components";
import { fmtDate } from "./Dashboard";
import { citySlug } from "../store";
import { coordsFor, fitFor } from "../geo";
import MarketMap from "../MarketMap";
import AudienceCard from "../AudienceCard";
import { ConfidenceBadge } from "../EvidenceCard";
import CountUp from "../CountUp";
import { makeShareLink } from "../share";
import { tradeOf, usd } from "../evidence";


function tier(t, fit, verified) {
  if (fit === null) return verified ? ["success", t.verified] : ["neutral", "–"];
  if (fit >= 90) return ["success", t.tierTop];
  if (fit >= 80) return ["info", t.tierStrong];
  return ["neutral", t.tierGood];
}

function Ring({ value }) {
  const r = 6, c = 2 * Math.PI * r;
  return (
    <span className="ring">
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="8" r={r} fill="none" stroke="var(--g100)" strokeWidth="2.5" />
        <circle cx="8" cy="8" r={r} fill="none" stroke="var(--g900)" strokeWidth="2.5" strokeDasharray={`${(value / 100) * c} ${c}`} strokeLinecap="round" />
      </svg>
      {Math.round(value)}%
    </span>
  );
}

// Plain-text summary for pasting into email, WhatsApp or a business matching form.
function summaryText(t, brief, markets) {
  const r = brief.report || {};
  const lines = [
    `${brief.name} – FindMarket`,
    r.headline || "",
    "",
    `${t.marketsTitle}:`,
    ...markets.map((m, i) => `${i + 1}. ${m.name}, ${m.country}${m.fit !== null ? ` (${Math.round(m.fit)}%)` : ""}: ${m.why}`),
    "",
    `${t.audience}: ${r.audience?.portrait || ""}`,
    r.story?.pitch_line ? `${t.pitchLabel}: ${r.story.pitch_line}` : "",
    "",
    `${t.nextSteps}:`,
    ...(r.next_steps || []).map((x) => `- ${x}`),
    "",
    t.tasteNotSales,
  ];
  return lines.filter((l, i, a) => !(l === "" && a[i - 1] === "")).join("\n");
}

// Clean report shown only when printing (Download PDF uses the browser's print to PDF).
function PrintReport({ t, lang, brief, markets }) {
  const r = brief.report || {};
  return (
    <div className="print-report" aria-hidden="true">
      <div className="pr-head">
        <div><div className="pr-brand">FindMarket</div><h1>{brief.name}</h1><p>{r.headline}</p></div>
        <div className="pr-meta">{t.cats[brief.category] || ""}<br />{fmtDate(brief.createdAt, lang)}<br />{brief.mocked ? t.sample : t.live}</div>
      </div>
      <h2>{t.marketsTitle}</h2>
      <table className="pr-table">
        <thead><tr><th>#</th><th>{t.colCity}</th><th>{t.fit}</th><th>{t.whyMarket}</th></tr></thead>
        <tbody>{markets.map((m, i) => (
          <tr key={m.name}><td>{i + 1}</td><td><strong>{m.name}</strong><br />{m.country}</td><td>{m.fit !== null ? `${Math.round(m.fit)}%` : "–"}</td><td>{m.why}{m.signals?.length ? <><br /><em>{t.basedOn}: {m.signals.join(", ")}</em></> : null}</td></tr>
        ))}</tbody>
      </table>
      <div className="pr-cols">
        <div><h2>{t.audience}</h2><p>{r.audience?.portrait}</p>{r.audience?.also_loves?.length ? <p><em>{t.alsoLoves}: {r.audience.also_loves.join(", ")}</em></p> : null}</div>
        <div><h2>{t.story}</h2><p>{r.story?.positioning}</p>{r.story?.pitch_line && <p><strong>“{r.story.pitch_line}”</strong></p>}</div>
      </div>
      <div className="pr-cols">
        <div><h2>{t.channels}</h2><ul>{(r.channels || []).map((x) => <li key={x}>{x}</li>)}</ul></div>
        <div><h2>{t.nextSteps}</h2><ul>{(r.next_steps || []).map((x) => <li key={x}>{x}</li>)}</ul></div>
      </div>
      <h2>{t.cautions}</h2>
      <ul>{(r.cautions || []).map((x) => <li key={x}>{x}</li>)}</ul>
      <p className="pr-foot">{t.tasteNotSales} · {t.footer}</p>
    </div>
  );
}

export default function BriefDetail({ t, lang, brief, go, onDelete, onSaveShared = null }) {
  const [tab, setTab] = useState("markets");
  const [shared, setShared] = useState(false);
  const [sel, setSel] = useState(0);
  const [confirm, setConfirm] = useState(false);
  const [copied, setCopied] = useState(false);

  const markets = useMemo(() => (brief?.report?.markets || []).map((m) => {
    const { fit, dest, destination, venues, venueCount } = fitFor(brief, m.name);
    const coords = coordsFor(m.name, typeof m.lat === "number" && typeof m.lon === "number" && (m.lat || m.lon) ? m : dest);
    return { ...m, fit, coords, destination, venues, venueCount, extra: !!m.extra };
  }).sort((a, b) => (a.extra ? 1 : 0) - (b.extra ? 1 : 0) || (b.fit ?? -1) - (a.fit ?? -1)), [brief]);

  if (!brief) {
    return (
      <div className="card"><div className="empty">
        <EmptyArt /><h3>{t.notFound}</h3>
        <div className="row"><button className="btn btn-secondary btn-lg" onClick={() => go("briefs")}>{Icon.arrowLeft}{t.backToBriefs}</button></div>
      </div></div>
    );
  }

  const r = brief.report || {};
  const verified = markets.filter((m) => m.verified).length;
  const signals = [...(brief.signals?.tags || []), ...(brief.signals?.entities || [])];
  const m = markets[sel] || markets[0];
  const topFit = markets[0]?.fit;

  return (
    <>
      <div className="detail-head">
        <div className="detail-title">
          <div className="detail-icon">{brief.thumb ? <img src={brief.thumb} alt="" /> : Icon.store}</div>
          <div style={{ minWidth: 0 }}>
            <h2>{brief.name}</h2>
            <p className="subtitle">{r.headline}</p>
          </div>
        </div>
        <div className="header-actions">
          <div className="segmented" role="tablist" aria-label={brief.name}>
            {[["markets", t.tabMarkets], ["audience", t.tabAudience], ["trace", t.tabTrace]].map(([k, label]) => (
              <button key={k} role="tab" aria-selected={tab === k} aria-pressed={tab === k} onClick={() => setTab(k)}>{label}</button>
            ))}
          </div>
          <button className="btn btn-secondary" onClick={() => window.print()}>{Icon.briefs}{t.downloadPdf}</button>
          <button className="btn btn-secondary" onClick={async () => {
            try { await navigator.clipboard.writeText(summaryText(t, brief, markets)); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard blocked */ }
          }}>{copied ? Icon.check : Icon.quote}{copied ? t.copied : t.copySummary}</button>
          {!brief.shared && (
            <button className="btn btn-secondary" onClick={async () => {
              try { const link = await makeShareLink(brief); await navigator.clipboard.writeText(link); setShared(true); setTimeout(() => setShared(false), 2500); } catch { /* clipboard blocked */ }
            }}>{shared ? Icon.check : Icon.external}{shared ? t.linkCopied : t.shareLink}</button>
          )}
          {!brief.example && !brief.shared && <button className="icon-btn" onClick={() => setConfirm(true)} aria-label={t.delete} title={t.delete}>{Icon.trash}</button>}
        </div>
      </div>

      {brief.example && (
        <div className="notice example-notice">
          <span className="notice-text">{Icon.alert}<span><strong>{t.exampleTitle}</strong> {t.exampleText}</span></span>
          <button className="btn btn-primary" onClick={() => go("new")}>{Icon.sparkle}{t.analyseOwn}</button>
        </div>
      )}

      {brief.shared && (
        <div className="notice example-notice">
          <span className="notice-text">{Icon.external}<span><strong>{t.sharedTitle}</strong> {t.sharedText}</span></span>
          {onSaveShared && <button className="btn btn-primary" onClick={() => onSaveShared(brief)}>{Icon.plus}{t.saveShared}</button>}
        </div>
      )}

      {markets[0] && tab === "markets" && (
        <section className="verdict">
          <div className="verdict-main">
            <span className="verdict-kicker">{Icon.target}{t.bestMarket}</span>
            <h3>{markets[0].name}<span>{markets[0].country}</span></h3>
            <p>{markets[0].why}</p>
          </div>
          <div className="verdict-stats">
            <div><span>{t.fit}</span><strong className="mono">{markets[0].fit !== null ? <CountUp value={markets[0].fit} format={(v) => `${Math.round(v)}%`} /> : "–"}</strong></div>
            {tradeOf(brief, markets[0].country)?.latestValue > 0 && (
              <div><span>{t.importsShortLabel}</span><strong className="mono">{usd(tradeOf(brief, markets[0].country).latestValue)}</strong></div>
            )}
            <div><span>{t.evidence}</span><ConfidenceBadge t={t} brief={brief} market={markets[0]} /></div>
          </div>
          <div className="verdict-actions">
            <button className="btn btn-primary btn-lg" onClick={() => go(`market-${brief.id}~${citySlug(markets[0].name)}`)}>{t.openMarket}{Icon.arrowLeft}</button>
          </div>
        </section>
      )}

      <div className="result-strip">
        <div className="result-facts">
          <div className="fact"><span>{t.colCategory}</span><strong>{t.cats[brief.category] || t.cats.other}</strong></div>
          <div className="fact"><span>{t.colDate}</span><strong>{fmtDate(brief.createdAt, lang)}</strong></div>
          <div className="fact"><span>{t.statusLabel}</span><strong className={brief.mocked ? "risk" : "ok"}>{brief.mocked ? t.sample : t.live}</strong></div>
        </div>
        <div className="result-fit">
          <div className="bars-top"><span>{t.topFitLabel}{markets[0] ? ` • ${markets[0].name}` : ""}</span>{topFit !== null && topFit !== undefined && <span className="mono">{Math.round(topFit)}%</span>}</div>
          <Bars percent={topFit ?? 0} />
        </div>
      </div>

      {tab === "markets" && (
        <div className="result-body">
          <div className="result-map">
            <MarketMap homeCode={brief.home?.code} t={t} markets={markets} selected={sel} onSelect={setSel} />
          </div>
          <div className="result-list">
            <div className="list-head">
              <h3>{t.marketList} {Icon.alert}</h3>
              <span className="mono muted" style={{ fontSize: 12 }}>{String(markets.length).padStart(2, "0")}</span>
            </div>
            <div className="list-scroll">
              {markets.map((x, i) => {
                const [kind, label] = tier(t, x.fit, x.verified);
                const firstExtra = x.extra && !markets[i - 1]?.extra;
                return (
                  <Fragment key={x.name + i}>
                  {firstExtra && <div className="list-divider"><span>{t.moreMatches(markets.filter((m) => m.extra).length)}</span></div>}
                  <button key={x.name + i} className={`mcard${x.extra ? " extra" : ""}`} aria-pressed={i === sel} onMouseEnter={() => setSel(i)} onFocus={() => setSel(i)}
                    onClick={() => go(`market-${brief.id}~${citySlug(x.name)}`, x.name)} aria-label={`${t.openMarket}: ${x.name}`}>
                    <span className="mcard-top">
                      <span className="mcard-icon">{String(i + 1).padStart(2, "0")}</span>
                      <span style={{ flex: 1, minWidth: 0 }}><strong>{x.name}</strong><span className="muted">{x.country}</span></span>
                      <Badge kind={kind}>{label}</Badge>
                    </span>
                    <span className="mcard-fit">
                      <span className="bars-top"><span>{t.fit}</span><b>{x.fit !== null ? `${Math.round(x.fit)}%` : "–"}</b></span>
                      <Bars percent={x.fit ?? 0} height={16} />
                      {x.venues !== null && x.venues !== undefined && (
                        <span className="fit-parts"><span>{t.fitTaste} <b className="mono">{x.destination ?? "–"}</b></span><span className="dot-sep" /><span>{t.fitVenues} <b className="mono">{x.venues}</b></span></span>
                      )}
                    </span>
                    <span className="mcard-meta">
                      <ConfidenceBadge t={t} brief={brief} market={x} />
                      {tradeOf(brief, x.country)?.latestValue > 0 && <span className="muted">{t.importsShort(usd(tradeOf(brief, x.country).latestValue))}</span>}
                    </span>
                    <span className="mcard-open">{t.openMarket}</span>
                  </button>
                  </Fragment>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === "audience" && (
        <>
          <div className="grid-2">
            <AudienceCard t={t} brief={brief} />
            <Card icon={Icon.quote} title={t.story}>
              <p style={{ marginTop: 0, color: "var(--g500)" }}>{r.story?.positioning}</p>
              {r.story?.pitch_line && <blockquote className="quote">{r.story.pitch_line}</blockquote>}
              <ul className="list">{(r.story?.name_and_packaging || []).map((x) => <li key={x}>{Icon.tag}{x}</li>)}</ul>
            </Card>
            <Card icon={Icon.store} title={t.channels}>
              <ul className="list">{(r.channels || []).map((x) => <li key={x}>{Icon.store}{x}</li>)}</ul>
            </Card>
            <Card icon={Icon.route} title={t.nextSteps}>
              <ul className="list">{(r.next_steps || []).map((x) => <li key={x}>{Icon.checkCircle}{x}</li>)}</ul>
            </Card>
            <Card icon={Icon.alert} title={t.cautions}>
              <ul className="list note-box">{(r.cautions || []).map((x) => <li key={x}>{Icon.alert}{x}</li>)}</ul>
            </Card>
            <Card icon={Icon.pen} title={t.description}>
              <p style={{ margin: 0, color: "var(--g500)", whiteSpace: "pre-line" }}>{brief.description}</p>
            </Card>
          </div>
        </>
      )}

      {tab === "trace" && (
        <div className="grid-2-1">
          <Card icon={Icon.layers} title={t.traceTitle}>
            <div className="timeline">
              {(brief.trace || []).map((s, i) => (
                <div className="tl-item" key={i}>
                  <span className={`tl-dot ${s.ok ? "ok" : "fail"}`}>{s.ok ? Icon.check : Icon.close}</span>
                  <div><div className="tl-title">{s.name}</div><div className="tl-tool">{s.tool}</div><div className="tl-sub">{s.detail}</div></div>
                </div>
              ))}
            </div>
          </Card>
          <Card icon={Icon.tag} title={t.chosenSignals}>
            <ul className="list">
              {signals.map((s) => <li key={s.id || s.name}>{Icon.tag}<span><strong style={{ color: "var(--g900)", fontWeight: 500 }}>{s.name || s.id}</strong>: {s.reason}</span></li>)}
            </ul>
          </Card>
        </div>
      )}

      <PrintReport t={t} lang={lang} brief={brief} markets={markets} />

      {confirm && (
        <Modal icon={Icon.trash} title={t.deleteTitle} text={`${brief.name}. ${t.deleteText}`} danger
          confirmLabel={t.delete} cancelLabel={t.cancel}
          onCancel={() => setConfirm(false)} onConfirm={() => { setConfirm(false); onDelete(brief.id); go("briefs"); }} />
      )}
    </>
  );
}
