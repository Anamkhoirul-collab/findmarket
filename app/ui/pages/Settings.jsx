"use client";

import { useState } from "react";
import { Icon, Card, Modal } from "../components";
import { countryOptions } from "../home";

function Seg({ value, options, onChange, label }) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map(([v, l]) => <button key={v} aria-pressed={value === v} onClick={() => onChange(v)}>{l}</button>)}
    </div>
  );
}

export default function Settings({ t, settings, update, briefCount, onClearAll }) {
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="settings">
      <Card icon={Icon.settings} title={t.prefs}>
        <div className="setting-row">
          <div><h4>{t.homeCountry}</h4><p>{t.homeCountrySub}</p></div>
          <label className="select-btn">
            {Icon.globe}
            <select value={settings.home || "ID"} onChange={(e) => update({ home: e.target.value })} aria-label={t.homeCountry}>
              {countryOptions().map(([c, n]) => <option key={c} value={c}>{n}</option>)}
            </select>
            {Icon.chevron}
          </label>
        </div>
        <div className="setting-row">
          <div><h4>{t.theme}</h4><p>{t.themeSub}</p></div>
          <Seg label={t.theme} value={settings.theme} onChange={(v) => update({ theme: v })} options={[["light", t.light], ["dark", t.dark]]} />
        </div>
      </Card>

      <Card icon={Icon.shield} title={t.privacy}>
        <div className="setting-row"><div><h4>{t.privStore}</h4><p>{t.privStoreSub}</p></div>{Icon.database}</div>
        <div className="setting-row"><div><h4>{t.privQloo}</h4><p>{t.privQlooSub}</p></div>{Icon.tag}</div>
        <div className="setting-row"><div><h4>{t.privAI}</h4><p>{t.privAISub}</p></div>{Icon.sparkle}</div>
        <div className="setting-row">
          <div><h4>{t.clearAll}</h4><p>{t.clearAllSub}</p></div>
          <button className="btn btn-secondary" style={{ color: "var(--danger)" }} onClick={() => setConfirm(true)} disabled={!briefCount}>{Icon.trash}{t.clearAll}</button>
        </div>
      </Card>

      <Card icon={Icon.help} title={t.about}>
        <p style={{ margin: 0, color: "var(--g500)" }}>{t.aboutText}</p>
      </Card>

      {confirm && (
        <Modal icon={Icon.trash} title={t.clearTitle} text={t.clearText} danger confirmLabel={t.clearAll} cancelLabel={t.cancel}
          onCancel={() => setConfirm(false)} onConfirm={() => { setConfirm(false); onClearAll(); }} />
      )}
    </div>
  );
}
