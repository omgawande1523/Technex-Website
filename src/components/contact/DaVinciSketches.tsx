"use client";

import React from "react";

/**
 * Decorative top center compass rose & tapered line divider.
 */
export function HeaderStarOrnament() {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 my-1 select-none pointer-events-none">
      <div className="h-[1.5px] w-16 sm:w-28 bg-gradient-to-r from-transparent via-[#5c3518] to-[#3a1d08]" />
      <svg
        viewBox="0 0 40 40"
        className="w-7 h-7 sm:w-8 sm:h-8 text-[#3a1d08]"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M20 2 L23.5 16.5 L38 20 L23.5 23.5 L20 38 L16.5 23.5 L2 20 L16.5 16.5 Z"
          fill="#623817"
          fillOpacity="0.35"
          stroke="#3a1d08"
          strokeWidth="1.2"
        />
        <path
          d="M11 11 L18 18 M29 11 L22 18 M29 29 L22 22 M11 29 L18 22"
          stroke="#3a1d08"
          strokeWidth="1"
        />
        <circle cx="20" cy="20" r="2.5" fill="#3a1d08" />
      </svg>
      <div className="h-[1.5px] w-16 sm:w-28 bg-gradient-to-l from-transparent via-[#5c3518] to-[#3a1d08]" />
    </div>
  );
}

function CartoucheEndCap({
  gradId,
  mirrored = false,
}: {
  gradId: string;
  mirrored?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 16 36"
      preserveAspectRatio="none"
      className={`w-[16px] h-full flex-shrink-0 block ${mirrored ? "-scale-x-100" : ""}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5dfb1" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#ecd098" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#dfc082" stopOpacity="0.95" />
        </linearGradient>
      </defs>
      <path
        d="M 16 0.75 L 9 0.75 L 6.5 6.5 L 1.5 12.5 L 0.75 18 L 1.5 23.5 L 6.5 29.5 L 9 35.25 L 16 35.25 Z"
        fill={`url(#${gradId})`}
      />
      <path
        d="M 16 0.75 L 9 0.75 L 6.5 6.5 L 1.5 12.5 L 0.75 18 L 1.5 23.5 L 6.5 29.5 L 9 35.25 L 16 35.25"
        fill="none"
        stroke="#4a250a"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M 16 3.5 L 11 3.5 L 9 8.5 L 4.5 13.5 L 3.75 18 L 4.5 22.5 L 9 27.5 L 11 32.5 L 16 32.5"
        fill="none"
        stroke="#6e421d"
        strokeOpacity="0.62"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Stepped architectural Renaissance cartouche nameplate with uniform-stroke SVG end-caps
 * and a seamless double-ruled horizontal parchment band.
 */
export function CartoucheBanner({
  children,
  className = "",
  innerClassName = "px-3.5 sm:px-5",
}: {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  const gradId = React.useId();

  return (
    <div
      className={`inline-flex items-stretch h-[36px] select-none drop-shadow-[0_3px_6px_rgba(44,21,6,0.24)] ${className}`}
    >
      <CartoucheEndCap gradId={`${gradId}-l`} />

      {/* Center double-ruled band */}
      <div
        className={`relative flex items-center justify-center gap-2 whitespace-nowrap border-t-[1.5px] border-b-[1.5px] border-[#4a250a] bg-gradient-to-b from-[#f5dfb1]/95 via-[#ecd098]/95 to-[#dfc082]/95 text-[#261104] ${innerClassName}`}
      >
        <span
          className="pointer-events-none absolute top-[1.5px] inset-x-0 h-[1px] bg-[#6e421d]/60"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute bottom-[1.5px] inset-x-0 h-[1px] bg-[#6e421d]/60"
          aria-hidden="true"
        />
        {children}
      </div>

      <CartoucheEndCap gradId={`${gradId}-r`} mirrored />
    </div>
  );
}

function FrameCornerBracket({ cornerClass }: { cornerClass: string }) {
  return (
    <svg
      viewBox="0 0 22 22"
      className={`w-[22px] h-[22px] ${cornerClass}`}
      aria-hidden="true"
    >
      <path
        d="M 22 0.75 L 12 0.75 L 12 8 L 8 12 L 0.75 12 L 0.75 22"
        fill="none"
        stroke="#4a250a"
        strokeWidth="1.5"
        strokeLinejoin="miter"
      />
      <path
        d="M 22 5 L 16.25 5 L 16.25 10.25 L 10.25 16.25 L 5 16.25 L 5 22"
        fill="none"
        stroke="#6e421d"
        strokeOpacity="0.65"
        strokeWidth="1"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

/**
 * Reusable Renaissance double-bordered frame with stepped/indented architectural corners
 * and an optional centered badge/medallion intersecting the top border.
 */
export function RenaissanceFrame({
  children,
  topBadge,
  className = "",
  topOffset = "pt-[18px]",
  contentClassName = "p-4 sm:p-5 lg:p-6 pt-7 sm:pt-8",
}: {
  children: React.ReactNode;
  topBadge?: React.ReactNode;
  className?: string;
  topOffset?: string;
  contentClassName?: string;
}) {
  const outerClip =
    "polygon(12px 0, calc(100% - 12px) 0, calc(100% - 12px) 8px, calc(100% - 8px) 12px, 100% 12px, 100% calc(100% - 12px), calc(100% - 8px) calc(100% - 12px), calc(100% - 12px) calc(100% - 8px), calc(100% - 12px) 100%, 12px 100%, 12px calc(100% - 8px), 8px calc(100% - 12px), 0 calc(100% - 12px), 0 12px, 8px 12px, 12px 8px)";

  return (
    <div className={`relative ${topOffset} ${className}`}>
      {/* Overlapping Top Header Plaque / Medallion */}
      {topBadge && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
          {topBadge}
        </div>
      )}

      {/* Frame Body */}
      <div className="relative h-full">
        {/* Translucent Parchment Wash Clipped Strictly Inside the Stepped Corners */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#fff2d2]/30 via-[#f7ddb0]/15 to-[#e6be7d]/20 shadow-[inset_0_0_24px_rgba(92,50,18,0.1)]"
          style={{ clipPath: outerClip }}
          aria-hidden="true"
        />

        {/* Crisp Double-Ruled Architectural Borders + 4 Mirrored Stepped Corner Brackets */}
        <div
          className="pointer-events-none absolute inset-0 z-10 opacity-90"
          aria-hidden="true"
        >
          {/* Outer edges */}
          <div className="absolute top-0 left-[21.5px] right-[21.5px] h-[1.5px] bg-[#4a250a]" />
          <div className="absolute bottom-0 left-[21.5px] right-[21.5px] h-[1.5px] bg-[#4a250a]" />
          <div className="absolute left-0 top-[21.5px] bottom-[21.5px] w-[1.5px] bg-[#4a250a]" />
          <div className="absolute right-0 top-[21.5px] bottom-[21.5px] w-[1.5px] bg-[#4a250a]" />

          {/* Inner hairline edges */}
          <div className="absolute top-[4.5px] left-[21.5px] right-[21.5px] h-[1px] bg-[#6e421d]/65" />
          <div className="absolute bottom-[4.5px] left-[21.5px] right-[21.5px] h-[1px] bg-[#6e421d]/65" />
          <div className="absolute left-[4.5px] top-[21.5px] bottom-[21.5px] w-[1px] bg-[#6e421d]/65" />
          <div className="absolute right-[4.5px] top-[21.5px] bottom-[21.5px] w-[1px] bg-[#6e421d]/65" />

          {/* Four stepped corner brackets */}
          <FrameCornerBracket cornerClass="absolute top-0 left-0" />
          <FrameCornerBracket cornerClass="absolute top-0 right-0 -scale-x-100" />
          <FrameCornerBracket cornerClass="absolute bottom-0 left-0 -scale-y-100" />
          <FrameCornerBracket cornerClass="absolute bottom-0 right-0 -scale-x-100 -scale-y-100" />
        </div>

        {/* Interactive Content */}
        <div className={`relative z-0 h-full ${contentClassName}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
