import React from 'react';

interface FootballIconSvgProps {
  className?: string;
  size?: number;
}

export const FootballIconSvg: React.FC<FootballIconSvgProps> = ({ className = 'w-16 h-16', size }) => {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      {/* Outer Ball Circle Base with #16a34a green glow */}
      <circle cx="60" cy="60" r="54" fill="#16a34a" />
      <circle cx="60" cy="60" r="52" stroke="#FFFFFF" strokeWidth="2.5" />

      {/* Central Pentagon (Dark Slate #0f172a) */}
      <polygon points="60,38 77,50 71,71 49,71 43,50" fill="#0f172a" />

      {/* Pentagon connecting seam lines */}
      <line x1="60" y1="38" x2="60" y2="16" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="77" y1="50" x2="96" y2="43" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="71" y1="71" x2="84" y2="90" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="49" y1="71" x2="36" y2="90" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="43" y1="50" x2="24" y2="43" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />

      {/* Outer perimeter patches */}
      <path d="M49 10 L60 16 L71 10 C68 7 64 6 60 6 C56 6 52 7 49 10Z" fill="#0f172a" />
      <path d="M96 43 L104 31 C101 27 98 23 94 20 L84 27 Z" fill="#0f172a" />
      <path d="M84 90 L99 84 C103 79 106 74 107 68 L97 62 Z" fill="#0f172a" />
      <path d="M36 90 L49 101 L71 101 L84 90 L71 96 L49 96 Z" fill="#0f172a" />
      <path d="M23 62 L13 68 C14 74 17 79 21 84 L36 90 Z" fill="#0f172a" />
      <path d="M24 43 L36 27 L26 20 C22 23 19 27 16 31 Z" fill="#0f172a" />

      {/* Subtle Green Highlight Arc */}
      <path
        d="M28 32 A46 46 0 0 1 62 14"
        stroke="#22c55e"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.8"
      />
    </svg>
  );
};
