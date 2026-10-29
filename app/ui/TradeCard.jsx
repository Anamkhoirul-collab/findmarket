"use client";

import { useState } from "react";
import { Icon, Badge, RingChart, RING_COLORS } from "./components";
import LineChart from "./LineChart";
import { usd, compact, tradeOf, factsOf } from "./evidence";
import { getHome } from "./geo";

function SelectBtn({ value, onChange, options, label }) {
  return (
    <label className="select-btn">
      {Icon.calendar || Icon.clock}
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      {Icon.chevron}
    </label>
  );
}

// Market data, laid out like the kit's "Stock trend" + "Stock health" pair:
// an import trend line chart on the left and a supplier-share ring on the right.
export default function TradeCard({ t, brief, country }) {
  const trade = tradeOf(brief, country);
  const facts = factsOf(brief, country);
  const hs = brief?.qloo?.hs;
  const home = trade?.home || brief?.home?.name || getHome().name;
  const [view, setView] = useState("value");

  // Yearly series without a partly reported final year; monthly series when Comtrade has it.
  const series = (trade?.imports || []).filter((d) => d.year !== trade?.partialYear);
  const monthly = trade?.monthly || [];
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthLabel = (p) => `${MONTHS[Number(p.slice(4, 6)) - 1]} ${p.slice(2, 4)}`;
  const yoy = series.slice(1).map((d, i) => ({ label: String(d.year), value: ((d.value - series[i].value) / series[i].value) * 100 }));
  const points = view === "growth" ? yoy
    : view === "monthly" ? monthly.map((d) => ({ label: monthLabel(d.period), value: d.value }))
    : series.map((d) => ({ label: String(d.year), value: d.value }));
  const range = series.length ? `${series[0].year}–${series[series.length - 1].year}` : "";
  const viewOptions = [
    ["value", `${t.yearly} · ${range}`],
    ...(monthly.length >= 3 ? [["monthly", `${t.monthly} · ${monthLabel(monthly[0].period)}–${monthLabel(monthly[monthly.length - 1].period)}`]] : []),
    ["growth", t.yearlyChange],
  ];

  // Supplier ring: top suppliers, the user's country if not already shown, then everyone else
  const sup = trade?.topSuppliers || [];
  const top = sup.slice(0, 3);
  const homeRow = sup.find((s) => s.name.toLowerCase() === String(home).toLowerCase());
  if (homeRow && !top.includes(homeRow)) top.push(homeRow);
  else if (!homeRow && trade?.indonesia?.share > 0) top.push({ name: home, share: trade.indonesia.share, value: trade.indonesia.value });
  const shown = top.reduce((a, s) => a + s.share, 0);
  const parts = [...top.map((s, i) => ({ key: s.name, label: s.name, share: s.share, value: s.value, color: s.name.toLowerCase() === String(home).toLowerCase() ? "var(--success)" : RING_COLORS[i] })),
    ...(shown < 99.5 ? [{ key: "_other", label: t.otherSuppliers, share: 100 - shown, value: trade?.latestValue ? trade.latestValue * (100 - shown) / 100 : null, color: "var(--g150)" }] : [])];

  if (!trade && !facts) {
    return (
      <section className="card trade-card">
        <div className="card-head"><h3 className="card-title">{Icon.database}{t.marketData(country)}</h3></div>
        <div className="card-body"><p className="hint" style={{ margin: 0 }}>{t.noTradeData}</p></div>
      </section>
    );
  }

  return (
    <div className="trade-row">
      <section className="card trend-card">
        <div className="card-head">
          <h3 className="card-title">{Icon.database}{t.importTrend(country)}</h3>
          {hs && <Badge kind="info">HS {hs.code}{trade?.hsLabel || hs.label ? ` · ${(trade?.hsLabel || hs.label).slice(0, 34)}` : ""}</Badge>}
        </div>
        <div className="card-body">
          {series.length ? (
            <>
              <div className="trend-top">
                <div>
                  <div className="trend-value"><strong className="mono">{usd(trade.latestValue)}</strong><span>{t.importsIn(trade.latestYear)}</span>
                    {typeof trade.growth === "number" && <Badge kind={trade.growth > 0 ? "success" : "danger"}>{trade.growth > 0 ? "+" : ""}{trade.growth.toFixed(1)}% {t.perYear}</Badge>}
                  </div>
                  {facts && <div className="trend-facts">{t.population} <b>{compact(facts.population?.value)}</b><span className="dot-sep" />{t.gdpPerCapita} <b>{usd(facts.gdpPerCapita?.value)}</b></div>}
                </div>
                <SelectBtn label={t.trendView} value={view} onChange={setView} options={viewOptions} />
              </div>
              <LineChart
                key={view}
                points={points}
                height={280}
                padLeft={view === "growth" ? 44 : 58}
                label={t.importTrend(country)}
                format={view === "growth" ? (v) => `${v > 0 ? "+" : ""}${v.toFixed(1)}%` : (v) => usd(v)}
                tickFormat={view === "growth" ? (v) => `${Math.round(v)}%` : (v) => usd(v)}
                initial={points.length - 1}
                axisLabel={(l, i) => (view === "monthly" && points.length > 12 && i % 3 !== 0 && i !== points.length - 1 ? "" : l)}
              />
              {trade?.partialYear && view !== "monthly" && <p className="hint" style={{ margin: "4px 0 0" }}>{t.partialYear(trade.partialYear)}</p>}
            </>
          ) : (
            <>
              {facts && <div className="trend-facts" style={{ marginBottom: 8 }}>{t.population} <b>{compact(facts.population?.value)}</b><span className="dot-sep" />{t.gdpPerCapita} <b>{usd(facts.gdpPerCapita?.value)}</b></div>}
              <p className="hint" style={{ margin: 0 }}>{trade?.note || t.noImportData}</p>
            </>
          )}
        </div>
        <div className="card-foot source-line">
          {trade?.source && <span>{t.srcComtrade}</span>}
          {facts?.source && <span>{t.srcWorldBank(facts.gdpPerCapita?.year || facts.population?.year)}</span>}
        </div>
      </section>

      <section className="card share-card">
        <div className="card-head"><h3 className="card-title">{Icon.users}{t.supplierShare}</h3></div>
        <div className="card-body share-body">
          {parts.length > 1 ? (
            <>
              <div className="share-ring">
                <RingChart parts={parts.map((p) => ({ key: p.key, value: p.share, color: p.color }))} center={usd(trade.latestValue)} sub={t.totalImports} size={210} />
              </div>
              {trade?.indonesia && (
                <p className="home-pos">
                  {trade.indonesia.rank ? t.homeRank(home, trade.indonesia.rank, trade.indonesia.of, trade.indonesia.share.toFixed(1)) : t.homeNone(home)}
                </p>
              )}
              <div className="legend legend-3">
                {parts.map((p) => (
                  <div key={p.key} style={{ "--c": p.color }} className={p.color === "var(--success)" ? "is-home" : ""}>
                    <b>{p.label}</b><span>{p.share.toFixed(0)}% • {usd(p.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <p className="hint" style={{ margin: 0 }}>{t.noSupplierData}</p>}
        </div>
      </section>
    </div>
  );
}
