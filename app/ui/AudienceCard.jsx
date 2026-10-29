"use client";

import { useState } from "react";
import { Icon } from "./components";
import LineChart from "./LineChart";
import { normalizeDemographics } from "./demographics";

function SelectBtn({ value, onChange, options, label }) {
  return (
    <label className="select-btn wide-select">
      {Icon.users}
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      {Icon.chevron}
    </label>
  );
}

// "Who this audience is", laid out like the kit's forecast card:
// a selector on top, a line chart of Qloo demographics, then the portrait and brands.
export default function AudienceCard({ t, brief }) {
  const r = brief?.report || {};
  const demo = normalizeDemographics(brief?.qloo?.audience);
  const views = [["age", t.byAgeGroup], ...(demo.gender.length ? [["gender", t.byGender]] : [])];
  const [view, setView] = useState("age");
  const points = (view === "gender" ? demo.gender : demo.age).map((d) => ({ label: d.label, value: d.value }));
  const peak = points.length ? points.reduce((a, b) => (b.value > a.value ? b : a)) : null;

  return (
    <section className="card audience-card">
      <div className="card-head"><h3 className="card-title">{Icon.users}{t.audience}</h3></div>
      <div className="card-body">
        {points.length ? (
          <>
            <SelectBtn label={t.audienceView} value={view} onChange={setView} options={views} />
            <div className="audience-chart">
              <LineChart key={view} points={points} height={260} label={t.audience} format={(v) => Math.round(v)} initial={peak ? points.indexOf(peak) : null} />
            </div>
          </>
        ) : null}
        <p className="audience-portrait">{r.audience?.portrait}</p>
        {r.audience?.also_loves?.length > 0 && (
          <div className="tags">{r.audience.also_loves.map((x) => <span className="tag" key={x}>{x}</span>)}</div>
        )}
      </div>
    </section>
  );
}
