"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { DATA_URL, filterCrisisArticles, formatTimeAgo, EMERGENCY_PROTOCOLS } from "../lib/utils";
import Header from "../components/Header";
import TacticalBackground from "../components/TacticalBackground";
import { CONFIG } from '../lib/config';

function TacticalHUD({ articles, severeCount }) {
  const threatLevel = severeCount > 10 ? "DELTA" : severeCount > 5 ? "GAMMA" : severeCount > 0 ? "BETA" : "ALPHA";
  const systemStatus = severeCount > 5 ? "CRITICAL" : "OPERATIONAL";

  return (
    <div className="tactical-hud">
      <div className="hud-stat">
        <div className="hud-label">Global Threat Level</div>
        <div className={`hud-value ${severeCount > 0 ? 'alert' : ''}`}>{threatLevel}</div>
      </div>
      <div className="hud-stat">
        <div className="hud-label">Active Signals</div>
        <div className="hud-value">{articles.length}</div>
      </div>
      <div className="hud-stat">
        <div className="hud-label">Severe Alerts</div>
        <div className="hud-value alert">{severeCount}</div>
      </div>
      <div className="hud-stat">
        <div className="hud-label">System Status</div>
        <div className="hud-value" style={{ color: severeCount > 5 ? '#ff4e50' : '#00ff88' }}>{systemStatus}</div>
      </div>
    </div>
  );
}

function ProtocolSidebar({ articles }) {
  const activeProtocols = useMemo(() => {
    const protocols = [];
    const titles = articles.map(a => a.title.toLowerCase());
    
    if (titles.some(t => t.includes('earthquake') || t.includes('magnitude'))) protocols.push(EMERGENCY_PROTOCOLS.Earthquake);
    if (titles.some(t => t.includes('flood') || t.includes('tsunami') || t.includes('cyclone'))) protocols.push(EMERGENCY_PROTOCOLS.Flood);
    if (titles.some(t => t.includes('war') || t.includes('conflict') || t.includes('missile'))) protocols.push(EMERGENCY_PROTOCOLS.Conflict);
    if (titles.some(t => t.includes('outbreak') || t.includes('virus') || t.includes('pandemic'))) protocols.push(EMERGENCY_PROTOCOLS.Health);
    if (titles.some(t => t.includes('cyber') || t.includes('attack') || t.includes('hack'))) protocols.push(EMERGENCY_PROTOCOLS.Cyber);
    
    return protocols.length > 0 ? protocols : [EMERGENCY_PROTOCOLS.Conflict];
  }, [articles]);

  return (
    <div className="protocol-sidebar">
      <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem', fontWeight: '800' }}>
        Strategic SOPs
      </div>
      {activeProtocols.map((p, idx) => (
        <div key={idx} className="protocol-card">
          <div className="protocol-title" style={{ color: p.color }}>
            <span style={{ width: '8px', height: '8px', background: p.color, borderRadius: '50%' }}></span>
            {p.title}
          </div>
          {p.steps.map((step, sIdx) => (
            <div key={sIdx} className="protocol-step">{step}</div>
          ))}
          {p.link && (
            <a href={p.link} target="_blank" rel="noreferrer" className="protocol-link" style={{ color: p.color }}>
              Official Guidelines →
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

export default function CrisisWatchPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [timeFilter, setTimeFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [activeSignal, setActiveSignal] = useState(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("pulsemesh-theme") || "dark";
    setTheme(savedTheme);
    if (savedTheme === "light") document.body.classList.add("light-mode");

    const fetchData = () => {
      const isLocal = typeof window !== 'undefined' && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
      const bustedUrl = `${DATA_URL}?t=${new Date().getTime()}`;
      
      fetch(isLocal ? "/fallback_data.json" : bustedUrl)
        .then(res => res.json())
        .then(json => {
           if (!json || Object.keys(json).length === 0) throw new Error();
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
    const interval = setInterval(fetchData, 60000);

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

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    if (newTheme === "light") document.body.classList.add("light-mode");
    else document.body.classList.remove("light-mode");
    localStorage.setItem("pulsemesh-theme", newTheme);
  };

  const allCrisisArticles = useMemo(() => filterCrisisArticles(data, timeFilter), [data, timeFilter]);
  
  const crisisArticles = useMemo(() => {
    let filtered = allCrisisArticles;
    if (severityFilter !== "all") {
      const level = parseInt(severityFilter);
      filtered = filtered.filter(a => {
        const sev = a.severity_score ? (a.severity_score >= 8 ? 3 : a.severity_score >= 5 ? 2 : 1) : (a.severity || 1);
        return sev === level;
      });
    }
    
    if (searchTerm) {
      const tokens = searchTerm.split(/\s+/);
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

      filtered = filtered.filter(a => {
        // Text search matching
        if (textQuery.length > 0) {
          const matchText = textQuery.every(q => a.title.toLowerCase().includes(q));
          if (!matchText) return false;
        }
        // Country search matching
        if (countryQuery && (!a.country || !a.country.toLowerCase().includes(countryQuery))) return false;
        // Region search matching
        if (regionQuery && (!a.region || !a.region.toLowerCase().includes(regionQuery))) return false;
        // Trust score matching
        if (trustQuery && (!a.trust_score || a.trust_score < trustQuery)) return false;
        // Thematic tags matching
        if (tagQuery && (!a.topic_tags || !a.topic_tags.some(t => t.toLowerCase().includes(tagQuery)))) return false;
        return true;
      });
    }
    return filtered;
  }, [allCrisisArticles, severityFilter, searchTerm]);

  const severeCount = useMemo(() => allCrisisArticles.filter(a => {
    const sev = a.severity_score ? (a.severity_score >= 8 ? 3 : a.severity_score >= 5 ? 2 : 1) : (a.severity || 0);
    return sev >= 3;
  }).length, [allCrisisArticles]);

  if (!data && !error) return (
    <div className="tactical-view" style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
      <TacticalBackground theme={theme} />
      <div className="neural-pulse pulse-red"></div>
      <div style={{ 
        fontFamily: 'Outfit', 
        color: '#ff4e50', 
        letterSpacing: '2px', 
        fontWeight: '800', 
        fontSize: '0.75rem', 
        textAlign: 'center',
        padding: '0 2rem'
      }}>
        INITIALIZING STRATEGIC FEED...
      </div>
    </div>
  );

  return (
    <div className="tactical-view">
      <TacticalBackground theme={theme} />
      <Header 
        theme={theme} 
        toggleTheme={toggleTheme} 
        timeFilter={timeFilter} 
        setTimeFilter={setTimeFilter} 
        showFilter={showFilter} 
        setShowFilter={setShowFilter} 
        showSearch={showSearch}
        setShowSearch={setShowSearch}
        viewCategory={null} 
        setViewCategory={() => {}} 
        hasCrisis={severeCount > 0}
      />

      {showSearch && (
        <div className="search-overlay" onClick={() => setShowSearch(false)}>
          <div className="search-container" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={(e) => { e.preventDefault(); setShowSearch(false); }}>
              <div className="search-input-wrapper">
                <input 
                  type="text" 
                  placeholder="Filter strategic signals..." 
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
            </form>
          </div>
        </div>
      )}

      <div className="container" style={{ paddingTop: '1.5rem' }}>
        <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(148, 163, 184, 0.2)', paddingBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: '4px' }}>Strategic Operations Center</div>
            <div className="section-title" style={{ fontSize: '1.75rem', fontWeight: '800', color: 'inherit', fontFamily: 'Outfit' }}>Crisis Watch Dashboard</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, justifyContent: 'flex-end' }}>
            <div className="severity-tabs">
              {["all", "3", "2", "1"].map(lvl => (
                <button 
                  key={lvl}
                  className={`severity-tab ${severityFilter === lvl ? 'active' : ''}`}
                  onClick={() => setSeverityFilter(lvl)}
                >
                  {lvl === "all" ? "All Signals" : lvl === "3" ? "Level 3" : lvl === "2" ? "Level 2" : "Level 1"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <TacticalHUD articles={allCrisisArticles} severeCount={severeCount} />

        <div className="watch-layout">
          <div className="main-feed">
            {crisisArticles.length === 0 ? (
              <div style={{ padding: '4rem 2rem', textAlign: 'center', border: '1px dashed rgba(30,41,59,0.5)', borderRadius: '12px', background: 'rgba(30,41,59,0.2)' }}>
                <div style={{ fontSize: '1rem', color: '#64748b' }}>No signals matching strategic parameters.</div>
              </div>
            ) : (
              <div className="tactical-grid">
                {crisisArticles.map((article, idx) => {
                  const severity = article.severity_score ? (article.severity_score >= 8 ? 3 : article.severity_score >= 5 ? 2 : 1) : (article.severity || 1);
                  const Content = (
                    <>
                      <div className="severity-badge">
                        {severity === 3 ? 'LEVEL 3 - SEVERE' : severity === 2 ? 'LEVEL 2 - HIGH' : 'LEVEL 1 - STRATEGIC'}
                      </div>
                      <h3 className="crisis-title">{article.title}</h3>
                      <div className="crisis-meta">
                        <span style={{ color: severity >= 3 ? '#ff4e50' : '#94a3b8' }}>{article.source}</span>
                        <span>{formatTimeAgo(article.timestamp)}</span>
                      </div>
                    </>
                  );

                  return (
                    <div 
                      key={idx} 
                      onClick={() => setActiveSignal(article)} 
                      className={`crisis-item severity-${severity}`}
                      style={{ cursor: 'pointer' }}
                    >
                      {Content}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="watch-sidebar">
            <ProtocolSidebar articles={crisisArticles} />
            <div className="tactical-card" style={{ marginTop: '1rem', padding: '1rem' }}>
              <div style={{ fontSize: '0.6rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Network Latency</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#00ff88', fontFamily: 'monospace' }}>14ms [SECURE]</div>
            </div>
          </div>
        </div>
      </div>
      
      <button className="floating-theme-btn" onClick={toggleTheme} title="Toggle Theme">
        {theme === "dark" ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
        )}
      </button>

      {activeSignal && (
        <div className="intel-modal-backdrop" onClick={() => setActiveSignal(null)}>
          <div className="intel-modal-panel strategic-alert" onClick={(e) => e.stopPropagation()}>
            <div className="intel-modal-header">
              <span className="source-badge">
                <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#ff2e63', borderRadius: '50%' }}></span>
                {activeSignal.source || "Pulse Ingestion"}
              </span>
              <span style={{ fontSize: '0.65rem', color: '#64748b', fontFamily: 'monospace' }}>
                TELEMETRY AGE: {formatTimeAgo(activeSignal.timestamp)}
              </span>
            </div>
            <div className="intel-modal-body">
              <h3 className="intel-title">{activeSignal.title}</h3>
              
              <div className="intel-summary-container">
                <div className="meta-field-label" style={{ marginBottom: '0.5rem', color: '#ff2e63' }}>Operational Abstract</div>
                <p className="intel-summary">
                  {activeSignal.summary || "No abstract available for this telemetry packet."}
                </p>
              </div>
              
              <div className="intel-meta-grid">
                <div className="meta-field">
                  <span className="meta-field-label">Trust Index</span>
                  <span className="meta-field-value glow-red">
                    {activeSignal.trust_score ? `${activeSignal.trust_score}/10 VERIFIED` : "UNRATED"}
                  </span>
                </div>
                <div className="meta-field">
                  <span className="meta-field-label">Severity Assessment</span>
                  <span className="meta-field-value">
                    {activeSignal.severity_score ? `LEVEL ${activeSignal.severity_score} - ${activeSignal.alert_level?.toUpperCase()}` : "LEVEL 1 - STRATEGIC"}
                  </span>
                </div>
                <div className="meta-field">
                  <span className="meta-field-label">Operational Origin</span>
                  <span className="meta-field-value">
                    {activeSignal.country || "Global"} ({activeSignal.region || "Global"})
                  </span>
                </div>
                <div className="meta-field">
                  <span className="meta-field-label">Intelligence Tags</span>
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
              <button className="modal-btn-dismiss" onClick={() => setActiveSignal(null)}>
                DISMISS HUD
              </button>
              {activeSignal.link && (
                <a 
                  href={activeSignal.link} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="modal-btn-action"
                  onClick={() => setActiveSignal(null)}
                >
                  OPEN SIGNAL SOURCE →
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <footer style={{ position: 'relative', zIndex: 10, padding: '2rem', textAlign: 'center', opacity: 0.3, fontSize: '0.6rem', letterSpacing: '1px' }}>
        {CONFIG.BRAND.STRATEGIC_FOOTER} &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
