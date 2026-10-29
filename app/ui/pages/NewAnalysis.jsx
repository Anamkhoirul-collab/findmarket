"use client";

import { useEffect, useState } from "react";
import { countryOptions, countryName } from "../home";
import { Icon, Badge } from "../components";
import { EXAMPLES } from "../strings";
import { newId, guessCategory } from "../store";

function composeFinal(draft, questions, answers) {
  const lines = (questions || [])
    .filter((q) => (answers[q.id] || "").trim())
    .map((q) => `${q.prefix || q.question}: ${answers[q.id].trim()}.`);
  return [draft.trim(), ...lines].filter(Boolean).join("\n");
}

function Stepper({ t, step }) {
  const labels = [t.stepProduct, t.stepDescribe, t.stepReview];
  const pos = [0, 50, 100];
  const idx = Math.min(step, 3) - 1;
  return (
    <div className="stepper" aria-label={`${idx + 1} / 3`}>
      <div className="stepper-track">
        <div className="stepper-fill" style={{ width: `${pos[Math.max(0, idx)]}%` }} />
        {pos.map((p, i) => <span key={i} className={`stepper-dot ${i < idx ? "done" : i === idx ? "now" : ""}`} style={{ left: `${p}%` }} />)}
      </div>
      <div className="stepper-labels">{labels.map((l, i) => <span key={l} className={i === idx ? "now" : ""}>{l}</span>)}</div>
    </div>
  );
}

export default function NewAnalysis({ t, lang, analyze, suggest, phaseMs, defaultReportLang, onSaved, prefill = null, onPrefillUsed = () => {}, home = "ID", onHome = () => {} }) {
  const [step, setStep] = useState(suggest ? 1 : 3);
  const [writeMode, setWriteMode] = useState(!suggest);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [suggestError, setSuggestError] = useState("");
  const [chosen, setChosen] = useState(null);
  const [answers, setAnswers] = useState({});
  const [text, setText] = useState("");
  const [reportLang, setReportLang] = useState(defaultReportLang);
  const [phase, setPhase] = useState(0);
  const [runError, setRunError] = useState("");
  const [runTrace, setRunTrace] = useState([]);
  const [live, setLive] = useState([]);
  const [exampleCat, setExampleCat] = useState(null);

  useEffect(() => { if (!suggest) { setWriteMode(true); setStep((s) => (s < 3 ? 3 : s)); } }, [suggest]);
  useEffect(() => { setReportLang(defaultReportLang); }, [defaultReportLang]);
  // Started from the dashboard's quick start: fill in and run straight away.
  useEffect(() => {
    if (!prefill) return;
    onPrefillUsed();
    const n = prefill.name || "";
    setName(n);
    if (!suggest) { setText(n); return; }
    if (n.length >= 2) runSuggest(n);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill]);
  useEffect(() => {
    if (step !== 4 || runError) return;
    setPhase(0);
    const id = setInterval(() => setPhase((p) => Math.min(p + 1, t.phases.length - 1)), phaseMs);
    return () => clearInterval(id);
  }, [step, runError, phaseMs, t.phases.length]);

  async function runSuggest(nameOverride) {
    const n = (nameOverride ?? name).trim();
    if (!suggest || !n) return;
    setBusy(true); setSuggestError(""); setSuggestion(null); setChosen(null); setAnswers({});
    try {
      const res = await suggest({ name: n, language: lang });
      if (!res || res.error === "NO_PRODUCT" || !res.options?.length) setSuggestError(t.noProduct);
      else { setSuggestion(res); setStep(2); }
    } catch (err) {
      setSuggestError(err.message || t.suggestErr);
    } finally {
      setBusy(false);
    }
  }

  function pickExample(ex) {
    setExampleCat(ex.category);
    if (writeMode) { setText(ex.text[lang]); return; }
    setName(ex.name[lang]);
    runSuggest(ex.name[lang]);
  }

  function toReview() {
    setText(composeFinal(suggestion.options[chosen].description, suggestion.questions, answers));
    setStep(3);
  }

  async function run() {
    setStep(4); setRunError(""); setRunTrace([]); setLive([]);
    const language = "en";
    try {
      const result = await analyze({ description: text, language, home: { code: home, name: countryName(home) }, onStep: (st) => setLive((l) => [...l, st]) });
      const thumb = null;
      const brief = {
        id: newId(),
        createdAt: Date.now(),
        name: (suggestion?.product || name || text.split(/\s+/).slice(0, 6).join(" ")).slice(0, 80),
        category: suggestion?.category || exampleCat || guessCategory(`${name} ${text}`),
        language,
        description: text,
        thumb,
        mocked: !!result.mocked,
        report: result.report,
        signals: result.signals,
        trace: result.trace,
        qloo: {
          destinations: result.qloo?.destinations || [], fit: result.qloo?.fit || {}, audience: result.qloo?.audience || null,
          hs: result.qloo?.hs || null, trade: result.qloo?.trade || {}, facts: result.qloo?.facts || {}, retrievedAt: result.qloo?.retrievedAt || Date.now(),
        },
      };
      onSaved(brief);
    } catch (err) {
      setRunError(err.message || String(err));
      setRunTrace(err.trace || []);
    }
  }

  return (
    <div className={`flow${step === 2 ? " wide" : ""}`}>
      {step <= 3 && <Stepper t={t} step={step} />}

      {step === 1 && (
        <div className="form-card">
          <h2>{t.s1Title}</h2>
          <p className="sub">{t.s1Sub}</p>
          <div className="field">
            <label htmlFor="pname">{t.nameLabel}</label>
            <input id="pname" className="input" value={name} maxLength={120} placeholder={t.namePh}
              onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") runSuggest(); }} />
          </div>
          <div className="field">
            <span className="hint">{t.tryExample}</span>
            <div className="chips">{EXAMPLES.map((ex) => <button key={ex.key} className="chip" onClick={() => pickExample(ex)} disabled={busy}>{ex.label[lang]}</button>)}</div>
          </div>
          {suggestError && <span className="error-text">{suggestError}</span>}
          <div className="form-actions">
            <button className="link-btn" onClick={() => { setWriteMode(true); setStep(3); }}>{t.writeOwn}</button>
            <button
              className={`btn btn-primary btn-lg${busy ? " btn-busy" : ""}`}
              onClick={() => runSuggest()}
              disabled={busy || name.trim().length < 2}
              aria-busy={busy}
            >
              {busy ? <span className="btn-spinner" aria-hidden="true" /> : Icon.sparkle}
              <span>{busy ? t.writing : t.continue}</span>
              {busy && <span className="btn-progress" aria-hidden="true" />}
            </button>
          </div>
        </div>
      )}

      {step === 2 && suggestion && (
        <div className="form-card">
          <h2>{t.s2Title}</h2>
          <p className="sub">{t.s2Sub}</p>
          {suggestion.known_facts?.length > 0 && (
            <div className="facts">{t.factsSeen}{suggestion.known_facts.map((f) => <span className="tag" key={f}>{f}</span>)}</div>
          )}
          <div className="options" role="radiogroup" aria-label={t.s2Title}>
            {suggestion.options.map((o, i) => (
              <button key={i} role="radio" aria-checked={chosen === i} className="option" onClick={() => setChosen(i)}>
                <Badge kind="info">{o.label}</Badge>
                <span className="option-summary">{o.summary}</span>
                <span className="option-text">{o.description}</span>
              </button>
            ))}
          </div>
          {suggestion.questions?.length > 0 && (
            <div className="field" style={{ gap: 10 }}>
              <span className="hint">{t.qIntro}</span>
              {suggestion.questions.map((q) => (
                <div className="q" key={q.id}>
                  <span className="label" style={{ fontWeight: 500, fontSize: 13 }}>{q.question}</span>
                  {q.type === "choice" && q.choices?.length ? (
                    <div className="chips">{q.choices.map((c) => (
                      <button key={c} className="chip" aria-pressed={answers[q.id] === c} onClick={() => setAnswers((a) => ({ ...a, [q.id]: a[q.id] === c ? "" : c }))}>{c}</button>
                    ))}</div>
                  ) : (
                    <input className="input" style={{ maxWidth: 260, minHeight: 32 }} value={answers[q.id] || ""} maxLength={60} placeholder={t.qSkip}
                      onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))} />
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="form-actions">
            <button className="btn btn-secondary btn-lg" onClick={() => setStep(1)}>{t.back}</button>
            <button className="btn btn-primary btn-lg" onClick={toReview} disabled={chosen === null}>{t.continue}</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="form-card">
          <h2>{t.s3Title}</h2>
          <p className="sub">{t.s3Sub}</p>
          <div className="field">
            <label htmlFor="desc">{t.descLabel}</label>
            <textarea id="desc" className="textarea" value={text} maxLength={1200} placeholder={t.descPh} onChange={(e) => setText(e.target.value)} />
            <span className="hint mono" style={{ textAlign: "right" }}>{text.length}/1200</span>
          </div>
          <div className="field">
            <label htmlFor="home">{t.exportingFrom}</label>
            <label className="select-btn wide-select">
              {Icon.globe}
              <select id="home" value={home} onChange={(e) => onHome(e.target.value)}>
                {countryOptions().map(([c, n]) => <option key={c} value={c}>{n}</option>)}
              </select>
              {Icon.chevron}
            </label>
          </div>
          {writeMode && (
            <div className="field">
              <span className="hint">{t.tryExample}</span>
              <div className="chips">{EXAMPLES.map((ex) => <button key={ex.key} className="chip" onClick={() => pickExample(ex)}>{ex.label[lang]}</button>)}</div>
            </div>
          )}
          <div className="form-actions">
            {suggest ? <button className="btn btn-secondary btn-lg" onClick={() => { setStep(suggestion && !writeMode ? 2 : 1); setWriteMode(false); }}>{t.back}</button> : <span />}
            <button className="btn btn-primary btn-lg" onClick={run} disabled={text.trim().length < 20}>{Icon.sparkle}{t.findMarkets}</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="form-card">
          {!runError ? (
            <>
              <h2>{t.runTitle}</h2>
              <p className="sub">{t.runSub}</p>
              <div className="progress" aria-live="polite">
                {t.phases.map((p, i) => {
                  // Advance with the agent's real progress (about 20 steps), or the timer, whichever is further
                  const shown = Math.max(phase, Math.min(t.phases.length - 1, Math.floor((live.length / 20) * t.phases.length)));
                  return (
                    <div key={p} className={`progress-row ${i < shown ? "done" : i === shown ? "now" : ""}`}>
                      <span className="p-dot">{i < shown ? Icon.check : null}</span>{p}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <h2>{t.runError}</h2>
              <p className="error-text" role="alert" style={{ fontSize: 13 }}>{runError}</p>
              {runTrace.length > 0 && (
                <details className="run-trace">
                  <summary>{t.showSteps(runTrace.filter((x) => x.ok).length, runTrace.length)}</summary>
                  <div className="timeline" style={{ marginTop: 10 }}>
                    {runTrace.map((st, i) => (
                      <div className="tl-item" key={i}>
                        <span className={`tl-dot ${st.ok ? "ok" : "fail"}`}>{st.ok ? Icon.check : Icon.close}</span>
                        <div><div className="tl-title">{st.name}</div><div className="tl-tool">{st.tool}</div><div className="tl-sub">{st.detail}</div></div>
                      </div>
                    ))}
                  </div>
                </details>
              )}
              <div className="form-actions">
                <button className="btn btn-secondary btn-lg" onClick={() => setStep(3)}>{t.editDesc}</button>
                <button className="btn btn-primary btn-lg" onClick={run}>{t.tryAgain}</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
