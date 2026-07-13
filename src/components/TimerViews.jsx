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
  let bgClass = 'bg-[#1e2335]';
  if (hasStarted) {
    if ((currentMode === 'countdown' || currentMode === 'rest') && timeMs <= 3000 && timeMs > 0) {
      bgClass = 'bg-red-900/40 animate-pulse';
    } else if (currentMode === 'hiit' || currentMode === 'tabata') {
      bgClass = intervalConfig.currentPhase === 'work' ? 'bg-[#1a3a2a]' : 'bg-[#1a2d42]';
    } else {
      bgClass = 'bg-[#1e2335]';
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
            className={`px-4 py-2 rounded-full whitespace-nowrap font-condensed font-bold text-sm transition-colors border ${
              (mode || activeTab) === t.id
                ? 'bg-[#FF6B00] text-white border-[#FF6B00]'
                : 'bg-white text-[#6E6E73] border-[#E8E8E4] hover:border-[#6E6E73]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    );
  };

  // ── CRONÓMETRO — números gigantes, sin anillo ──
  const renderStopwatch = () => (
    <div className={`flex flex-col items-center justify-center flex-1 ${hasStarted ? 'bg-[#1e2335] rounded-3xl mx-2 my-2' : ''}`}>
      <div
        className={`font-condensed font-black leading-none tracking-tight tabular-nums text-center ${hasStarted ? 'text-white' : 'text-[#1C1C1E]'}`}
        style={{ fontSize: 'clamp(5rem, 25vw, 11rem)' }}
      >
        {formatTime(timeMs, true)}
      </div>
      <div className="flex gap-6 mt-10">
        {hasStarted ? (
          <>
            <button onClick={isRunning ? pauseTimer : resumeTimer} className="w-16 h-16 rounded-full bg-blue text-white flex items-center justify-center">
              {isRunning ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
            </button>
            <button onClick={stopTimer} className="w-16 h-16 rounded-full bg-white/10 border-2 border-white/20 text-white flex items-center justify-center">
              <RotateCcw size={24} />
            </button>
          </>
        ) : (
          <button onClick={startStopwatch} className="w-20 h-20 rounded-full bg-green text-white flex items-center justify-center shadow-lg shadow-green/20">
            <Play size={36} className="ml-2" />
          </button>
        )}
      </div>
    </div>
  );

  // ── CUENTA ATRÁS — con anillo ──
  const renderCountdown = () => (
    <div className={`flex flex-col items-center justify-center flex-1 ${hasStarted ? 'bg-[#1e2335] rounded-3xl mx-2 my-2' : ''}`}>
      {!hasStarted ? (
        <div className="flex items-center gap-4 mb-12">
          <div className="flex flex-col items-center">
            <div className="w-28 h-28 bg-white rounded-2xl border border-[#E8E8E4] shadow-md flex items-center justify-center">
              <input
                type="number"
                value={cdMins}
                onChange={e => setCdMins(e.target.value)}
                className="w-full h-full bg-transparent text-[#1C1C1E] text-5xl font-condensed font-black text-center outline-none rounded-2xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <span className="text-[#6E6E73] font-bold text-xs mt-2 tracking-wider">MINUTOS</span>
          </div>
          <span className="text-4xl font-black text-[#6E6E73] pb-6">:</span>
          <div className="flex flex-col items-center">
            <div className="w-28 h-28 bg-white rounded-2xl border border-[#E8E8E4] shadow-md flex items-center justify-center">
              <input
                type="number"
                value={cdSecs}
                onChange={e => setCdSecs(e.target.value)}
                className="w-full h-full bg-transparent text-[#1C1C1E] text-5xl font-condensed font-black text-center outline-none rounded-2xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <span className="text-[#6E6E73] font-bold text-xs mt-2 tracking-wider">SEGUNDOS</span>
          </div>
        </div>
      ) : (
        <CountdownRing progress={getCountdownProgress()} stroke={20}>
          <div
            className="font-condensed font-black leading-none tracking-tight text-white tabular-nums text-center"
            style={{ fontSize: 'clamp(4rem, 18vw, 6rem)' }}
          >
            {formatTime(timeMs)}
          </div>
        </CountdownRing>
      )}

      <div className="flex gap-6 mt-10">
        {hasStarted ? (
          <>
            <button onClick={isRunning ? pauseTimer : resumeTimer} className="w-16 h-16 rounded-full bg-blue text-white flex items-center justify-center">
              {isRunning ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
            </button>
            <button onClick={stopTimer} className="w-16 h-16 rounded-full bg-white/10 border-2 border-white/20 text-white flex items-center justify-center">
              <Square size={24} />
            </button>
          </>
        ) : (
          <button 
            onClick={() => startCountdown((parseInt(cdMins||0)*60 + parseInt(cdSecs||0))*1000)}
            className="w-20 h-20 rounded-full bg-green text-white flex items-center justify-center shadow-lg"
          >
            <Play size={36} className="ml-2" />
          </button>
        )}
      </div>
    </div>
  );

  // ── HIIT / TABATA — con anillo ──
  const renderHiitTabata = (isTabata) => (
    <div className="flex flex-col items-center justify-center flex-1">
      {!hasStarted ? (
        isTabata ? (
          <div className="text-center mb-8">
            <h3 className="font-condensed font-bold text-4xl mb-2 text-accent">TABATA PRESET</h3>
            <p className="text-[#6E6E73] text-lg mb-8">20s Trab / 10s Desc / 8 Rondas</p>
            <button onClick={startTabata} className="w-20 h-20 mx-auto rounded-full bg-accent text-white flex items-center justify-center shadow-lg">
              <Play size={36} className="ml-2" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 w-full max-w-xs mb-8">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-[#E8E8E4] shadow-sm">
               <span className="font-semibold text-[#6E6E73]">Trabajo (s)</span>
               <input type="number" value={hiitWork} onChange={e=>setHiitWork(e.target.value)} className="w-16 bg-[#F5F5F0] text-center rounded-lg text-xl font-bold py-2 text-[#1C1C1E] border border-[#E8E8E4] outline-none focus:border-[#FF6B00] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"/>
            </div>
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-[#E8E8E4] shadow-sm">
               <span className="font-semibold text-[#6E6E73]">Descanso (s)</span>
               <input type="number" value={hiitRest} onChange={e=>setHiitRest(e.target.value)} className="w-16 bg-[#F5F5F0] text-center rounded-lg text-xl font-bold py-2 text-[#1C1C1E] border border-[#E8E8E4] outline-none focus:border-[#FF6B00] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"/>
            </div>
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-[#E8E8E4] shadow-sm">
               <span className="font-semibold text-[#6E6E73]">Rondas</span>
               <input type="number" value={hiitRounds} onChange={e=>setHiitRounds(e.target.value)} className="w-16 bg-[#F5F5F0] text-center rounded-lg text-xl font-bold py-2 text-[#1C1C1E] border border-[#E8E8E4] outline-none focus:border-[#FF6B00] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"/>
            </div>
            <button onClick={() => startHiit(parseInt(hiitWork), parseInt(hiitRest), parseInt(hiitRounds))} className="w-full py-4 mt-2 rounded-xl bg-accent text-white font-condensed font-bold text-xl">
              ¡INICIAR HIIT!
            </button>
          </div>
        )
      ) : (
        <>
          {intervalConfig.currentPhase === 'finished' ? (
             <div className="text-center">
                 <h2 className="text-4xl font-condensed font-black text-green mb-4">¡COMPLETADO!</h2>
                 <button onClick={stopTimer} className="px-6 py-2 bg-white rounded-full text-[#6E6E73] border border-[#E8E8E4]">Volver</button>
             </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full flex-1">
              <div className="text-lg font-condensed font-bold tracking-widest text-white/60 mb-3 uppercase">
                Ronda {intervalConfig.currentRound} / {intervalConfig.rounds}
              </div>
              
              <div className={`px-5 py-1.5 rounded-lg text-lg font-condensed font-black tracking-widest uppercase mb-6 ${intervalConfig.currentPhase === 'work' ? 'bg-green/20 text-green' : 'bg-blue/20 text-blue'}`}>
                {intervalConfig.currentPhase === 'work' ? 'TRABAJO' : 'DESCANSO'}
              </div>

              <CountdownRing
                progress={getHiitProgress()}
                stroke={20}
                color={intervalConfig.currentPhase === 'work' ? '#27ae60' : '#3d7dd4'}
              >
                <div
                  className="font-condensed font-black leading-none tracking-tight text-white tabular-nums text-center"
                  style={{ fontSize: 'clamp(4rem, 18vw, 6rem)' }}
                >
                  {formatTime(timeMs)}
                </div>
              </CountdownRing>

              <div className="flex gap-6 w-full justify-center mt-8">
                <button onClick={isRunning ? pauseTimer : resumeTimer} className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-[#1C1C1E]">
                  {isRunning ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
                </button>
                <button onClick={stopTimer} className="w-16 h-16 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-white">
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
    <div className="flex flex-col items-center justify-center flex-1 text-white">
      {!hasStarted ? (
        <div className="w-full flex-1 flex flex-col items-center justify-center">
           <h3 className="font-condensed text-[#6E6E73] mb-8 text-xl">Descanso Rápido</h3>
           <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
              {[30, 60, 90, 120, 180].map(s => (
                 <button key={s} onClick={() => startRest(s)} className="py-4 bg-white rounded-xl border border-[#E8E8E4] font-condensed font-bold text-2xl text-[#1C1C1E] hover:border-accent shadow-sm">
                    {s}s
                 </button>
              ))}
           </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center flex-1">
           <div className="text-white/60 font-condensed text-xl tracking-widest mb-6">DESCANSANDO</div>
           
           <CountdownRing progress={getCountdownProgress()} stroke={20}>
             <div
               className="font-condensed font-black leading-none tracking-tight text-white tabular-nums text-center"
               style={{ fontSize: 'clamp(4rem, 18vw, 6rem)' }}
             >
               {formatTime(timeMs)}
             </div>
           </CountdownRing>
           
           <div className="flex gap-4 mt-10">
             <button onClick={stopTimer} className="flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white font-bold font-condensed hover:bg-white/20">
                <Square size={20} /> PARAR
             </button>
             {timeMs > 0 && asModal && (
               <button onClick={stopTimer} className="flex items-center gap-2 px-6 py-3 bg-blue/20 text-blue border border-blue/30 rounded-xl font-bold font-condensed shadow-lg">
                  <FastForward size={20} /> SALTAR
               </button>
             )}
           </div>
        </div>
      )}
    </div>
  );

  // Page wrapper
  const pageWrapperClass = !asModal
    ? (hasStarted ? `${bgClass} transition-colors duration-500` : 'bg-[#F5F5F0]')
    : `${bgClass} rounded-t-3xl h-full transition-colors duration-500`;

  return (
    <div className={`flex flex-col flex-1 w-full ${pageWrapperClass} ${!asModal ? 'relative' : ''}`}>
      {asModal && (
        <div className="flex justify-between items-center px-6 pt-4 pb-2 border-b border-white/5 shrink-0">
           <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-3"></div>
           <span className="font-condensed font-bold text-accent tracking-widest">TIMER GLOBAL</span>
           <button onClick={onCloseModal} className="p-1.5 bg-white/10 text-white/60 rounded-full hover:text-white ml-auto shrink-0 z-10 relative">
             <X size={20} />
           </button>
        </div>
      )}
      
      <div className={`flex flex-col flex-1 px-0 overflow-hidden ${asModal ? 'py-4 px-4' : 'pt-2 pb-0'}`}>
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
