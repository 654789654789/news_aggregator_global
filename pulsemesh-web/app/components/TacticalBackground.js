"use client";

import React from "react";

// Geopolitical Intelligence Hotspots (Bloomberg/Satellite Monitoring UI style)
const SIGNAL_NODES = [
  { name: "NODE_WDC_01", lat: "38.90°N", lon: "77.03°W", top: "28%", left: "14%", status: "SECURE" },
  { name: "NODE_LDN_02", lat: "51.50°N", lon: "0.12°W", top: "20%", left: "44%", status: "SYNCED" },
  { name: "NODE_MOW_03", lat: "55.75°N", lon: "37.61°E", top: "18%", left: "62%", status: "STABLE" },
  { name: "NODE_TKY_04", lat: "35.67°N", lon: "139.65°E", top: "25%", left: "80%", status: "ACTIVE" },
  { name: "NODE_SYD_05", lat: "33.86°S", lon: "151.20°E", top: "75%", left: "85%", status: "STANDBY" }
];

export default function TacticalBackground({ theme }) {
  const isDark = theme === "dark";

  // Bloomberg Terminal Style Configs
  const colors = {
    background: isDark
      ? "radial-gradient(circle at 50% 30%, rgba(255, 78, 80, 0.05) 0%, rgba(5, 5, 8, 1) 75%)"
      : "radial-gradient(circle at 50% 30%, rgba(30, 41, 59, 0.02) 0%, rgba(248, 250, 252, 1) 75%)",
    gridLine: isDark
      ? "linear-gradient(rgba(255, 78, 80, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 78, 80, 0.05) 1px, transparent 1px)"
      : "linear-gradient(rgba(30, 41, 59, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(30, 41, 59, 0.04) 1px, transparent 1px)",
    nodeColor: isDark ? "#ff4e50" : "#ef4444",
    nodeGlow: isDark ? "rgba(255, 78, 80, 0.4)" : "rgba(239, 68, 68, 0.3)",
    statusOnline: isDark ? "#00ff88" : "#10b981",
    textLabel: isDark ? "rgba(148, 163, 184, 0.5)" : "rgba(71, 85, 105, 0.6)"
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 1, // Above background color, below cards/content
        pointerEvents: "none",
        transition: "background 0.5s ease",
        background: colors.background,
      }}
    >
      {/* 1. Subtle, Ultra-Sharp Grid Pattern */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: colors.gridLine,
          backgroundSize: "80px 80px",
        }}
      />

      {/* 2. Tactical "+" crosshairs at intersections */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: isDark
            ? "radial-gradient(rgba(255, 78, 80, 0.15) 1px, transparent 1px)"
            : "radial-gradient(rgba(30, 41, 59, 0.12) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          backgroundPosition: "-40px -40px",
        }}
      />

      {/* 3. Static Geopolitical Signal Glow Hotspots */}
      {SIGNAL_NODES.map((node, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            top: node.top,
            left: node.left,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            transform: "translate(-50%, -50%)",
          }}
        >
          {/* Signal Indicator Core */}
          <div style={{ position: "relative", width: "8px", height: "8px" }}>
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: colors.nodeColor,
                boxShadow: `0 0 8px ${colors.nodeColor}`,
              }}
            />
            {/* Soft Breathing Satellite Waves */}
            <div className="signal-ring" />
            <div className="signal-ring ring-delayed" />
          </div>


        </div>
      ))}

      {/* Embedded 60fps CSS animations for satellite breathing signals */}
      <style jsx global>{`
        @keyframes signal-breath {
          0% {
            transform: scale(0.5);
            opacity: 0.8;
          }
          100% {
            transform: scale(3.5);
            opacity: 0;
          }
        }
        .signal-ring {
          position: absolute;
          top: -4px;
          left: -4px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 1px solid ${colors.nodeGlow};
          animation: signal-breath 4s cubic-bezier(0.16, 1, 0.3, 1) infinite;
          pointer-events: none;
        }
        .signal-ring.ring-delayed {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
