"use client";

import React, { useState } from 'react';
import frameTitan from './assets/frames/frame-titan.png';
import frameBack from './assets/frames/frame-back.png';
import './TeamCard.css';

/**
 * Authentic, pixel-perfect brand SVG icons
 * Custom calibrated with gold ambient mech glow
 */
function LinkedInIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

function MailIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect width="20" height="16" x="2" y="4" rx="2.5" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function InstagramIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689-.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

/**
 * Adaptive text size tiers based on character length
 * Ensures 100% full text display with zero truncation or overflow
 */
function getNameSizeClass(name) {
  const len = (name || '').length;
  if (len >= 22) return 'name-size-xl';
  if (len >= 17) return 'name-size-lg';
  if (len >= 15) return 'name-size-md';
  return 'name-size-sm';
}

function getRoleSizeClass(role) {
  const len = (role || '').length;
  if (len >= 28) return 'role-size-xl';
  if (len >= 20) return 'role-size-lg';
  if (len >= 16) return 'role-size-md';
  return 'role-size-sm';
}

/**
 * TeamCard - 3D Flippable High-Tech Golden Mech Card
 * Front: Perfectly proportioned portrait, bottom-stacked Name & Role, and below-frame flip prompt
 * Back: High-Tech Golden Reactor Social Medallions centered in honeycomb core
 */
export function TeamCard({ member, sectionId }) {
  const { id, name, designation, email, linkedin, instagram, image } = member;
  const safeId = String(id || 'member').replace(/[^a-zA-Z0-9_-]/g, '');
  const [isFlipped, setIsFlipped] = useState(false);

  const hasLinkedin = Boolean(
    linkedin &&
    typeof linkedin === 'string' &&
    linkedin.trim() !== '' &&
    linkedin.trim() !== '#'
  );

  const hasEmail = Boolean(
    email &&
    typeof email === 'string' &&
    email.trim() !== '' &&
    email.trim() !== '#'
  );

  const hasInstagram = Boolean(
    instagram &&
    typeof instagram === 'string' &&
    instagram.trim() !== '' &&
    instagram.trim() !== '#'
  );

  const resolvedLinkedinUrl = hasLinkedin
    ? (linkedin.startsWith('http')
        ? linkedin
        : `https://www.linkedin.com/in/${linkedin.replace(/^(in\/|@)/, '')}`)
    : null;

  const emailUrl = hasEmail
    ? (email.startsWith('mailto:') ? email : `mailto:${email}`)
    : null;

  const instagramUrl = hasInstagram
    ? (instagram.startsWith('http')
        ? instagram
        : `https://www.instagram.com/${instagram.replace(/^@/, '')}`)
    : null;

  const handleCardToggle = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsFlipped((prev) => !prev);
    }
  };

  const handleSocialClick = (e) => {
    e.stopPropagation();
  };

  const titanSrc =
    typeof frameTitan === 'object' && frameTitan?.src ? frameTitan.src : frameTitan;
  const backSrc =
    typeof frameBack === 'object' && frameBack?.src ? frameBack.src : frameBack;

  return (
    <div
      className={`cyber-card-wrapper theme-titan frame-titan${sectionId === 'faculty-mentors' ? ' faculty-mentor-card' : ''} ${isFlipped ? 'is-flipped' : ''}`}
      id={`card-${safeId}`}
      onClick={handleCardToggle}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-pressed={isFlipped}
      aria-label={`${name}, ${designation}. Click to flip card.`}
    >
      {/* Continuous 3D Left-to-Right Tilt Motion Track */}
      <div className="cyber-card-tilt-track">
        {/* Radiant Golden Solar Ambient Glow Behind the Card */}
        <div className="cyber-card-glow" aria-hidden="true" />

        <div className="cyber-card-inner">
          {/* ===================================================================
              FRONT FACE: Authentic Golden Mech Card
              =================================================================== */}
          <div className="cyber-card-face cyber-card-front">
            {/* Portrait Stage: Shows Photo or Futuristic Cyber Hologram Silhouette */}
            <div className="cyber-portrait-stage">
              {image ? (
                <img src={image} alt={name} className="cyber-portrait-img" />
              ) : (
                <div className="cyber-avatar-placeholder" aria-hidden="true">
                  <svg
                    className="cyber-avatar-svg"
                    viewBox="0 0 120 120"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="60" cy="42" r="24" stroke="currentColor" strokeWidth="2.5" strokeDasharray="4 2" />
                    <path
                      d="M20 102C20 76 38 66 60 66C82 66 100 76 100 102"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <polygon points="60,26 66,37 78,39 69,48 71,60 60,54 49,60 51,48 42,39 54,37" fill="currentColor" opacity="0.35" />
                    <line x1="12" y1="60" x2="108" y2="60" stroke="currentColor" strokeWidth="1" opacity="0.35" strokeDasharray="6 3" />
                  </svg>
                  <span className="cyber-avatar-tag">TECHNEX &apos;26</span>
                </div>
              )}
            </div>

            {/* High-Resolution Transparent Cyber Mech Frame */}
            <img
              src={titanSrc}
              alt={`${name} Frame`}
              className="cyber-card-frame-img"
              loading="eager"
            />

            {/* Bottom Combined Identity Plate: Name & Role Pushed Down into Bottom Arch */}
            <div className="cyber-front-bottom-plate">
              <div className={`cyber-front-name ${getNameSizeClass(name)}`} title={name}>
                {name}
              </div>
              <div className={`cyber-front-role ${getRoleSizeClass(designation)}`} title={designation}>
                {designation}
              </div>
            </div>
          </div>

          {/* ===================================================================
              BACK FACE: Golden Reactor Mech Frame with Vertically Stacked Socials
              =================================================================== */}
          <div className="cyber-card-face cyber-card-back">
            <img
              src={backSrc}
              alt={`${name} Card Back Frame`}
              className="cyber-card-frame-img cyber-card-back-frame-img"
              loading="eager"
            />

            <div className="cyber-back-hud-overlay">
              {/* Dynamically Rendered Golden Reactor Social Medallions */}
              <nav className="cyber-back-social-vertical" aria-label={`${name} Social Channels`}>
                {hasLinkedin && (
                  <a
                    href={resolvedLinkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cyber-back-social-unit link-linkedin"
                    title={`LinkedIn: ${name}`}
                    aria-label={`LinkedIn ${name}`}
                    onClick={handleSocialClick}
                  >
                    <div className="cyber-back-reactor-disc">
                      <LinkedInIcon className="cyber-back-vector-svg" />
                    </div>
                    <span className="cyber-back-unit-label">LinkedIn</span>
                  </a>
                )}

                {hasEmail && (
                  <a
                    href={emailUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cyber-back-social-unit link-email"
                    title={`Email: ${name}`}
                    aria-label={`Email ${name}`}
                    onClick={handleSocialClick}
                  >
                    <div className="cyber-back-reactor-disc">
                      <MailIcon className="cyber-back-vector-svg" />
                    </div>
                    <span className="cyber-back-unit-label">Email</span>
                  </a>
                )}

                {hasInstagram && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cyber-back-social-unit link-instagram"
                    title={`Instagram: ${name}`}
                    aria-label={`Instagram ${name}`}
                    onClick={handleSocialClick}
                  >
                    <div className="cyber-back-reactor-disc">
                      <InstagramIcon className="cyber-back-vector-svg" />
                    </div>
                    <span className="cyber-back-unit-label">Instagram</span>
                  </a>
                )}

                {!hasLinkedin && !hasEmail && !hasInstagram && (
                  <div className="cyber-back-no-socials">
                    <span className="cyber-back-no-socials-tag">TECHNEX &apos;26</span>
                    <span className="cyber-back-no-socials-text">NO SOCIALS LINKED</span>
                  </div>
                )}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* External Flip Prompt Below Frame */}
      <div className="cyber-card-below-prompt" aria-hidden="true">
        <span className="cyber-below-prompt-icon">↻</span>
        <span className="cyber-below-prompt-text">CLICK TO FLIP</span>
      </div>
    </div>
  );
}

export default TeamCard;
