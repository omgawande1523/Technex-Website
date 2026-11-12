'use client';

import React, { useEffect, useState } from 'react';
import {
  InstagramIcon,
  YoutubeIcon,
  Linkedin01Icon,
  Facebook01Icon,
  Globe02Icon,
} from 'hugeicons-react';

interface SocialItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accentColor: string;
}

const RIGHT_SOCIAL_ITEMS: SocialItem[] = [
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/technex_svpcet_nagpur/?hl=en',
    icon: InstagramIcon,
    accentColor: '#e1306c',
  },
  {
    name: 'YouTube',
    href: 'https://youtu.be/bCcJIvfuiRc?si=bYSNiLfIxK33WN9e',
    icon: YoutubeIcon,
    accentColor: '#ff0000',
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/school/svpcet/posts/?feedView=all',
    icon: Linkedin01Icon,
    accentColor: '#0a66c2',
  },
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/technexsvpcetnagpur/',
    icon: Facebook01Icon,
    accentColor: '#1877f2',
  },
  {
    name: 'College SVPCET',
    href: 'https://www.stvincentngp.edu.in/',
    icon: Globe02Icon,
    accentColor: '#d9ad62',
  },
];

export default function RightSidebar() {
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
          .site-right-sidebar {
            right: 8px !important;
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
          .site-right-sidebar::-webkit-scrollbar { display: none; }
          .site-right-sidebar .sidebar-icon-btn {
            width: 35px !important;
            height: 35px !important;
            border-radius: 10px !important;
          }
          .site-right-sidebar .sidebar-tooltip,
          .site-right-sidebar .sidebar-tooltip-left { display: none !important; }
          .site-right-sidebar .sidebar-nav-items[data-open='false'] { display: none !important; }
          .site-right-sidebar .sidebar-nav-items { display: flex; flex-direction: column; gap: 6px; }
          .site-right-sidebar .mobile-sidebar-toggle { display: flex !important; }
        }
        @media (min-width: 768px) {
          .site-right-sidebar .mobile-sidebar-toggle { display: none !important; }
          .site-right-sidebar .sidebar-nav-items { display: contents !important; }
        }
      `}</style>
    <aside
      className="site-right-sidebar"
      style={{
        position: 'fixed',
        right: '20px',
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
      {RIGHT_SOCIAL_ITEMS.map((item) => {
        const IconComponent = item.icon;
        return (
          <div key={item.name} style={{ position: 'relative' }} className="group">
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
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
            </a>

            {/* Floating Tooltip to the left in Champagne Gold */}
            <div
              style={{
                position: 'absolute',
                right: 'calc(100% + 14px)',
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
              className="sidebar-tooltip-left"
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
