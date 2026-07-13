import React, { useEffect, useRef, useState } from 'react';
import { useCircuit } from '../../context/CircuitContext';
import { useTimer } from '../../context/TimerContext';
import { playShortBeep, playLongBeep, playBell, speakText, vibrateLong, vibratePulse } from '../../utils/audio';
import { X, Play, Pause, SkipForward, SkipBack, RotateCcw } from 'lucide-react';
import CountdownRing from './CountdownRing';

const formatTime = (ms) => {
  const totalS = Math.floor(ms / 1000);
  const minutes = Math.floor(totalS / 60).toString().padStart(2, '0');
  const seconds = (totalS % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

export default function CircuitPlayer() {
  const { 
    circuitBlocks, executionStatus, setExecutionStatus, 
    currentBlockIndex, setCurrentBlockIndex,
    currentSet, setCurrentSet 
  } = useCircuit();

  const { startStopwatch, startCountdown, pauseTimer, resumeTimer, stopTimer, status, timeMs } = useTimer();

  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Trackers of phase
  const lastBeepSecRef = useRef(null);
  const blockInit = useRef(false);

  const activeBlock = circuitBlocks[currentBlockIndex] || null;
  const nextBlock = circuitBlocks[currentBlockIndex + 1] || null;

  // Montaje Inicial: Entrar en Fullscreen y lanzar Timer
  useEffect(() => {
    if (executionStatus === 'running' && !blockInit.current && activeBlock) {
       blockInit.current = true;
       // Intentar requestFullscreen nativo
       try {
         if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(e => console.warn(e));
         } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen();
            setIsFullscreen(true);
         }
       } catch(e) {}

       // Lanzar 
       startCountdown(activeBlock.timeSeconds * 1000);
       lastBeepSecRef.current = null;
    }
  }, [executionStatus]);

  // Countdown beeps 3-2-1 per second
  useEffect(() => {
    if (status === 'running' && timeMs > 0 && timeMs <= 3500) {
      const secsRemaining = Math.ceil(timeMs / 1000);
      if (secsRemaining <= 3 && secsRemaining > 0 && lastBeepSecRef.current !== secsRemaining) {
        lastBeepSecRef.current = secsRemaining;
        
        if (activeBlock?.sound === 'voice' && secsRemaining === 3) {
          // Voice announcement at 3s
          let msg = 'Completado';
          if (currentSet < activeBlock.sets) {
            msg = `Siguiente: Set ${currentSet + 1}`;
          } else if (nextBlock) {
            msg = `Siguiente: ${nextBlock.name}`;
          }
          speakText(msg);
        } else if (activeBlock?.sound !== 'none') {
          playShortBeep();
        }
        vibratePulse();
      }
    }
  }, [timeMs, status, activeBlock, nextBlock, currentSet]);

  // Detector de Fin de Temporizador (Timer completado)
  useEffect(() => {
     if (status === 'completed' && executionStatus === 'running' && activeBlock) {
        
        // Ejecutar Sonido final (a menos que haya sido voz)
        if (activeBlock.sound !== 'voice') {
           if (activeBlock.sound === 'beep_short') playShortBeep();
           else if (activeBlock.sound === 'beep_long') playLongBeep();
           else if (activeBlock.sound === 'bell') playBell();
        }
        
        vibrateLong();

        // Calcular siguiente paso
        let nextSet = currentSet + 1;
        let nextIdx = currentBlockIndex;

        if (nextSet > activeBlock.sets) {
           nextSet = 1;
           nextIdx = currentBlockIndex + 1;
        }

        if (nextIdx >= circuitBlocks.length) {
           // FIN DE CIRCUITO
           setExecutionStatus('finished');
        } else {
           // AVANZAR AUTOMÁTICO
           setCurrentSet(nextSet);
           setCurrentBlockIndex(nextIdx);
           lastBeepSecRef.current = null;
           startCountdown(circuitBlocks[nextIdx].timeSeconds * 1000);
        }
     }
  }, [status, executionStatus]);

  const handleExit = () => {
     if (window.confirm("¿Estás seguro de que quieres salir del circuito?")) {
        try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e){}
        stopTimer();
        setExecutionStatus('idle');
     }
  };

  const handleSkip = () => {
    // Fuerzo final manual
    let nextIdx = currentBlockIndex + 1;
    if (nextIdx >= circuitBlocks.length) {
       setExecutionStatus('finished');
       stopTimer();
    } else {
       setCurrentSet(1);
       setCurrentBlockIndex(nextIdx);
       lastBeepSecRef.current = null;
       startCountdown(circuitBlocks[nextIdx].timeSeconds * 1000);
    }
  };

  const handlePrev = () => {
    if (currentBlockIndex > 0) {
       let prevIdx = currentBlockIndex - 1;
       setCurrentSet(1);
       setCurrentBlockIndex(prevIdx);
       lastBeepSecRef.current = null;
       startCountdown(circuitBlocks[prevIdx].timeSeconds * 1000);
    }
  };

  if (!activeBlock) return null;

  const isWarning = timeMs <= 3000 && timeMs > 0 && status === 'running';

  if (executionStatus === 'finished') {
    return (
       <div className="fixed inset-0 z-[100] bg-[#0f1117] flex flex-col items-center justify-center p-6 text-center animate-fade-in text-white">
          <div className="w-24 h-24 bg-green/20 rounded-full flex items-center justify-center mb-8 ring-4 ring-green">
             <div className="text-5xl">🏆</div>
          </div>
          <h1 className="font-condensed font-black text-6xl text-green mb-4 shadow-black shadow-sm">CIRCUITO COMPLETADO</h1>
          <p className="text-xl text-muted font-bold mb-12">¡Buen trabajo, bestia!</p>
          
          <div className="flex gap-4 w-full max-w-sm">
             <button onClick={() => { setExecutionStatus('idle'); stopTimer(); try{document.exitFullscreen();}catch(e){} }} className="flex-1 py-4 bg-surface rounded-2xl border border-border font-bold">
                Cerrar
             </button>
             <button onClick={() => { setCurrentBlockIndex(0); setCurrentSet(1); setExecutionStatus('running'); blockInit.current=false; }} className="flex-1 py-4 bg-accent rounded-2xl text-white font-bold">
                Repetir
             </button>
          </div>
       </div>
    );
  }

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col justify-between transition-colors duration-500 ease-in-out select-none text-white ${isWarning ? 'animate-pulse' : ''}`}
      style={{ backgroundColor: activeBlock.color }}
    >
      {/* Fallback de Degradado Obscuro */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none"></div>

      {/* HEADER INFO */}
      <div className="relative z-10 p-6 pt-[var(--safe-top,24px)] flex justify-between items-center text-white/80 drop-shadow-md">
         <span className="font-condensed font-bold tracking-widest text-lg bg-black/20 px-4 py-1.5 rounded-full">
           BLOQUE {currentBlockIndex + 1} / {circuitBlocks.length}
         </span>
         <button onClick={handleExit} className="w-12 h-12 flex items-center justify-center bg-black/20 rounded-full hover:bg-black/40">
           <X size={24} />
         </button>
      </div>

      {/* CENTER CLOCK (80%) */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 pb-20 mt-[-10vh]">
         {activeBlock.sets > 1 && (
           <div className="text-2xl font-black font-condensed tracking-widest mb-4 opacity-80 uppercase bg-black/10 px-6 py-2 rounded-xl">
             Set {currentSet} de {activeBlock.sets}
           </div>
         )}
         <h2 className="text-[32px] md:text-5xl font-condensed font-black uppercase text-center max-w-[90%] break-words leading-tight drop-shadow-lg mb-6 truncate">
             {activeBlock.name}
         </h2>
         
         <CountdownRing
           progress={activeBlock.timeSeconds > 0 ? timeMs / (activeBlock.timeSeconds * 1000) : 0}
           stroke={20}
           color="rgba(255,255,255,0.9)"
         >
           <div 
             className="font-condensed font-black leading-none drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)] text-white tabular-nums text-center"
             style={{ fontSize: 'clamp(4rem, 18vw, 6rem)' }}
           >
               {formatTime(timeMs)}
           </div>
         </CountdownRing>
         
         {(activeBlock.reps || activeBlock.notes) && (
            <div className="mt-8 text-xl font-bold font-condensed tracking-widest bg-black/20 px-6 py-3 rounded-2xl max-w-xs text-center border border-white/10">
               {activeBlock.reps && <span>{activeBlock.reps} REPS<br/></span>}
            </div>
         )}
      </div>

      {/* BOTTOM AREA (Next + Controls) */}
      <div className="relative z-10 w-full flex flex-col pb-[var(--safe-bottom,24px)]">
         
         {/* Siguiente Bloque */}
         {nextBlock ? (
           <div className="w-full flex justify-between items-center px-8 py-4 bg-black/30 backdrop-blur-sm border-t border-white/10">
             <span className="text-sm font-bold uppercase tracking-widest opacity-60">Siguiente:</span>
             <div className="flex items-center gap-3">
               <span className="font-condensed text-xl font-black truncate max-w-[150px] uppercase drop-shadow">{nextBlock.name}</span>
               <div className="w-4 h-4 rounded-full border border-white/50" style={{backgroundColor: nextBlock.color}}></div>
             </div>
           </div>
         ) : (
           <div className="w-full flex justify-end items-center px-8 py-5 bg-black/30 backdrop-blur-sm border-t border-white/10">
             <span className="text-sm font-bold uppercase tracking-widest opacity-60">Último bloque del circuito</span>
           </div>
         )}

         {/* Controles de Reproducción */}
         <div className="flex justify-between items-center px-8 py-8 md:py-10 bg-black/50 backdrop-blur-md">
            <button onClick={handlePrev} disabled={currentBlockIndex === 0} className="w-14 h-14 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 disabled:opacity-30">
               <SkipBack size={24} fill="currentColor" />
            </button>
            
            <button onClick={status === 'running' ? pauseTimer : resumeTimer} className="w-24 h-24 rounded-full flex items-center justify-center bg-white text-black shadow-xl hover:scale-105 transition-transform active:scale-95">
               {status === 'running' ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-2" />}
            </button>
            
            <button onClick={handleSkip} className="w-14 h-14 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20">
               <SkipForward size={24} fill="currentColor" />
            </button>
         </div>
      </div>
    </div>
  );
}
