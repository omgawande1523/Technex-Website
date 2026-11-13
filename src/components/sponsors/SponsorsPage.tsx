'use client';

import React from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import {
  TitleSponsor,
  SectionHeading,
  SponsorCard,
  SponsorGroup,
} from '@/components/sponsors';
import {
  titleSponsor,
  expoSponsors,
  educationSponsors,
  gamingSponsors,
  foodSponsors,
} from '@/data/sponsors';
import styles from './sponsors.module.css';

const SponsorsPage: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  const heroItemVariants: Variants = {
    hidden: shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  return (
    <div className={`sponsorsPage relative min-h-screen text-white selection:bg-yellow-300 selection:text-black zoom-viewport ${styles.page}`}>
      {/* Pure Black Background with celestial subtle champagne starlight glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-grid-cyber">
        {/* Subtle top left ambient soft champagne reflection */}
        <div className="absolute -left-48 -top-48 h-[650px] w-[650px] rounded-full bg-gradient-to-br from-yellow-200/5 via-amber-200/2 to-transparent blur-[140px]" />
        
        {/* Subtle top right ambient soft champagne reflection */}
        <div className="absolute -right-48 -top-32 h-[600px] w-[600px] rounded-full bg-gradient-to-bl from-yellow-100/5 via-amber-100/2 to-transparent blur-[140px]" />

        {/* Subtle bottom ambient soft champagne reflection */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 h-[450px] w-[850px] bg-gradient-to-t from-yellow-900/10 via-yellow-950/5 to-transparent blur-[150px]" />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-[100px] sm:pt-[112px] pb-16">
        {/* Hero Header Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.15 }}
          className="text-center"
        >
          {/* Light Champagne Golden Pill Eyebrow */}
          <motion.div
            variants={heroItemVariants}
            className="inline-flex items-center justify-center rounded-full gold-pill px-7 sm:px-9 py-2 text-xs sm:text-sm md:text-base font-bold tracking-[0.28em] text-yellow-100 shadow-sm"
          >
            <span>POWERED BY INNOVATION</span>
          </motion.div>

          {/* Main Title - Refined Light Champagne Gold Chrome */}
          <motion.h1
            variants={heroItemVariants}
            className="mt-4 font-orbitron text-4xl sm:text-6xl md:text-7xl font-black tracking-wider"
          >
            <span className="text-[#ffffff] drop-shadow-[0_2px_12px_rgba(255,255,255,0.4)]">OUR </span>
            <span className="bg-gradient-to-r from-white via-yellow-100 to-amber-200 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(254,240,138,0.4)]">
              SPONSORS
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={heroItemVariants}
            className="mx-auto mt-3 max-w-xl text-sm sm:text-base text-yellow-100/70 font-normal tracking-wide"
          >
            The partners who make innovation happen.
          </motion.p>
        </motion.div>

        {/* Title Sponsor Component */}
        <TitleSponsor sponsor={titleSponsor} />

        {/* Expo Sponsors Section */}
        <section aria-labelledby="expo-sponsors-heading" className="mt-10 sm:mt-12">
          <SectionHeading title="EXPO SPONSORS" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-6 lg:gap-5">
            {expoSponsors.map((sponsor, index) => (
              <SponsorCard
                key={sponsor.id}
                sponsor={sponsor}
                index={index}
                className="h-32 sm:h-36"
              />
            ))}
          </div>
        </section>

        {/* Education Sponsors Section */}
        <section aria-labelledby="education-sponsors-heading" className="mt-10 sm:mt-12">
          <SectionHeading title="EDUCATION SPONSORS" />
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
            {educationSponsors.map((sponsor, index) => (
              <SponsorCard
                key={sponsor.id}
                sponsor={sponsor}
                index={index}
                className="h-32 sm:h-36"
              />
            ))}
          </div>
        </section>

        {/* Bottom Dual Panels: Gaming Sponsor & Food Sponsors */}
        <section aria-label="Gaming and Food Sponsors" className="mt-10 sm:mt-12">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 md:gap-6">
            {/* Gaming Sponsor Panel */}
            <SponsorGroup
              title="GAMING SPONSOR"
              sponsors={gamingSponsors}
              gridCols="grid-cols-1"
              className="flex flex-col justify-center"
            />

            {/* Food Sponsors Panel */}
            <SponsorGroup
              title="FOOD SPONSORS"
              sponsors={foodSponsors}
              gridCols="grid-cols-2"
              className="flex flex-col justify-center"
            />
          </div>
        </section>
      </main>
    </div>
  );
};

export default SponsorsPage;
