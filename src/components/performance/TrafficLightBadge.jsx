import React from 'react';

const COLOR_MAP = {
  green:  { dot: '#27ae60', shadow: 'rgba(39,174,96,0.35)',  label: 'text-[#27ae60]' },
  yellow: { dot: '#f5a623', shadow: 'rgba(245,166,35,0.35)', label: 'text-[#f5a623]' },
  red:    { dot: '#e8412a', shadow: 'rgba(232,65,42,0.35)',  label: 'text-[#e8412a]' },
};

export default function TrafficLightBadge({
  color = 'yellow',
  label = '',
  simpleMessage = '',
  size = 'md',
  showMessage = true,
}) {
  const c = COLOR_MAP[color] ?? COLOR_MAP.yellow;

  if (size === 'sm') {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span
          className="rounded-full shrink-0"
          style={{ width: 8, height: 8, background: c.dot, boxShadow: `0 0 0 2px ${c.shadow}` }}
        />
        <span className="font-mono font-bold text-[10px] uppercase tracking-wider" style={{ color: c.dot }}>
          {label}
        </span>
      </span>
    );
  }

  if (size === 'lg') {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <span
          className={`rounded-full ${color === 'green' ? 'pulse-green' : color === 'red' ? 'pulse-red' : ''}`}
          style={{
            width: 24, height: 24,
            background: c.dot,
            boxShadow: `0 0 0 4px ${c.shadow}, 0 0 20px ${c.shadow}`,
            display: 'block'
          }}
        />
        <div className="text-center">
          <p className="font-condensed font-black text-xl uppercase tracking-widest" style={{ color: c.dot }}>
            {label}
          </p>
          {showMessage && simpleMessage && (
            <p className="font-sans text-sm text-[#6B7280] mt-1">{simpleMessage}</p>
          )}
        </div>
      </div>
    );
  }

  // md (default)
  return (
    <div className="flex items-start gap-2.5">
      <span
        className="rounded-full shrink-0 mt-0.5"
        style={{ width: 12, height: 12, background: c.dot, boxShadow: `0 0 0 3px ${c.shadow}` }}
      />
      <div>
        <p className="font-condensed font-black text-sm uppercase tracking-wide" style={{ color: c.dot }}>
          {label}
        </p>
        {showMessage && simpleMessage && (
          <p className="font-sans text-xs text-[#6B7280] mt-0.5">{simpleMessage}</p>
        )}
      </div>
    </div>
  );
}
