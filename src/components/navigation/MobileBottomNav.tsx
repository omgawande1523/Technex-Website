'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Info, Award, Image as ImageIcon, Users, Mail, type LucideIcon } from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

const LEFT_ITEMS: NavItem[] = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'About', href: '/about', icon: Info },
  { name: 'Sponsors', href: '/sponsors', icon: Award },
];

const RIGHT_ITEMS: NavItem[] = [
  { name: 'Gallery', href: '/gallery', icon: ImageIcon },
  { name: 'Team', href: '/team', icon: Users },
  { name: 'Contact', href: '/contact', icon: Mail },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  // Default to 370px for standard 390px mobile screens during SSR
  const [dockWidth, setDockWidth] = useState<number>(370);

  // Synchronize exact pixel width with viewport
  useEffect(() => {
    const update = () => {
      const screenW = window.innerWidth;
      // Fit comfortably with 16px margins on each side
      const targetW = Math.min(410, Math.max(320, screenW - 24));
      setDockWidth(Math.round(targetW));
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Hide on admin routes
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return null;
  }

  // Exact geometry parameters for the continuous sculpted dock
  const w = dockWidth;
  const h = 50; // height of flat dock bar (reduced from 64)
  const rise = 14; // height of center arch hump above flat bar (reduced from 18)
  const r = 25; // corner radius of the dock
  const m = w / 2;
  const topY = rise;
  const bottomY = rise + h;

  // Single continuous seamless silhouette SVG path
  // Smooth organic bell curve matching the reference image
  const dockBodyPath = [
    `M ${r} ${topY}`,
    `L ${m - 38} ${topY}`,
    `C ${m - 24} ${topY}, ${m - 18} 5, ${m - 10} 2`,
    `C ${m - 5} 0.5, ${m + 5} 0.5, ${m + 10} 2`,
    `C ${m + 18} 5, ${m + 24} ${topY}, ${m + 38} ${topY}`,
    `L ${w - r} ${topY}`,
    `A ${r} ${r} 0 0 1 ${w} ${topY + r}`,
    `L ${w} ${bottomY - r}`,
    `A ${r} ${r} 0 0 1 ${w - r} ${bottomY}`,
    `L ${r} ${bottomY}`,
    `A ${r} ${r} 0 0 1 0 ${bottomY - r}`,
    `L 0 ${topY + r}`,
    `A ${r} ${r} 0 0 1 ${r} ${topY}`,
    `Z`,
  ].join(' ');

  // Top illuminated rim stroke
  const dockRimPath = [
    `M 0 ${topY + r}`,
    `A ${r} ${r} 0 0 1 ${r} ${topY}`,
    `L ${m - 38} ${topY}`,
    `C ${m - 24} ${topY}, ${m - 18} 5, ${m - 10} 2`,
    `C ${m - 5} 0.5, ${m + 5} 0.5, ${m + 10} 2`,
    `C ${m + 18} 5, ${m + 24} ${topY}, ${m + 38} ${topY}`,
    `L ${w - r} ${topY}`,
    `A ${r} ${r} 0 0 1 ${w} ${topY + r}`,
  ].join(' ');

  // Subtle bottom/side rim outline
  const dockBottomPath = [
    `M ${w} ${topY + r}`,
    `L ${w} ${bottomY - r}`,
    `A ${r} ${r} 0 0 1 ${w - r} ${bottomY}`,
    `L ${r} ${bottomY}`,
    `A ${r} ${r} 0 0 1 0 ${bottomY - r}`,
    `L 0 ${topY + r}`,
  ].join(' ');

  return (
    <nav
      className="mobile-bottom-nav"
      aria-label="Mobile Bottom Navigation"
      style={{
        position: 'fixed',
        bottom: 'max(14px, env(safe-area-inset-bottom))',
        left: '50%',
        transform: 'translateX(-50%)',
        width: `${w}px`,
        height: `${bottomY}px`,
        zIndex: 50,
        pointerEvents: 'none',
      }}
    >
      {/* Frosted Glassmorphism Backdrop Blur Silhouette */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${w}px`,
          height: `${bottomY}px`,
          clipPath: `path('${dockBodyPath}')`,
          WebkitClipPath: `path('${dockBodyPath}')`,
          backdropFilter: 'blur(28px) saturate(210%) brightness(108%)',
          WebkitBackdropFilter: 'blur(28px) saturate(210%) brightness(108%)',
          pointerEvents: 'none',
        }}
      />

      {/* 1:1 EXACT PIXEL-MATCHED SEAMLESS SCULPTED DOCK SVG */}
      <svg
        width={w}
        height={bottomY}
        viewBox={`0 0 ${w} ${bottomY}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${w}px`,
          height: `${bottomY}px`,
          pointerEvents: 'none',
          filter:
            'drop-shadow(0 16px 36px rgba(0, 0, 0, 0.82)) drop-shadow(0 0 22px rgba(217, 173, 98, 0.16)) drop-shadow(0 4px 10px rgba(0, 0, 0, 0.50))',
        }}
      >
        <defs>
          {/* Translucent Cosmic Obsidian Glass Fill */}
          <linearGradient id="dockBodyGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a1426" stopOpacity="0.65" />
            <stop offset="42%" stopColor="#100c1c" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#08060f" stopOpacity="0.86" />
          </linearGradient>

          {/* Luminous Luxury Champagne Gold Specular Rim Highlight */}
          <linearGradient id="dockRimGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(217, 173, 98, 0.20)" />
            <stop offset="28%" stopColor="rgba(245, 229, 201, 0.45)" />
            <stop offset="44%" stopColor="rgba(217, 173, 98, 0.85)" />
            <stop offset="50%" stopColor="rgba(255, 245, 225, 0.98)" />
            <stop offset="56%" stopColor="rgba(217, 173, 98, 0.85)" />
            <stop offset="72%" stopColor="rgba(245, 229, 201, 0.45)" />
            <stop offset="100%" stopColor="rgba(217, 173, 98, 0.20)" />
          </linearGradient>
        </defs>

        {/* Translucent Frosted Glass Tint Body */}
        <path d={dockBodyPath} fill="url(#dockBodyGradient)" />

        {/* Continuous Champagne Gold Rim Highlight */}
        <path
          d={dockRimPath}
          stroke="url(#dockRimGradient)"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Champagne Glass Under-Rim Contour */}
        <path
          d={dockBottomPath}
          stroke="rgba(217, 173, 98, 0.16)"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {/* LEFT CLUSTER: 3 ITEMS (HOME, ABOUT, SPONSORS) */}
      <div
        style={{
          position: 'absolute',
          left: '8px',
          width: 'calc(50% - 34px)',
          top: `${rise}px`,
          height: `${h}px`,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          alignItems: 'center',
          pointerEvents: 'auto',
        }}
      >
        {LEFT_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                gap: '2px',
                padding: '3px 0 5px',
                position: 'relative',
                width: '100%',
                height: '100%',
                minWidth: 0,
                transition: 'transform 0.15s ease',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <Icon
                size={18}
                strokeWidth={isActive ? 2.1 : 1.7}
                style={{
                  color: isActive ? '#ffffff' : 'rgba(243, 239, 230, 0.60)',
                  filter: isActive
                    ? 'drop-shadow(0 0 8px rgba(217, 173, 98, 0.85)) drop-shadow(0 0 2px rgba(255, 255, 255, 0.9))'
                    : 'none',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-redaction), "Redaction 20", system-ui, sans-serif',
                  fontSize: '9.5px',
                  fontWeight: isActive ? 600 : 500,
                  letterSpacing: '0.02em',
                  color: isActive ? '#f5e5c9' : 'rgba(243, 239, 230, 0.60)',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                  textShadow: isActive
                    ? '0 0 10px rgba(217, 173, 98, 0.55)'
                    : 'none',
                }}
              >
                {item.name}
              </span>

              {/* ACTIVE PILL INDICATOR & UPWARD GLOW */}
              {isActive && (
                <>
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '0px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '28px',
                      height: '14px',
                      background:
                        'radial-gradient(ellipse at bottom, rgba(217, 173, 98, 0.42) 0%, transparent 72%)',
                      pointerEvents: 'none',
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '2px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '18px',
                      height: '2.5px',
                      borderRadius: '9999px',
                      backgroundColor: '#d9ad62',
                      boxShadow:
                        '0 0 8px #d9ad62, 0 0 16px rgba(217, 173, 98, 0.85), 0 -1px 3px rgba(255, 235, 175, 0.9)',
                    }}
                  />
                </>
              )}
            </Link>
          );
        })}
      </div>

      {/* CENTER COLUMN: ELEVATED CIRCULAR ACTION BUTTON NESTLED IN THE HUMP */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '68px',
          top: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingBottom: '3px',
          pointerEvents: 'none',
        }}
      >
        {/* Slightly reduced Floating Chatbot Avatar - No golden border, glowing cosmic presence */}
        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('open-chatbot'));
            }
          }}
          aria-label="Open AI Chatbot"
          className="active:scale-90 hover:scale-105"
          style={{
            position: 'absolute',
            top: '-13px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#000000',
            border: 'none',
            boxShadow:
              '0 6px 20px rgba(0, 0, 0, 0.88), 0 0 16px rgba(56, 189, 248, 0.55), 0 0 24px rgba(239, 68, 68, 0.35)',
            textDecoration: 'none',
            zIndex: 10,
            pointerEvents: 'auto',
            transition:
              'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease',
            WebkitTapHighlightColor: 'transparent',
            padding: 0,
            cursor: 'pointer',
            overflow: 'hidden',
          }}
        >
          <img
            src="/assets/chatbot-icon.webp"
            alt="Chatbot AI"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '50%',
              display: 'block',
            }}
          />
        </button>

        {/* Micro-label below circle, aligned with other nav labels */}
        <span
          style={{
            fontFamily: 'var(--font-redaction), "Redaction 20", system-ui, sans-serif',
            fontSize: '9px',
            fontWeight: 600,
            letterSpacing: '0.04em',
            color: '#d9ad62',
            pointerEvents: 'auto',
            transition: 'color 0.2s ease',
            textShadow: '0 0 10px rgba(217, 173, 98, 0.45)',
          }}
        >
          Chat
        </span>
      </div>

      {/* RIGHT CLUSTER: 3 ITEMS (GALLERY, TEAM, CONTACT) */}
      <div
        style={{
          position: 'absolute',
          right: '8px',
          width: 'calc(50% - 34px)',
          top: `${rise}px`,
          height: `${h}px`,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          alignItems: 'center',
          pointerEvents: 'auto',
        }}
      >
        {RIGHT_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                gap: '2px',
                padding: '3px 0 5px',
                position: 'relative',
                width: '100%',
                height: '100%',
                minWidth: 0,
                transition: 'transform 0.15s ease',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <Icon
                size={18}
                strokeWidth={isActive ? 2.1 : 1.7}
                style={{
                  color: isActive ? '#ffffff' : 'rgba(243, 239, 230, 0.60)',
                  filter: isActive
                    ? 'drop-shadow(0 0 8px rgba(217, 173, 98, 0.85)) drop-shadow(0 0 2px rgba(255, 255, 255, 0.9))'
                    : 'none',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-redaction), "Redaction 20", system-ui, sans-serif',
                  fontSize: '9.5px',
                  fontWeight: isActive ? 600 : 500,
                  letterSpacing: '0.02em',
                  color: isActive ? '#f5e5c9' : 'rgba(243, 239, 230, 0.60)',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                  textShadow: isActive
                    ? '0 0 10px rgba(217, 173, 98, 0.55)'
                    : 'none',
                }}
              >
                {item.name}
              </span>

              {/* ACTIVE PILL INDICATOR & UPWARD GLOW */}
              {isActive && (
                <>
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '0px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '28px',
                      height: '14px',
                      background:
                        'radial-gradient(ellipse at bottom, rgba(217, 173, 98, 0.42) 0%, transparent 72%)',
                      pointerEvents: 'none',
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '2px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '18px',
                      height: '2.5px',
                      borderRadius: '9999px',
                      backgroundColor: '#d9ad62',
                      boxShadow:
                        '0 0 8px #d9ad62, 0 0 16px rgba(217, 173, 98, 0.85), 0 -1px 3px rgba(255, 235, 175, 0.9)',
                    }}
                  />
                </>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
