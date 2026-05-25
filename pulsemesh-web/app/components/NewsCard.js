"use client";

import React from 'react';
import { formatTimeAgo } from '../lib/utils';

export default function NewsCard({ article, style, handleCopy, copiedLink, featured = false, showSource = true, onSelect, forceNormal = false }) {
  if (article.trending && !forceNormal) {
    const heatColors = {
      "LOW": "rgba(100, 116, 139, 0.15)",
      "HOT": "rgba(249, 115, 22, 0.15)",
      "SURGING": "rgba(234, 179, 8, 0.15)",
      "CRITICAL": "rgba(239, 68, 68, 0.15)"
    };
    
    const heatTextColors = {
      "LOW": "#94a3b8",
      "HOT": "#ff9f1c",
      "SURGING": "#eab308",
      "CRITICAL": "#ef4444"
    };

    const heatText = article.heat_level || "HOT";
    const sourceCount = article.source_count || 3;
    const accel = article.trend_accel || "+24%";
    
    // Aggregate publisher labels (Multi-source clustering)
    const sourcesList = article.sources_reporting && article.sources_reporting.length > 0 
      ? article.sources_reporting.join(" • ") 
      : article.source || "Ingested Node";

    return (
      <a 
        href={article.link} 
        target="_blank" 
        rel="noreferrer" 
        className={`news-item trending-card keyboard-focus-ring ${featured ? 'featured-trend' : ''}`}
        style={featured ? { padding: '1.5rem' } : {}}
      >
        {/* Trend Top Badge Line */}
        <div className="trend-badge-row">
          <div className="trend-indicator-pill font-mono">
            <span className="trend-arrow">▲</span>
            <span className="trend-accel-val">{accel}</span>
          </div>
          
          <div 
            className="trend-heat-pill font-mono" 
            style={{ 
              background: heatColors[heatText], 
              color: heatTextColors[heatText],
              border: `1px solid ${heatTextColors[heatText]}33`
            }}
          >
            <span className="heat-dot" style={{ background: heatTextColors[heatText] }}></span>
            {heatText}
          </div>
          
          <div className="trend-sources-badge font-mono">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{marginRight: '5px', display: 'inline-block', verticalAlign: 'middle'}}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span style={{verticalAlign: 'middle'}}>{sourceCount} reports</span>
          </div>

          {article.breaking && (
            <span className="breaking-pulse-badge" style={{ verticalAlign: 'middle' }}>
              BREAKING
            </span>
          )}

          <div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px'}}>
            {onSelect && (
              <button 
                className="decrypt-hud-trigger keyboard-focus-ring"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSelect(article);
                }}
                title="DECRYPT TELEMETRY HUD"
                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <svg width={featured ? "18" : "14"} height={featured ? "18" : "14"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="radar-icon-spin">
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="6"></circle>
                  <line x1="12" y1="2" x2="12" y2="12"></line>
                </svg>
              </button>
            )}
            
            <button 
              className={`copy-btn keyboard-focus-ring ${copiedLink === article.link ? 'copied' : ''}`}
              onClick={(e) => handleCopy(e, article)}
              title="Copy Headline"
            >
              {copiedLink === article.link ? (
                <svg width={featured ? "18" : "14"} height={featured ? "18" : "14"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              ) : (
                <svg width={featured ? "18" : "14"} height={featured ? "18" : "14"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              )}
            </button>
          </div>
        </div>

        {/* Headline */}
        <h3 className="trend-headline">
          {article.title}
        </h3>

        {/* Clustered Outlets */}
        <div className="trend-outlets-row">
          <div className="trend-outlet-list">
            {sourcesList}
          </div>
          <div className="trend-intel-subtext">
            {sourceCount} tracking nodes aggregated
          </div>
        </div>
      </a>
    );
  }

  return (
    <a 
      href={article.link} 
      target="_blank" 
      rel="noreferrer" 
      className={`news-item keyboard-focus-ring ${featured ? 'featured' : ''}`}
      style={featured ? { padding: '1.5rem' } : {}}
    >
      <div className="item-header">
        <div style={{display:'flex', alignItems:'center', gap:'8px', flexWrap: 'wrap'}}>
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
          {article.country && (
            <span className="country-tag-badge" title={`Geopolitical Origin: ${article.country}`}>
              {article.country}
            </span>
          )}
        </div>
        
        <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
          {onSelect && (
            <button 
              className="decrypt-hud-trigger keyboard-focus-ring"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelect(article);
              }}
              title="DECRYPT TELEMETRY HUD"
            >
              <svg width={featured ? "20" : "16"} height={featured ? "20" : "16"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="radar-icon-spin">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="6"></circle>
                <circle cx="12" cy="12" r="2"></circle>
                <line x1="12" y1="2" x2="12" y2="12"></line>
              </svg>
            </button>
          )}
          
          <button 
            className={`copy-btn keyboard-focus-ring ${copiedLink === article.link ? 'copied' : ''}`}
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
      </div>
      
      <h3 className="item-title" style={featured ? { fontSize: '1.25rem', marginTop: '0.5rem' } : {}}>
        {featured && <span className="source-tag">{article.source || 'News'}</span>}
        {article.title}
      </h3>
    </a>
  );
}
