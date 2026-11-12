'use client';

import React, { useState, useEffect } from 'react';
import { Maximize2, Minimize2, Move3d, Sparkles, X, Compass } from 'lucide-react';

export default function UIOverlay() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Synchronize hint appearance after cards trail entrance animation settles (~3.6s)
  useEffect(() => {
    const hintTimer = setTimeout(() => {
      setShowHint(true);
    }, 3600);

    // Auto-dismiss safely after 18 seconds of idle display
    const autoDismissTimer = setTimeout(() => {
      setIsDismissed(true);
    }, 21000);

    // Listen to user 3D interactions (OrbitControls drag, card carousel spin, card click)
    let interactionDismissTimer: NodeJS.Timeout | null = null;
    const handleUserInteraction = () => {
      if (!interactionDismissTimer) {
        interactionDismissTimer = setTimeout(() => {
          setIsDismissed(true);
        }, 3500);
      }
    };

    window.addEventListener('user-3d-interacted', handleUserInteraction);

    return () => {
      clearTimeout(hintTimer);
      clearTimeout(autoDismissTimer);
      if (interactionDismissTimer) clearTimeout(interactionDismissTimer);
      window.removeEventListener('user-3d-interacted', handleUserInteraction);
    };
  }, []);

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
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '20px',
        zIndex: 20,
      }}
    >
      {/* BOTTOM CENTER: INTERACTIVE 3D MULTIVERSE HINT POPUP */}
      <div
        className="ui-3d-controls-container"
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          maxWidth: '680px',
          padding: '0 16px',
          zIndex: 30,
        }}
      >
        {/* Expanded Interactive Guide Popup */}
        <div
          style={{
            pointerEvents: showHint && !isDismissed ? 'auto' : 'none',
            opacity: showHint && !isDismissed ? 1 : 0,
            transform: showHint && !isDismissed ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.96)',
            transition: 'all 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
            background: 'rgba(14, 11, 7, 0.88)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(217, 173, 98, 0.38)',
            boxShadow:
              '0 16px 48px rgba(0, 0, 0, 0.88), 0 0 28px rgba(217, 173, 98, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            width: '100%',
            maxWidth: '540px',
          }}
        >
          {/* Left Icon Badge with Pulse Glow */}
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(217, 173, 98, 0.22), rgba(184, 141, 68, 0.08))',
              border: '1px solid rgba(217, 173, 98, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 0 14px rgba(217, 173, 98, 0.28)',
            }}
          >
            <Move3d size={20} color="#d9ad62" />
          </div>

          {/* Central Instruction Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#d9ad62',
                fontSize: '11px',
                letterSpacing: '0.12em',
                fontWeight: 700,
                textTransform: 'uppercase',
                fontFamily: 'var(--font-sans)',
              }}
            >
              <Sparkles size={12} color="#d9ad62" />
              <span>Interactive 3D Multiverse</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '3px',
                color: '#f1f5f9',
                fontSize: '12.5px',
                fontWeight: 500,
                flexWrap: 'wrap',
                fontFamily: 'var(--font-sans)',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <b style={{ color: '#d9ad62', fontWeight: 600 }}>Drag</b> to rotate 360°
              </span>
              <span style={{ opacity: 0.35 }}>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <b style={{ color: '#d9ad62', fontWeight: 600 }}>Scroll</b> to zoom
              </span>
              <span style={{ opacity: 0.35 }}>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <b style={{ color: '#d9ad62', fontWeight: 600 }}>Click</b> cards for lore
              </span>
            </div>
          </div>

          {/* Dismiss Button */}
          <button
            onClick={() => setIsDismissed(true)}
            style={{
              background: 'rgba(217, 173, 98, 0.12)',
              border: '1px solid rgba(217, 173, 98, 0.35)',
              borderRadius: '8px',
              padding: '6px 12px',
              color: '#d9ad62',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.2s ease',
              fontFamily: 'var(--font-sans)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(217, 173, 98, 0.25)';
              e.currentTarget.style.borderColor = 'rgba(217, 173, 98, 0.7)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(217, 173, 98, 0.12)';
              e.currentTarget.style.borderColor = 'rgba(217, 173, 98, 0.35)';
            }}
            title="Dismiss instruction"
          >
            <span>Got it</span>
            <X size={13} />
          </button>
        </div>

        {/* Minimized Pill to Re-open Guide */}
        {showHint && isDismissed && (
          <button
            onClick={() => setIsDismissed(false)}
            style={{
              pointerEvents: 'auto',
              position: 'absolute',
              background: 'rgba(14, 11, 7, 0.82)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(217, 173, 98, 0.3)',
              borderRadius: '9999px',
              padding: '6px 14px',
              color: '#d9ad62',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.06em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6), 0 0 12px rgba(217, 173, 98, 0.1)',
              fontFamily: 'var(--font-sans)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(217, 173, 98, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(217, 173, 98, 0.6)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.8), 0 0 16px rgba(217, 173, 98, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(14, 11, 7, 0.82)';
              e.currentTarget.style.borderColor = 'rgba(217, 173, 98, 0.3)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.6), 0 0 12px rgba(217, 173, 98, 0.1)';
            }}
            title="Show 3D interaction tips"
          >
            <Compass size={13} color="#d9ad62" />
            <span>3D Controls</span>
          </button>
        )}
      </div>
    </div>
  );
}
