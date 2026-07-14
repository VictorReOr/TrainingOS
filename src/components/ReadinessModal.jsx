import React, { useState } from 'react';
import { useReadiness } from '../context/ReadinessContext';
import { calculateReadinessAdjuster } from '../utils/overloadEngine';
import { Heart, Activity, CheckCircle2, ChevronRight } from 'lucide-react';

const WELLNESS_QUESTIONS = [
  { key: 'sleep', label: 'Calidad del Sueño', desc: '¿Cómo dormiste anoche?', emojis: ['🥱', '😴', '😐', '🙂', '🤩'] },
  { key: 'stress', label: 'Estrés General', desc: 'Estrés mental fuera del entreno', emojis: ['🤯', '😰', '😐', '😌', '🧘'] },
  { key: 'doms', label: 'Agujetas / Dolor local', desc: 'Nivel de agujetas musculares', emojis: ['🔥', '🤕', '😐', '👍', '💪'] },
  { key: 'fatigue', label: 'Fatiga General', desc: 'Nivel de cansancio corporal', emojis: ['🪫', '🥱', '😐', '🔋', '⚡'] }
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
    // 1. Guardar Wellness
    const wellRecord = await saveWellness(wellness);

    // 2. Guardar CMJ si se introduce
    let jumpVal = null;
    if (cmjToday && !isNaN(parseFloat(cmjToday))) {
      jumpVal = parseFloat(cmjToday);
      await saveCMJ(jumpVal);
    }

    // 3. Calcular Ajuste de Readiness
    const adjuster = calculateReadinessAdjuster(wellRecord, jumpVal, cmjStats.avg30d);
    
    // Almacenar factor temporal de readiness de hoy en sessionStorage para autorregular la carga
    sessionStorage.setItem('trainingos_today_readiness', JSON.stringify({
      factor: adjuster.loadFactor,
      modifier: adjuster.seriesModifier,
      score: adjuster.readinessScore,
      status: adjuster.status
    }));

    // Disparar evento para que la sesión activa se actualice reactivamente
    window.dispatchEvent(new Event('readiness_checkin_completed'));

    setReadinessVal(adjuster.readinessScore);
    setResultMessage(adjuster.message);
    setStep(3);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end md:justify-center md:items-center bg-black/60 backdrop-blur-sm animate-fade-in">
      {/* Container */}
      <div 
        className="w-full md:max-w-md bg-white rounded-t-[32px] md:rounded-[32px] px-6 pt-5 pb-[calc(1.5rem+var(--safe-bottom))] shadow-2xl relative animate-slide-up flex flex-col max-h-[85vh] md:max-h-[90vh]"
      >
        <div className="w-10 h-1 bg-[#E8E8E4] rounded-full mx-auto mb-5 md:hidden" />

        {/* STEP 1: WELLNESS */}
        {step === 1 && (
          <div className="flex flex-col flex-1 overflow-y-auto hide-scrollbar">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="text-[#FF6B00]" size={20} />
              <span className="text-[10px] font-black tracking-widest text-[#FF6B00] uppercase">Check-in Diario</span>
            </div>
            <h3 className="font-condensed font-black text-2xl text-[#1C1C1E] mb-2 leading-none">¿CÓMO TE ENCUENTRAS HOY?</h3>
            <p className="text-xs text-[#6E6E73] mb-5 leading-normal">
              Contesta estas 4 preguntas rápidas para regular la carga de entrenamiento científica del día.
            </p>

            <div className="space-y-5 flex-1">
              {WELLNESS_QUESTIONS.map(q => (
                <div key={q.key} className="flex flex-col">
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="text-sm font-bold text-[#1C1C1E]">{q.label}</label>
                    <span className="text-[10px] text-[#6E6E73] font-semibold">{q.desc}</span>
                  </div>
                  
                  {/* Emojis Selector */}
                  <div className="grid grid-cols-5 gap-2 bg-[#F5F5F0] p-1.5 rounded-2xl border border-[#E8E8E4]">
                    {[1, 2, 3, 4, 5].map(val => {
                      const active = wellness[q.key] === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleWellnessChange(q.key, val)}
                          className={`py-2 text-xl rounded-xl transition-all duration-200 flex flex-col items-center gap-0.5 ${
                            active 
                              ? 'bg-white shadow border border-transparent scale-105' 
                              : 'hover:bg-white/40 border border-transparent text-[#6E6E73]'
                          }`}
                        >
                          <span>{q.emojis[val - 1]}</span>
                          <span className="text-[10px] font-black">{val}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleNextStep}
              className="mt-6 w-full py-4 bg-[#FF6B00] text-white font-condensed font-black text-lg rounded-2xl shadow-[0_4px_16px_rgba(255,107,0,0.3)] active:scale-[0.98] transition-transform flex justify-center items-center gap-1"
            >
              SIGUIENTE PASO <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 2: CMJ TEST (OPTIONAL) */}
        {step === 2 && (
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="text-[#FF6B00]" size={20} />
              <span className="text-[10px] font-black tracking-widest text-[#FF6B00] uppercase">Test Opcional</span>
            </div>
            <h3 className="font-condensed font-black text-2xl text-[#1C1C1E] mb-2 leading-none">TEST DE SALTO CMJ</h3>
            <p className="text-xs text-[#6E6E73] mb-5 leading-normal">
              Introduce la altura de tu salto vertical hoy (en cm). La pérdida de potencia en CMJ es el mejor indicador objetivo de fatiga neuromuscular.
            </p>

            <div className="bg-[#F5F5F0] border border-[#E8E8E4] rounded-2xl p-4 mb-5 text-center">
              <span className="text-[10px] text-[#6E6E73] font-bold uppercase tracking-wider block mb-1">Tu Media de 30 Días</span>
              <span className="font-condensed font-black text-3xl text-[#1C1C1E]">
                {cmjStats.avg30d > 0 ? `${cmjStats.avg30d} cm` : 'Sin datos'}
              </span>
            </div>

            <div className="flex flex-col gap-2 mb-6">
              <label className="text-xs font-bold text-[#6E6E73] uppercase tracking-wider pl-1">Altura de Salto Hoy (cm)</label>
              <input
                type="number"
                inputMode="decimal"
                placeholder="Ej. 38.5"
                value={cmjToday}
                onChange={e => setCmjToday(e.target.value)}
                className="w-full bg-[#F5F5F0] border border-[#E8E8E4] rounded-2xl py-3 px-4 text-center text-xl font-bold focus:border-[#FF6B00] outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleSaveAll}
                className="w-full py-4 bg-[#FF6B00] text-white font-condensed font-black text-lg rounded-2xl shadow-[0_4px_16px_rgba(255,107,0,0.3)] active:scale-[0.98] transition-transform"
              >
                COMPLETAR CHECK-IN
              </button>
              <button
                onClick={handleSaveAll}
                className="w-full py-3 bg-white text-[#6E6E73] font-bold text-sm hover:text-[#1C1C1E] transition-colors"
              >
                Saltar este test
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: RESULT */}
        {step === 3 && (
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-16 h-16 bg-[#FFF3EC] rounded-full flex items-center justify-center text-[#FF6B00] mb-4">
              <CheckCircle2 size={36} />
            </div>
            <span className="text-[10px] font-black tracking-widest text-[#FF6B00] uppercase mb-1">Disposición Analizada</span>
            <h3 className="font-condensed font-black text-3xl text-[#1C1C1E] mb-2 leading-none">
              READINESS: {Math.round(readinessVal * 100)}%
            </h3>
            
            <p className="text-sm text-[#1C1C1E] font-medium max-w-[280px] leading-relaxed mb-6">
              {resultMessage}
            </p>

            <button
              onClick={onClose}
              className="w-full py-4 bg-[#1C1C1E] text-white font-condensed font-black text-lg rounded-2xl active:scale-[0.98] transition-transform tracking-wide"
            >
              INICIAR SESIÓN AHORA
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
