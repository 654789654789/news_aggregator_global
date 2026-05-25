"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  DATA_URL,
  CATEGORY_STYLES,
  desiredOrder,
  formatTimeAgo,
  filterArticlesByTime
} from "./lib/utils";
import { CONFIG } from "./lib/config";

// Components
import Header from "./components/Header";
import Footer from "./components/Footer";
import Ticker from "./components/Ticker";
import NewsCard from "./components/NewsCard";

const TrendingIcon = (color) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
  </svg>
);

export default function Home() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [copiedLink, setCopiedLink] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [theme, setTheme] = useState("dark");
  const [timeFilter, setTimeFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [viewCategory, setViewCategory] = useState(null);
  const [activeSignal, setActiveSignal] = useState(null);

  // V3.1 Geopolitical Filters State
  const [activeCountry, setActiveCountry] = useState("ALL");
  const [activeRegion, setActiveRegion] = useState("ALL");

  // V3.1 Groq AI coprocessor states
  const [intelBrief, setIntelBrief] = useState("");
  const [briefLoading, setBriefLoading] = useState(false);

  // Scroll to Top state & logic
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < lastScrollY && currentScrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
      lastScrollY = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("pulsemesh-theme");
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "light") document.body.classList.add("light-mode");
    }

    const fetchData = () => {
      const isLocal = typeof window !== 'undefined' && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
      const bustedUrl = `${DATA_URL}?t=${new Date().getTime()}`;

      fetch(isLocal ? "/fallback_data.json" : bustedUrl)
        .then(res => res.json())
        .then(json => {
          if (!json || Object.keys(json).length === 0) throw new Error("Empty data");
          setData(json);
        })
        .catch(() => {
          fetch("/fallback_data.json")
            .then(res => res.json())
            .then(json => setData(json))
            .catch(() => setError(true));
        });
    };

    fetchData();
    const interval = setInterval(fetchData, CONFIG.UI.REFRESH_INTERVAL);

    const handleClickOutside = (event) => {
      if (!event.target.closest(".funnel-wrapper")) {
        setShowFilter(false);
      }
    };

    if (showFilter) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      clearInterval(interval);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilter]);

  // Dynamic AI fetching trigger
  useEffect(() => {
    if (!activeSignal) {
      setIntelBrief("");
      return;
    }

    setBriefLoading(true);
    fetch("/api/intelligence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: activeSignal.title,
        source: activeSignal.source,
        country: activeSignal.country
      })
    })
      .then(res => res.json())
      .then(data => {
        setIntelBrief(data.brief);
      })
      .catch(() => {
        setIntelBrief("Operational error: Secure terminal coprocessor link failed. Fallback bypassed.");
      })
      .finally(() => {
        setBriefLoading(false);
      });
  }, [activeSignal]);

  // Global keydown listeners for Escape dismissals
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === "Escape") {
        setActiveSignal(null);
        setShowSearch(false);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    if (newTheme === "light") {
      document.body.classList.add("light-mode");
    } else {
      document.body.classList.remove("light-mode");
    }
    localStorage.setItem("pulsemesh-theme", newTheme);
  }, [theme]);

  const handleCopy = useCallback((e, article) => {
    e.preventDefault();
    navigator.clipboard.writeText(article.title).then(() => {
      setCopiedLink(article.link);
      setToastMessage("Headline Copied to Clipboard!");
      setTimeout(() => setCopiedLink(null), 2000);
      setTimeout(() => setToastMessage(""), CONFIG.UI.TOAST_DURATION);
    });
  }, []);

  const filterBySearch = useCallback((articles, query) => {
    if (!query) return articles;
    const tokens = query.split(/\s+/);
    let textQuery = [];
    let countryQuery = null;
    let regionQuery = null;
    let trustQuery = null;
    let tagQuery = null;

    tokens.forEach(token => {
      if (token.startsWith("country:")) {
        countryQuery = token.substring(8).toLowerCase();
      } else if (token.startsWith("region:")) {
        regionQuery = token.substring(7).toLowerCase();
      } else if (token.startsWith("trust:")) {
        trustQuery = parseInt(token.substring(6));
      } else if (token.startsWith("tag:")) {
        tagQuery = token.substring(4).toLowerCase();
      } else if (token) {
        textQuery.push(token.toLowerCase());
      }
    });

    return articles.filter(a => {
      if (textQuery.length > 0) {
        const matchText = textQuery.every(q => a.title.toLowerCase().includes(q));
        if (!matchText) return false;
      }
      if (countryQuery && (!a.country || !a.country.toLowerCase().includes(countryQuery))) return false;
      if (regionQuery && (!a.region || !a.region.toLowerCase().includes(regionQuery))) return false;
      if (trustQuery && (!a.trust_score || a.trust_score < trustQuery)) return false;
      if (tagQuery && (!a.topic_tags || !a.topic_tags.some(t => t.toLowerCase().includes(tagQuery)))) return false;
      return true;
    });
  }, []);

  // V3.1 Geopolitical Filters pipeline
  const filterByGeopolitics = useCallback((articles) => {
    return articles.filter(a => {
      if (activeCountry !== "ALL" && a.country !== activeCountry) return false;
      if (activeRegion !== "ALL" && a.region !== activeRegion) return false;
      return true;
    });
  }, [activeCountry, activeRegion]);

  const categories = useMemo(() => {
    if (!data) return [];
    return Object.keys(data)
      .filter(cat => cat !== "CrisisWatch")
      .sort((a, b) => {
        let indexA = desiredOrder.indexOf(a);
        let indexB = desiredOrder.indexOf(b);
        return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
      });
  }, [data]);

  const hasCrisis = useMemo(() => {
    if (!data) return false;
    const allArticles = Object.values(data).flat();
    return allArticles.some(a => a.severity_score && a.severity_score >= 5);
  }, [data]);

  // Extract unique countries dynamically
  const countryList = useMemo(() => {
    if (!data) return ["ALL"];
    const countries = new Set();
    Object.values(data).flat().forEach(a => {
      if (a.country && a.country !== "Global") countries.add(a.country);
    });
    return ["ALL", ...Array.from(countries).sort()];
  }, [data]);

  // Extract unique regions dynamically
  const regionList = useMemo(() => {
    if (!data) return ["ALL"];
    const regions = new Set();
    Object.values(data).flat().forEach(a => {
      if (a.region && a.region !== "Global") regions.add(a.region);
    });
    return ["ALL", ...Array.from(regions).sort()];
  }, [data]);

  // V3.2 Calculate trending articles sorted by trend_score with strict source diversity
  const trendingArticles = useMemo(() => {
    if (!data) return [];
    const all = Object.keys(data)
      .filter(cat => cat !== "CrisisWatch")
      .flatMap(cat => data[cat] || []);

    // First de-duplicate by URL link to avoid exact same stories
    const unique = [];
    const seen = new Set();
    for (const a of all) {
      if (!seen.has(a.link)) {
        seen.add(a.link);
        unique.push(a);
      }
    }

    // Sort all unique articles by trend score descending
    const sorted = unique.sort((a, b) => (b.trend_score || 0) - (a.trend_score || 0));

    // Filter to enforce strict publisher source diversity (max 1 article per unique outlet)
    const diverse = [];
    const seenSources = new Set();
    for (const a of sorted) {
      if (!seenSources.has(a.source)) {
        seenSources.add(a.source);
        diverse.push(a);
      }
    }
    return diverse;
  }, [data]);

  const filteredTrending = useMemo(() => {
    return filterBySearch(filterByGeopolitics(filterArticlesByTime(trendingArticles, timeFilter)), searchTerm);
  }, [trendingArticles, timeFilter, searchTerm, filterBySearch, filterByGeopolitics]);

  const renderCategorySection = useCallback((cat) => {
    if (!data) return null;

    if (cat === "Trending") {
      if (filteredTrending.length === 0) return null;
      return (
        <div key="Trending" className="category-section trending">
          <div className="category-header">
            <div className="category-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ff9f1c' }}>
              {TrendingIcon('#ff9f1c')} Trending Intel
              <span className="pulse-dot breathing"></span>
            </div>
            <span className="category-count" style={{ background: 'rgba(255, 159, 28, 0.11)', color: '#ff9f1c' }}>{filteredTrending.length} active trends</span>
          </div>
          <div className="news-list">
            {filteredTrending.slice(0, CONFIG.UI_LIMITS.MAX_DISPLAY_CARDS).map((article, idx) => (
              <NewsCard
                key={idx} article={article} style={{ color: '#ff9f1c' }}
                handleCopy={handleCopy} copiedLink={copiedLink}
                onSelect={setActiveSignal}
                featured={idx === 0}
              />
            ))}
          </div>
          {filteredTrending.length > CONFIG.UI_LIMITS.MAX_DISPLAY_CARDS && (
            <button className="view-more-btn" style={{ borderColor: 'rgba(255, 159, 28, 0.35)', color: '#ff9f1c' }} onClick={() => setViewCategory("Trending")}>
              View All {filteredTrending.length} Active Trends
            </button>
          )}
        </div>
      );
    }

    const filtered = filterBySearch(filterByGeopolitics(filterArticlesByTime(data[cat] || [], timeFilter)), searchTerm);
    if (filtered.length === 0) return null;
    const style = CATEGORY_STYLES[cat] || CATEGORY_STYLES.World;
    const Icon = style.icon;

    return (
      <div key={cat} className={`category-section ${cat.toLowerCase()}`}>
        <div className="category-header">
          <div className="category-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: style.color }}>
            {Icon(style.color)} {cat}
          </div>
          <span className="category-count" style={{ background: `${style.color}11`, color: style.color }}>{filtered.length} total</span>
        </div>
        <div className="news-list">
          {filtered.slice(0, CONFIG.UI_LIMITS.MAX_DISPLAY_CARDS).map((article, idx) => (
            <NewsCard
              key={idx} article={article} style={style}
              handleCopy={handleCopy} copiedLink={copiedLink}
              onSelect={setActiveSignal}
              forceNormal={true}
            />
          ))}
        </div>
        {filtered.length > CONFIG.UI_LIMITS.MAX_DISPLAY_CARDS && (
          <button className="view-more-btn" style={{ borderColor: `${style.color}44` }} onClick={() => setViewCategory(cat)}>
            View All {filtered.length} Updates
          </button>
        )}
      </div>
    );
  }, [data, filteredTrending, timeFilter, searchTerm, filterBySearch, filterByGeopolitics, handleCopy, copiedLink, setActiveSignal]);

  const tickerArticles = useMemo(() => {
    if (!data) return [];
    return categories
      .map(cat => (data[cat] && data[cat].length > 0) ? { ...data[cat][0], category: cat } : null)
      .filter(Boolean);
  }, [data, categories]);

  if (!data && !error) return (
    <div className="mesh-bg" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '2rem' }}>
      <div className="loading-container" style={{ position: 'static', transform: 'none' }}>
        <div className="neural-pulse"></div>
      </div>
      <div className="loading-text" style={{ position: 'static', transform: 'none' }}>Syncing PulseMesh Network...</div>
    </div>
  );

  if (error) return (
    <div className="mesh-bg" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '2rem' }}>
      <div className="loading-container" style={{ position: 'static', transform: 'none' }}>
        <div className="neural-pulse" style={{ borderColor: '#ff4e50' }}></div>
      </div>
      <div className="loading-text" style={{ position: 'static', transform: 'none', background: '#ff4e50', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Waiting for data synchronization...</div>
    </div>
  );

  return (
    <>
      <div className="mesh-bg"></div>

      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        timeFilter={timeFilter}
        setTimeFilter={setTimeFilter}
        showFilter={showFilter}
        setShowFilter={setShowFilter}
        showSearch={showSearch}
        setShowSearch={setShowSearch}
        viewCategory={viewCategory}
        setViewCategory={setViewCategory}
        isSubView={!!viewCategory}
        hasCrisis={hasCrisis}
      />

      {showSearch && (
        <div className="search-overlay" onClick={() => setShowSearch(false)}>
          <div className="search-container" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={(e) => { e.preventDefault(); setShowSearch(false); }}>
              <div className="search-input-wrapper" style={{ borderColor: 'rgba(0, 242, 254, 0.4)' }}>
                <input
                  type="text"
                  placeholder={viewCategory ? `Search in ${viewCategory}...` : "Search across all intelligence categories..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setShowSearch(false);
                    }
                  }}
                  autoFocus
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="clear-search-btn"
                    onClick={(e) => { e.stopPropagation(); setSearchTerm(''); }}
                    title="Clear Search"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                )}
                <button type="button" className="close-search" onClick={() => setShowSearch(false)} title="Dismiss Search">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              {/* V3.1 Search Guide Cheatsheet */}
              <div className="search-cheatsheet">
                <div className="cheatsheet-title">Tactical Query Cheatsheet (Click to auto-fill)</div>
                <div className="cheatsheet-tags">
                  {CONFIG.SEARCH_HELPERS.map((helper, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="cheatsheet-tag"
                      onClick={() => setSearchTerm(helper.query)}
                    >
                      {helper.label} ({helper.query})
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
                Press ENTER to submit query, ESC or click backdrop to close
              </div>
            </form>
          </div>
        </div>
      )}

      {viewCategory ? (
        <div className="sub-view">
          <div className="container" style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 className="section-title" style={{ margin: 0 }}>{viewCategory} Intelligence</h2>
            </div>

            {/* Subview Geopolitical Origin Dropdowns */}
            <div className="filter-dropdown-group">
              <div className="filter-select-wrapper">
                <label htmlFor="subview-country-select">Country:</label>
                <select
                  id="subview-country-select"
                  value={activeCountry}
                  onChange={(e) => setActiveCountry(e.target.value)}
                  className="tactical-select keyboard-focus-ring"
                >
                  {countryList.map(c => (
                    <option key={c} value={c}>{c === "ALL" ? "ALL COUNTRIES" : c.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div className="filter-select-wrapper">
                <label htmlFor="subview-region-select">Region:</label>
                <select
                  id="subview-region-select"
                  value={activeRegion}
                  onChange={(e) => setActiveRegion(e.target.value)}
                  className="tactical-select keyboard-focus-ring"
                >
                  {regionList.map(r => (
                    <option key={r} value={r}>{r === "ALL" ? "ALL REGIONS" : r.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="dashboard-grid">
              {filterBySearch(
                filterByGeopolitics(
                  filterArticlesByTime(
                    viewCategory === "Trending" ? trendingArticles : (data[viewCategory] || []),
                    timeFilter
                  )
                ),
                searchTerm
              )
                .map((article, idx) => (
                  <NewsCard
                    key={idx} article={article}
                    style={viewCategory === "Trending" ? { color: '#ff9f1c' } : (CATEGORY_STYLES[viewCategory] || CATEGORY_STYLES.World)}
                    handleCopy={handleCopy} copiedLink={copiedLink}
                    onSelect={setActiveSignal}
                    featured={viewCategory === "Trending" && idx === 0}
                    forceNormal={viewCategory !== "Trending"}
                  />
                ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <Ticker articles={tickerArticles} />

          <div className="container">
            {/* Dynamic Geopolitical Dropdowns on Landing */}
            <div className="filter-dropdown-group" style={{ marginTop: '1.5rem' }}>
              <div className="filter-select-wrapper">
                <label htmlFor="landing-country-select">Country:</label>
                <select
                  id="landing-country-select"
                  value={activeCountry}
                  onChange={(e) => setActiveCountry(e.target.value)}
                  className="tactical-select keyboard-focus-ring"
                >
                  {countryList.map(c => (
                    <option key={c} value={c}>{c === "ALL" ? "ALL COUNTRIES" : c.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div className="filter-select-wrapper">
                <label htmlFor="landing-region-select">Region:</label>
                <select
                  id="landing-region-select"
                  value={activeRegion}
                  onChange={(e) => setActiveRegion(e.target.value)}
                  className="tactical-select keyboard-focus-ring"
                >
                  {regionList.map(r => (
                    <option key={r} value={r}>{r === "ALL" ? "ALL REGIONS" : r.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="dashboard-grid category-grid" style={{ marginTop: '1.5rem' }}>
              {/* Column 1: Trending, Business, Sports */}
              <div className="masonry-column">
                {renderCategorySection("Trending")}
                {renderCategorySection("Business")}
                {renderCategorySection("Sports")}
              </div>

              {/* Column 2: World, Tech, Entertainment */}
              <div className="masonry-column">
                {renderCategorySection("World")}
                {renderCategorySection("Tech")}
                {renderCategorySection("Entertainment")}
              </div>

              {/* Column 3: Politics, Science, Lifestyle */}
              <div className="masonry-column">
                {renderCategorySection("Politics")}
                {renderCategorySection("Science")}
                {renderCategorySection("Lifestyle")}
              </div>
            </div>
          </div>
        </>
      )}

      <button className="floating-theme-btn" onClick={toggleTheme} title="Toggle Theme">
        {theme === "dark" ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
        )}
      </button>

      <div className={`toast ${toastMessage ? 'show' : ''}`}>{toastMessage}</div>

      {activeSignal && (
        <div className="intel-modal-backdrop" onClick={() => setActiveSignal(null)}>
          <div className="intel-modal-panel" onClick={(e) => e.stopPropagation()}>
            {/* V3.1 Close Floating Cross Button */}
            <button className="hud-modal-close keyboard-focus-ring" onClick={() => setActiveSignal(null)} title="CLOSE HUD OVERLAY">×</button>

            <div className="intel-modal-header">
              <span className="source-badge">
                <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#00f2fe', borderRadius: '50%' }}></span>
                {activeSignal.source || "Pulse Ingestion"}
              </span>
              <span style={{ fontSize: '0.65rem', color: '#64748b', fontFamily: 'monospace' }}>
                INGESTED: {formatTimeAgo(activeSignal.timestamp)}
              </span>
            </div>
            <div className="intel-modal-body">
              <h3 className="intel-title">{activeSignal.title}</h3>

              <div className="intel-summary-container" style={{ marginBottom: '1.25rem' }}>
                <div className="meta-field-label" style={{ marginBottom: '0.5rem', color: '#00f2fe' }}>Ingested Abstract</div>
                <p className="intel-summary" style={{ fontSize: '0.8rem', opacity: 0.85 }}>
                  {activeSignal.summary || "No operational abstract is currently available for this signal."}
                </p>
              </div>

              {/* V3.1 Dynamic Groq AI Brief Coprocessor Segment */}
              <div className="intel-summary-container" style={{ background: 'rgba(0, 242, 254, 0.04)', border: '1px solid rgba(0, 242, 254, 0.15)', borderRadius: '6px', padding: '0.75rem 1rem', marginBottom: '1.5rem' }}>
                <div className="meta-field-label" style={{ marginBottom: '0.5rem', color: '#00f2fe', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="radar-icon-spin" style={{ display: 'inline-block', width: '6px', height: '6px', background: '#00f2fe', borderRadius: '50%', animation: 'badgePulse 1.2s infinite alternate' }}></span>
                  Tactical Geopolitical Briefing (Groq AI)
                </div>
                {briefLoading ? (
                  <p className="intel-summary" style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#00f2fe', animation: 'badgePulse 1.5s infinite alternate' }}>
                    ESTABLISHING ENCRYPTED COPROCESSOR TUNNEL... DECRYPTING TELEMETRY OVERLAY...
                  </p>
                ) : (
                  <p className="intel-summary" style={{ fontSize: '0.82rem', lineHeight: '1.5', fontStyle: 'italic', color: '#e2e8f0' }}>
                    {intelBrief}
                  </p>
                )}
              </div>

              <div className="intel-meta-grid">
                <div className="meta-field">
                  <span className="meta-field-label">Trust Score</span>
                  <span className="meta-field-value glow-blue">
                    {activeSignal.trust_score ? `${activeSignal.trust_score}/10 VERIFIED` : "UNRATED"}
                  </span>
                </div>
                <div className="meta-field">
                  <span className="meta-field-label">Signal Quality Index</span>
                  <span className="meta-field-value">
                    {activeSignal.headline_quality ? `${activeSignal.headline_quality.toFixed(1)}/10` : "7.0/10"}
                  </span>
                </div>
                <div className="meta-field">
                  <span className="meta-field-label">Geopolitical Origin</span>
                  <span className="meta-field-value">
                    {activeSignal.country || "Global"} ({activeSignal.region || "Global"})
                  </span>
                </div>
                <div className="meta-field">
                  <span className="meta-field-label">Thematic Taxonomy</span>
                  <div className="intel-tags-container">
                    {activeSignal.topic_tags && activeSignal.topic_tags.length > 0 ? (
                      activeSignal.topic_tags.map((t, tIdx) => (
                        <span key={tIdx} className="intel-tag">{t}</span>
                      ))
                    ) : (
                      <span className="intel-tag" style={{ opacity: 0.5 }}>General</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="intel-modal-footer">
              {activeSignal.link && (
                <a
                  href={activeSignal.link}
                  target="_blank"
                  rel="noreferrer"
                  className="modal-btn-action keyboard-focus-ring"
                  onClick={() => setActiveSignal(null)}
                >
                  OPEN OFFICIAL SOURCE →
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <button 
        className={`floating-scroll-top-btn offset ${showScrollTop ? 'show' : ''}`} 
        onClick={scrollToTop} 
        title="Scroll to Top"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="19" x2="12" y2="5"></line>
          <polyline points="5 12 12 5 19 12"></polyline>
        </svg>
      </button>

      <Footer />
    </>
  );
}
