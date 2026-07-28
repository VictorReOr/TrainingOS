import React from 'react';

export default function ColdStartBanner({ current = 0, total = 5 }) {
  if (current >= total) return null;
  const pct = Math.round((current / total) * 100);
  const remaining = total - current;

  const messages = [
    'Registra tu primera sesión para iniciar el aprendizaje.',
    `Completa ${remaining} sesión${remaining !== 1 ? 'es' : ''} más para activar todas las métricas.`,
    `Vas por buen camino. Solo ${remaining} sesión${remaining !== 1 ? 'es' : ''} más.`,
    '¡Casi listo! Una sesión más para el motor completo.',
    'El motor está casi listo. Completa esta sesión.',
  ];
  const msg = messages[Math.min(current, messages.length - 1)];

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="text-xl shrink-0">📊</span>
        <div className="flex-1 min-w-0">
          <p className="font-condensed font-black text-sm text-[#111827] uppercase tracking-wide">
            Aprendiendo tu capacidad
          </p>
          <p className="font-mono text-[10px] text-[#6B7280] mt-0.5 uppercase tracking-wider">
            Sesión {current} de {total}
          </p>

          <div className="mt-3 h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-[#FF5A00] transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="font-mono text-[9px] text-[#6B7280] mt-1.5">{msg}</p>
        </div>
      </div>
    </div>
  );
}
