'use client';

import React from 'react';
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
  return (
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
    </aside>
  );
}
