"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { T } from "./strings";
import { Icon, Mark } from "./components";
import { loadBriefs, saveBriefs, loadSettings, saveSettings, clearAll, loadCities, clearCities, clearOverviews } from "./store";
import { setHome } from "./geo";
import { detectHome } from "./home";
import { readShareLink } from "./share";
import Dashboard from "./pages/Dashboard";
import NewAnalysis from "./pages/NewAnalysis";
import Briefs from "./pages/Briefs";
import BriefDetail from "./pages/BriefDetail";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import Markets from "./pages/Markets";
import City from "./pages/City";
import MarketDetail from "./pages/MarketDetail";
import Compare from "./pages/Compare";

const PAGES = ["dashboard", "markets", "new", "briefs", "settings", "help"];

const DEFAULT_FEATURED = ["Tokyo", "Seoul", "Kyoto", "Singapore", "Melbourne", "Dubai", "Amsterdam", "London", "Paris", "Berlin", "Copenhagen", "Los Angeles"];

function readRoute() {
  if (typeof window === "undefined") return "dashboard";
  const h = window.location.hash.replace(/^#/, "");
  if (h === "explore") return "markets";
  if (h.startsWith("shared-")) return "shared";
  if (h === "compare" || h.startsWith("compare-") || h.startsWith("brief-") || h.startsWith("city-") || h.startsWith("market-") || PAGES.includes(h)) return h;
  return "dashboard";
}

export default function App({ analyze, suggest = null, exploreCity, marketsOverview, whereToSell, featuredCities = DEFAULT_FEATURED, sampleBriefs = () => [], sampleCityNote = "", phaseMs = 3500, autoSeed = false, defaultCompare = [], realMaps = false, fetchBoundaries = null }) {
  const [settings, setSettings] = useState({ lang: "en", reportLang: "same", theme: "light" });
  const [briefs, setBriefs] = useState([]);
  const [route, setRoute] = useState("dashboard");
  const [navKey, setNavKey] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");
  const [cities, setCities] = useState([]);
  const [cityHint, setCityHint] = useState("");
  const [prefill, setPrefill] = useState(null);
  const [briefsCats, setBriefsCats] = useState([]);
  const [sharedBrief, setSharedBrief] = useState(null);
  const [sharedError, setSharedError] = useState("");
  const [welcome, setWelcome] = useState(false);
  // FindMarket is used worldwide, so the interface and briefs are always in English.
  const t = T.en;

  useEffect(() => {
    const loaded = loadSettings();
    // Keep following the detected country until the user picks one themselves
    if (!loaded.homeManual) { const d = detectHome(); if (loaded.home !== d) { loaded.home = d; saveSettings(loaded); } }
    if (!loaded.welcomed && !window.location.hash.startsWith("#shared-")) setWelcome(true);
    setHome(loaded.home);
    setSettings(loaded);
    const stored = loadBriefs();
    if (autoSeed) {
      // Preview: always show the latest sample briefs, keeping anything the user created.
      const own = stored.filter((b) => !String(b.id).startsWith("sample-"));
      const seeded = [...sampleBriefs("en"), ...own];
      saveBriefs(seeded);
      setBriefs(seeded);
    } else {
      setBriefs(stored);
    }
    setCities(loadCities());
    setRoute(readRoute());
    const onHash = () => { setRoute(readRoute()); setMenuOpen(false); };
    const loadShared = () => {
      if (!window.location.hash.startsWith("#shared-")) return;
      readShareLink(window.location.hash).then((b) => { if (b) { setSharedBrief(b); setSharedError(""); } else setSharedError("bad"); }).catch(() => setSharedError("bad"));
    };
    loadShared();
    window.addEventListener("hashchange", loadShared);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => {
    document.documentElement.lang = "en";
    document.documentElement.dataset.theme = settings.theme === "dark" ? "dark" : "light";
  }, ["en", settings.theme]);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(id);
  }, [toast]);

  const go = useCallback((r, hint) => {
    if (r !== "briefs") setBriefsCats([]);
    if (r.startsWith("city-") || r.startsWith("market-")) setCityHint(hint || "");
    if (r === "new") setNavKey((k) => k + 1);
    if (window.location.hash.replace(/^#/, "") === r) setRoute(r);
    else window.location.hash = r;
    setMenuOpen(false);
    window.scrollTo({ top: 0 });
  }, []);

  function update(patch) {
    if (patch.home) { setHome(patch.home); patch = { ...patch, homeManual: true }; }
    setSettings((s) => { const n = { ...s, ...patch }; saveSettings(n); return n; });
  }
  function setAndSave(list) { setBriefs(list); saveBriefs(list); }
  function addBrief(b) { setAndSave([b, ...briefs]); setToast(t.saved); go(`brief-${b.id}`); }
  function deleteBrief(id) { setAndSave(briefs.filter((b) => b.id !== id)); setToast(t.deleted); }
  // Example report: shown but never saved to the user's list.
  const example = useMemo(() => { const b = sampleBriefs("en")[0]; return b ? { ...b, id: "example", example: true } : null; }, ["en", sampleBriefs]);
  const openExample = () => go("brief-example");
  const closeWelcome = (next) => { setWelcome(false); update({ welcomed: true }); if (next) next(); };
  const saveShared = (b) => {
    const copy = { ...b, id: Math.random().toString(36).slice(2, 12), shared: false, createdAt: Date.now() };
    setAndSave([copy, ...briefs]); setToast(t.savedToBriefs); go(`brief-${copy.id}`);
  };

  const page = route.startsWith("brief-") ? "brief" : route.startsWith("city-") ? "city" : route.startsWith("market-") ? "market" : route.startsWith("compare") ? "compare" : route;
  const [mBriefId, mSlug] = page === "market" ? route.slice(7).split("~") : [];
  const findBrief = (id) => (id === "example" ? example : briefs.find((b) => b.id === id));
  const brief = page === "brief" ? findBrief(route.slice(6)) : page === "market" ? findBrief(mBriefId) : null;
  const titles = { markets: t.nav.markets, dashboard: t.nav.dashboard, new: t.nav.new, briefs: t.nav.briefs, settings: t.nav.settings, help: t.nav.help };

  const menuItem = (key, icon, label, extra) => (
    <button className="menu-item" aria-current={(page === key || (key === "briefs" && (page === "brief" || page === "new" || page === "market")) || (key === "markets" && (page === "city" || page === "compare"))) ? "page" : undefined} onClick={() => go(key)}>
      {icon}<span className="grow">{label}</span>{extra}
    </button>
  );

  return (
    <div className="shell">
      <div className={`scrim${menuOpen ? " open" : ""}`} onClick={() => setMenuOpen(false)} />
      <aside className={`sidebar${menuOpen ? " open" : ""}`} aria-label="Sidebar">
        <div className="side-block">
          <div className="logo-row">
            <div className="logo"><span className="logo-mark"><Mark /></span><span className="logo-name">FindMarket<span>.</span></span></div>
            <button className="icon-btn hamburger" aria-label={t.closeMenu} onClick={() => setMenuOpen(false)}>{Icon.close}</button>
          </div>
        </div>
        <div className="side-block">
          <div className="menu-head">{t.mainMenu}</div>
          <nav className="menu">
            {menuItem("dashboard", Icon.dashboard, t.nav.dashboard)}
            {menuItem("markets", Icon.globe, t.nav.markets)}
            {menuItem("briefs", Icon.briefs, t.nav.briefs, briefs.length ? <span className="count">{briefs.length}</span> : null)}
          </nav>
        </div>
        <div className="side-block side-grow">
          <div className="menu-head">{t.others}</div>
          <nav className="menu">
            {menuItem("settings", Icon.settings, t.nav.settings)}
            {menuItem("help", Icon.help, t.nav.help)}
          </nav>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-btn hamburger" aria-label={t.openMenu} onClick={() => setMenuOpen(true)}>{Icon.menu}</button>
            {page === "market" ? (
              <nav className="crumbs" aria-label="Breadcrumb">
                <button onClick={() => go("briefs")}>{t.nav.briefs}</button><span>/</span>
                <button onClick={() => brief && go(`brief-${brief.id}`)}>{brief?.name || t.nav.brief}</button><span>/</span>
                <span className="crumb-now">{cityHint || (mSlug || "").replace(/-/g, " ")}</span>
              </nav>
            ) : page === "shared" ? (
              <nav className="crumbs" aria-label="Breadcrumb"><span className="crumb-now">{t.sharedCrumb}</span></nav>
            ) : page === "brief" ? (
              <nav className="crumbs" aria-label="Breadcrumb">
                <button onClick={() => go("briefs")}>{t.nav.briefs}</button><span>/</span>
                <span className="crumb-now">{brief?.name || t.nav.brief}</span>
              </nav>
            ) : page === "city" ? (
              <nav className="crumbs" aria-label="Breadcrumb">
                <button onClick={() => go("markets")}>{t.nav.markets}</button><span>/</span>
                <span className="crumb-now">{cityHint || route.slice(5).replace(/-/g, " ")}</span>
              </nav>
            ) : page === "compare" ? (
              <nav className="crumbs" aria-label="Breadcrumb">
                <button onClick={() => go("markets")}>{t.nav.markets}</button><span>/</span><span className="crumb-now">{t.compare}</span>
              </nav>
            ) : page === "new" ? (
              <nav className="crumbs" aria-label="Breadcrumb">
                <button onClick={() => go("briefs")}>{t.nav.briefs}</button><span>/</span><span className="crumb-now">{t.nav.new}</span>
              </nav>
            ) : (
              <h1 className="page-title">{titles[page]}</h1>
            )}
          </div>
          <div className="topbar-right">
            <button className="btn btn-primary" onClick={() => go("new")} aria-label={t.newAnalysis}>{Icon.plus}<span className="hide-sm">{t.newAnalysis}</span></button>
          </div>
        </header>

        <div className="content" key={route}>
          {page === "dashboard" && <Dashboard t={t} lang={"en"} briefs={briefs} go={go} onLoadSamples={openExample}
            onStart={(p) => { setPrefill({ ...p, at: Date.now() }); go("new"); }} />}
          {page === "new" && (
            <NewAnalysis key={navKey} t={t} lang={"en"} analyze={analyze} suggest={suggest} phaseMs={phaseMs}
              defaultReportLang={settings.reportLang} home={settings.home || "ID"} onHome={(c) => update({ home: c })} onSaved={addBrief} prefill={prefill} onPrefillUsed={() => setPrefill(null)} />
          )}
          {page === "briefs" && <Briefs key={briefsCats.join(",")} initialCats={briefsCats} t={t} lang={"en"} briefs={briefs} go={go} query={query} setQuery={setQuery} onDelete={deleteBrief} onLoadSamples={openExample} />}
          {page === "brief" && <BriefDetail key={route} t={t} lang={"en"} brief={brief} go={go} onDelete={deleteBrief} />}
          {page === "shared" && (sharedBrief
            ? <BriefDetail key="shared" t={t} lang={"en"} brief={sharedBrief} go={go} onDelete={() => {}} onSaveShared={saveShared} />
            : <div className="card"><div className="empty"><h3>{sharedError ? t.sharedBad : t.loading}</h3></div></div>)}
          {page === "settings" && <Settings t={t} settings={settings} update={update} briefCount={briefs.length} onClearAll={() => { clearAll(); clearCities(); clearOverviews(); setBriefs([]); setCities([]); setToast(t.cleared); }} />}
          {page === "help" && <Help t={t} />}
          {page === "market" && (
            <MarketDetail key={route + "en"} t={t} lang={"en"} brief={brief} slug={mSlug} go={go}
              exploreCity={exploreCity} onCached={setCities} whereToSell={whereToSell} realMaps={realMaps} fetchBoundaries={fetchBoundaries} />
          )}
          {page === "compare" && (
            <Compare key={route + "en"} t={t} lang={"en"} go={go} featured={featuredCities} briefs={briefs}
              initial={route.startsWith("compare-") ? (cities.find((c) => c.slug === route.slice(8))?.profile.city || route.slice(8).replace(/-/g, " ")) : ""}
              exploreCity={exploreCity} onCached={setCities} defaults={defaultCompare} />
          )}
          {page === "markets" && <Markets t={t} lang={"en"} go={go} briefs={briefs} featured={featuredCities} marketsOverview={marketsOverview} sampleNote={sampleCityNote ? t.sampleOnly(sampleCityNote) : ""} />}
          {page === "city" && (
            <City key={route + "en"} t={t} lang={"en"} slug={route.slice(5)} nameHint={cityHint}
              exploreCity={exploreCity} go={go} onCached={setCities} onAnalyse={() => go("new")} realMaps={realMaps} fetchBoundaries={fetchBoundaries} />
          )}
        </div>
      </main>

      {toast && <div className="toast" role="status">{Icon.checkCircle}{toast}</div>}
      {welcome && (
        <div className="welcome-backdrop" role="dialog" aria-modal="true" aria-labelledby="welcome-title" onClick={(e) => { if (e.target === e.currentTarget) closeWelcome(); }}>
          <div className="welcome">
            <button className="icon-btn ghost welcome-close" onClick={() => closeWelcome()} aria-label={t.close}>{Icon.close}</button>
            <div className="welcome-mark"><Mark /></div>
            <h2 id="welcome-title">{t.welcomeTitle}</h2>
            <p>{t.welcomeText}</p>
            <ol className="welcome-steps">
              {t.welcomeSteps.map(([a, b], i) => (
                <li key={a}><span className="mono">{String(i + 1).padStart(2, "0")}</span><strong>{a}</strong><span>{b}</span></li>
              ))}
            </ol>
            <div className="welcome-actions">
              <button className="btn btn-secondary btn-lg" onClick={() => closeWelcome(openExample)}>{Icon.layers}{t.seeExample}</button>
              <button className="btn btn-primary btn-lg" onClick={() => closeWelcome(() => go("new"))} autoFocus>{Icon.sparkle}{t.analyseMine}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
