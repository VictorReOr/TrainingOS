import React from 'react';

function getValueColor(value, inverted = false) {
  const v = inverted ? 100 - value : value;
  if (v <= 30)  return '#27ae60';
  if (v <= 60)  return '#f5a623';
  if (v <= 80)  return '#e67e22';
  return '#e8412a';
}

const TREND_ICONS = { increasing: '↑', stable: '→', decreasing: '↓' };

export default function IndexCard({
  title, icon, value, label, detail, confidence = 1,
  trend, color, expandable = false, inverted = false
}) {
  const barColor = color ?? getValueColor(value, inverted);
  const trendIcon = TREND_ICONS[trend] ?? '';

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-base">{icon}</span>
          <span className="text-eyebrow text-[#6B7280]">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {trendIcon && (
            <span className="font-mono text-xs font-bold" style={{ color: barColor }}>
              {trendIcon}
            </span>
          )}
          <span className="font-mono font-bold text-xs text-[#6B7280] uppercase tracking-wider">
            {label}
          </span>
        </div>
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1.5">
        <span className="text-display text-3xl leading-none" style={{ color: barColor }}>
          {value ?? '--'}
        </span>
        <span className="text-meta uppercase">/100</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(value ?? 0, 100)}%`, background: barColor }}
        />
      </div>

      {/* Detail */}
      {detail && (
        <p className="text-meta leading-snug line-clamp-2">{detail}</p>
      )}

      {/* Confidence badge */}
      {confidence < 1 && (
        <span className="text-meta border border-[#E5E7EB] bg-[#F3F4F6] rounded px-1.5 py-0.5 self-start">
          📊 Confianza: {Math.round(confidence * 100)}%
        </span>
      )}
    </div>
  );
}
