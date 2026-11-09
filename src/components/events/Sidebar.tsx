'use client';

import { useState } from 'react';
import Link from 'next/link';
import { navLinks, siteConfig } from '@/constants/events';

/** Left-side navbar. Collapsed to icons; expands on hover. On phones it is a slide-in menu. */
export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="ev-burger"
        aria-label="Toggle menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <i />
        <i />
        <i />
      </button>

      <aside className="ev-side" data-open={open}>
        <Link className="ev-side-brand" href="/">
          <span className="ev-side-logo">T</span>
          <span className="ev-side-word">
            <b>{siteConfig.brand}</b>
            <em>{siteConfig.section}</em>
          </span>
        </Link>

        <nav aria-label="Main">
          <ul>
            {navLinks.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className={l.active ? 'is-active' : undefined}
                  aria-current={l.active ? 'page' : undefined}
                  onClick={() => setOpen(false)}
                >
                  <span className="ev-side-dot" />
                  <span className="ev-side-label">{l.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ev-side-foot">
          <a className="ev-side-reg" href={siteConfig.registerUrl}>
            <span className="ev-side-dot" />
            <span className="ev-side-label">Register</span>
          </a>
          <span className="ev-side-date">{siteConfig.dates}</span>
        </div>
      </aside>
    </>
  );
}