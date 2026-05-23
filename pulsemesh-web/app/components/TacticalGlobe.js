"use client";

import React, { useState, useMemo, useRef } from 'react';
import { WORLD_MAP_DATA } from '../lib/worldMapData';
import { geocodeArticle, COUNTRY_REGISTRY } from '../lib/geocoder';

/**
 * Projects latitude and longitude coordinates into the 2D coordinate space
 * of the Al MacDonald Simple World Map SVG (viewBox="30.767 241.591 784.077 458.627").
 */
const projectMercator = (lat, lon) => {
  // Longitude linear mapping: maps -180..180 to X coordinates 30.767..814.844 (width 784.077)
  const x = 30.767 + ((lon + 180) / 360) * 784.077;
  
  // Latitude Mercator mapping: maps lat to Y coordinates in viewBox
  const latRad = (lat * Math.PI) / 180;
  // Clamp latitude to avoid infinite values at the poles
  const clampedLatRad = Math.max(-1.48, Math.min(1.48, latRad)); 
  const yRad = Math.log(Math.tan(Math.PI / 4 + clampedLatRad / 2));
  // Mercator scale factor to align with map viewBox
  const y = 535 - 140 * yRad;
  
  return { x, y };
};

export default function TacticalGlobe({ 
  activeCountry, 
  setActiveCountry, 
  activeRegion, 
  setActiveRegion, 
  allCrisisArticles 
}) {
  const containerRef = useRef(null);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [hoveredHotspot, setHoveredHotspot] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Map country name to standard ISO two-letter code for visual highlight matches
  const activeCountryCode = useMemo(() => {
    if (!activeCountry || activeCountry === "ALL") return null;
    const match = Object.entries(COUNTRY_REGISTRY).find(
      ([_, registry]) => registry.name.toLowerCase() === activeCountry.toLowerCase()
    );
    return match ? match[0] : null;
  }, [activeCountry]);

  // Geocode and project active crisis articles into visual hotspots
  const activeHotspots = useMemo(() => {
    const spots = [];
    const seenLocations = new Set();

    allCrisisArticles.forEach((article, idx) => {
      const geo = geocodeArticle(article);
      if (geo && geo.lat !== undefined && geo.lon !== undefined) {
        const coords = projectMercator(geo.lat, geo.lon);
        
        // Slight coordinate jittering for multiple articles at the exact same coordinates to prevent complete overlap
        let jitterX = 0;
        let jitterY = 0;
        const coordKey = `${geo.lat.toFixed(2)},${geo.lon.toFixed(2)}`;
        if (seenLocations.has(coordKey)) {
          // Add micro-jitter offset based on index
          jitterX = Math.sin(idx) * 3;
          jitterY = Math.cos(idx) * 3;
        } else {
          seenLocations.add(coordKey);
        }

        spots.push({
          id: `spot-${idx}`,
          article,
          x: coords.x + jitterX,
          y: coords.y + jitterY,
          countryCode: geo.countryCode,
          locationName: geo.locationName,
          severity: article.severity_score ? (article.severity_score >= 8 ? 3 : article.severity_score >= 5 ? 2 : 1) : (article.severity || 1)
        });
      }
    });
    return spots;
  }, [allCrisisArticles]);

  // Handle country path interaction triggers
  const handleCountryClick = (code) => {
    const registry = COUNTRY_REGISTRY[code];
    if (registry) {
      const targetName = registry.name;
      // Toggle country filter on click
      if (activeCountry === targetName) {
        setActiveCountry("ALL");
      } else {
        setActiveCountry(targetName);
        setActiveRegion("ALL"); // Clear region to prevent conflicts
      }
    }
  };

  // Handle hotspot coordinates interaction triggers
  const handleHotspotClick = (spot) => {
    const registry = COUNTRY_REGISTRY[spot.countryCode];
    if (registry) {
      setActiveCountry(registry.name);
      setActiveRegion("ALL");
    }
  };

  // Track cursor coordinates for tooltip overlays
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left + 15,
      y: e.clientY - rect.top + 10
    });
  };

  return (
    <div className="world-map-hud-container" style={{ marginTop: '2rem' }}>
      <div className="world-map-hud-title">
        <span>Tactical Threat Vector Map</span>
        <span className="map-live-status">
          <span style={{ 
            display: 'inline-block', 
            width: '6px', 
            height: '6px', 
            background: '#ff2e63', 
            borderRadius: '50%', 
            animation: 'badgePulse 1.2s infinite alternate',
            boxShadow: '0 0 8px #ff2e63'
          }}></span>
          LIVE GEOPOLITICAL WATCH ACTIVE
        </span>
      </div>

      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        style={{ 
          position: 'relative', 
          width: '100%', 
          aspectRatio: '2.1/1', 
          background: 'rgba(6, 10, 22, 0.75)', 
          border: '1px solid rgba(255, 46, 99, 0.15)', 
          borderRadius: '8px', 
          overflow: 'hidden' 
        }}
      >
        {/* Background static HUD markings */}
        <div style={{ position: 'absolute', top: '10px', left: '15px', pointerEvents: 'none', color: 'rgba(0, 242, 254, 0.25)', fontFamily: 'monospace', fontSize: '7.5px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          PROJECTION: MERCATOR 2D VECTOR WATCH
        </div>
        <div style={{ position: 'absolute', top: '10px', right: '15px', pointerEvents: 'none', color: 'rgba(255, 46, 99, 0.25)', fontFamily: 'monospace', fontSize: '7.5px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          HOTSPOTS ACTIVE: {activeHotspots.length}
        </div>
        
        {/* Responsive interactive SVG Vector Map */}
        <svg 
          viewBox="30.767 241.591 784.077 458.627" 
          style={{ width: '100%', height: '100%', display: 'block' }}
        >
          <g className="world-base-grid" style={{ opacity: 0.15 }}>
            {/* Draw Equator */}
            <line x1="30.767" y1="535" x2="814.844" y2="535" stroke="#00f2fe" strokeWidth="0.5" strokeDasharray="3 3" />
            <text x="35" y="531" fill="#00f2fe" fontSize="6px" fontFamily="monospace">EQUATOR</text>
            
            {/* Draw Prime Meridian */}
            <line x1="422.8" y1="241.591" x2="422.8" y2="700.218" stroke="#00f2fe" strokeWidth="0.5" strokeDasharray="3 3" />
            <text x="426" y="250" fill="#00f2fe" fontSize="6px" fontFamily="monospace">MERIDIAN</text>
          </g>

          <g className="country-boundaries">
            {WORLD_MAP_DATA.map((country) => {
              const isHovered = hoveredCountry === country.id;
              const isActive = activeCountryCode === country.id;
              
              // Color styles depending on active selection or hover
              const getFillColor = () => {
                if (isActive) return 'rgba(255, 46, 99, 0.22)';
                if (isHovered) return 'rgba(0, 242, 254, 0.12)';
                return 'rgba(15, 23, 42, 0.45)';
              };

              const getStrokeColor = () => {
                if (isActive) return 'rgba(255, 46, 99, 0.75)';
                if (isHovered) return 'rgba(0, 242, 254, 0.6)';
                return 'rgba(0, 242, 254, 0.15)';
              };

              const getStrokeWidth = () => {
                if (isActive) return '0.9';
                if (isHovered) return '0.75';
                return '0.4';
              };

              return (
                <g 
                  key={country.id} 
                  id={`map-country-${country.id}`}
                  style={{ cursor: 'pointer', transition: 'all 0.25s ease' }}
                  onMouseEnter={() => setHoveredCountry(country.id)}
                  onMouseLeave={() => setHoveredCountry(null)}
                  onClick={() => handleCountryClick(country.id)}
                >
                  {country.paths.map((d, index) => (
                    <path
                      key={index}
                      d={d}
                      fill={getFillColor()}
                      stroke={getStrokeColor()}
                      strokeWidth={getStrokeWidth()}
                      style={{ transition: 'fill 0.2s ease, stroke 0.2s ease, stroke-width 0.2s ease' }}
                    />
                  ))}
                </g>
              );
            })}
          </g>

          {/* Glowing automatic Geopolitical Hotspots overlay */}
          <g className="news-hotspots">
            {activeHotspots.map((spot) => {
              const isHovered = hoveredHotspot?.id === spot.id;
              
              // Crimson for alerts, orange/cyan for standard
              const markerColor = spot.severity === 3 ? '#ff2e63' : spot.severity === 2 ? '#fbbf24' : '#00f2fe';
              const coreRadius = isHovered ? 5 : spot.severity === 3 ? 3.5 : 2.5;

              return (
                <g 
                  key={spot.id}
                  className="map-pulsing-hotspot"
                  onMouseEnter={() => setHoveredHotspot(spot)}
                  onMouseLeave={() => setHoveredHotspot(null)}
                  onClick={() => handleHotspotClick(spot)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Outer pulsing ring */}
                  <circle 
                    cx={spot.x} 
                    cy={spot.y} 
                    r={isHovered ? 15 : 8} 
                    fill="none" 
                    stroke={markerColor} 
                    strokeWidth={0.8}
                    style={{ 
                      opacity: isHovered ? 0.8 : 0.45,
                      animation: 'beaconGlow 1.6s infinite ease-out',
                      transformOrigin: `${spot.x}px ${spot.y}px`
                    }}
                  />
                  
                  {/* Solid core element */}
                  <circle 
                    cx={spot.x} 
                    cy={spot.y} 
                    r={coreRadius} 
                    fill={markerColor} 
                    style={{ 
                      boxShadow: `0 0 10px ${markerColor}`,
                      transition: 'r 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  />

                  {/* Draw cybernetic pointer line and tactical tag ONLY for hovered or high severity Level 3 alerts */}
                  {(isHovered || spot.severity === 3) && (
                    <g style={{ pointerEvents: 'none' }}>
                      <polyline 
                        points={`${spot.x},${spot.y} ${spot.x + 12},${spot.y - 12} ${spot.x + 40},${spot.y - 12}`} 
                        stroke={markerColor} 
                        strokeWidth={0.7} 
                        fill="none" 
                        style={{ opacity: 0.6 }}
                      />
                      <text 
                        x={spot.x + 15} 
                        y={spot.y - 16} 
                        fill={isHovered ? '#ffffff' : markerColor} 
                        fontSize="6.5px" 
                        fontFamily="monospace" 
                        fontWeight="bold"
                        letterSpacing="0.5px"
                      >
                        {spot.locationName.toUpperCase()}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Floating tactical cyberpunk tooltip overlay on hotspot hover */}
        {hoveredHotspot && (
          <div 
            className="tactical-map-tooltip"
            style={{
              position: 'absolute',
              left: `${tooltipPos.x}px`,
              top: `${tooltipPos.y}px`,
              pointerEvents: 'none',
              zIndex: 1000,
              background: 'rgba(6, 10, 22, 0.94)',
              backdropFilter: 'blur(8px)',
              border: `1px solid ${hoveredHotspot.severity === 3 ? 'rgba(255, 46, 99, 0.5)' : hoveredHotspot.severity === 2 ? 'rgba(251, 191, 36, 0.5)' : 'rgba(0, 242, 254, 0.5)'}`,
              borderRadius: '6px',
              padding: '0.65rem 0.85rem',
              maxWidth: '260px',
              boxShadow: `0 8px 30px rgba(0, 0, 0, 0.6), 0 0 10px ${hoveredHotspot.severity === 3 ? 'rgba(255, 46, 99, 0.15)' : 'rgba(0, 242, 254, 0.08)'}`,
              transition: 'opacity 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', gap: '1rem' }}>
              <span style={{ 
                fontFamily: 'monospace', 
                fontSize: '0.6rem', 
                fontWeight: 'bold',
                color: hoveredHotspot.severity === 3 ? '#ff2e63' : hoveredHotspot.severity === 2 ? '#fbbf24' : '#00f2fe',
                textTransform: 'uppercase'
              }}>
                LEVEL {hoveredHotspot.severity} • {hoveredHotspot.locationName}
              </span>
              <span style={{ fontFamily: 'Outfit', fontSize: '0.55rem', opacity: 0.5 }}>
                {hoveredHotspot.article.source}
              </span>
            </div>
            <div style={{ 
              fontSize: '0.72rem', 
              color: '#ffffff', 
              lineHeight: '1.4', 
              fontWeight: '600',
              fontFamily: 'Outfit'
            }}>
              {hoveredHotspot.article.title}
            </div>
            <div style={{ fontSize: '0.55rem', color: '#64748b', marginTop: '0.4rem', fontFamily: 'monospace', textAlign: 'right' }}>
              CLICK DOT TO FILTER FEED
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
