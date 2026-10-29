"use client";

import { useState } from "react";
import { Icon, Card, Modal, EmptyArt } from "../components";
import { BriefsTable } from "./Dashboard";

export default function Briefs({ t, lang, briefs, go, query, setQuery, onDelete, onLoadSamples, initialCats = [] }) {
  const [cats, setCats] = useState(initialCats);
  const toggleCat = (c) => setCats((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]));
  const [pending, setPending] = useState(null);

  if (!briefs.length) {
    return (
      <div className="card">
        <div className="empty">
          <EmptyArt />
          <h3>{t.dashEmptyTitle}</h3>
          <p>{t.dashEmptyText}</p>
          <div className="row">
            <button className="btn btn-primary btn-lg" onClick={() => go("new")}>{Icon.plus}{t.newAnalysis}</button>
            <button className="btn btn-secondary btn-lg" onClick={onLoadSamples}>{Icon.briefs}{t.loadSamples}</button>
          </div>
        </div>
      </div>
    );
  }

  const q = query.trim().toLowerCase();
  const usedCats = [...new Set(briefs.map((b) => b.category || "other"))];
  const rows = briefs.filter((b) =>
    (!cats.length || cats.includes(b.category || "other")) &&
    (!q || [b.name, b.description, ...(b.report?.markets || []).map((m) => m.name)].join(" ").toLowerCase().includes(q))
  );

  return (
    <>
      <Card icon={Icon.briefs} title={t.briefsCount(briefs.length)}
>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
          <label className="search" style={{ display: "flex", width: 240 }}>
            {Icon.search}
            <span className="sr-only">{t.searchPh}</span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.searchPh} />
          </label>
          <div className="chips">
            <button className="chip" aria-pressed={!cats.length} onClick={() => setCats([])}>{t.filterAll}</button>
            {usedCats.map((c) => (
              <button key={c} className="chip" aria-pressed={cats.includes(c)} onClick={() => toggleCat(c)}>{t.cats[c] || c}</button>
            ))}
          </div>
        </div>
        {rows.length ? (
          <BriefsTable t={t} lang={lang} rows={rows} go={go} onDelete={setPending} />
        ) : (
          <p className="muted" style={{ padding: "24px 0", textAlign: "center", margin: 0 }}>{t.noMatch}</p>
        )}
      </Card>
      {pending && (
        <Modal icon={Icon.trash} title={t.deleteTitle} text={`${pending.name}. ${t.deleteText}`} danger
          confirmLabel={t.delete} cancelLabel={t.cancel}
          onCancel={() => setPending(null)} onConfirm={() => { onDelete(pending.id); setPending(null); }} />
      )}
    </>
  );
}
