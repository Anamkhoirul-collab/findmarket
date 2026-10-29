"use client";

import { useEffect, useRef, useState } from "react";
import { Icon, Card, Bars, Badge, EmptyArt } from "../components";
import { citySlug, loadChecklist, saveChecklist, loadCities } from "../store";
import { EXAMPLES } from "../strings";
import { MAP } from "../worldMap";
import { project, getOrigin, coordsFor, getHome } from "../geo";

const CAT_KEYS = ["food", "fashion", "craft", "beauty", "other"];

export function fmtDate(ts, lang, withTime = false) {
  try {
    return new Intl.DateTimeFormat(lang === "id" ? "id-ID" : "en-GB", withTime
      ? { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }
      : { day: "numeric", month: "short", year: "numeric" }).format(new Date(ts));
  } catch { return ""; }
}

export function BriefsTable({ t, lang, rows, go, onDelete }) {
  return (
    <div className="table-wrap">
      <table className="data">
        <thead>
          <tr>
            <th>{t.colProduct}</th><th>{t.colCategory}</th><th>{t.colTop}</th><th>{t.colMarkets}</th><th>{t.colDate}</th><th>{t.colStatus}</th>
            {onDelete && <th><span className="sr-only">{t.delete}</span></th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((b) => (
            <tr key={b.id} className="clickable" onClick={() => go(`brief-${b.id}`)}>
              <td>
                <div className="cell-title">{b.name}</div>
              </td>
              <td className="muted">{t.cats[b.category] || t.cats.other}</td>
              <td>{b.report?.markets?.[0]?.name || "–"}</td>
              <td className="mono">{String(b.report?.markets?.length || 0).padStart(2, "0")}</td>
              <td className="muted">{fmtDate(b.createdAt, lang)}</td>
              <td>{b.mocked ? <Badge kind="warn">{t.sample}</Badge> : <Badge kind="success">{t.live}</Badge>}</td>
              {onDelete && (
                <td style={{ width: 40 }}>
                  <button className="icon-btn" aria-label={`${t.delete} ${b.name}`} onClick={(e) => { e.stopPropagation(); onDelete(b); }}>{Icon.trash}</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


const CHECK_ITEMS = [
  { id: "analysis", auto: "briefs", link: null },
  { id: "explore", auto: "cities", link: null },
  { id: "tariffs", link: "https://www.macmap.org/" },
  { id: "demand", link: "https://www.trademap.org/" },
  { id: "profile", link: null },
  { id: "inaexport", link: "https://www.inaexport.id/", only: "ID" },
  { id: "buyers", link: "https://www.intracen.org/", except: "ID" },
];


// Decorative route map for Quick start: Indonesia to a few sample export cities.
const QS_CITIES = [["Tokyo", 93], ["Amsterdam", 89], ["Los Angeles", 86], ["Dubai", 84], ["Melbourne", 91]];
function QuickVisual() {
  const o = project(getOrigin()[0], getOrigin()[1]);
  const pts = QS_CITIES.map(([n, f]) => ({ n, f, p: project(...coordsFor(n)) }));
  const arc = (p) => {
    const mx = (o[0] + p[0]) / 2, my = (o[1] + p[1]) / 2, d = Math.hypot(p[0] - o[0], p[1] - o[1]);
    return `M${o[0]},${o[1]} Q${mx},${my - d * 0.3} ${p[0]},${p[1]}`;
  };
  return (
    <div className="qs-visual" aria-hidden="true">
      <svg viewBox="40 14 920 466" preserveAspectRatio="xMidYMid slice">
        <path d={MAP.land} className="qs-land" />
        {pts.map(({ n, p }, i) => <path key={n} d={arc(p)} className="qs-arc" style={{ animationDelay: `${i * 0.35}s` }} />)}
        <circle cx={o[0]} cy={o[1]} r="14" className="qs-origin-halo" />
        <circle cx={o[0]} cy={o[1]} r="6" className="qs-origin" />
        {pts.map(({ n, p }) => <circle key={n} cx={p[0]} cy={p[1]} r="6" className="qs-dot" />)}
        {pts.filter(({ n }) => ["Tokyo", "Amsterdam", "Dubai"].includes(n)).map(({ n, f, p }) => {
          const w = n.length * 8.6 + 64;
          return (
            <g key={"l" + n} transform={`translate(${p[0] - w / 2},${p[1] - 44})`}>
              <rect width={w} height="28" rx="14" className="qs-pill" />
              <circle cx="14" cy="14" r="3.5" className="qs-pill-dot" />
              <text x="24" y="18.5" className="qs-pill-text">{n} <tspan className="qs-pill-num">{f}%</tspan></text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function QuickStart({ t, lang, onStart }) {
  const [name, setName] = useState("");
  const inputRef = useRef(null);
  // Examples only fill in the form; the user presses the button themselves.
  const fillExample = (text) => {
    setName(text);
    requestAnimationFrame(() => { inputRef.current?.focus(); inputRef.current?.setSelectionRange(text.length, text.length); });
  };
  return (
    <section className="card quick">
      <QuickVisual />
      <div className="quick-body">
        <span className="quick-kicker">{Icon.sparkle}{t.quickKicker}</span>
        <h2>{t.quickTitle}</h2>
        <p>{t.quickSub}</p>
        <form className="quick-form" onSubmit={(e) => { e.preventDefault(); if (name.trim().length >= 2) onStart({ name: name.trim() }); }}>
          <label htmlFor="qname" className="sr-only">{t.nameLabel}</label>
          <input id="qname" ref={inputRef} className="input" value={name} maxLength={120} placeholder={t.namePh} onChange={(e) => setName(e.target.value)} />
          <button type="submit" className="btn btn-primary btn-lg" disabled={name.trim().length < 2}>{Icon.sparkle}{t.findMarkets}</button>
        </form>
        <div className="chips">
          <span className="hint">{t.tryExample}</span>
          {EXAMPLES.map((ex) => (
            <button key={ex.key} type="button" className="chip" aria-pressed={name === ex.name[lang]} onClick={() => fillExample(ex.name[lang])}>{ex.label[lang]}</button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Checklist({ t, briefs, cityCount }) {
  const homeCode = getHome().code;
  const ITEMS = CHECK_ITEMS.filter((it) => (!it.only || it.only === homeCode) && (!it.except || it.except !== homeCode));
  const [checks, setChecks] = useState({});
  useEffect(() => { setChecks(loadChecklist()); }, []);
  const done = (it) => (it.auto === "briefs" ? briefs.length > 0 : it.auto === "cities" ? cityCount > 0 : !!checks[it.id]);
  const n = ITEMS.filter(done).length;
  const toggle = (id) => { const c = { ...checks, [id]: !checks[id] }; setChecks(c); saveChecklist(c); };
  return (
    <Card icon={Icon.checkCircle} title={t.checklistTitle} action={<span className="mono muted" style={{ fontSize: 12 }}>{n}/{ITEMS.length}</span>}>
      <div style={{ marginBottom: 12 }}><Bars percent={(n / ITEMS.length) * 100} height={16} /></div>
      <ul className="checklist">
        {ITEMS.map((it) => {
          const d = done(it);
          const [label, sub] = t.checks[it.id];
          return (
            <li key={it.id} className={d ? "done" : ""}>
              {it.auto ? (
                <span className="check-box" aria-hidden="true">{d ? Icon.check : null}</span>
              ) : (
                <button className="check-box" role="checkbox" aria-checked={d} aria-label={label} onClick={() => toggle(it.id)}>{d ? Icon.check : null}</button>
              )}
              <span style={{ flex: 1, minWidth: 0 }}>
                <span className="check-label">{label}</span>
                <span className="check-sub">{sub}</span>
              </span>
              {it.link && <a className="icon-btn ghost" href={it.link} target="_blank" rel="noopener noreferrer" aria-label={`${label} (${t.opensNew})`}>{Icon.external}</a>}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

export default function Dashboard({ t, lang, briefs, go, onLoadSamples, onStart }) {
  // Read browser storage only after the page has loaded, so server and browser render the same HTML.
  const [cityCount, setCityCount] = useState(0);
  useEffect(() => { setCityCount(loadCities().length); }, []);
  const counts = {};
  briefs.forEach((b) => new Set((b.report?.markets || []).map((m) => m.name)).forEach((n) => { counts[n] = (counts[n] || 0) + 1; }));
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const showTop = briefs.length >= 3;

  return (
    <>
      <div className="grid-2-1">
        <QuickStart t={t} lang={lang} onStart={onStart} />
        <Checklist t={t} briefs={briefs} cityCount={cityCount} />
      </div>

      {briefs.length ? (
        <div className={showTop ? "grid-2-1" : ""}>
          <Card icon={Icon.briefs} title={t.recent} action={<button className="btn btn-secondary" onClick={() => go("briefs")}>{t.viewAll}</button>}>
            <BriefsTable t={t} lang={lang} rows={briefs.slice(0, 5)} go={go} />
          </Card>
          {showTop && (
            <Card icon={Icon.route} title={t.topMarkets}>
              {top.slice(0, 5).map(([city, n]) => (
                <div className="bars-row" key={city}>
                  <div className="bars-top"><button className="city-link" onClick={() => go(`city-${citySlug(city)}`, city)}>{city}</button><span className="mono">{n}/{briefs.length}</span></div>
                  <Bars percent={(n / briefs.length) * 100} height={12} />
                </div>
              ))}
            </Card>
          )}
        </div>
      ) : (
        <div className="card">
          <div className="empty">
            <EmptyArt />
            <h3>{t.dashEmptyTitle}</h3>
            <p>{t.dashEmptyText}</p>
            <div className="row"><button className="btn btn-secondary btn-lg" onClick={onLoadSamples}>{Icon.briefs}{t.loadSamples}</button></div>
          </div>
        </div>
      )}
    </>
  );
}
