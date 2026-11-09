'use client';

import React, { useState } from 'react';
import frameFaculty from './assets/frames/frame-faculty.png';
import frameMentor from './assets/frames/frame-mentor.png';
import frameLead from './assets/frames/frame-lead.png';
import frameWebsite from './assets/frames/frame-website.png';
import frameFacultyBack from './assets/frames/frame-faculty-back.webp';
import frameMentorBack from './assets/frames/frame-mentor-back.webp';
import frameLeadBack from './assets/frames/frame-lead-back.webp';
import frameWebsiteBack from './assets/frames/frame-website-back.webp';
import './TeamCard.css';

/**
 * Resolves frame image, theme colors, glowing styles, and category metadata
 */
function getCategoryConfig(sectionId) {
  switch (sectionId) {
    case 'faculty-mentors':
    case 'faculty':
      return {
        frameSrc: frameFaculty,
        frameBackSrc: frameFacultyBack,
        themeClass: 'theme-faculty',
        nameColor: '#ffffff',
        nameGlow: '0 2px 4px rgba(0, 0, 0, 0.95), 0 0 12px rgba(255, 255, 255, 0.85)',
        roleColor: '#ffffff',
        roleGlow: '0 2px 4px rgba(0, 0, 0, 0.95), 0 0 10px rgba(186, 230, 253, 0.85)',
        glowColor: 'rgba(255, 255, 255, 0.55)',
        themeAccent: '#ffffff',
        categoryName: 'Faculty Mentor',
        tagText: 'Academic Guidance',
        defaultDesc:
          'Provides strategic vision, institutional mentorship, and academic leadership to empower students and foster technical excellence at Technex SVPCET.',
      };
    case 'mentors':
    case 'mentor':
      return {
        frameSrc: frameMentor,
        frameBackSrc: frameMentorBack,
        themeClass: 'theme-mentor',
        nameColor: '#ffffff',
        nameGlow: '0 2px 4px rgba(0, 0, 0, 0.95), 0 0 12px rgba(216, 120, 255, 0.85)',
        roleColor: '#e879f9',
        roleGlow: '0 2px 4px rgba(0, 0, 0, 0.95), 0 0 10px rgba(216, 120, 255, 0.85)',
        glowColor: 'rgba(195, 95, 255, 0.75)',
        themeAccent: '#c55fff',
        categoryName: 'Technical Mentor',
        tagText: 'Strategy & Ops',
        defaultDesc:
          'Mentors core engineering workflows, technical architecture design, and competitive hackathon projects with industry-aligned experience.',
      };
    case 'lead-team':
    case 'coordinator':
      return {
        frameSrc: frameLead,
        frameBackSrc: frameLeadBack,
        themeClass: 'theme-coordinator',
        nameColor: '#ffffff',
        nameGlow: '0 2px 4px rgba(0, 0, 0, 0.95), 0 0 12px rgba(255, 215, 50, 0.85)',
        roleColor: '#facc15',
        roleGlow: '0 2px 4px rgba(0, 0, 0, 0.95), 0 0 10px rgba(255, 215, 50, 0.85)',
        glowColor: 'rgba(255, 220, 55, 0.75)',
        themeAccent: '#ffd737',
        categoryName: 'Lead Coordinator',
        tagText: 'Event Operations',
        defaultDesc:
          'Orchestrates operations, cross-domain logistics, brand partnerships, and execution for Central India’s premier annual tech fest.',
      };
    case 'website-developers':
    case 'website':
    default:
      return {
        frameSrc: frameWebsite,
        frameBackSrc: frameWebsiteBack,
        themeClass: 'theme-website',
        nameColor: '#ffffff',
        nameGlow: '0 2px 4px rgba(0, 0, 0, 0.95), 0 0 12px rgba(56, 189, 248, 0.85)',
        roleColor: '#38bdf8',
        roleGlow: '0 2px 4px rgba(0, 0, 0, 0.95), 0 0 10px rgba(56, 189, 248, 0.85)',
        glowColor: 'rgba(55, 205, 255, 0.75)',
        themeAccent: '#37cdff',
        categoryName: 'Web Developer',
        tagText: 'Full-Stack Dev',
        defaultDesc:
          'Full-stack engineer crafting responsive cyber components, real-time interfaces, and high-performance web systems for Technex SVPCET.',
      };
  }
}

/**
 * TeamCard - 3D Flippable High-Tech Cyber Mech Card
 * Features:
 * - Glowing & Highlighted Name & Role typography on real metallic/neon plates
 * - Authentic 608x890 frames with 100% restored lightning
 * - Interactive 3D flip on click with smooth animation
 * - Accessible keyboard navigation & clickable social icons
 */
export function TeamCard({ member, sectionId }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const { id, name, designation, email, linkedin, instagram, image, description } = member;
  const safeId = String(id || 'member').replace(/[^a-zA-Z0-9_-]/g, '');

  const config = getCategoryConfig(sectionId);

  const resolvedLinkedinUrl =
    linkedin && (linkedin.startsWith('http')
      ? linkedin
      : `https://www.linkedin.com/in/${linkedin.replace(/^(in\/|@)/, '')}`);

  const emailUrl = email ? `mailto:${email}` : 'mailto:technex@stvincentngp.edu.in';
  const linkedinUrl = resolvedLinkedinUrl || 'https://www.linkedin.com/company/technex-svpcet/';
  const instagramUrl = instagram || 'https://www.instagram.com/technex_svpcet/';

  const memberDesc = description || config.defaultDesc;

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

  return (
    <div
      className={`cyber-card-wrapper ${config.themeClass} ${isFlipped ? 'is-flipped' : ''}`}
      id={`card-${safeId}`}
      style={{
        '--card-glow-color': config.glowColor,
        '--card-accent-color': config.themeAccent,
      }}
      onClick={handleCardToggle}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-pressed={isFlipped}
      aria-label={`${name}, ${designation}. Click to flip card.`}
    >
      {/* Radiant Color-Matched Ambient Glow Behind the Card */}
      <div className="cyber-card-glow" aria-hidden="true" />

      <div className="cyber-card-inner">
        {/* ===================================================================
            FRONT FACE: Authentic Real Cyber Mech Card
            =================================================================== */}
        <div className="cyber-card-face cyber-card-front">
          {/* Optional Portrait Stage */}
          {image && (
            <div className="cyber-portrait-stage">
              <img src={image} alt={name} className="cyber-portrait-img" loading="eager" />
            </div>
          )}

          {/* High-Resolution Transparent Cyber Mech Frame */}
          <img
            src={typeof config.frameSrc === 'object' && config.frameSrc?.src ? config.frameSrc.src : config.frameSrc}
            alt={`${name} Frame`}
            className="cyber-card-frame-img"
            loading="eager"
          />

          {/* Member Name Plate (Auto-fits long names to avoid ellipsis/truncation) */}
          <div
            className={`cyber-name-plate ${name.length >= 21 ? 'name-plate-long' : ''}`}
            style={{
              color: config.nameColor,
              textShadow: config.nameGlow,
            }}
          >
            <span className="cyber-name-text" title={name}>
              {name}
            </span>
          </div>

          {/* Member Role Plate (Identical Unified Size across all cards) */}
          <div
            className={`cyber-role-plate ${designation.length > 24 ? 'role-plate-compact' : ''}`}
            style={{
              color: config.roleColor,
              textShadow: config.roleGlow,
            }}
          >
            <span className="cyber-role-text" title={designation}>
              {designation}
            </span>
          </div>

          {/* Clickable Social Graphic Links */}
          <nav className="cyber-social-nav" aria-label={`${name} Social Links`}>
            <a
              href={emailUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cyber-social-link email-link"
              title={email ? `Email: ${email}` : 'Contact via Email'}
              aria-label={`Email ${name}`}
              onClick={handleSocialClick}
            >
              <span className="cyber-sr-only">Email</span>
            </a>

            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cyber-social-link linkedin-link"
              title={resolvedLinkedinUrl ? `LinkedIn: ${name}` : 'Technex SVPCET LinkedIn'}
              aria-label={`LinkedIn ${name}`}
              onClick={handleSocialClick}
            >
              <span className="cyber-sr-only">LinkedIn</span>
            </a>

            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cyber-social-link instagram-link"
              title="Instagram Profile"
              aria-label={`Instagram ${name}`}
              onClick={handleSocialClick}
            >
              <span className="cyber-sr-only">Instagram</span>
            </a>
          </nav>
        </div>

        {/* ===================================================================
            BACK FACE: Clean Cyber Dossier (Centered & Focused on Back Frame)
            =================================================================== */}
        <div className="cyber-card-face cyber-card-back">
          {/* High-Resolution Cyber Back Frame */}
          <img
            src={typeof config.frameBackSrc === 'object' && config.frameBackSrc?.src ? config.frameBackSrc.src : config.frameBackSrc}
            alt={`${name} Back Frame`}
            className="cyber-card-frame-img"
            loading="eager"
          />

          <div className="cyber-back-overlay">
            <div className="cyber-back-card">
              {/* Top Dossier Title */}
              <div className="cyber-back-header">
                <span className="cyber-profile-icon">◈</span>
                <span className="cyber-profile-title">DOSSIER BRIEF</span>
                <span className="cyber-profile-icon">◈</span>
              </div>

              {/* Glowing Cyber Divider Line */}
              <div className="cyber-back-divider" />

              {/* Profile Description */}
              <p className="cyber-profile-desc">{memberDesc}</p>

              {/* Flip Back Hint */}
              <div className="cyber-back-flip-hint" aria-hidden="true">
                <span>↻ CLICK TO FLIP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeamCard;
