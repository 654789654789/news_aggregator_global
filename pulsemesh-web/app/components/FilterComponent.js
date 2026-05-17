"use client";

import React from 'react';
import { TIME_FILTERS } from '../lib/utils';

export default function FilterComponent({ timeFilter, setTimeFilter, showFilter, setShowFilter }) {
  return (
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
}
