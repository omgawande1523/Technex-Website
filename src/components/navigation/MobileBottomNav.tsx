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
      // Clamp between 330px and 410px, leaving 20px padding (10px on each side)
      const targetW = Math.min(410, Math.max(330, screenW - 20));
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
  const h = 64; // height of flat dock bar
  const rise = 22; // height of center arch hump above flat bar
  const r = 28; // corner radius of the dock
  const m = w / 2;
  const topY = rise;
  const bottomY = rise + h;

  // Single continuous seamless silhouette SVG path (no joins, no seams)
  const dockBodyPath = [
    `M ${r} ${topY}`,
    `L ${m - 48} ${topY}`,
    `C ${m - 34} ${topY}, ${m - 28} ${topY - 8}, ${m - 22} 8`,
    `C ${m - 14} 2, ${m - 8} 2, ${m} 2`,
    `C ${m + 8} 2, ${m + 14} 2, ${m + 22} 8`,
    `C ${m + 28} ${topY - 8}, ${m + 34} ${topY}, ${m + 48} ${topY}`,
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
    `L ${m - 48} ${topY}`,
    `C ${m - 34} ${topY}, ${m - 28} ${topY - 8}, ${m - 22} 8`,
    `C ${m - 14} 2, ${m - 8} 2, ${m} 2`,
    `C ${m + 8} 2, ${m + 14} 2, ${m + 22} 8`,
    `C ${m + 28} ${topY - 8}, ${m + 34} ${topY}, ${m + 48} ${topY}`,
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
        bottom: 'max(12px, env(safe-area-inset-bottom))',
        left: '50%',
        transform: 'translateX(-50%)',
        width: `${w}px`,
        height: `${bottomY}px`,
        zIndex: 50,
        pointerEvents: 'none',
      }}
    >
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
            'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.94)) drop-shadow(0 0 20px rgba(217, 173, 98, 0.12))',
        }}
      >
        <defs>
          <linearGradient id="dockBodyGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#17151d" stopOpacity="0.97" />
            <stop offset="100%" stopColor="#0c0a10" stopOpacity="0.99" />
          </linearGradient>
          <linearGradient id="dockRimGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.12)" />
            <stop offset="30%" stopColor="rgba(217, 173, 98, 0.3)" />
            <stop offset="50%" stopColor="rgba(255, 235, 175, 0.75)" />
            <stop offset="70%" stopColor="rgba(217, 173, 98, 0.3)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.12)" />
          </linearGradient>
        </defs>

        {/* Unified Body Fill with frosted glass effect */}
        <path d={dockBodyPath} fill="url(#dockBodyGradient)" />

        {/* Sculpted continuous top rim highlight */}
        <path
          d={dockRimPath}
          stroke="url(#dockRimGradient)"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Subtle bottom/side rim outline */}
        <path
          d={dockBottomPath}
          stroke="rgba(255, 255, 255, 0.06)"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {/* LEFT CLUSTER: 3 ITEMS (HOME, ABOUT, SPONSORS) - RIGID EQUAL 3-COLUMN GRID */}
      <div
        style={{
          position: 'absolute',
          left: '6px',
          width: 'calc(50% - 44px)',
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
                gap: '3px',
                padding: '4px 0 6px',
                position: 'relative',
                width: '100%',
                height: '100%',
                minWidth: 0,
                transition: 'transform 0.2s ease',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <Icon
                size={19}
                strokeWidth={1.8}
                style={{
                  color: isActive ? '#ffffff' : '#888594',
                  filter: isActive
                    ? 'drop-shadow(0 0 6px rgba(255, 235, 175, 0.75))'
                    : 'none',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: '9.5px',
                  fontWeight: isActive ? 600 : 500,
                  letterSpacing: '0.02em',
                  color: isActive ? '#ffffff' : '#888594',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}
              >
                {item.name}
              </span>

              {/* ACTIVE PILL INDICATOR & UPWARD GLOW (EXACT MATCH TO REFERENCE) */}
              {isActive && (
                <>
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '0px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '32px',
                      height: '18px',
                      background:
                        'radial-gradient(ellipse at bottom, rgba(217, 173, 98, 0.45) 0%, transparent 70%)',
                      pointerEvents: 'none',
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '3px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '20px',
                      height: '3.5px',
                      borderRadius: '9999px',
                      backgroundColor: '#d9ad62',
                      boxShadow:
                        '0 0 8px #d9ad62, 0 0 16px rgba(217, 173, 98, 0.8), 0 -1px 4px rgba(255, 230, 160, 0.9)',
                    }}
                  />
                </>
              )}
            </Link>
          );
        })}
      </div>

      {/* CENTER COLUMN: ELEVATED CIRCULAR DOCK BUTTON NESTLED IN THE HUMP */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '76px',
          top: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingBottom: '7px',
          pointerEvents: 'none',
        }}
      >
        {/* Elevated Circular Theme Button nestled seamlessly inside the hump */}
        <Link
          href="/"
          aria-label="TECHNEX 2026 Home"
          className="active:scale-95 hover:scale-105"
          style={{
            position: 'absolute',
            top: '3px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background:
              'radial-gradient(circle at 35% 30%, #ffe494 0%, #d4af37 55%, #7a5416 100%)',
            boxShadow:
              '0 0 20px rgba(217, 173, 98, 0.65), 0 8px 20px rgba(0, 0, 0, 0.85), inset 0 2px 4px rgba(255, 255, 255, 0.65)',
            border: '2px solid rgba(255, 240, 200, 0.95)',
            textDecoration: 'none',
            zIndex: 10,
            pointerEvents: 'auto',
            transition:
              'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {/* Inner dark disc framing the emblem */}
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #1a1722 0%, #08060a 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 0 6px rgba(0, 0, 0, 0.9)',
            }}
          >
            <img
              src="/logo_topnav.webp"
              alt="TNX Logo"
              style={{
                width: '76%',
                height: '76%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 6px rgba(217, 173, 98, 0.85))',
              }}
            />
          </div>
        </Link>

        {/* Micro-label below circle */}
        <span
          style={{
            fontFamily: "var(--font-barge), 'Barge', 'Outfit', sans-serif",
            fontSize: '9px',
            fontWeight: 800,
            letterSpacing: '0.08em',
            color: '#d9ad62',
            textTransform: 'uppercase',
            pointerEvents: 'auto',
          }}
        >
          TNX&apos;26
        </span>
      </div>

      {/* RIGHT CLUSTER: 3 ITEMS (GALLERY, TEAM, CONTACT) - RIGID EQUAL 3-COLUMN GRID */}
      <div
        style={{
          position: 'absolute',
          right: '6px',
          width: 'calc(50% - 44px)',
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
                gap: '3px',
                padding: '4px 0 6px',
                position: 'relative',
                width: '100%',
                height: '100%',
                minWidth: 0,
                transition: 'transform 0.2s ease',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <Icon
                size={19}
                strokeWidth={1.8}
                style={{
                  color: isActive ? '#ffffff' : '#888594',
                  filter: isActive
                    ? 'drop-shadow(0 0 6px rgba(255, 235, 175, 0.75))'
                    : 'none',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: '9.5px',
                  fontWeight: isActive ? 600 : 500,
                  letterSpacing: '0.02em',
                  color: isActive ? '#ffffff' : '#888594',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}
              >
                {item.name}
              </span>

              {/* ACTIVE PILL INDICATOR & UPWARD GLOW (EXACT MATCH TO REFERENCE) */}
              {isActive && (
                <>
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '0px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '32px',
                      height: '18px',
                      background:
                        'radial-gradient(ellipse at bottom, rgba(217, 173, 98, 0.45) 0%, transparent 70%)',
                      pointerEvents: 'none',
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '3px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '20px',
                      height: '3.5px',
                      borderRadius: '9999px',
                      backgroundColor: '#d9ad62',
                      boxShadow:
                        '0 0 8px #d9ad62, 0 0 16px rgba(217, 173, 98, 0.8), 0 -1px 4px rgba(255, 230, 160, 0.9)',
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