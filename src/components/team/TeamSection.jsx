import React from 'react';
import TeamCard from './TeamCard.jsx';
import SectionHeadingBanner from './SectionHeadingBanner.jsx';
import './TeamSection.css';

/**
 * TeamSection - Renders each team category section
 * Features the exact Art-Deco royal blue & gold heading banner
 * followed by the responsive grid of team member profile cards.
 */
export function TeamSection({ section }) {
  const { id, title, members } = section;

  return (
    <section className="technex-section" id={id} aria-label={title}>
      {/* Art-Deco Gold & Royal Blue Heading Banner */}
      <SectionHeadingBanner title={title} />

      {/* Team Member Cards Grid */}
      <div className={`technex-cards-grid grid-${members.length}-members`}>
        {members.map((member) => (
          <TeamCard key={member.id} member={member} sectionId={id} />
        ))}
      </div>
    </section>
  );
}

export default TeamSection;
