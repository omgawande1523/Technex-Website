"use client";

import React from 'react';
import headingBannerImg from './assets/heading-banner.png';
import './SectionHeadingBanner.css';

/**
 * SectionHeadingBanner - Technex 2026 Holographic Cyber Mech Heading Banner
 * Replaces the old Art-Deco banner with the official Technex 2026 holographic banner:
 * - Dual glowing chevrons: Electric Blue (left) and Neon Green (right)
 * - Prismatic holographic chamfered metallic frame
 * - Centered section title text in bold cyber typography
 */
export function SectionHeadingBanner({ title }) {
  const bannerSrc =
    typeof headingBannerImg === 'object' && headingBannerImg?.src
      ? headingBannerImg.src
      : headingBannerImg;

  return (
    <div className="section-heading-banner-wrapper" role="heading" aria-level={2}>
      <div className="section-heading-banner-container">
        {/* Dual Neon Cyan/Green Ambient Glow Aura */}
        <div className="section-heading-banner-glow" aria-hidden="true" />

        {/* High-Resolution Transparent Cyber Mech Banner Frame */}
        <img
          src={bannerSrc}
          alt=""
          className="section-heading-banner-frame"
          loading="eager"
        />

        {/* Section Title Text (Keeps exact section name) */}
        <h2 className="section-heading-banner-title">
          {title}
        </h2>
      </div>
    </div>
  );
}

export default SectionHeadingBanner;
