import React from 'react';
import './SectionHeadingBanner.css';

/**
 * SectionHeadingBanner - Exact Art Deco Gold Heading Banner
 * Recreates the banner from the reference image:
 * - Royal Navy Blue core banner with stepped 45-degree chamfers
 * - Radiant metallic gold borders (top, bottom, and stepped returns)
 * - Double chevron arrow wings on both left and right sides (< and >)
 * - Centered Title text in bold golden-yellow sans-serif typography
 */
export function SectionHeadingBanner({ title }) {
  const safeId = String(title || 'heading').toLowerCase().replace(/[^a-z0-9]/g, '-');
  const goldGradId = `headGoldGrad-${safeId}`;
  const blueGradId = `headBlueGrad-${safeId}`;

  return (
    <div className="section-heading-banner-wrapper" role="banner">
      <svg
        viewBox="0 0 640 76"
        className="section-heading-banner-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Radiant Metallic Gold Gradient */}
          <linearGradient id={goldGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff6cf" />
            <stop offset="25%" stopColor="#f3cf65" />
            <stop offset="60%" stopColor="#c8992a" />
            <stop offset="85%" stopColor="#dfb33b" />
            <stop offset="100%" stopColor="#ffe68a" />
          </linearGradient>

          {/* Deep Obsidian Black Gradient */}
          <linearGradient id={blueGradId} x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#1e2029" />
            <stop offset="45%" stopColor="#0f1016" />
            <stop offset="100%" stopColor="#040407" />
          </linearGradient>

          {/* Soft Gold Ambient Glow for Text */}
          <filter id={`headGlow-${safeId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#dfb33b" floodOpacity="0.45" />
          </filter>
        </defs>

        {/* Outer Left Chevron Bracket Wing */}
        <polyline
          points="66,14 40,38 66,62"
          fill="none"
          stroke={`url(#${goldGradId})`}
          strokeWidth="3.2"
          strokeLinecap="miter"
          strokeLinejoin="miter"
        />
        <polyline
          points="62,18 44,38 62,58"
          fill="none"
          stroke="#fff4cc"
          strokeWidth="1.4"
          opacity="0.85"
        />

        {/* Outer Right Chevron Bracket Wing */}
        <polyline
          points="574,14 600,38 574,62"
          fill="none"
          stroke={`url(#${goldGradId})`}
          strokeWidth="3.2"
          strokeLinecap="miter"
          strokeLinejoin="miter"
        />
        <polyline
          points="578,18 596,38 578,58"
          fill="none"
          stroke="#fff4cc"
          strokeWidth="1.4"
          opacity="0.85"
        />

        {/* Main Banner Core (Royal Blue Body with Stepped Chamfers & Pointed Ends) */}
        <path
          d="
            M 82 8 
            L 558 8 
            L 558 16 
            L 582 38 
            L 558 60 
            L 558 68 
            L 82 68 
            L 82 60 
            L 58 38 
            L 82 16 
            L 82 8 
            Z
          "
          fill={`url(#${blueGradId})`}
          stroke={`url(#${goldGradId})`}
          strokeWidth="3.4"
          strokeLinejoin="miter"
        />

        {/* Inner Gold Accent Trim Line */}
        <path
          d="
            M 88 14 
            L 552 14 
            L 552 20 
            L 572 38 
            L 552 56 
            L 552 62 
            L 88 62 
            L 88 56 
            L 68 38 
            L 88 20 
            L 88 14 
            Z
          "
          fill="none"
          stroke={`url(#${goldGradId})`}
          strokeWidth="1.2"
          opacity="0.65"
        />

        {/* Section Title Text in Golden-Yellow */}
        <text
          x="320"
          y="46.5"
          textAnchor="middle"
          fill="#dfb33b"
          fontFamily="'Space Grotesk', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
          fontSize="24"
          fontWeight="700"
          letterSpacing="0.8"
          filter={`url(#headGlow-${safeId})`}
        >
          {title}
        </text>
      </svg>
    </div>
  );
}

export default SectionHeadingBanner;

