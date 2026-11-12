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
  const h = 64; // height of flat dock bar
  const rise = 18; // height of center arch hump above flat bar
  const r = 32; // corner radius of the dock
  const m = w / 2;
  const topY = rise;
  const bottomY = rise + h;

  // Single continuous seamless silhouette SVG path
  // Smooth organic bell curve matching the reference image
  const dockBodyPath = [
    `M ${r} ${topY}`,
    `L ${m - 46} ${topY}`,
    `C ${m - 32} ${topY}, ${m - 26} 7, ${m - 14} 3`,
    `C ${m - 7} 1, ${m + 7} 1, ${m + 14} 3`,
    `C ${m + 26} 7, ${m + 32} ${topY}, ${m + 46} ${topY}`,
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
    `L ${m - 46} ${topY}`,
    `C ${m - 32} ${topY}, ${m - 26} 7, ${m - 14} 3`,
    `C ${m - 7} 1, ${m + 7} 1, ${m + 14} 3`,
    `C ${m + 26} 7, ${m + 32} ${topY}, ${m + 46} ${topY}`,
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
            'drop-shadow(0 20px 42px rgba(0, 0, 0, 0.90)) drop-shadow(0 4px 12px rgba(0, 0, 0, 0.50))',
        }}
      >
        <defs>
          <linearGradient id="dockBodyGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#18181d" stopOpacity="0.96" />
            <stop offset="100%" stopColor="#0e0e12" stopOpacity="0.98" />
          </linearGradient>
          <linearGradient id="dockRimGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.08)" />
            <stop offset="35%" stopColor="rgba(255, 255, 255, 0.12)" />
            <stop offset="50%" stopColor="rgba(229, 184, 105, 0.40)" />
            <stop offset="65%" stopColor="rgba(255, 255, 255, 0.12)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.08)" />
          </linearGradient>
        </defs>

        {/* Unified Matte Dark Charcoal Body */}
        <path d={dockBodyPath} fill="url(#dockBodyGradient)" />

        {/* Subtle, refined continuous top rim highlight */}
        <path
          d={dockRimPath}
          stroke="url(#dockRimGradient)"
          strokeWidth="1.1"
          strokeLinecap="round"
          fill="none"
        />

        {/* Subtle bottom/side rim outline */}
        <path
          d={dockBottomPath}
          stroke="rgba(255, 255, 255, 0.04)"
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
          width: 'calc(50% - 38px)',
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
                padding: '6px 0 8px',
                position: 'relative',
                width: '100%',
                height: '100%',
                minWidth: 0,
                transition: 'transform 0.15s ease',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <Icon
                size={19}
                strokeWidth={isActive ? 2.0 : 1.65}
                style={{
                  color: isActive ? '#ffffff' : '#7e808c',
                  filter: isActive
                    ? 'drop-shadow(0 0 6px rgba(255, 235, 175, 0.6))'
                    : 'none',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: '9.5px',
                  fontWeight: isActive ? 600 : 500,
                  letterSpacing: '0.01em',
                  color: isActive ? '#ffffff' : '#7e808c',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}
              >
                {item.name}
              </span>

              {/* ACTIVE PILL INDICATOR & UPWARD GLOW (MATCHING REFERENCE EXACTLY) */}
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
                        'radial-gradient(ellipse at bottom, rgba(217, 173, 98, 0.40) 0%, transparent 70%)',
                      pointerEvents: 'none',
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '3px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '22px',
                      height: '3.5px',
                      borderRadius: '9999px',
                      backgroundColor: '#d9ad62',
                      boxShadow:
                        '0 0 8px #d9ad62, 0 0 16px rgba(217, 173, 98, 0.75), 0 -1px 3px rgba(255, 230, 160, 0.8)',
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
          paddingBottom: '8px',
          pointerEvents: 'none',
        }}
      >
        {/* Sleek Elevated Action Button matching the blue circle in reference */}
        <Link
          href="/"
          aria-label="TECHNEX 2026 Home"
          className="active:scale-95 hover:scale-105"
          style={{
            position: 'absolute',
            top: '-5px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background:
              'radial-gradient(circle at 35% 30%, #262432 0%, #131218 70%, #09080c 100%)',
            border: '1.5px solid rgba(229, 184, 105, 0.75)',
            boxShadow:
              '0 8px 22px rgba(0, 0, 0, 0.8), 0 0 16px rgba(217, 173, 98, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.25)',
            textDecoration: 'none',
            zIndex: 10,
            pointerEvents: 'auto',
            transition:
              'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <img
            src="/logo_topnav.webp"
            alt="TNX Logo"
            style={{
              width: '68%',
              height: '68%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 8px rgba(217, 173, 98, 0.75))',
            }}
          />
        </Link>

        {/* Micro-label below circle, aligned with other nav labels */}
        <span
          style={{
            fontSize: '9.5px',
            fontWeight: pathname === '/' ? 600 : 500,
            letterSpacing: '0.02em',
            color: pathname === '/' ? '#d9ad62' : '#7e808c',
            pointerEvents: 'auto',
            transition: 'color 0.2s ease',
          }}
        >
          TNX
        </span>
      </div>

      {/* RIGHT CLUSTER: 3 ITEMS (GALLERY, TEAM, CONTACT) */}
      <div
        style={{
          position: 'absolute',
          right: '8px',
          width: 'calc(50% - 38px)',
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
                padding: '6px 0 8px',
                position: 'relative',
                width: '100%',
                height: '100%',
                minWidth: 0,
                transition: 'transform 0.15s ease',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <Icon
                size={19}
                strokeWidth={isActive ? 2.0 : 1.65}
                style={{
                  color: isActive ? '#ffffff' : '#7e808c',
                  filter: isActive
                    ? 'drop-shadow(0 0 6px rgba(255, 235, 175, 0.6))'
                    : 'none',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: '9.5px',
                  fontWeight: isActive ? 600 : 500,
                  letterSpacing: '0.01em',
                  color: isActive ? '#ffffff' : '#7e808c',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}
              >
                {item.name}
              </span>

              {/* ACTIVE PILL INDICATOR & UPWARD GLOW (MATCHING REFERENCE EXACTLY) */}
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
                        'radial-gradient(ellipse at bottom, rgba(217, 173, 98, 0.40) 0%, transparent 70%)',
                      pointerEvents: 'none',
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '3px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '22px',
                      height: '3.5px',
                      borderRadius: '9999px',
                      backgroundColor: '#d9ad62',
                      boxShadow:
                        '0 0 8px #d9ad62, 0 0 16px rgba(217, 173, 98, 0.75), 0 -1px 3px rgba(255, 230, 160, 0.8)',
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
