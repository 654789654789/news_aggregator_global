"use client";

import React from 'react';

export const CATEGORY_STYLES = {
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

export const DATA_URL = "https://raw.githubusercontent.com/654789654789/news_aggregator_global/main/data_engine/pulsemesh_data.json";

export const TIME_FILTERS = [
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
  { label: "1 Hour", value: "1h" },
  { label: "30 Mins", value: "30m" },
];

export const FILTER_MINUTES = { all: Infinity, "6d": 8640, "5d": 7200, "4d": 5760, "3d": 4320, "2d": 2880, "24h": 1440, "12h": 720, "9h": 540, "6h": 360, "3h": 180, "1h": 60, "30m": 30 };

export const formatTimeAgo = (isoString) => {
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

export const filterArticlesByTime = (articles, filter) => {
  const minutes = FILTER_MINUTES[filter] ?? Infinity;
  if (minutes === Infinity) return articles;
  const now = new Date();
  return articles.filter(a => (now - new Date(a.timestamp)) / 60000 <= minutes);
};

export const desiredOrder = ["World", "Politics", "Business", "Tech", "Science", "Sports", "Entertainment", "Lifestyle"];

export const EMERGENCY_PROTOCOLS = {
  Earthquake: {
    title: "Seismic Event Protocol",
    steps: ["DROP to the ground", "COVER your head and neck", "HOLD ON until shaking stops"],
    color: "#ff8c00",
    link: "https://www.ready.gov/earthquakes"
  },
  Flood: {
    title: "Hydrological Alert",
    steps: ["Move to higher ground", "Avoid walking/driving through water", "Turn off utilities if instructed"],
    color: "#3b82f6",
    link: "https://www.ready.gov/floods"
  },
  Conflict: {
    title: "Security Situation",
    steps: ["Seek immediate shelter", "Stay away from windows", "Follow local authority instructions"],
    color: "#ff4e50",
    link: "https://www.reliefweb.int"
  },
  Health: {
    title: "Pathogen Outbreak",
    steps: ["Practice social distancing", "Wear protective masks", "Follow WHO/CDC guidelines"],
    color: "#8b5cf6",
    link: "https://www.who.int/emergencies/situations"
  },
  Cyber: {
    title: "Digital Threat",
    steps: ["Change compromised passwords", "Enable 2FA immediately", "Isolate affected systems"],
    color: "#00f2fe",
    link: "https://www.cisa.gov/be-ready-cyber-threats"
  }
};

export const filterCrisisArticles = (data, filter = "all") => {
  if (!data) return [];
  
  const minutes = FILTER_MINUTES[filter] ?? Infinity;
  const now = new Date();

  // 1. Prioritize articles already in the CrisisWatch category
  const crisisWatchArticles = data.CrisisWatch || [];
  
  // 2. Scan other categories for high-threat severity tags (explicitly tagged by engine)
  const otherCrisisArticles = Object.keys(data)
    .filter(cat => cat !== "CrisisWatch")
    .flatMap(cat => data[cat])
    .filter(article => article.severity && article.severity >= 1);

  // 3. Merge and Deduplicate
  const merged = [...crisisWatchArticles, ...otherCrisisArticles];
  const seen = new Set();
  
  return merged
    .filter(article => {
      if (seen.has(article.title)) return false;
      seen.add(article.title);
      
      if (minutes === Infinity) return true;
      return (now - new Date(article.timestamp)) / 60000 <= minutes;
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};
