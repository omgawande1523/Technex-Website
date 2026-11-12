'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Home09Icon,
  InformationCircleIcon,
  Award02Icon,
  Image01Icon,
  UserGroupIcon,
  Mail01Icon,
} from 'hugeicons-react';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const LEFT_NAV_ITEMS: SidebarItem[] = [
  { name: 'Home', href: '/', icon: Home09Icon },
  { name: 'About Us', href: '/about', icon: InformationCircleIcon },
  { name: 'Sponsors', href: '/sponsors', icon: Award02Icon },
  { name: 'Gallery', href: '/gallery', icon: Image01Icon },
  { name: 'Team', href: '/team', icon: UserGroupIcon },
  { name: 'Contact', href: '/contact', icon: Mail01Icon },
];

export default function LeftSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setMobileOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <> 
      <style>{`
        @media (max-width: 767px) {
          .site-left-sidebar {
            left: 8px !important;
            top: 96px !important;
            transform: none !important;
            padding: 5px !important;
            border-radius: 15px !important;
            gap: 5px !important;
            background: rgba(12, 10, 16, .88) !important;
            box-shadow: 0 6px 18px rgba(0,0,0,.38) !important;
            backdrop-filter: blur(10px) !important;
            -webkit-backdrop-filter: blur(10px) !important;
            max-height: calc(100dvh - 190px);
            overflow-y: auto;
            scrollbar-width: none;
          }
          .site-left-sidebar::-webkit-scrollbar { display: none; }
          .site-left-sidebar .sidebar-icon-btn {
            width: 35px !important;
            height: 35px !important;
            border-radius: 10px !important;
          }
          .site-left-sidebar .sidebar-tooltip,
          .site-left-sidebar .sidebar-tooltip-left { display: none !important; }
          .site-left-sidebar .sidebar-nav-items[data-open='false'] { display: none !important; }
          .site-left-sidebar .sidebar-nav-items { display: flex; flex-direction: column; gap: 6px; }
          .site-left-sidebar .mobile-sidebar-toggle { display: flex !important; }
        }
        @media (min-width: 768px) {
          .site-left-sidebar .mobile-sidebar-toggle { display: none !important; }
          .site-left-sidebar .sidebar-nav-items { display: contents !important; }
        }
      `}</style>
    <aside
      className="site-left-sidebar"
      style={{
        position: 'fixed',
        left: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '12px 8px',
        borderRadius: '24px',
        background: 'rgba(12, 10, 16, 0.72)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(217, 173, 98, 0.28)',
        boxShadow:
          '0 16px 40px rgba(0, 0, 0, 0.8), 0 0 24px rgba(217, 173, 98, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
        gap: '12px',
        pointerEvents: 'auto',
      }}
    >
      <button
        type="button"
        className="mobile-sidebar-toggle"
        aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((v) => !v)}
        style={{ display: 'none', width: 35, height: 35, alignItems: 'center', justifyContent: 'center', borderRadius: 10, background: 'rgba(217,173,98,.14)', border: '1px solid rgba(217,173,98,.38)', color: '#f1cf89', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}
      >
        {mobileOpen ? '×' : '☰'}
      </button>
      <div className="sidebar-nav-items" data-open={mobileOpen}>
      {LEFT_NAV_ITEMS.map((item) => {
        const IconComponent = item.icon;
        return (
          <div key={item.name} style={{ position: 'relative' }} className="group">
            <Link
              href={item.href}
              aria-label={item.name}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(217, 173, 98, 0.18)',
                color: '#cbd5e1',
                textDecoration: 'none',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                cursor: 'pointer',
              }}
              className="sidebar-icon-btn"
            >
              <IconComponent size={20} />
            </Link>

            {/* Floating Tooltip to the right in Champagne Gold */}
            <div
              style={{
                position: 'absolute',
                left: 'calc(100% + 14px)',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(14, 11, 8, 0.94)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(217, 173, 98, 0.45)',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.85), 0 0 14px rgba(217, 173, 98, 0.25)',
                borderRadius: '8px',
                padding: '6px 12px',
                color: '#d9ad62',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                opacity: 0,
                visibility: 'hidden',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                zIndex: 60,
              }}
              className="sidebar-tooltip"
            >
              {item.name}
            </div>
          </div>
        );
      })}
      </div>
    </aside>
    </>
  );
}
