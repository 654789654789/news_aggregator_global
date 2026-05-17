"use client";

import { CONFIG } from '../lib/config';

export default function Footer() {
  return (
    <footer className="global-footer">
      <p className="footer-text">
        {CONFIG.BRAND.NAME} {CONFIG.BRAND.SUBTITLE} &copy; {new Date().getFullYear()} | Curated via <a href={CONFIG.SOCIAL.X_TWITTER} target="_blank" rel="noreferrer" className="footer-link">X Interface</a>
      </p>
    </footer>
  );
}
