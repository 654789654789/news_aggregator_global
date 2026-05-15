"use client";

import { useState, useEffect, useMemo } from "react";

const CATEGORY_STYLES = {
  World: { color: "#00f2fe", icon: (color) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
  )},
  Politics: { color: "#3b82f6", icon: (color) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18"></path>
      <path d="M3 7l9-4 9 4v2H3V7z"></path>
      <path d="M5 21V11h3v10"></path>
      <path d="M10 21V11h4v10"></path>
      <path d="M16 21V11h3v10"></path>
    </svg>
  )},
  Business: { color: "#10b981", icon: (color) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
      <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
  )},
  Tech: { color: "#00d2ff", icon: (color) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
      <rect x="9" y="9" width="6" height="6"></rect>
      <line x1="9" y1="1" x2="9" y2="4"></line>
      <line x1="15" y1="1" x2="15" y2="4"></line>
      <line x1="9" y1="20" x2="9" y2="23"></line>
      <line x1="15" y1="20" x2="15" y2="23"></line>
      <line x1="20" y1="9" x2="23" y2="9"></line>
      <line x1="20" y1="15" x2="23" y2="15"></line>
      <line x1="1" y1="9" x2="4" y2="9"></line>
      <line x1="1" y1="15" x2="4" y2="15"></line>
    </svg>
  )},
  Science: { color: "#8b5cf6", icon: (color) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.3 21H7.7c-.5 0-.9-.3-1.1-.8L10 11V5c0-.6.4-1 1-1h2c.6 0 1 .4 1 1v6l3.4 9.2c.2.5-.2.8-.7.8z"></path>
      <path d="M10 10h4"></path>
    </svg>
  )},
  Sports: { color: "#f59e0b", icon: (color) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
      <path d="M12 15V22"></path>
      <path d="M10 22H14"></path>
    </svg>
  )},
  Entertainment: { color: "#ec4899", icon: (color) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect>
      <path d="M7 2v20"></path>
      <path d="M17 2v20"></path>
      <path d="M2 12h20"></path>
      <path d="M2 7h5"></path>
      <path d="M2 17h5"></path>
      <path d="M17 17h5"></path>
      <path d="M17 7h5"></path>
    </svg>
  )},
  Lifestyle: { color: "#fbbf24", icon: (color) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
      <path d="M5 3L4 4"></path>
      <path d="M19 3l1 1"></path>
      <path d="M5 21l-1-1"></path>
      <path d="M19 21l1-1"></path>
    </svg>
  )}
};

const DATA_URL = "https://raw.githubusercontent.com/654789654789/news_aggregator_global/main/data_engine/pulsemesh_data.json";

export default function Home() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [copiedLink, setCopiedLink] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [theme, setTheme] = useState("dark");
  const [timeFilter, setTimeFilter] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const [viewCategory, setViewCategory] = useState(null);

  const TIME_FILTERS = [
    { label: "All Time", value: "all" },
    { label: "Last 6 Days", value: "6d" },
    { label: "Last 5 Days", value: "5d" },
    { label: "Last 4 Days", value: "4d" },
    { label: "Last 3 Days", value: "3d" },
    { label: "Last 2 Days", value: "2d" },
    { label: "Last 24 Hours", value: "24h" },
    { label: "Last 12 Hours", value: "12h" },
    { label: "Last 9 Hours", value: "9h" },
    { label: "Last 6 Hours", value: "6h" },
    { label: "Last 3 Hours", value: "3h" },
    { label: "Last 1 Hour", value: "1h" },
  ];

  const FILTER_MINUTES = { all: Infinity, "6d": 8640, "5d": 7200, "4d": 5760, "3d": 4320, "2d": 2880, "24h": 1440, "12h": 720, "9h": 540, "6h": 360, "3h": 180, "1h": 60 };

  useEffect(() => {
    const savedTheme = localStorage.getItem("pulsemesh-theme");
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "light") document.body.classList.add("light-mode");
    }

    const fetchData = () => {
      const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      
      if (isLocal) {
        fetch("/fallback_data.json?t=" + new Date().getTime())
          .then(res => res.json())
          .then(json => setData(json))
          .catch(() => setError(true));
      } else {
        const bustedUrl = `${DATA_URL}?t=${new Date().getTime()}`;
        fetch(bustedUrl)
          .then((res) => {
            if (!res.ok) throw new Error("GitHub fetch failed");
            return res.json();
          })
          .then((json) => {
            if (!json || Object.keys(json).length === 0) {
              return fetch("/fallback_data.json").then(r => r.json());
            }
            return json;
          })
          .then((json) => setData(json))
          .catch(() => {
            fetch("/fallback_data.json")
              .then(res => res.json())
              .then(json => setData(json))
              .catch(() => setError(true));
          });
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);

    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
      document.body.classList.add("light-mode");
      localStorage.setItem("pulsemesh-theme", "light");
    } else {
      setTheme("dark");
      document.body.classList.remove("light-mode");
      localStorage.setItem("pulsemesh-theme", "dark");
    }
  };

  const formatTimeAgo = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const filterArticlesByTime = (articles, filter) => {
    const minutes = FILTER_MINUTES[filter] ?? Infinity;
    if (minutes === Infinity) return articles;
    const now = new Date();
    return articles.filter(a => (now - new Date(a.timestamp)) / 60000 <= minutes);
  };

  const handleCopy = (e, article) => {
    e.preventDefault();
    const textToCopy = article.title;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedLink(article.link);
      setToastMessage("Headline Copied to Clipboard!");
      
      setTimeout(() => setCopiedLink(null), 2000);
      setTimeout(() => setToastMessage(""), 3000);
    });
  };

  const desiredOrder = ["World", "Politics", "Business", "Tech", "Science", "Sports", "Entertainment", "Lifestyle"];
  
  const categories = useMemo(() => {
    if (!data) return [];
    return Object.keys(data).sort((a, b) => {
      let indexA = desiredOrder.indexOf(a);
      let indexB = desiredOrder.indexOf(b);
      if (indexA === -1) indexA = 999;
      if (indexB === -1) indexB = 999;
      return indexA - indexB;
    });
  }, [data]);

  const tickerArticles = useMemo(() => {
    if (!data) return [];
    return categories
      .map(cat => {
        const articles = data[cat];
        if (!articles || articles.length === 0) return null;
        return { ...articles[0], category: cat };
      })
      .filter(Boolean);
  }, [data, categories]);

  if (!data && !error) return (
    <div className="mesh-bg">
      <div className="loading">Syncing PulseMesh Network...</div>
    </div>
  );

  if (error) return (
    <div className="mesh-bg">
      <div className="loading">Waiting for first data synchronization...</div>
    </div>
  );

  const FilterComponent = () => (
    <div className="funnel-wrapper">
      <button
        className={`funnel-btn ${timeFilter !== 'all' ? 'funnel-active' : ''}`}
        onClick={() => setShowFilter(v => !v)}
        title="Filter by time"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
        </svg>
        {timeFilter !== 'all' && (
          <span className="funnel-badge">
            {TIME_FILTERS.find(f => f.value === timeFilter)?.label.replace('Last ', '').replace(' Hours','H').replace(' Hour','H').replace(' Days','D').replace(' Day','D')}
          </span>
        )}
      </button>
      {showFilter && (
        <div className="funnel-dropdown">
          <div className="funnel-dropdown-title">Filter by Time Range</div>
          {TIME_FILTERS.map(f => (
            <button
              key={f.value}
              className={`funnel-option ${timeFilter === f.value ? 'selected' : ''}`}
              onClick={() => { setTimeFilter(f.value); setShowFilter(false); }}
            >
              {f.label}
              {timeFilter === f.value && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const MainView = () => (
    <>
      <header className="header">
        <div className="brand-container">
          <h1 className="brand-title">PulseMesh</h1>
          <div className="brand-subtitle">
            <span className="live-indicator"></span>
            Live <span className="hide-mobile">Global</span>
          </div>
        </div>

        <div style={{display:'flex', alignItems:'center', gap:'0.75rem'}}>
          <FilterComponent />
          <button className="theme-btn" onClick={toggleTheme} title="Toggle Theme">
            {theme === "dark" ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            )}
          </button>
        </div>
      </header>

      {tickerArticles.length > 0 && (
        <div className="ticker-container">
          <div className="ticker-label">
            <span className="live-indicator" style={{marginRight: '8px'}}></span>
            LIVE
          </div>
          <div className="ticker-wrap">
            {tickerArticles.map((article, idx) => {
              const style = CATEGORY_STYLES[article.category] || CATEGORY_STYLES.World;
              return (
                <a key={idx} href={article.link} target="_blank" rel="noreferrer" className="ticker-item">
                  <span className="ticker-category" style={{background: `${style.color}22`, color: style.color}}>{article.category}</span>
                  {article.title} <span className="ticker-dot">•</span>
                </a>
              );
            })}
            {tickerArticles.map((article, idx) => {
              const style = CATEGORY_STYLES[article.category] || CATEGORY_STYLES.World;
              return (
                <a key={`dup-${idx}`} href={article.link} target="_blank" rel="noreferrer" className="ticker-item">
                  <span className="ticker-category" style={{background: `${style.color}22`, color: style.color}}>{article.category}</span>
                  {article.title} <span className="ticker-dot">•</span>
                </a>
              );
            })}
          </div>
        </div>
      )}

      <div className="container">
        <div className="dashboard-grid">
          {categories.map((cat) => {
            const articles = data[cat] || [];
            const filteredCatArticles = filterArticlesByTime(articles, timeFilter);
            if (filteredCatArticles.length === 0) return null;
            
            const displayArticles = filteredCatArticles.slice(0, 3);
            const style = CATEGORY_STYLES[cat] || CATEGORY_STYLES.World;
            const Icon = style.icon;
            
            return (
              <div key={cat} className="category-section">
                <div className="category-header">
                  <div className="category-title" style={{display:'flex', alignItems:'center', gap:'10px', color: style.color}}>
                    {Icon(style.color)} {cat}
                  </div>
                  <span className="category-count" style={{background: `${style.color}11`, color: style.color}}>{filteredCatArticles.length} total</span>
                </div>
                
                <div className="news-list">
                  {displayArticles.map((article, idx) => (
                    <a key={idx} href={article.link} target="_blank" rel="noreferrer" className="news-item">
                      <div className="item-header">
                        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                          <span className="ticker-category" style={{margin:0, fontSize:'0.6rem', background: `${style.color}22`, color: style.color}}>{article.source}</span>
                          <span className="item-time">{formatTimeAgo(article.timestamp)}</span>
                        </div>
                        <button 
                          className={`copy-btn ${copiedLink === article.link ? 'copied' : ''}`}
                          onClick={(e) => handleCopy(e, article)}
                          title="Copy Headline"
                        >
                          {copiedLink === article.link ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                          )}
                        </button>
                      </div>
                      <h3 className="item-title">{article.title}</h3>
                    </a>
                  ))}
                </div>
                
                {filteredCatArticles.length > 3 && (
                  <button className="view-more-btn" style={{borderColor: `${style.color}44`}} onClick={() => setViewCategory(cat)}>
                    View All {filteredCatArticles.length} Updates
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );

  const SubView = () => {
    const articles = filterArticlesByTime(data[viewCategory] || [], timeFilter);
    const style = CATEGORY_STYLES[viewCategory] || CATEGORY_STYLES.World;
    const Icon = style.icon;
    return (
      <div className="sub-view">
        <header className="header">
          <div className="brand-container">
            <button className="theme-btn" onClick={() => setViewCategory(null)} style={{marginRight:'1rem'}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            </button>
            <h1 className="brand-title" style={{display:'flex', alignItems:'center', gap:'10px', color: style.color}}>{Icon(style.color)} {viewCategory} Updates</h1>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:'0.75rem'}}>
            <FilterComponent />
            <button className="theme-btn" onClick={toggleTheme} title="Toggle Theme">
              {theme === "dark" ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              )}
            </button>
          </div>
        </header>
        <div className="container">
          <div className="dashboard-grid">
            {articles.map((article, idx) => (
              <a key={idx} href={article.link} target="_blank" rel="noreferrer" className="news-item">
                <div className="item-header">
                  <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                    <span className="ticker-category" style={{margin:0, fontSize:'0.6rem', background: `${style.color}22`, color: style.color}}>{article.source}</span>
                    <span className="item-time">{formatTimeAgo(article.timestamp)}</span>
                  </div>
                  <button 
                    className={`copy-btn ${copiedLink === article.link ? 'copied' : ''}`}
                    onClick={(e) => handleCopy(e, article)}
                    title="Copy Headline"
                  >
                    {copiedLink === article.link ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    )}
                  </button>
                </div>
                <h3 className="item-title">{article.title}</h3>
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="mesh-bg"></div>
      {viewCategory ? <SubView /> : <MainView />}
      <div className={`toast ${toastMessage ? 'show' : ''}`}>
        {toastMessage}
      </div>
    </>
  );
}
