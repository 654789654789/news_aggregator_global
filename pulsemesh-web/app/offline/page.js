"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

export default function OfflinePage() {
  const [pulses, setPulses] = useState([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("pm-hs") || 0;
    setHighScore(parseInt(saved));
  }, []);

  const spawnPulse = useCallback(() => {
    const id = Date.now();
    const x = Math.random() * 70 + 15;
    const y = Math.random() * 50 + 25;
    const size = 60;
    
    setPulses(prev => [...prev, { id, x, y, size }]);

    setTimeout(() => {
      setPulses(prev => prev.filter(p => p.id !== id));
    }, 1500);
  }, []);

  useEffect(() => {
    if (!gameStarted) return;
    const interval = setInterval(spawnPulse, 900);
    return () => clearInterval(interval);
  }, [gameStarted, spawnPulse]);

  const handlePulseClick = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setPulses(prev => prev.filter(p => p.id !== id));
    setScore(s => {
      const newScore = s + 1;
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem("pm-hs", newScore.toString());
      }
      return newScore;
    });
  };

  const startGame = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setGameStarted(true);
    setScore(0);
  };

  return (
    <div className="mesh-bg" style={{ 
      position: 'fixed', 
      inset: 0, 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#050508',
      zIndex: 10000,
      color: 'white',
      textAlign: 'center',
      padding: '20px'
    }}>
      <div style={{ position: 'relative', zIndex: 10001, width: '100%', maxWidth: '600px' }}>
        <h1 style={{ 
          fontFamily: 'Outfit, sans-serif', 
          fontSize: '3.5rem', 
          marginBottom: '10px',
          background: 'linear-gradient(135deg, #00f2fe, #f093fb)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Offline
        </h1>
        <p style={{ color: '#9090a0', marginBottom: '40px' }}>Mesh sync lost. Restore the pulse.</p>

        {!gameStarted ? (
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '40px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '1.2rem', color: '#00f2fe', marginBottom: '20px' }}>High Score: {highScore}</div>
            <button 
              onClick={startGame}
              style={{ 
                padding: '15px 40px', 
                fontSize: '1.2rem', 
                fontWeight: '800',
                backgroundColor: '#00f2fe',
                color: '#050508',
                border: 'none',
                borderRadius: '50px',
                cursor: 'pointer',
                boxShadow: '0 10px 20px rgba(0, 242, 254, 0.3)'
              }}
            >
              Start Sync
            </button>
          </div>
        ) : (
          <div style={{ height: '50vh', position: 'relative', width: '100%' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#00f2fe', marginBottom: '20px' }}>{score}</div>
            {pulses.map(p => (
              <div
                key={p.id}
                onMouseDown={(e) => handlePulseClick(e, p.id)}
                onTouchStart={(e) => handlePulseClick(e, p.id)}
                style={{
                  position: 'absolute',
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  backgroundColor: '#00f2fe',
                  borderRadius: '50%',
                  boxShadow: '0 0 20px #00f2fe',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'pulseScale 1.5s linear'
                }}
              >
                 <div style={{ width: '40%', height: '40%', borderRadius: '50%', backgroundColor: '#f093fb' }}></div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '50px' }}>
          <Link href="/" style={{ color: '#00f2fe', textDecoration: 'none', fontWeight: '600' }}>
            &larr; Try Reconnecting
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulseScale {
          0% { transform: scale(0); opacity: 0; }
          20% { transform: scale(1.2); opacity: 1; }
          80% { transform: scale(1); opacity: 1; }
          100% { transform: scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
