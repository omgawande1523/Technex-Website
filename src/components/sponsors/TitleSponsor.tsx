'use client';

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Sponsor } from '@/types/sponsor';
import { GlareCard } from '@/components/sponsors/ui/glare-card';

interface TitleSponsorProps {
  sponsor: Sponsor;
}

export const TitleSponsor: React.FC<TitleSponsorProps> = ({ sponsor }) => {
  const [imgError, setImgError] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const content = (
    <div className="relative">
      {/* Top Notched Tab / Pill - Light Champagne Golden Tab */}
      <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <div className="flex items-center justify-center rounded-full gold-tab-pill px-7 sm:px-10 py-1.5 sm:py-2">
          <span className="font-orbitron text-xs sm:text-sm md:text-base font-black tracking-[0.25em] bg-gradient-to-r from-white via-yellow-100 to-amber-200 bg-clip-text text-transparent uppercase whitespace-nowrap drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
            TITLE SPONSOR
          </span>
        </div>
      </div>

      {/* Full Frame with GlareCard Effect - Compact & Refined */}
      <GlareCard
        containerClassName="w-full"
        cardClassName="border-yellow-200/30 hover:border-yellow-200/60 shadow-[0_12px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(254,240,138,0.15)]"
        className="flex min-h-[160px] sm:min-h-[190px] md:min-h-[220px] w-full items-center justify-center p-6 sm:p-8 md:p-10 bg-zinc-950/90"
        radius="32px"
      >
        {/* Specular champagne golden highlight on top */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-yellow-100/70 to-transparent z-20" />

        {/* Liquid champagne horizontal accent light beam */}
        <div className="pointer-events-none absolute inset-x-12 sm:inset-x-24 bottom-3 sm:bottom-4 h-[1px] bg-gradient-to-r from-transparent via-yellow-200/40 to-transparent shadow-[0_0_10px_rgba(254,240,138,0.25)] z-20" />

        {/* Center Federal Bank Logo */}
        <div className="relative z-10 flex w-full items-center justify-center">
          {!imgError ? (
            <img
              src={sponsor.logo}
              alt={`${sponsor.name} - Title Sponsor`}
              loading="lazy"
              onError={() => setImgError(true)}
              className="max-h-24 sm:max-h-32 md:max-h-36 w-auto max-w-[85%] sm:max-w-[75%] object-contain rounded-2xl filter drop-shadow-[0_6px_25px_rgba(0,0,0,0.8)] transition-all duration-300"
            />
          ) : (
            <div className="font-orbitron text-2xl sm:text-4xl font-extrabold tracking-widest bg-gradient-to-r from-white via-yellow-100 to-amber-200 bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(254,240,138,0.4)]">
              {sponsor.name}
            </div>
          )}
        </div>
      </GlareCard>
    </div>
  );

  return (
    <motion.section
      aria-label="Title Sponsor Section"
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative mx-auto mt-6 sm:mt-8 w-full max-w-2xl sm:max-w-3xl md:max-w-4xl px-4 sm:px-6 select-none"
    >
      {content}
    </motion.section>
  );
};
