"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import "./globals.css";

const DATA_URL = "https://raw.githubusercontent.com/654789654789/news_aggregator_global/main/data_engine/pulsemesh_data.json";

export default function Home() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [copiedLink, setCopiedLink] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [theme, setTheme] = useState("dark");
  const [timeFilter, setTimeFilter] = useState("all");

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
    if (filter === "all") return articles;
    const now = new Date();
    const cutoffs = { "1h": 60, "24h": 1440, "7d": 10080 };
    const minutes = cutoffs[filter];
    return articles.filter(a => {
      const diff = (now - new Date(a.timestamp)) / 60000;
      return diff <= minutes;
    });
  };

  const handleCopy = (e, article) => {
    e.preventDefault();
    const textToCopy = `${article.title}\n\nRead more: ${article.link}`;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedLink(article.link);
      setToastMessage("Headline Copied to Clipboard!");
      
      setTimeout(() => setCopiedLink(null), 2000);
      setTimeout(() => setToastMessage(""), 3000);
    });
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

  const desiredOrder = ["World", "Politics", "Business", "Tech", "Science", "Sports", "Entertainment", "Lifestyle"];
  const categories = Object.keys(data).sort((a, b) => {
    let indexA = desiredOrder.indexOf(a);
    let indexB = desiredOrder.indexOf(b);
    if (indexA === -1) indexA = 999;
    if (indexB === -1) indexB = 999;
    return indexA - indexB;
  });

  // Extract top 5 newest articles across all categories for the Live Ticker
  const allArticles = [];
  Object.values(data).forEach(catArticles => {
    allArticles.push(...catArticles);
  });
  allArticles.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const tickerArticles = allArticles.slice(0, 5);

  return (
    <>
      <div className="mesh-bg"></div>
      
      <main>
        <header className="header">
          <div className="brand-container">
            <h1 className="brand-title">PulseMesh</h1>
            <div className="brand-subtitle">
              <span className="live-indicator"></span>
              Live Global
            </div>
          </div>

          <div style={{display:'flex', alignItems:'center', gap:'0.75rem'}}>
            {/* Global time filter */}
            <div className="time-filter-bar" style={{margin:0}}>
              {["all", "1h", "24h", "7d"].map((f) => (
                <button
                  key={f}
                  className={`time-filter-btn ${timeFilter === f ? "active" : ""}`}
                  onClick={() => setTimeFilter(f)}
                >
                  {f === "all" ? "All" : f === "1h" ? "1H" : f === "24h" ? "24H" : "7D"}
                </button>
              ))}
            </div>
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
              {tickerArticles.map((article, idx) => (
                <a key={idx} href={article.link} target="_blank" rel="noreferrer" className="ticker-item">
                  {article.title} <span className="ticker-dot">•</span>
                </a>
              ))}
              {/* Duplicate for seamless infinite scroll */}
              {tickerArticles.map((article, idx) => (
                <a key={`dup-${idx}`} href={article.link} target="_blank" rel="noreferrer" className="ticker-item">
                  {article.title} <span className="ticker-dot">•</span>
                </a>
              ))}
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
              
              return (
                <div key={cat} className="category-section">
                  <div className="category-header">
                    <h2 className="category-title">{cat}</h2>
                    <span className="category-count">{filteredCatArticles.length} total</span>
                  </div>
                  
                  <div className="news-list">
                    {displayArticles.map((article, idx) => (
                      <a key={idx} href={article.link} target="_blank" rel="noreferrer" className="news-item">
                        <div className="item-header">
                          <span className="item-time">{formatTimeAgo(article.timestamp)}</span>
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
                    <Link href={`/category/${cat.toLowerCase()}`} style={{textDecoration: 'none'}}>
                      <button className="view-more-btn">
                        View All {filteredCatArticles.length} Updates
                      </button>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className={`toast ${toastMessage ? 'show' : ''}`}>
          {toastMessage}
        </div>
      </main>
    </>
  );
}
