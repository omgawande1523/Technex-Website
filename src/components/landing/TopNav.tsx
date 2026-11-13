'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Maximize2, Minimize2 } from 'lucide-react';

export default function TopNav() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  return (
    <header
      className="site-top-nav"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '76px',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        background:
          'linear-gradient(180deg, rgba(8, 6, 12, 0.90) 0%, rgba(8, 6, 12, 0.50) 75%, transparent 100%)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(217, 173, 98, 0.18)',
        pointerEvents: 'auto',
      }}
    >
      {/* LEFT SECTION: BRAND LOGO ONLY ON MOBILE (+ TITLE ON DESKTOP) */}
      <div style={{ display: 'flex', alignItems: 'center', zIndex: 10 }}>
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none',
            outline: 'none',
          }}
          className="group"
          aria-label="TECHNEX 26-27 Home"
        >
          {/* Circular TNX Badge Icon */}
          <div
            style={{
              position: 'relative',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            className="group-hover:scale-105"
          >
            <img
              src="/logo_topnav.webp"
              alt="TNX Logo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 10px rgba(217, 173, 98, 0.35))',
              }}
            />
          </div>

          {/* TECHNEX 26-27 Text in Barge font - hidden on mobile, visible on desktop */}
          <span
            style={{
              fontFamily: "var(--font-barge), 'Barge', 'Outfit', sans-serif",
              fontSize: '20px',
              fontWeight: 900,
              letterSpacing: '0.04em',
              color: '#ffffff',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.8), 0 0 20px rgba(217, 173, 98, 0.25)',
              transition: 'color 0.3s ease, text-shadow 0.3s ease',
            }}
            className="group-hover:text-[#d9ad62] hidden md:inline"
          >
            TECHNEX 26-27
          </span>
        </Link>
      </div>

      {/* CENTER SECTION: WORKSHOPS & EVENTS (centered in both mobile & desktop) */}
      <nav
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          whiteSpace: 'nowrap',
          zIndex: 10,
        }}
        className="site-main-navigation"
        aria-label="Main Navigation"
      >
        <Link
          href="/workshops"
          style={{
            fontFamily: "var(--font-barge), 'Barge', 'Outfit', sans-serif",
            fontWeight: 800,
            letterSpacing: '0.08em',
            color: '#f8fafc',
            textDecoration: 'none',
            textTransform: 'uppercase',
            padding: '7px 14px',
            borderRadius: '8px',
            transition: 'all 0.25s ease',
            border: '1px solid transparent',
          }}
          className="nav-link-btn"
        >
          WORKSHOPS
        </Link>

        <Link
          href="/events"
          style={{
            fontFamily: "var(--font-barge), 'Barge', 'Outfit', sans-serif",
            fontWeight: 800,
            letterSpacing: '0.08em',
            color: '#f8fafc',
            textDecoration: 'none',
            textTransform: 'uppercase',
            padding: '7px 14px',
            borderRadius: '8px',
            transition: 'all 0.25s ease',
            border: '1px solid transparent',
          }}
          className="nav-link-btn"
        >
          EVENTS
        </Link>


      </nav>

      {/* RIGHT SECTION: FULLSCREEN ONLY */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', zIndex: 10 }}>
        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="gold-btn"
          style={{
            padding: '8px',
            borderRadius: '10px',
            background: 'rgba(14, 11, 18, 0.75)',
            border: '1px solid rgba(217, 173, 98, 0.35)',
            color: '#d9ad62',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>
    </header>
  );
}
