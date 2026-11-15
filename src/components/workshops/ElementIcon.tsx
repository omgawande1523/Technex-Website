import React from "react";

export type ElementType = "tech" | "hydro" | "data" | "spatial" | "cyber" | "fire" | "shield";

interface ElementIconProps {
  type: ElementType | string;
  className?: string;
  size?: number;
  glow?: boolean;
}

export function ElementIcon({ type, className = "", size = 18, glow = false }: ElementIconProps) {
  const norm = type.toLowerCase().trim();

  switch (norm) {
    case "tech":
    case "⚡":
    case "violet":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={glow ? { filter: "drop-shadow(0 0 4px rgba(192, 132, 252, 0.8))" } : undefined}
        >
          <defs>
            <linearGradient id="tech-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#e9d5ff" />
              <stop offset="0.5" stopColor="#c084fc" />
              <stop offset="1" stopColor="#9333ea" />
            </linearGradient>
          </defs>
          <path
            d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
            fill="url(#tech-grad)"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "hydro":
    case "water":
    case "🌊":
    case "blue":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={glow ? { filter: "drop-shadow(0 0 4px rgba(56, 189, 248, 0.8))" } : undefined}
        >
          <defs>
            <linearGradient id="hydro-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#e0f2fe" />
              <stop offset="0.5" stopColor="#38bdf8" />
              <stop offset="1" stopColor="#0284c7" />
            </linearGradient>
          </defs>
          <path
            d="M2 13C4 11 6.5 11 8.5 13C10.5 15 13 15 15 13C17 11 19.5 11 21.5 13"
            stroke="url(#hydro-grad)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 17.5C4 15.5 6.5 15.5 8.5 17.5C10.5 19.5 13 19.5 15 17.5C17 15.5 19.5 15.5 21.5 17.5"
            stroke="url(#hydro-grad)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 3C12 3 6.5 8.5 6.5 11.5C6.5 14.5376 8.96243 17 12 17C15.0376 17 17.5 14.5376 17.5 11.5C17.5 8.5 12 3 12 3Z"
            fill="url(#hydro-grad)"
            fillOpacity="0.45"
            stroke="#ffffff"
            strokeWidth="1.2"
          />
        </svg>
      );

    case "data":
    case "vision":
    case "👁️":
    case "green":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={glow ? { filter: "drop-shadow(0 0 4px rgba(52, 211, 153, 0.8))" } : undefined}
        >
          <defs>
            <linearGradient id="data-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#d1fae5" />
              <stop offset="0.5" stopColor="#34d399" />
              <stop offset="1" stopColor="#059669" />
            </linearGradient>
          </defs>
          <path
            d="M1 12C2.5 7 6.5 4 12 4C17.5 4 21.5 7 23 12C21.5 17 17.5 20 12 20C6.5 20 2.5 17 1 12Z"
            stroke="url(#data-grad)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="4.5" fill="url(#data-grad)" stroke="#ffffff" strokeWidth="1.2" />
          <circle cx="12" cy="12" r="1.5" fill="#042f1a" />
          <path d="M12 1V3M12 21V23M1 12H3M21 12H23" stroke="url(#data-grad)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case "spatial":
    case "cad":
    case "📐":
    case "cyan":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={glow ? { filter: "drop-shadow(0 0 4px rgba(34, 211, 238, 0.8))" } : undefined}
        >
          <defs>
            <linearGradient id="spatial-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#cffafe" />
              <stop offset="0.5" stopColor="#22d3ee" />
              <stop offset="1" stopColor="#0891b2" />
            </linearGradient>
          </defs>
          <path
            d="M12 2L2 7.5L12 13L22 7.5L12 2Z"
            fill="url(#spatial-grad)"
            fillOpacity="0.4"
            stroke="url(#spatial-grad)"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M2 12.5L12 18L22 12.5"
            stroke="url(#spatial-grad)"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 17.5L12 23L22 17.5"
            stroke="#ffffff"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "cyber":
    case "exploit":
    case "🛡️":
    case "red":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={glow ? { filter: "drop-shadow(0 0 4px rgba(248, 113, 113, 0.8))" } : undefined}
        >
          <defs>
            <linearGradient id="cyber-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fee2e2" />
              <stop offset="0.5" stopColor="#f87171" />
              <stop offset="1" stopColor="#dc2626" />
            </linearGradient>
          </defs>
          <path
            d="M12 2L3 6V11C3 16.5 6.8 21.6 12 23C17.2 21.6 21 16.5 21 11V6L12 2Z"
            fill="url(#cyber-grad)"
            fillOpacity="0.35"
            stroke="#ffffff"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path
            d="M9 12L11 14L15 10"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="2" fill="url(#cyber-grad)" />
        </svg>
      );

    case "fire":
    case "🔥":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <path
            d="M8.5 14.5C8.5 16.433 10.067 18 12 18C13.933 18 15.5 16.433 15.5 14.5C15.5 12.5 13.5 10.5 12 9C10.5 10.5 8.5 12.5 8.5 14.5Z"
            fill="#f97316"
          />
          <path
            d="M12 2C12 2 5 7.5 5 14C5 17.866 8.13401 21 12 21C15.866 21 19 17.866 19 14C19 7.5 12 2 12 2Z"
            stroke="#fb923c"
            strokeWidth="1.6"
          />
        </svg>
      );

    default:
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <polygon
            points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9"
            fill="#ffd875"
            stroke="#ffffff"
            strokeWidth="1"
          />
        </svg>
      );
  }
}

export function ElementalWatermark({ type, className = "" }: { type: string; className?: string }) {
  const norm = type.toLowerCase().trim();

  switch (norm) {
    case "tech":
    case "⚡":
    case "violet":
      return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" opacity="0.4" />
          <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
          <path d="M100 10L100 30M100 170L100 190M10 100L30 100M170 100L190 100" stroke="currentColor" strokeWidth="2" opacity="0.5" />
          <polygon points="110,35 60,110 105,110 95,165 145,90 100,90" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="2.5" />
        </svg>
      );

    case "hydro":
    case "water":
    case "🌊":
    case "blue":
      return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="1" strokeDasharray="5 5" opacity="0.35" />
          <path d="M25 110C50 90 75 90 100 110C125 130 150 130 175 110" stroke="currentColor" strokeWidth="3" opacity="0.4" strokeLinecap="round" />
          <path d="M25 140C50 120 75 120 100 140C125 160 150 160 175 140" stroke="currentColor" strokeWidth="3" opacity="0.4" strokeLinecap="round" />
          <path d="M100 25C100 25 55 75 55 105C55 130 75 150 100 150C125 150 145 130 145 105C145 75 100 25 100 25Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2" />
        </svg>
      );

    case "data":
    case "vision":
    case "👁️":
    case "green":
      return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="1" opacity="0.3" />
          <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.5" />
          <path d="M20 100C40 60 70 40 100 40C130 40 160 60 180 100C160 140 130 160 100 160C70 160 40 140 20 100Z" stroke="currentColor" strokeWidth="2.5" opacity="0.5" />
          <circle cx="100" cy="100" r="28" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2" />
          <circle cx="100" cy="100" r="10" fill="currentColor" fillOpacity="0.35" />
        </svg>
      );

    case "spatial":
    case "cad":
    case "📐":
    case "cyan":
      return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="1" strokeDasharray="8 6" opacity="0.35" />
          <polygon points="100,20 170,60 170,140 100,180 30,140 30,60" stroke="currentColor" strokeWidth="2" opacity="0.45" />
          <line x1="100" y1="20" x2="100" y2="180" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
          <line x1="30" y1="60" x2="170" y2="140" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
          <line x1="30" y1="140" x2="170" y2="60" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
          <polygon points="100,60 140,82 140,126 100,148 60,126 60,82" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="2" />
        </svg>
      );

    case "cyber":
    case "exploit":
    case "🛡️":
    case "red":
      return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="1" opacity="0.3" />
          <path d="M100 20L35 50V95C35 145 65 180 100 190C135 180 165 145 165 95V50L100 20Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2.5" opacity="0.5" />
          <path d="M75 100L95 120L130 80" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
        </svg>
      );

    default:
      return null;
  }
}
