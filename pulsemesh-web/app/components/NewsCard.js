"use client";

import React from 'react';
import { formatTimeAgo } from '../lib/utils';

export default function NewsCard({ article, style, handleCopy, copiedLink, featured = false, showSource = true }) {
  return (
    <a 
      href={article.link} 
      target="_blank" 
      rel="noreferrer" 
      className={`news-item ${featured ? 'featured' : ''}`}
      style={featured ? { padding: '1.5rem' } : {}}
    >
      <div className="item-header">
        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
          {showSource && (
            <span 
              className="ticker-category" 
              style={{margin:0, fontSize:'0.6rem', background: `${style.color}22`, color: style.color}}
            >
              {article.source}
            </span>
          )}
          <span className="item-time" style={featured ? { fontSize: '0.85rem' } : {}}>
            {formatTimeAgo(article.timestamp)}
          </span>
          {/* V3 Placeholder: Country Indicator */}
          {article.country && (
            <span className="country-tag" title={article.country}>
              {article.country_code || '🌍'}
            </span>
          )}
        </div>
        <button 
          className={`copy-btn ${copiedLink === article.link ? 'copied' : ''}`}
          onClick={(e) => handleCopy(e, article)}
          title="Copy Headline"
        >
          {copiedLink === article.link ? (
            <svg width={featured ? "20" : "16"} height={featured ? "20" : "16"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          ) : (
            <svg width={featured ? "20" : "16"} height={featured ? "20" : "16"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          )}
        </button>
      </div>
      <h3 className="item-title" style={featured ? { fontSize: '1.25rem', marginTop: '0.5rem' } : {}}>
        {featured && <span className="source-tag">{article.source || 'News'}</span>}
        {article.title}
      </h3>
    </a>
  );
}
