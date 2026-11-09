'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Sponsor } from '@/types/sponsor';
import { SponsorCard } from './SponsorCard';

interface SponsorGroupProps {
  title: string;
  sponsors: Sponsor[];
  gridCols?: string;
  className?: string;
}

export const SponsorGroup: React.FC<SponsorGroupProps> = ({
  title,
  sponsors,
  gridCols = 'grid-cols-1',
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className={`relative mt-8 rounded-[32px] gold-water-panel p-6 sm:p-8 pt-11 sm:pt-14 ${className}`}
    >
      {/* Top Notched Tab / Pill - Light Champagne Golden Tab */}
      <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <div className="flex items-center justify-center rounded-full gold-tab-pill px-7 sm:px-9 py-2 sm:py-2.5">
          <span className="font-orbitron text-sm sm:text-base md:text-lg font-black tracking-[0.22em] bg-gradient-to-r from-white via-yellow-100 to-amber-200 bg-clip-text text-transparent uppercase whitespace-nowrap drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
            {title}
          </span>
        </div>
      </div>

      {/* Specular champagne golden rim highlight line on top */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-yellow-100/70 to-transparent" />

      {/* Grid of sponsor cards - Larger height for big logos */}
      <div className={`relative z-10 grid gap-4 sm:gap-5 ${gridCols} h-full items-stretch`}>
        {sponsors.map((sponsor, index) => (
          <SponsorCard
            key={sponsor.id}
            sponsor={sponsor}
            index={index}
            className="h-full min-h-[130px] sm:min-h-[150px]"
          />
        ))}
      </div>
    </motion.div>
  );
};
