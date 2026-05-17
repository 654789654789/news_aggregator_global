"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import FilterComponent from './FilterComponent';
import { CONFIG } from '../lib/config';

export default function Header({ 
  theme, 
  toggleTheme, 
  timeFilter, 
  setTimeFilter, 
  showFilter, 
  setShowFilter,
  showSearch,
  setShowSearch,
  viewCategory, 
  setViewCategory,
  isSubView = false,
  hasCrisis = false 
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isTactical = pathname === '/watch';

  const toggleTactical = () => {
    if (isTactical) router.push('/');
    else router.push('/watch');
  };

  return (
    <header className="header">
      <div className="brand-container">
        {isSubView && (
          <button className="theme-btn" onClick={() => setViewCategory(null)} style={{marginRight:'1rem'}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </button>
        )}
        <h1 className={`brand-title ${isSubView ? 'category-title' : ''}`}>
          {CONFIG.BRAND.NAME}
        </h1>
        <div className="brand-subtitle">
          <span className={`live-indicator ${isTactical ? 'pulse-red' : ''}`}></span>
          <span style={{color: isTactical ? '#ff4e50' : '#00ff88', fontWeight: '700'}}>
            {isTactical ? CONFIG.BRAND.CRISIS_LABEL : CONFIG.BRAND.LIVE_LABEL}
          </span> 
          <span className="hide-mobile" style={{marginLeft: '4px', opacity: 0.6}}>{CONFIG.BRAND.GLOBAL_LABEL}</span>
        </div>
      </div>

      <div style={{display:'flex', alignItems:'center', gap:'1.25rem'}}>
        <div className="tactical-switch-container" onClick={toggleTactical} title={isTactical ? "Switch to Normal View" : "Switch to Strategic Crisis Watch"}>
          <span className="switch-label hide-mobile">{isTactical ? 'STRATEGIC' : 'NORMAL'}</span>
          <div className={`tactical-switch ${isTactical ? 'active' : ''}`}>
            <div className="switch-handle"></div>
          </div>
        </div>
        
        <FilterComponent 
          timeFilter={timeFilter} 
          setTimeFilter={setTimeFilter} 
          showFilter={showFilter} 
          setShowFilter={setShowFilter} 
        />

        <button className={`theme-btn ${showSearch ? 'active' : ''}`} onClick={() => setShowSearch(!showSearch)} title="Search Signals">
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </button>
      </div>
    </header>
  );
}
