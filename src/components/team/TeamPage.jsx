import React from 'react';
import { teamSections } from './data/teamData.js';
import TeamSection from './TeamSection.jsx';
import './TeamPage.css';

/**
 * TeamPage - Main Technex SVPCET Team Showcase
 * Recreates the Team page with 18 team members across 4 sections:
 * 1. Faculty Mentors (4)
 * 2. Mentors (4)
 * 3. Lead Team (6)
 * 4. Website Developers (6)
 */
export function TeamPage() {
  return (
    <div className="technex-team-page">
      {/* Full-bleed Deep Space & Cosmic Nebula Backdrop */}
      <div className="technex-page-backdrop" aria-hidden="true">
        <div className="technex-backdrop-stars" />
        <div className="technex-backdrop-nebula nebula-top" />
        <div className="technex-backdrop-nebula nebula-middle" />
        <div className="technex-backdrop-nebula nebula-bottom" />
        <div className="technex-backdrop-veil" />
      </div>

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
