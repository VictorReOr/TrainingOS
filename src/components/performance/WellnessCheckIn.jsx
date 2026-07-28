import React, { useState } from 'react';
import { useReadiness } from '../../context/ReadinessContext';

const METRICS = [
  {
    key: 'sleep',
    label: 'Sueño',
    icon: '😴',
    options: ['😴','😐','🙂','😊','🤩'],
    descriptions: ['Muy malo','Malo','Regular','Bueno','Excelente'],
  },
  {
    key: 'stress',
    label: 'Estrés',
    icon: '😤',
    options: ['😤','😟','😐','🙂','😊'],
    descriptions: ['Muy alto','Alto','Moderado','Bajo','Sin estrés'],
    inverted: true, // 1=bad, 5=good
  },
  {
    key: 'energy',  // mapped to 'fatigue' inverted in saveWellness
    label: 'Energía',
    icon: '⚡',
    options: ['😴','😐','🙂','😊','🤩'],
    descriptions: ['Sin energía','Poca','Normal','Buena','Excelente'],
  },
  {
    key: 'doms',
    label: 'Dolor muscular',
    icon: '🦵',
    options: ['🤩','😊','😐','😟','😤'],
    descriptions: ['Sin dolor','Leve','Moderado','Fuerte','Muy fuerte'],
  },
];

export default function WellnessCheckIn({ onDismiss }) {
  const { saveWellness } = useReadiness();

  const [values, setValues] = useState({
    sleep: null, stress: null, energy: null, doms: null,
  });
  const [weight, setWeight] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const allFilled = Object.values(values).every(v => v !== null);

  const handleSelect = (key, val) => setValues(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    if (!allFilled || submitting) return;
    setSubmitting(true);
    try {
      // Map energy (1-5) → fatigue (5-1, inverted: high energy = low fatigue)
      const fatigueVal = values.energy ? 6 - values.energy : 3;
      await saveWellness({
        sleep:   values.sleep,
        stress:  values.stress,
        doms:    values.doms,
        fatigue: fatigueVal,
      });
      onDismiss?.();
    } catch (e) {
      console.error('[WellnessCheckIn] Error:', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-[80] animate-fade-in"
        onClick={onDismiss}
      />

      {/* Bottom sheet */}
      <div
        className="fixed bottom-0 left-0 w-full z-[81] bg-white rounded-t-2xl border-t border-[#E5E7EB] shadow-xl animate-slide-up"
        style={{ maxHeight: '88vh', overflowY: 'auto', paddingBottom: 'calc(1.5rem + var(--safe-bottom, 0px))' }}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-[#E5E7EB] rounded-full mx-auto mt-4 mb-5" />

        <div className="px-5 pb-2">
          <h2 className="font-condensed font-black text-2xl text-[#111827] uppercase tracking-wide">
            ☀️ ¿Cómo has llegado hoy?
          </h2>
          <p className="font-sans text-xs text-[#6B7280] mt-1">
            El engine ajustará las recomendaciones según tu estado.
          </p>
        </div>

        <div className="px-5 mt-4 flex flex-col gap-5">
          {METRICS.map(metric => (
            <div key={metric.key}>
              <label className="font-condensed font-bold text-sm text-[#111827] uppercase tracking-wide flex items-center gap-1.5">
                {metric.icon} {metric.label}
              </label>
              <div className="flex gap-2 mt-2">
                {metric.options.map((emoji, i) => {
                  const val = i + 1;
                  const isSelected = values[metric.key] === val;
                  return (
                    <button
                      key={val}
                      onClick={() => handleSelect(metric.key, val)}
                      title={metric.descriptions[i]}
                      className={`flex-1 py-2.5 text-xl rounded-xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#FF5A00] bg-[#FFF3EE] scale-105'
                          : 'border-[#E5E7EB] bg-[#F3F4F6] hover:border-[#FF5A00]/50'
                      }`}
                    >
                      {emoji}
                    </button>
                  );
                })}
              </div>
              {values[metric.key] && (
                <p className="font-mono text-[9px] text-[#6B7280] mt-1 text-center uppercase tracking-wider">
                  {metric.descriptions[values[metric.key] - 1]}
                </p>
              )}
            </div>
          ))}

          {/* Weight (optional) */}
          <div>
            <label className="font-condensed font-bold text-sm text-[#111827] uppercase tracking-wide">
              ⚖️ Peso (opcional)
            </label>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="number"
                inputMode="decimal"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                placeholder="70.5"
                className="flex-1 bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl px-4 py-2.5 font-mono text-sm text-[#111827] focus:border-[#FF5A00] outline-none transition-colors"
              />
              <span className="font-mono font-bold text-sm text-[#6B7280]">kg</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 mt-6 flex gap-3">
          <button
            onClick={onDismiss}
            className="flex-1 py-3.5 border border-[#E5E7EB] text-[#6B7280] font-condensed font-black text-base uppercase tracking-wide rounded-2xl hover:border-[#111827] transition-colors cursor-pointer"
          >
            Ahora no
          </button>
          <button
            onClick={handleSubmit}
            disabled={!allFilled || submitting}
            className={`flex-2 flex-grow-[2] py-3.5 font-condensed font-black text-base uppercase tracking-wide rounded-2xl transition-all cursor-pointer ${
              allFilled && !submitting
                ? 'bg-[#FF5A00] text-white hover:opacity-90 active:scale-[0.98]'
                : 'bg-[#E5E7EB] text-[#6B7280] cursor-not-allowed'
            }`}
          >
            {submitting ? 'Guardando...' : 'Registrar →'}
          </button>
        </div>
      </div>
    </>
  );
}
