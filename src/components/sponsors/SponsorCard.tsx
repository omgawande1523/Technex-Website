'use client';

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Sponsor } from '@/types/sponsor';
import { GlareCard } from '@/components/sponsors/ui/glare-card';
import { cn } from '@/lib/utils';

interface SponsorCardProps {
  sponsor: Sponsor;
  index: number;
  className?: string;
}

export const SponsorCard: React.FC<SponsorCardProps> = ({ sponsor, index, className = '' }) => {
  const [imgError, setImgError] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const cardMotionProps = {
    initial: shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-30px' },
    transition: {
      duration: shouldReduceMotion ? 0.01 : 0.45,
      delay: shouldReduceMotion ? 0 : index * 0.06,
      ease: [0.21, 0.47, 0.32, 0.98] as const,
    },
  };

  return (
    <motion.div className={cn("w-full h-full select-none", className)} {...cardMotionProps}>
      <GlareCard
        className="flex h-full w-full items-center justify-center p-1 bg-zinc-950/85"
        containerClassName="w-full h-full"
        radius="20px"
      >
        {/* Specular champagne golden highlight on top */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-yellow-100/60 to-transparent z-20" />

        {/* Big Centered Logo Filling at least 90% of the Box */}
        <div className="relative z-10 flex h-full w-full items-center justify-center p-0.5">
          {!imgError ? (
            <img
              src={sponsor.logo}
              alt={`${sponsor.name} logo`}
              loading="lazy"
              onError={() => setImgError(true)}
              className="h-full w-full max-h-[92%] max-w-[94%] object-contain rounded-[20px] filter drop-shadow-[0_4px_16px_rgba(254,240,138,0.12)] transition-all duration-300"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-yellow-200/30 bg-yellow-950/20 text-sm font-bold uppercase tracking-wider text-yellow-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
              {sponsor.name.slice(0, 3)}
            </div>
          )}
        </div>
      </GlareCard>
    </motion.div>
  );
};
