"use client";

import React from 'react';
import { CATEGORY_STYLES } from '../lib/utils';

export default function Ticker({ articles }) {
  if (!articles || articles.length === 0) return null;

  return (
    <div className="ticker-container">
      <div className="ticker-label">
        <span className="live-indicator" style={{marginRight: '8px'}}></span>
        LIVE
      </div>
      <div className="ticker-wrap">
        {articles.map((article, idx) => {
          const style = CATEGORY_STYLES[article.category] || CATEGORY_STYLES.World;
          return (
            <a key={idx} href={article.link} target="_blank" rel="noreferrer" className="ticker-item">
              <span className="ticker-category" style={{background: `${style.color}22`, color: style.color}}>{article.category}</span>
              {article.title} <span className="ticker-dot">•</span>
            </a>
          );
        })}
        {/* Duplicate for infinite effect */}
        {articles.map((article, idx) => {
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
  );
}
