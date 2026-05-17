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
      filtered = filtered.filter(a => (a.severity || 1) === level);
    }
    if (searchTerm) {
      filtered = filtered.filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return filtered;
  }, [allCrisisArticles, severityFilter, searchTerm]);

  const severeCount = useMemo(() => allCrisisArticles.filter(a => (a.severity || 0) >= 3).length, [allCrisisArticles]);

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
        <div className="search-overlay">
          <div className="search-container">
            <div className="search-input-wrapper">
              <input 
                type="text" 
                placeholder="Filter strategic signals..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
              <button className="close-search" onClick={() => setShowSearch(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
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
                  const Content = (
                    <>
                      <div className="severity-badge">
                        {article.severity === 3 ? 'LEVEL 3 - SEVERE' : article.severity === 2 ? 'LEVEL 2 - HIGH' : 'LEVEL 1 - STRATEGIC'}
                      </div>
                      <h3 className="crisis-title">{article.title}</h3>
                      <div className="crisis-meta">
                        <span style={{ color: article.severity >= 3 ? '#ff4e50' : '#94a3b8' }}>{article.source}</span>
                        <span>{formatTimeAgo(article.timestamp)}</span>
                      </div>
                    </>
                  );

                  return article.link ? (
                    <a key={idx} href={article.link} target="_blank" rel="noreferrer" className={`crisis-item severity-${article.severity || 1}`}>
                      {Content}
                    </a>
                  ) : (
                    <div key={idx} className={`crisis-item severity-${article.severity || 1} static`}>
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

      <footer style={{ position: 'relative', zIndex: 10, padding: '2rem', textAlign: 'center', opacity: 0.3, fontSize: '0.6rem', letterSpacing: '1px' }}>
        {CONFIG.BRAND.STRATEGIC_FOOTER} &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
