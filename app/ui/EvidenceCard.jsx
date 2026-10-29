"use client";

import { Icon, Badge } from "./components";
import { confidenceFor } from "./evidence";
import { fmtDate } from "./pages/Dashboard";

export function ConfidenceBadge({ t, brief, market }) {
  const c = confidenceFor(t, brief, market);
  const kind = c.level === "high" ? "success" : c.level === "medium" ? "info" : "warn";
  return <Badge kind={kind}>{t.confidence[c.level]}</Badge>;
}

// "Why you can trust this": the evidence behind one market, with sources and dates.
export default function EvidenceCard({ t, brief, market, lang = "en" }) {
  const c = confidenceFor(t, brief, market);
  const kind = c.level === "high" ? "success" : c.level === "medium" ? "info" : "warn";
  const when = brief?.qloo?.retrievedAt || brief?.createdAt;
  return (
    <section className="card evidence-card">
      <div className="card-head">
        <h3 className="card-title">{Icon.shield}{t.evTitle}</h3>
        <span className="ev-score"><Badge kind={kind}>{t.confidence[c.level]}</Badge><span className="mono muted">{c.score}/{c.total}</span></span>
      </div>
      <div className="card-body">
        <ul className="ev-list">
          {c.checks.map((x) => (
            <li key={x.key} className={x.ok ? "ok" : ""}>
              <span className="ev-icon">{x.ok ? Icon.check : Icon.close}</span>
              <span className="ev-label">{x.label}</span>
              <span className="ev-detail">{x.detail}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="card-foot source-line">
        <span>{t.srcQloo}</span>
        {when && <span>{t.retrieved(fmtDate(when, lang, true))}</span>}
        {brief?.mocked && <Badge kind="warn">{t.sample}</Badge>}
      </div>
    </section>
  );
}
