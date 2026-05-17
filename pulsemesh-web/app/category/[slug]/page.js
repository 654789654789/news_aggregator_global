"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { 
  DATA_URL, 
  CATEGORY_STYLES, 
  formatTimeAgo, 
  filterArticlesByTime 
} from "../../lib/utils";

// Components
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import NewsCard from "../../components/NewsCard";

export default function CategoryPage({ params }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [copiedLink, setCopiedLink] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [theme, setTheme] = useState("dark");
  const [timeFilter, setTimeFilter] = useState("all");
  const [showFilter, setShowFilter] = useState(false);

  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;

  useEffect(() => {
    const savedTheme = localStorage.getItem("pulsemesh-theme");
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "light") document.body.classList.add("light-mode");
    }

    const fetchData = () => {
      fetch(`${DATA_URL}?t=${new Date().getTime()}`)
        .then(res => res.json())
        .then(json => setData(json))
        .catch(() => {
          fetch("/fallback_data.json")
            .then(res => res.json())
            .then(json => setData(json))
            .catch(() => setError(true));
        });
    };

    fetchData();
    const interval = setInterval(fetchData, 180000);

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
    if (newTheme === "light") {
      document.body.classList.add("light-mode");
    } else {
      document.body.classList.remove("light-mode");
    }
    localStorage.setItem("pulsemesh-theme", newTheme);
  };

  const handleCopy = (e, article) => {
    e.preventDefault();
    navigator.clipboard.writeText(article.title).then(() => {
      setCopiedLink(article.link);
      setToastMessage("Headline Copied to Clipboard!");
      setTimeout(() => setCopiedLink(null), 2000);
      setTimeout(() => setToastMessage(""), 3000);
    });
  };

  if (!data && !error) return (
    <div className="mesh-bg">
      <div className="loading-container">
        <div className="neural-pulse"></div>
        <div className="loading-text">Syncing PulseMesh Network...</div>
      </div>
    </div>
  );

  if (error) return (
    <div className="mesh-bg">
      <div className="loading-container">
        <div className="neural-pulse" style={{ borderColor: '#ff4e50' }}></div>
        <div className="loading-text" style={{ background: '#ff4e50', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Waiting for data synchronization...</div>
      </div>
    </div>
  );

  const categoryName = Object.keys(data).find(key => key.toLowerCase() === slug.toLowerCase());
  const articles = categoryName ? data[categoryName] : [];
  const filtered = filterArticlesByTime(articles, timeFilter);
  const style = CATEGORY_STYLES[categoryName] || CATEGORY_STYLES.World;

  return (
    <>
      <div className="mesh-bg"></div>

      <div>
        <header className="header">
          <div className="brand-container">
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '1rem', color: 'var(--accent-cyan)' }}><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
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

        <div className="container" style={{ maxWidth: '800px' }}>
          <div className={`category-section section-${categoryName}`}>
            <div className="category-header">
              <div className="category-title-wrap">
                {style.icon(style.color)}
                <h2 className="category-title">{categoryName ? `${categoryName} Updates` : "Category Not Found"}</h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="category-count">{filtered.length} updates</span>
                <Header 
                  isSubView={true} hideBrand={true}
                  theme={theme} toggleTheme={toggleTheme}
                  timeFilter={timeFilter} setTimeFilter={setTimeFilter}
                  showFilter={showFilter} setShowFilter={setShowFilter}
                />
              </div>
            </div>

            {filtered.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', padding: '2rem 0', textAlign: 'center' }}>
                No headlines found for this time range. Try a wider filter.
              </p>
            ) : (
              <div className="news-list">
                {filtered.map((article, idx) => (
                  <NewsCard 
                    key={idx} article={article} style={style} 
                    handleCopy={handleCopy} copiedLink={copiedLink} 
                    featured={idx === 0} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={`toast ${toastMessage ? 'show' : ''}`}>{toastMessage}</div>
        <Footer />
      </div>
    </>
  );
}
