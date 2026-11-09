'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SectionHeadingProps {
  title: string;
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({ title, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`flex items-center justify-center space-x-4 sm:space-x-6 my-10 sm:my-14 ${className}`}
    >
      {/* Left glowing light champagne golden divider line */}
      <div className="h-[1.5px] sm:h-[2px] flex-1 max-w-xs sm:max-w-md bg-gradient-to-r from-transparent via-yellow-200/50 to-amber-200/80 shadow-[0_0_10px_rgba(254,240,138,0.3)]" />

      {/* Heading Text - Big and Bold Light Champagne Gold */}
      <h2 className="font-orbitron text-xl sm:text-2xl md:text-3xl font-black tracking-[0.25em] sm:tracking-[0.3em] bg-gradient-to-r from-white via-yellow-100 to-amber-200 bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(254,240,138,0.35)] uppercase px-4 sm:px-6 text-center">
        {title}
      </h2>

      {/* Right glowing light champagne golden divider line */}
      <div className="h-[1.5px] sm:h-[2px] flex-1 max-w-xs sm:max-w-md bg-gradient-to-l from-transparent via-yellow-200/50 to-amber-200/80 shadow-[0_0_10px_rgba(254,240,138,0.3)]" />
    </motion.div>
  );
};
