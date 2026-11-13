"use client";

import React from 'react';
import { teamSections } from './data/teamData.js';
import TeamSection from './TeamSection.jsx';
import './TeamPage.css';

/**
 * TeamPage - Main Technex SVPCET Team Showcase
 * Features the permanent cosmic golden backdrop and compact 3D golden mech cards
 */
export function TeamPage() {
  return (
    <div className="technex-team-page">
      {/* Soft Ambient Depth Overlay */}
      <div className="technex-page-backdrop" aria-hidden="true" />

      {/* Main Page Container */}
      <main className="technex-team-container">
        {teamSections.map((section) => (
          <TeamSection key={section.id} section={section} />
        ))}
      </main>
    </div>
  );
}

export default TeamPage;
