"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Gavel, Cpu, Globe, TrendingUp } from "lucide-react";
import "../../globals.css";

const DATA_URL = "https://raw.githubusercontent.com/654789654789/news_aggregator_global/main/data_engine/pulsemesh_data.json";

export default function CategoryPage({ params }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [copiedLink, setCopiedLink] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [theme, setTheme] = useState("dark");
  const [timeFilter, setTimeFilter] = useState("all");
  const [showFilter, setShowFilter] = useState(false);

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

  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug; // e.g., "tech"

  useEffect(() => {
    const savedTheme = localStorage.getItem("pulsemesh-theme");
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "light") document.body.classList.add("light-mode");
    }

    const fetchData = () => {
      // Cache-Buster: Append random timestamp to force GitHub to send freshest data
      const bustedUrl = `${DATA_URL}?t=${new Date().getTime()}`;
      
      fetch(bustedUrl)
        .then((res) => {
          if (!res.ok) throw new Error("GitHub fetch failed");
          return res.json();
        })
        .then((json) => {
          // If GitHub returns empty object (e.g. wiped/cached), use local fallback
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
    };

    fetchData(); // Initial load
    const interval = setInterval(fetchData, 180000); // Silent background polling every 3 minutes

    return () => clearInterval(interval);
  }, [data]);

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

  const getCategoryIcon = (category) => {
    const props = { size: 28, className: "category-icon" };
    switch(category) {
      case 'Politics': return <Gavel {...props} color="#3b82f6" />;
      case 'Tech': return <Cpu {...props} color="#22d3ee" />;
      case 'World': return <Globe {...props} color="#10b981" />;
      default: return <TrendingUp {...props} color="#a855f7" />;
    }
  };

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

  // Find the exact category name (case-insensitive match)
  const categoryName = Object.keys(data).find(
    (key) => key.toLowerCase() === slug.toLowerCase()
  );

  const articles = categoryName ? data[categoryName] : [];
  const filteredArticles = filterArticlesByTime(articles, timeFilter);

  return (
    <>
      <div className="mesh-bg"></div>
      
      <main>
        <header className="header">
          <div className="brand-container">
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '1rem', color: 'var(--accent-cyan)'}}><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              <h1 className="brand-title">PulseMesh</h1>
            </Link>
          </div>
          
          <button className="theme-btn" onClick={toggleTheme} title="Toggle Theme">
            {theme === "dark" ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            )}
          </button>
        </header>

        <div className="container" style={{maxWidth: '800px'}}>
          <div className={`category-section section-${categoryName}`}>
            <div className="category-header">
              <div className="category-title-wrap">
                {getCategoryIcon(categoryName)}
                <h2 className="category-title" style={{fontSize: '2rem'}}>{categoryName || "Category Not Found"}</h2>
              </div>
              <div style={{display:'flex', alignItems:'center', gap:'0.75rem'}}>
                <span className="category-count">{filteredArticles.length} updates</span>
                {/* Funnel Filter Dropdown */}
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
              </div>
            </div>
            
            {filteredArticles.length === 0 ? (
              <p style={{color: 'var(--text-secondary)', padding: '2rem 0', textAlign: 'center'}}>
                No headlines found for this time range. Try a wider filter.
              </p>
            ) : (
              <div className="news-list">
                {filteredArticles.map((article, idx) => (
                  <a key={idx} href={article.link} target="_blank" rel="noreferrer" className={`news-item ${idx === 0 ? 'featured' : ''}`} style={{padding: '1.5rem'}}>
                    <div className="item-header">
                      <span className="item-time" style={{fontSize: '0.85rem'}}>{formatTimeAgo(article.timestamp)}</span>
                      <button 
                        className={`copy-btn ${copiedLink === article.link ? 'copied' : ''}`}
                        onClick={(e) => handleCopy(e, article)}
                        title="Copy Headline"
                      >
                        {copiedLink === article.link ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        )}
                      </button>
                    </div>
                    <h3 className="item-title" style={{fontSize: '1.25rem', marginTop: '0.5rem'}}>
                      <span className="source-tag">{article.source || 'News'}</span>
                      {article.title}
                    </h3>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={`toast ${toastMessage ? 'show' : ''}`}>
          {toastMessage}
        </div>
      </main>
    </>
  );
}
