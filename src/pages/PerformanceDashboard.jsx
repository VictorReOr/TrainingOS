import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { usePerformanceEngine } from '../hooks/usePerformanceEngine';
import { useReadiness } from '../context/ReadinessContext';
import { useAthlete } from '../context/AthleteContext';
import TrafficLightBadge from '../components/performance/TrafficLightBadge';
import IndexCard from '../components/performance/IndexCard';
import RecommendationCard from '../components/performance/RecommendationCard';
import ColdStartBanner from '../components/performance/ColdStartBanner';
import WellnessCheckIn from '../components/performance/WellnessCheckIn';

export default function PerformanceDashboard() {
  const navigate = useNavigate();
  const {
    output, isEnabled, isColdStart,
    coldStartProgress, coldStartTotal,
    globalTrafficLight, recommendations,
    indices
  } = usePerformanceEngine();

  const { todayCheckIn } = useReadiness();
  const { athlete } = useAthlete();

  const [showAllRecs, setShowAllRecs] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);

  const hasCheckedInToday = todayCheckIn !== null;
  const sport = athlete?.activeSport ?? 'gym';
  const showTKD = sport === 'tkd' || sport === 'all';

  const visibleRecs = showAllRecs
    ? recommendations
    : recommendations.slice(0, 3);

  // Index card configs
  const indexCards = [
    {
      key: 'fatigue',
      title: 'Fatiga',
      icon: '🔥',
      inverted: false,
      detail: indices?.fatigue?.detail
    },
    {
      key: 'recovery',
      title: 'Recuperación',
      icon: '💚',
      inverted: true,
      detail: indices?.recovery?.detail
    },
    {
      key: 'stimulus',
      title: 'Estímulo',
      icon: '⚡',
      inverted: true,
      detail: indices?.stimulus?.detail
    },
    {
      key: 'progression',
      title: 'Progresión',
      icon: '📈',
      inverted: true,
      detail: indices?.progression?.detail
    },
    {
      key: 'patternBalance',
      title: 'Equilibrio',
      icon: '⚖️',
      inverted: true,
      detail: indices?.patternBalance?.detail
    },
    {
      key: 'sportTransfer',
      title: 'Transfer TKD',
      icon: '🥋',
      inverted: true,
      detail: indices?.sportTransfer?.detail,
      onlyTKD: true
    },
  ];

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col">

      {/* HEADER */}
      <div className="bg-white border-b border-[#E5E7EB] px-5 pt-5 pb-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827] hover:border-[#111827] transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="text-center">
            <h1 className="font-condensed font-black text-xl text-[#111827] uppercase tracking-widest">
              Performance Engine
            </h1>
            <span className="font-mono text-[9px] text-[#6B7280] uppercase tracking-widest">
              v2.0 · Fase 2
            </span>
          </div>

          <div className="w-9" /> {/* spacer */}
        </div>
      </div>

      <div
        className="flex-1 px-4 py-5 space-y-4"
        style={{ paddingBottom: 'calc(5rem + var(--safe-bottom, 0px))' }}
      >

        {/* ── 1. SEMÁFORO GLOBAL ── */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
          <p className="font-mono text-[9px] text-[#6B7280] uppercase tracking-widest mb-3">
            Estado Global
          </p>
          {globalTrafficLight ? (
            <>
              <TrafficLightBadge
                color={globalTrafficLight.color}
                label={globalTrafficLight.label}
                simpleMessage={globalTrafficLight.simpleMessage}
                size="lg"
              />
              {globalTrafficLight.action && (
                <p className="font-sans text-xs text-[#6B7280] text-center mt-2 leading-relaxed px-4">
                  {globalTrafficLight.action}
                </p>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 py-3">
              <span className="text-2xl">🔄</span>
              <p className="font-sans text-sm text-[#6B7280] text-center">
                {isEnabled ? 'Calculando estado...' : 'Motor desactivado'}
              </p>
            </div>
          )}
        </div>

        {/* ── 2. COLD START ── */}
        {isColdStart && (
          <ColdStartBanner current={coldStartProgress} total={coldStartTotal} />
        )}

        {/* ── 3. LOS 6 ÍNDICES ── */}
        <div>
          <p className="font-mono text-[9px] text-[#6B7280] uppercase tracking-widest mb-3 px-1">
            Índices de Rendimiento
          </p>
          <div className="grid grid-cols-2 gap-3">
            {indexCards.map(card => {
              if (card.onlyTKD && !showTKD) {
                return (
                  <div
                    key={card.key}
                    className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm flex flex-col gap-2 items-center justify-center opacity-50"
                  >
                    <span className="text-2xl">{card.icon}</span>
                    <p className="font-mono text-[9px] text-[#6B7280] uppercase text-center">
                      No aplica
                    </p>
                    <p className="font-mono text-[8px] text-[#6B7280] text-center">
                      Solo TKD
                    </p>
                  </div>
                );
              }

              const idx = indices?.[card.key];
              if (!idx) {
                return (
                  <div
                    key={card.key}
                    className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm flex flex-col gap-2"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{card.icon}</span>
                      <span className="font-condensed font-bold text-[10px] text-[#6B7280] uppercase tracking-widest">
                        {card.title}
                      </span>
                    </div>
                    <span className="font-condensed font-black text-3xl text-[#E5E7EB]">--</span>
                    <div className="h-2 bg-[#F3F4F6] rounded-full" />
                    <p className="font-mono text-[9px] text-[#6B7280]">Sin datos</p>
                  </div>
                );
              }

              return (
                <IndexCard
                  key={card.key}
                  title={card.title}
                  icon={card.icon}
                  value={idx.value}
                  label={idx.label}
                  detail={card.detail ?? idx.detail}
                  confidence={idx.confidence ?? 1}
                  trend={idx.trend}
                  inverted={card.inverted}
                />
              );
            })}
          </div>
        </div>

        {/* ── 4. RECOMENDACIONES ── */}
        <div>
          <p className="font-mono text-[9px] text-[#6B7280] uppercase tracking-widest mb-3 px-1">
            Recomendaciones
          </p>

          {recommendations.length === 0 ? (
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm text-center">
              <span className="text-2xl">✅</span>
              <p className="font-condensed font-black text-base text-[#111827] uppercase tracking-wide mt-2">
                Sin alertas esta semana
              </p>
              <p className="font-sans text-xs text-[#6B7280] mt-1">
                Todos los indicadores dentro de rangos óptimos.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {visibleRecs.map((rec, i) => (
                <RecommendationCard
                  key={rec.id ?? i}
                  recommendation={rec}
                  readOnly={true}
                />
              ))}

              {recommendations.length > 3 && (
                <button
                  onClick={() => setShowAllRecs(v => !v)}
                  className="w-full py-3 border border-[#E5E7EB] bg-white text-[#6B7280] font-condensed font-bold text-sm uppercase tracking-wider rounded-2xl flex items-center justify-center gap-1.5 hover:border-[#111827] transition-colors cursor-pointer shadow-sm"
                >
                  {showAllRecs ? (
                    <><ChevronUp size={14} /> Ver menos</>
                  ) : (
                    <><ChevronDown size={14} /> Ver todas ({recommendations.length})</>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── 5. CHECK-IN DE HOY ── */}
        <div>
          <p className="font-mono text-[9px] text-[#6B7280] uppercase tracking-widest mb-3 px-1">
            Bienestar de Hoy
          </p>

          {hasCheckedInToday ? (
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">✅</span>
                <p className="font-condensed font-black text-sm text-[#111827] uppercase tracking-wide">
                  Check-in completado
                </p>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Sueño',   val: todayCheckIn?.sleep,   icon: '😴' },
                  { label: 'Estrés',  val: todayCheckIn?.stress,  icon: '😤' },
                  { label: 'Fatiga',  val: todayCheckIn?.fatigue, icon: '⚡' },
                  { label: 'DOMS',    val: todayCheckIn?.doms,    icon: '🦵' },
                ].map(item => (
                  <div key={item.label} className="text-center">
                    <span className="text-xl">{item.icon}</span>
                    <p className="font-mono font-black text-base text-[#111827] mt-1">
                      {item.val ?? '--'}
                    </p>
                    <p className="font-mono text-[8px] text-[#6B7280] uppercase tracking-wider">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0">☀️</span>
                <div className="flex-1">
                  <p className="font-condensed font-black text-sm text-[#111827] uppercase tracking-wide">
                    Sin check-in hoy
                  </p>
                  <p className="font-sans text-xs text-[#6B7280] mt-0.5">
                    Registra tu estado para mejorar las recomendaciones del motor.
                  </p>
                  <button
                    onClick={() => setShowCheckIn(true)}
                    className="mt-3 px-4 py-2 bg-[#FF5A00] text-white font-condensed font-black text-sm uppercase tracking-wide rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Hacer check-in →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── META INFO ── */}
        {output?.meta && (
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
            <p className="font-mono text-[9px] text-[#6B7280] uppercase tracking-widest mb-2">
              Metadatos del motor
            </p>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between">
                <span className="font-mono text-[9px] text-[#6B7280] uppercase">Versión</span>
                <span className="font-mono text-[9px] text-[#111827] font-bold">{output.meta.engineVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono text-[9px] text-[#6B7280] uppercase">Completitud datos</span>
                <span className="font-mono text-[9px] text-[#111827] font-bold">
                  {Math.round((output.meta.dataCompleteness ?? 0) * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono text-[9px] text-[#6B7280] uppercase">Cold Start</span>
                <span className={`font-mono text-[9px] font-bold ${isColdStart ? 'text-[#f5a623]' : 'text-[#27ae60]'}`}>
                  {isColdStart ? `${coldStartProgress}/${coldStartTotal}` : 'Completado ✓'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono text-[9px] text-[#6B7280] uppercase">Fase</span>
                <span className="font-mono text-[9px] text-[#111827] font-bold">
                  Fase {output.meta.phase}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Wellness modal */}
      {showCheckIn && (
        <WellnessCheckIn onDismiss={() => setShowCheckIn(false)} />
      )}
    </div>
  );
}
