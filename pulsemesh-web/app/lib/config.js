/**
 * PulseMesh Global Identity & Strategy Configuration
 * Use this file to update branding, social links, search guides, vector maps, and AI prompts.
 */

export const CONFIG = {
  // Brand Metadata
  BRAND: {
    NAME: "PulseMesh",
    SUBTITLE: "Intelligence Network",
    LIVE_LABEL: "LIVE",
    CRISIS_LABEL: "CRISIS",
    GLOBAL_LABEL: "GLOBAL",
    FOOTER_TEXT: "PULSEMESH GLOBAL INTELLIGENCE NETWORK | ENCRYPTED SYNC ACTIVE",
    STRATEGIC_FOOTER: "PULSEMESH STRATEGIC DATA LAYER | SECURE FEED ACTIVE",
  },

  // UI Settings
  UI: {
    DEFAULT_THEME: "dark",
    REFRESH_INTERVAL: 60000, // 1 minute in milliseconds
    TOAST_DURATION: 3000,
  },

  // Social & External Links
  SOCIAL: {
    X_TWITTER: "https://x.com/urban_cipher",
    LINKEDIN: "https://linkedin.com/company/pulsemesh",
    GITHUB: "https://github.com/pulsemesh",
    SUPPORT_EMAIL: "ops@pulsemesh.intel",
  },

  // Data endpoints
  ENDPOINTS: {
    FALLBACK_DATA: "/fallback_data.json",
    INTELLIGENCE_API: "/api/intelligence",
  },

  // --- V3.1 Geopolitical Future-Proofing Configurations ---

  // Interactive Search Guide Tags (Cheatsheet)
  SEARCH_HELPERS: [
    { label: "US Signals", query: "country:US" },
    { label: "UK Signals", query: "country:UK" },
    { label: "India Signals", query: "country:India" },
    { label: "European Union", query: "country:EU" },
    { label: "Global/UN", query: "country:UN" },
    { label: "Europe Region", query: "region:Europe" },
    { label: "East Asia Region", query: "region:East Asia" },
    { label: "Middle East", query: "region:Middle East" },
    { label: "Oceania", query: "region:Oceania" },
    { label: "High Trust (9+)", query: "trust:9" },
    { label: "Active Military", query: "tag:Military" },
    { label: "Geopolitical Flashpoints", query: "tag:Geopolitics" },
  ],

  // SVG World Map Cyberpunk Hotspots & pulsing coordinates
  MAP_HOTSPOTS: [
    { id: "americas", name: "Americas Command", country: "US", x: "24%", y: "34%", color: "#00f2fe", lat: 38, lon: -97 },
    { id: "europe", name: "European Theatre", country: "UK", x: "53%", y: "26%", color: "#3b82f6", lat: 53, lon: -2 },
    { id: "south-asia", name: "South Asia Grid", country: "India", x: "69%", y: "46%", color: "#fbbf24", lat: 22, lon: 78 },
    { id: "east-asia", name: "East Asia Watch", country: "Japan", x: "78%", y: "38%", color: "#ef4444", lat: 36, lon: 138 },
    { id: "oceania", name: "Oceania Command", country: "Australia", x: "84%", y: "65%", color: "#10b981", lat: -25, lon: 133 },
  ],

  // Groq AI Custom System Prompt Instruction template
  AI_PROMPT_TEMPLATE: "Provide a highly concise, 3-sentence military-style strategic geopolitical threat assessment brief for the following news update. Focus strictly on geopolitical risks, tactical escalations, and sovereign implications. Ensure the tone is objective and highly professional. Headline: {title}. Source: {source}. Geopolitical Origin: {country}.",

  // Display limits
  UI_LIMITS: {
    MAX_DISPLAY_CARDS: 3,
    MAX_SUBVIEW_CARDS: 200,
  }
};
