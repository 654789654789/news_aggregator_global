"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { 
  DATA_URL, 
  CATEGORY_STYLES, 
  desiredOrder, 
  formatTimeAgo, 
  filterArticlesByTime 
} from "./lib/utils";

// Components
import Header from "./components/Header";
import Footer from "./components/Footer";
import Ticker from "./components/Ticker";
import NewsCard from "./components/NewsCard";

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
      setTimeout(() => setToastMessage(""), 3000);
    });
  }, []);

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
    return allArticles.some(a => a.severity && a.severity >= 3);
  }, [data]);

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
        <div className="search-overlay">
          <div className="search-container">
            <div className="search-input-wrapper">
              <input 
                type="text" 
                placeholder={viewCategory ? `Search in ${viewCategory}...` : "Search across all intelligence categories..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
              <button className="close-search" onClick={() => setShowSearch(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div style={{marginTop: '1rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center'}}>
              Press ESC or click X to return to dashboard
            </div>
          </div>
        </div>
      )}

      {viewCategory ? (
        <div className="sub-view">
          <div className="container" style={{marginTop: '1.5rem'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
               <h2 className="section-title" style={{margin: 0}}>{viewCategory} Intelligence</h2>
            </div>
            <div className="dashboard-grid">
              {filterArticlesByTime(data[viewCategory] || [], timeFilter)
                .filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((article, idx) => (
                <NewsCard 
                  key={idx} article={article} 
                  style={CATEGORY_STYLES[viewCategory] || CATEGORY_STYLES.World}
                  handleCopy={handleCopy} copiedLink={copiedLink}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <Ticker articles={tickerArticles} />

          <div className="container">
            <div className="dashboard-grid" style={{marginTop: '2rem'}}>
              {categories.map((cat) => {
                const filtered = filterArticlesByTime(data[cat] || [], timeFilter)
                  .filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase()));
                if (filtered.length === 0) return null;
                const style = CATEGORY_STYLES[cat] || CATEGORY_STYLES.World;
                const Icon = style.icon;
                
                return (
                  <div key={cat} className="category-section">
                    <div className="category-header">
                      <div className="category-title" style={{display:'flex', alignItems:'center', gap:'10px', color: style.color}}>
                        {Icon(style.color)} {cat}
                      </div>
                      <span className="category-count" style={{background: `${style.color}11`, color: style.color}}>{filtered.length} total</span>
                    </div>
                    <div className="news-list">
                      {filtered.slice(0, 3).map((article, idx) => (
                        <NewsCard key={idx} article={article} style={style} handleCopy={handleCopy} copiedLink={copiedLink} />
                      ))}
                    </div>
                    {filtered.length > 3 && (
                      <button className="view-more-btn" style={{borderColor: `${style.color}44`}} onClick={() => setViewCategory(cat)}>
                        View All {filtered.length} Updates
                      </button>
                    )}
                  </div>
                );
              })}
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
      <Footer />
    </>
  );
}
