import React, { useState } from 'react';
import { useReadiness } from '../context/ReadinessContext';
import { calculateReadinessAdjuster } from '../utils/overloadEngine';
import { ChevronRight, Check } from 'lucide-react';

const WELLNESS_QUESTIONS = [
  { key: 'sleep', label: 'Calidad del Sueño', desc: 'Sueño de anoche', labels: ['Muy mala', 'Mala', 'Normal', 'Buena', 'Excelente'] },
  { key: 'stress', label: 'Estrés General', desc: 'Estrés mental', labels: ['Muy alto', 'Alto', 'Normal', 'Bajo', 'Ninguno'] },
  { key: 'doms', label: 'Agujetas / Dolor', desc: 'Dolor muscular', labels: ['Extremo', 'Fuerte', 'Normal', 'Leve', 'Ninguno'] },
  { key: 'fatigue', label: 'Fatiga General', desc: 'Cansancio corporal', labels: ['Extrema', 'Alta', 'Normal', 'Baja', 'Ninguna'] }
];

export default function ReadinessModal({ onClose }) {
  const { saveWellness, saveCMJ, cmjStats } = useReadiness();
  
  const [step, setStep] = useState(1); // 1: Wellness, 2: CMJ (Opcional), 3: Result
  const [wellness, setWellness] = useState({ sleep: 3, stress: 3, doms: 3, fatigue: 3 });
  const [cmjToday, setCmjToday] = useState('');
  const [resultMessage, setResultMessage] = useState('');
  const [readinessVal, setReadinessVal] = useState(0);

  const handleWellnessChange = (key, val) => {
    setWellness(prev => ({ ...prev, [key]: val }));
  };

  const handleNextStep = () => {
    setStep(2);
  };

  const handleSaveAll = async () => {
    const wellRecord = await saveWellness(wellness);

    let jumpVal = null;
    if (cmjToday && !isNaN(parseFloat(cmjToday))) {
      jumpVal = parseFloat(cmjToday);
      await saveCMJ(jumpVal);
    }

    const adjuster = calculateReadinessAdjuster(wellRecord, jumpVal, cmjStats.avg30d);
    
    sessionStorage.setItem('trainingos_today_readiness', JSON.stringify({
      factor: adjuster.loadFactor,
      modifier: adjuster.seriesModifier,
      score: adjuster.readinessScore,
      status: adjuster.status
    }));

    window.dispatchEvent(new Event('readiness_checkin_completed'));

    setReadinessVal(adjuster.readinessScore);
    setResultMessage(adjuster.message);
    setStep(3);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end md:justify-center md:items-center bg-black/50 backdrop-blur-xs animate-fade-in">
      {/* Container */}
      <div 
        className="w-full md:max-w-md bg-card rounded-t-2xl md:rounded-2xl border-t border-l border-r md:border border-border px-6 pt-5 pb-[calc(1.5rem+var(--safe-bottom))] shadow-lg relative animate-slide-up flex flex-col max-h-[85vh] md:max-h-[90vh]"
      >
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5 md:hidden" />

        {/* STEP 1: WELLNESS */}
        {step === 1 && (
          <div className="flex flex-col flex-1 overflow-y-auto hide-scrollbar">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-[8px] text-corner-blue font-bold tracking-widest uppercase border border-corner-blue/40 px-1.5 py-0.5 rounded">
                FICHA DE CONTROL
              </span>
            </div>
            <h3 className="font-display font-black text-2.5xl text-ink mb-1 uppercase tracking-wide">¿CÓMO TE ENCUENTRAS HOY?</h3>
            <p className="font-mono text-[10px] text-muted mb-5 uppercase tracking-wider leading-relaxed">
              Contesta estas 4 preguntas rápidas para regular la carga de entrenamiento científica del día.
            </p>

            <div className="space-y-5 flex-1">
              {WELLNESS_QUESTIONS.map(q => {
                const currentRating = wellness[q.key];
                return (
                  <div key={q.key} className="flex flex-col">
                    <div className="flex justify-between items-baseline mb-2">
                      <label className="font-condensed font-black text-sm uppercase text-ink tracking-wide">{q.label}</label>
                      <span className="font-mono text-[9px] text-muted uppercase tracking-wider">{q.desc}</span>
                    </div>
                    
                    {/* Scale Selector */}
                    <div className="grid grid-cols-5 gap-1.5 bg-bg/25 p-1.5 rounded-xl border border-border">
                      {[1, 2, 3, 4, 5].map(val => {
                        const active = currentRating === val;
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handleWellnessChange(q.key, val)}
                            className={`py-2 text-xs font-mono font-bold rounded-lg transition-all border cursor-pointer ${
                              active 
                                ? 'bg-signal-orange border-signal-orange text-ink font-black scale-105 shadow-none' 
                                : 'bg-card border-border text-muted hover:border-signal-orange'
                            }`}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                    {/* Selected state text label */}
                    <span className="font-mono text-[8px] text-signal-orange uppercase tracking-widest mt-1.5 font-bold">
                      ESTADO: {q.labels[currentRating - 1]}
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleNextStep}
              className="mt-6 w-full py-3.5 bg-signal-orange text-ink font-display font-black text-xl rounded-xl active:scale-[0.98] transition-transform flex justify-center items-center gap-1 uppercase tracking-wider cursor-pointer"
            >
              Siguiente Paso <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 2: CMJ TEST (OPTIONAL) */}
        {step === 2 && (
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-[8px] text-corner-blue font-bold tracking-widest uppercase border border-corner-blue/40 px-1.5 py-0.5 rounded">
                TEST NEUROMUSCULAR
              </span>
            </div>
            <h3 className="font-display font-black text-2.5xl text-ink mb-1 uppercase tracking-wide">TEST DE SALTO CMJ</h3>
            <p className="font-mono text-[10px] text-muted mb-5 uppercase tracking-wider leading-relaxed">
              Introduce la altura de tu salto vertical hoy (en cm). La pérdida de potencia en CMJ es el mejor indicador objetivo de fatiga neuromuscular.
            </p>

            <div className="bg-bg/25 border border-border rounded-xl p-4 mb-5 text-center">
              <span className="font-mono text-[9px] text-muted font-bold uppercase tracking-wider block mb-1">Tu Media de 30 Días</span>
              <span className="font-display font-black text-3xl text-ink">
                {cmjStats.avg30d > 0 ? `${cmjStats.avg30d} CM` : 'SIN DATOS'}
              </span>
            </div>

            <div className="flex flex-col gap-2 mb-6">
              <label className="font-mono text-[9px] text-muted uppercase tracking-widest pl-1 font-bold">Altura de Salto Hoy (cm)</label>
              <input
                type="number"
                inputMode="decimal"
                placeholder="Ej. 38.5"
                value={cmjToday}
                onChange={e => setCmjToday(e.target.value)}
                className="w-full bg-bg/25 border border-border rounded-xl py-3 px-4 text-center text-xl font-mono font-bold text-ink focus:border-signal-orange outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleSaveAll}
                className="w-full py-3.5 bg-signal-orange text-ink font-display font-black text-xl rounded-xl active:scale-[0.98] transition-transform uppercase tracking-wider cursor-pointer"
              >
                COMPLETAR CHECK-IN
              </button>
              <button
                onClick={handleSaveAll}
                className="w-full py-2.5 text-muted font-mono font-bold text-xs uppercase tracking-wider hover:text-ink transition-colors cursor-pointer"
              >
                Saltar este test
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: RESULT */}
        {step === 3 && (
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-20 h-6 border border-corner-blue text-corner-blue flex items-center justify-center mx-auto mb-4 font-mono font-bold text-[9px] uppercase tracking-wider rounded">
              COMPLETADO
            </div>
            <span className="font-mono text-[9px] text-muted tracking-widest uppercase mb-1 font-bold">ANÁLISIS COMPLETADO</span>
            <h3 className="font-display font-black text-3.5xl text-ink mb-1 uppercase tracking-wide">
              READINESS: <span className="text-signal-orange">{Math.round(readinessVal * 100)}%</span>
            </h3>
            
            <p className="font-sans text-sm text-ink font-medium max-w-[280px] leading-relaxed mb-6">
              {resultMessage}
            </p>

            <button
              onClick={onClose}
              className="w-full py-3.5 bg-ink text-white font-display font-black text-xl rounded-xl active:scale-[0.98] transition-transform tracking-wider uppercase cursor-pointer hover:bg-ink/90"
            >
              INICIAR SESIÓN AHORA
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
