import React from 'react';

interface AreexLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showBadgeText?: boolean;
}

export const AreexLogo: React.FC<AreexLogoProps> = ({
  size = 'md',
  showBadgeText = false,
}) => {
  const dimensions =
    size === 'sm'
      ? 'h-8 w-8 rounded-lg'
      : size === 'lg'
        ? 'h-12 w-12 rounded-2xl'
        : 'h-9 w-9 rounded-xl';

  const svgSize = size === 'sm' ? 'h-5 w-5' : size === 'lg' ? 'h-7 w-7' : 'h-5 w-5';

  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      <div
        className={`relative flex ${dimensions} shrink-0 items-center justify-center border border-red-500/60 bg-gradient-to-br from-red-600 via-[#991b1b] to-[#1a060a] shadow-[0_0_24px_rgba(220,38,38,0.45)]`}
      >
        {/* Subtle inner specular highlight */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0.5 rounded-[inherit] border border-white/15 bg-gradient-to-b from-white/15 to-transparent"
        />
        {/* Custom Areex Cloud Crimson Crest SVG (Stylized 'A' + Cloud + Server Lightning Bolt) */}
        <svg
          viewBox="0 0 32 32"
          fill="none"
          aria-hidden="true"
          className={`relative z-10 ${svgSize} text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]`}
        >
          {/* Outer Hexagonal Shield Frame */}
          <path
            d="M16 2.5L27.5 8.8V23.2L16 29.5L4.5 23.2V8.8L16 2.5Z"
            stroke="currentColor"
            strokeOpacity="0.45"
            strokeWidth="1.5"
            fill="rgba(9,6,8,0.35)"
          />
          {/* Cloud Silhouette Arc */}
          <path
            d="M10.5 20.5H21.8C23.8 20.5 25.2 19.1 25.2 17.2C25.2 15.5 23.9 14.1 22.2 13.9C21.6 10.9 19 8.8 15.8 8.8C12.9 8.8 10.4 10.6 9.6 13.3C7.9 13.6 6.8 15.1 6.8 16.9C6.8 18.9 8.4 20.5 10.5 20.5Z"
            fill="currentColor"
            fillOpacity="0.22"
          />
          {/* Bold Areex 'A' Apex + Lightning Core */}
          <path
            d="M16 6.8L9.2 22.8H12.7L14.2 19H18.4L19.8 22.8H23.2L16 6.8ZM15.1 16.2L16.3 12.6L17.5 16.2H15.1Z"
            fill="currentColor"
          />
          {/* Crimson Energy Spark Dot */}
          <circle cx="16" cy="25.2" r="1.4" fill="#fca5a5" />
        </svg>
      </div>
      {showBadgeText && (
        <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-red-400">
          OFFICIAL CLOUD
        </span>
      )}
    </div>
  );
};
