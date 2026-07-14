import React, { useState } from 'react';
import { useTimer } from '../context/TimerContext';
import { useCircuit } from '../context/CircuitContext';
import { Play, Pause, Square, RotateCcw, X, FastForward } from 'lucide-react';

import CircuitConfigurator from './timer/CircuitConfigurator';
import CircuitPlayer from './timer/CircuitPlayer';
import CountdownRing from './timer/CountdownRing';

const formatTime = (ms, showMs = false) => {
  const totalS = Math.floor(ms / 1000);
  const minutes = Math.floor(totalS / 60).toString().padStart(2, '0');
  const seconds = (totalS % 60).toString().padStart(2, '0');
  
  if (showMs) {
    const dec = Math.floor((ms % 1000) / 100);
    return `${minutes}:${seconds}.${dec}`;
  }
  return `${minutes}:${seconds}`;
};

export default function TimerViews({ asModal = false, onCloseModal }) {
  const { 
    mode, status, timeMs, initialTimeMs, intervalConfig, 
    startStopwatch, startCountdown, startHiit, startTabata, startRest,
    pauseTimer, resumeTimer, stopTimer
  } = useTimer();

  const { executionStatus } = useCircuit();

  const [activeTab, setActiveTab] = useState('circuit');

  // Input states para Cuenta Atrás
  const [cdMins, setCdMins] = useState(0);
  const [cdSecs, setCdSecs] = useState(0);

  // Input states para HIIT
  const [hiitWork, setHiitWork] = useState(30);
  const [hiitRest, setHiitRest] = useState(15);
  const [hiitRounds, setHiitRounds] = useState(5);

  const isRunning = status === 'running';
  const isPaused = status === 'paused';
  const hasStarted = isRunning || isPaused;
  const currentMode = mode || activeTab;

  if (executionStatus !== 'idle') {
    return <CircuitPlayer />;
  }

  // Background
  let bgClass = 'bg-bg';
  if (hasStarted) {
    if ((currentMode === 'countdown' || currentMode === 'rest') && timeMs <= 3000 && timeMs > 0) {
      bgClass = 'bg-corner-red/20 animate-pulse';
    } else if (currentMode === 'hiit' || currentMode === 'tabata') {
      bgClass = intervalConfig.currentPhase === 'work' ? 'bg-[#142B1B]' : 'bg-[#122238]';
    } else {
      bgClass = 'bg-[#14151A]';
    }
  }

  // Ring progress calculations
  const getCountdownProgress = () => {
    if (initialTimeMs <= 0) return 0;
    return Math.max(0, timeMs / initialTimeMs);
  };

  const getHiitProgress = () => {
    const phaseTotal = intervalConfig.currentPhase === 'work' ? intervalConfig.work : intervalConfig.rest;
    if (!phaseTotal || phaseTotal <= 0) return 0;
    return Math.max(0, timeMs / phaseTotal);
  };

  const renderTabs = () => {
    if (hasStarted && !asModal) return null;
    if (hasStarted && asModal && mode !== null) return null;

    const tabs = [
      { id: 'circuit', label: 'Circuitos' },
      { id: 'stopwatch', label: 'Crono' },
      { id: 'countdown', label: 'Atrás' },
      { id: 'hiit', label: 'HIIT' },
      { id: 'tabata', label: 'Tabata' }
    ];

    if (asModal) tabs.push({ id: 'rest', label: 'Rest' });

    return (
      <div className="flex overflow-x-auto gap-2 pb-2 mb-4 scrollbar-hide shrink-0">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap font-mono font-bold text-xs uppercase tracking-wider transition-colors border cursor-pointer ${
              (mode || activeTab) === t.id
                ? 'bg-signal-orange text-ink border-signal-orange font-black'
                : 'bg-card text-muted border-border hover:border-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    );
  };

  // ── CRONÓMETRO — números gigantes ──
  const renderStopwatch = () => (
    <div className={`flex flex-col items-center justify-center flex-1 ${hasStarted ? 'bg-[#14151A] border-2 border-border/10 rounded-2xl mx-2 my-2' : ''}`}>
      <div
        className={`font-display font-black leading-none tracking-tight tabular-nums text-center ${hasStarted ? 'text-signal-orange' : 'text-ink'}`}
        style={{ fontSize: 'clamp(5rem, 24vw, 10rem)' }}
      >
        {formatTime(timeMs, true)}
      </div>
      <div className="flex gap-6 mt-10">
        {hasStarted ? (
          <>
            <button onClick={isRunning ? pauseTimer : resumeTimer} className="w-16 h-16 rounded-full bg-corner-blue text-white flex items-center justify-center cursor-pointer shadow-lg">
              {isRunning ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
            </button>
            <button onClick={stopTimer} className="w-16 h-16 rounded-full bg-white/10 border-2 border-white/20 text-white flex items-center justify-center cursor-pointer">
              <RotateCcw size={24} />
            </button>
          </>
        ) : (
          <button onClick={startStopwatch} className="w-20 h-20 rounded-full bg-signal-orange text-ink flex items-center justify-center shadow-lg cursor-pointer">
            <Play size={36} className="ml-2" />
          </button>
        )}
      </div>
    </div>
  );

  // ── CUENTA ATRÁS — con anillo ──
  const renderCountdown = () => (
    <div className={`flex flex-col items-center justify-center flex-1 ${hasStarted ? 'bg-[#14151A] border-2 border-border/10 rounded-2xl mx-2 my-2' : ''}`}>
      {!hasStarted ? (
        <div className="flex items-center gap-4 mb-12">
          <div className="flex flex-col items-center">
            <div className="w-28 h-28 bg-card rounded-xl border border-border shadow-none flex items-center justify-center focus-within:border-signal-orange">
              <input
                type="number"
                value={cdMins}
                onChange={e => setCdMins(e.target.value)}
                className="w-full h-full bg-transparent text-ink text-5xl font-display font-black text-center outline-none rounded-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <span className="font-mono text-[9px] text-muted font-bold mt-2.5 tracking-wider uppercase">MINUTOS</span>
          </div>
          <span className="text-4xl font-black text-muted/40 pb-6">:</span>
          <div className="flex flex-col items-center">
            <div className="w-28 h-28 bg-card rounded-xl border border-border shadow-none flex items-center justify-center focus-within:border-signal-orange">
              <input
                type="number"
                value={cdSecs}
                onChange={e => setCdSecs(e.target.value)}
                className="w-full h-full bg-transparent text-ink text-5xl font-display font-black text-center outline-none rounded-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <span className="font-mono text-[9px] text-muted font-bold mt-2.5 tracking-wider uppercase">SEGUNDOS</span>
          </div>
        </div>
      ) : (
        <CountdownRing progress={getCountdownProgress()} stroke={20}>
          <div
            className="font-display font-black leading-none tracking-tight text-signal-orange tabular-nums text-center"
            style={{ fontSize: 'clamp(4rem, 18vw, 6rem)' }}
          >
            {formatTime(timeMs)}
          </div>
        </CountdownRing>
      )}

      <div className="flex gap-6 mt-10">
        {hasStarted ? (
          <>
            <button onClick={isRunning ? pauseTimer : resumeTimer} className="w-16 h-16 rounded-full bg-corner-blue text-white flex items-center justify-center cursor-pointer shadow-lg">
              {isRunning ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
            </button>
            <button onClick={stopTimer} className="w-16 h-16 rounded-full bg-white/10 border-2 border-white/20 text-white flex items-center justify-center cursor-pointer">
              <Square size={24} />
            </button>
          </>
        ) : (
          <button 
            onClick={() => startCountdown((parseInt(cdMins||0)*60 + parseInt(cdSecs||0))*1000)}
            className="w-20 h-20 rounded-full bg-signal-orange text-ink flex items-center justify-center shadow-lg cursor-pointer"
          >
            <Play size={36} className="ml-2" />
          </button>
        )}
      </div>
    </div>
  );

  // ── HIIT / TABATA ──
  const renderHiitTabata = (isTabata) => (
    <div className="flex flex-col items-center justify-center flex-1">
      {!hasStarted ? (
        isTabata ? (
          <div className="text-center mb-8">
            <h3 className="font-display font-black text-4xl mb-2 text-ink uppercase tracking-wide">TABATA PRESET</h3>
            <p className="font-mono text-xs text-muted mb-8 uppercase tracking-wider">20s Trab / 10s Desc / 8 Rondas</p>
            <button onClick={startTabata} className="w-20 h-20 mx-auto rounded-full bg-signal-orange text-ink flex items-center justify-center shadow-lg cursor-pointer">
              <Play size={36} className="ml-2" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 w-full max-w-xs mb-8">
            <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border shadow-none">
               <span className="font-mono text-xs text-muted font-bold uppercase tracking-wider">Trabajo (s)</span>
               <input type="number" value={hiitWork} onChange={e=>setHiitWork(e.target.value)} className="w-16 bg-bg/25 text-center rounded-lg text-lg font-mono font-bold py-2 text-ink border border-border outline-none focus:border-signal-orange [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"/>
            </div>
            <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border shadow-none">
               <span className="font-mono text-xs text-muted font-bold uppercase tracking-wider">Descanso (s)</span>
               <input type="number" value={hiitRest} onChange={e=>setHiitRest(e.target.value)} className="w-16 bg-bg/25 text-center rounded-lg text-lg font-mono font-bold py-2 text-ink border border-border outline-none focus:border-signal-orange [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"/>
            </div>
            <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border shadow-none">
               <span className="font-mono text-xs text-muted font-bold uppercase tracking-wider">Rondas</span>
               <input type="number" value={hiitRounds} onChange={e=>setHiitRounds(e.target.value)} className="w-16 bg-bg/25 text-center rounded-lg text-lg font-mono font-bold py-2 text-ink border border-border outline-none focus:border-signal-orange [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"/>
            </div>
            <button onClick={() => startHiit(parseInt(hiitWork), parseInt(hiitRest), parseInt(hiitRounds))} className="w-full py-3.5 mt-2 rounded-xl bg-signal-orange text-ink font-display font-black text-xl uppercase tracking-wider cursor-pointer">
              ¡INICIAR HIIT!
            </button>
          </div>
        )
      ) : (
        <>
          {intervalConfig.currentPhase === 'finished' ? (
             <div className="text-center">
                 <h2 className="text-4xl font-display font-black text-success-green mb-4 uppercase tracking-wider">¡COMPLETADO!</h2>
                 <button onClick={stopTimer} className="px-6 py-2 bg-card rounded-xl text-muted border border-border font-mono text-xs font-bold uppercase tracking-wider cursor-pointer">Volver</button>
             </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full flex-1">
              <div className="text-sm font-mono font-bold tracking-widest text-white/50 mb-3 uppercase">
                Ronda {intervalConfig.currentRound} / {intervalConfig.rounds}
              </div>
              
              <div className={`px-5 py-1.5 rounded-lg text-sm font-mono font-black tracking-widest uppercase mb-6 ${intervalConfig.currentPhase === 'work' ? 'bg-success-green/20 text-success-green' : 'bg-corner-blue/20 text-corner-blue'}`}>
                {intervalConfig.currentPhase === 'work' ? 'TRABAJO' : 'DESCANSO'}
              </div>

              <CountdownRing
                progress={getHiitProgress()}
                stroke={20}
                color={intervalConfig.currentPhase === 'work' ? 'var(--color-success-green)' : 'var(--color-corner-blue)'}
              >
                <div
                  className="font-display font-black leading-none tracking-tight text-white tabular-nums text-center"
                  style={{ fontSize: 'clamp(4rem, 18vw, 6rem)' }}
                >
                  {formatTime(timeMs)}
                </div>
              </CountdownRing>

              <div className="flex gap-6 w-full justify-center mt-8">
                <button onClick={isRunning ? pauseTimer : resumeTimer} className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-ink cursor-pointer">
                  {isRunning ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
                </button>
                <button onClick={stopTimer} className="w-16 h-16 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-white cursor-pointer">
                  <Square size={24} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  // ── REST — con anillo ──
  const renderRest = () => (
    <div className="flex flex-col items-center justify-center flex-1 text-ink">
      {!hasStarted ? (
        <div className="w-full flex-1 flex flex-col items-center justify-center">
           <h3 className="font-mono text-muted mb-8 text-xs font-bold uppercase tracking-wider">Descanso Rápido</h3>
           <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
              {[30, 60, 90, 120, 180].map(s => (
                 <button key={s} onClick={() => startRest(s)} className="py-4 bg-card rounded-xl border border-border font-display font-black text-2xl text-ink hover:border-signal-orange cursor-pointer">
                    {s}S
                 </button>
              ))}
           </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center flex-1">
           <div className="text-white/60 font-mono text-xs font-bold tracking-widest uppercase mb-6">DESCANSANDO</div>
           
           <CountdownRing progress={getCountdownProgress()} stroke={20}>
             <div
               className="font-display font-black leading-none tracking-tight text-white tabular-nums text-center"
               style={{ fontSize: 'clamp(4rem, 18vw, 6rem)' }}
             >
               {formatTime(timeMs)}
             </div>
           </CountdownRing>
           
           <div className="flex gap-4 mt-10">
             <button onClick={stopTimer} className="flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white font-bold font-mono text-xs uppercase tracking-wider cursor-pointer">
                <Square size={16} /> PARAR
             </button>
             {timeMs > 0 && asModal && (
               <button onClick={stopTimer} className="flex items-center gap-2 px-6 py-3 bg-corner-blue/20 text-white border border-corner-blue/30 rounded-xl font-bold font-mono text-xs uppercase tracking-wider cursor-pointer">
                  <FastForward size={16} /> SALTAR
               </button>
             )}
           </div>
        </div>
      )}
    </div>
  );

  // Page wrapper
  const pageWrapperClass = !asModal
    ? (hasStarted ? `${bgClass} transition-colors duration-500` : 'bg-bg')
    : `${bgClass} rounded-t-2xl h-full transition-colors duration-500`;

  return (
    <div className={`flex flex-col flex-1 w-full ${pageWrapperClass} ${!asModal ? 'relative' : ''}`}>
      {asModal && (
        <div className="flex justify-between items-center px-6 pt-4 pb-2 border-b border-white/5 shrink-0">
           <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-3"></div>
           <span className="font-mono font-bold text-signal-orange tracking-widest text-xs uppercase">TIMER GLOBAL</span>
           <button onClick={onCloseModal} className="p-1.5 bg-white/10 text-white/60 rounded-full hover:text-white ml-auto shrink-0 z-10 relative cursor-pointer">
             <X size={20} />
           </button>
        </div>
      )}
      
      <div className={`flex flex-col flex-1 px-0 overflow-hidden ${asModal ? 'py-4 px-4' : 'pt-4 pb-0'}`}>
        {(!hasStarted || asModal) && (
           <div className="px-4 shrink-0">
             {renderTabs()}
           </div>
        )}
        
        <div className="flex-1 flex flex-col overflow-hidden relative w-full h-full">
          {currentMode === 'circuit' && <CircuitConfigurator />}
          {currentMode === 'stopwatch' && renderStopwatch()}
          {currentMode === 'countdown' && renderCountdown()}
          {currentMode === 'hiit' && renderHiitTabata(false)}
          {currentMode === 'tabata' && renderHiitTabata(true)}
          {currentMode === 'rest' && renderRest()}
        </div>
      </div>
    </div>
  );
}
