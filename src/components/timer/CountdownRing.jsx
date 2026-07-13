import React from 'react';

/**
 * CountdownRing — SVG circular progress for countdown timers.
 * Responsive: fills available width up to maxSize.
 * Thick ring with layered texture effect (3D depth).
 */
export default function CountdownRing({
  progress = 1,
  stroke = 20,
  color = '#FF6B00',
  children,
}) {
  // Internal SVG coordinates (fixed viewBox)
  const vbSize = 300;
  const radius = (vbSize - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const offset = circumference * (1 - clampedProgress);

  const uid = `ring-${color.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: 'min(82vw, 400px)', height: 'min(82vw, 400px)' }}
    >
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${vbSize} ${vbSize}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        <defs>
          {/* Main gradient — subtle color shift for texture */}
          <linearGradient id={`${uid}-main`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="40%" stopColor={color} stopOpacity="0.75" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </linearGradient>

          {/* Highlight gradient — lighter inner edge for 3D bevel */}
          <linearGradient id={`${uid}-hi`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
          </linearGradient>

          {/* Shadow gradient — darker outer edge for depth */}
          <linearGradient id={`${uid}-sh`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0" />
            <stop offset="50%" stopColor="#000000" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </linearGradient>

          <filter id={`${uid}-glow`}>
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>

        {/* ── Track (empty portion) ── */}
        <circle
          cx={vbSize / 2}
          cy={vbSize / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={stroke}
        />
        {/* Track inner highlight */}
        <circle
          cx={vbSize / 2}
          cy={vbSize / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke - 6}
        />

        {/* ── Glow layer (behind progress) ── */}
        <circle
          cx={vbSize / 2}
          cy={vbSize / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke + 12}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          opacity="0.15"
          filter={`url(#${uid}-glow)`}
        />

        {/* ── Main progress ring ── */}
        <circle
          cx={vbSize / 2}
          cy={vbSize / 2}
          r={radius}
          fill="none"
          stroke={`url(#${uid}-main)`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />

        {/* ── Highlight overlay (inner bevel) ── */}
        <circle
          cx={vbSize / 2}
          cy={vbSize / 2}
          r={radius}
          fill="none"
          stroke={`url(#${uid}-hi)`}
          strokeWidth={stroke - 4}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />

        {/* ── Shadow overlay (outer depth) ── */}
        <circle
          cx={vbSize / 2}
          cy={vbSize / 2}
          r={radius}
          fill="none"
          stroke={`url(#${uid}-sh)`}
          strokeWidth={stroke + 2}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          opacity="0.4"
        />
      </svg>

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}
