// utils/audio.js
// Gestor de sonido nativo usando Web Audio API optimizado para móviles (Singleton + Multi-Frecuencia)

let _sharedCtx = null;
const audioElements = {};

// Mapeo de archivos primarios HTML5 <audio> presentes en /sounds/
const SOUND_FILES = {
  bell: '/sounds/Campana.mp4',
  whistle: '/sounds/Silbato.mp4',
};

/**
 * 1. Singleton getSharedAudioContext()
 * Crea el AudioContext una sola vez (module-level variable) y lo reutiliza en todas las llamadas.
 */
export function getSharedAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtxClass) return null;

  if (!_sharedCtx) {
    try {
      _sharedCtx = new AudioCtxClass();
    } catch (e) {
      console.warn('[AudioDiagnostic] Error instanciando AudioContext singleton:', e);
      return null;
    }
  }

  if (_sharedCtx.state === 'suspended') {
    _sharedCtx.resume().catch(() => {});
  }

  return _sharedCtx;
}

/**
 * 2. unlockAudio()
 * Desbloquea el contexto ante eventos táctiles para cumplir la política de autoplay móvil.
 * Idempotente: llamarla múltiples veces es completamente seguro.
 */
export function unlockAudio() {
  const ctx = getSharedAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  // Precargar elementos <audio> HTML5
  Object.entries(SOUND_FILES).forEach(([key, url]) => {
    if (!audioElements[key]) {
      try {
        const audio = new Audio(url);
        audio.preload = 'auto';
        audio.volume = 1.0;
        audioElements[key] = audio;
      } catch (_) {}
    }
  });
}

// Auto-desbloqueo en primera interacción táctil/clic del usuario en móviles
if (typeof window !== 'undefined') {
  const onTouch = () => unlockAudio();
  window.addEventListener('touchstart', onTouch, { once: true, passive: true });
  window.addEventListener('touchend', onTouch, { once: true, passive: true });
  window.addEventListener('pointerdown', onTouch, { once: true, passive: true });
  window.addEventListener('click', onTouch, { once: true, passive: true });
}

/**
 * 3. Generación de tonos mediante osciladores multi-frecuencia sintéticos
 * Combina múltiples frecuencias sumadas con envolvente de ganancia reforzada.
 */
const createMultiTone = (freqs = [], type = 'sine', duration = 0.2, peakGain = 0.8) => {
  const ctx = getSharedAudioContext();
  if (!ctx) return;

  try {
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const gainNode = ctx.createGain();
    gainNode.connect(ctx.destination);

    // Envolvente de volumen reforzada y suave
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.exponentialRampToValueAtTime(peakGain, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    // Conectar osciladores multi-frecuencia sumados
    const oscList = (Array.isArray(freqs) ? freqs : [freqs]).map(f => {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.setValueAtTime(f, now);
      osc.connect(gainNode);
      return osc;
    });

    oscList.forEach(osc => {
      osc.start(now);
      osc.stop(now + duration);
    });
  } catch (e) {
    console.warn('[AudioDiagnostic] Error reproduciendo multi-tono sintético:', e);
  }
};

export const playShortBeep = () => {
  // Bi-frecuencia aguda (880Hz + 1760Hz) para máxima claridad
  createMultiTone([880, 1760], 'sine', 0.15, 0.9);
};

export const playLongBeep = () => {
  // Tríada armónica reforzada (C5 + E5 + G5: 523.25Hz, 659.25Hz, 783.99Hz)
  createMultiTone([523.25, 659.25, 783.99], 'sine', 0.65, 0.95);
};

export const playWorkBeep = () => {
  // Tono brillante de alerta (1050Hz + 1320Hz)
  createMultiTone([1050, 1320], 'sine', 0.35, 1.0);
};

export const playRestBeep = () => {
  // Tono grave cálido (330Hz + 440Hz)
  createMultiTone([330, 440], 'triangle', 0.4, 1.0);
};

export const playBell = () => {
  const ctx = getSharedAudioContext();
  if (!ctx) return;

  try {
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const now = ctx.currentTime;
    const freqs = [1047, 1318, 1568, 2093]; // Campana rica en armónicos

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 1.0);

      osc.connect(gain);
      gain.connect(ctx.destination);

      const peak = 0.8 / (idx + 1);
      gain.gain.setValueAtTime(peak, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

      osc.start(now);
      osc.stop(now + 1.0);
    });
  } catch (e) {
    console.warn('[AudioDiagnostic] Error en playBell:', e);
  }
};

export const playWhistle = () => {
  createMultiTone([2800, 2950], 'sine', 0.25, 0.9);
  setTimeout(() => createMultiTone([2800, 2950], 'sine', 0.25, 0.9), 100);
};

export const playDoubleBeep = () => {
  createMultiTone([880, 1320], 'sine', 0.12, 0.9);
  setTimeout(() => createMultiTone([1046.5, 1569], 'sine', 0.22, 1.0), 130);
};

export const playChime = () => {
  createMultiTone([523.25, 1046.5], 'sine', 0.3, 0.8);
  setTimeout(() => createMultiTone([659.25, 1318.5], 'sine', 0.3, 0.8), 100);
  setTimeout(() => createMultiTone([783.99, 1568], 'sine', 0.45, 1.0), 200);
};

export const SOUND_PRESETS = [
  { id: 'beep_long', name: 'Beep Clásico', type: 'audio_primary' },
  { id: 'bell', name: 'Campana de Boxeo', type: 'audio_primary' },
  { id: 'whistle', name: 'Silbato Digital', type: 'audio_primary' },
  { id: 'double_beep', name: 'Doble Beep', type: 'audio_primary' },
  { id: 'chime', name: 'Chime Armónico', type: 'audio_primary' },
];

const playSynthFallback = (soundId) => {
  console.log('[AudioDiagnostic] Reproduciendo vía sintetizador multi-frecuencia Web Audio API:', soundId);
  switch (soundId) {
    case 'bell':
      playBell();
      break;
    case 'whistle':
      playWhistle();
      break;
    case 'double_beep':
      playDoubleBeep();
      break;
    case 'chime':
      playChime();
      break;
    case 'beep_long':
    default:
      playLongBeep();
      break;
  }
};

/**
 * Reproducción de audio con fallback automático garantizado.
 */
export const playSound = (soundId, options = { useAudioTagFallback: true }) => {
  unlockAudio();
  const fileUrl = SOUND_FILES[soundId] || null;

  if (fileUrl) {
    try {
      let audio = audioElements[soundId];
      if (!audio) {
        audio = new Audio(fileUrl);
        audio.preload = 'auto';
        audio.volume = 1.0;
        audioElements[soundId] = audio;
      }

      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('[AudioDiagnostic] Éxito <audio> HTML5 para:', fileUrl);
          })
          .catch(err => {
            console.warn('[AudioDiagnostic] Fallback a sintetizador por:', err.message);
            if (options?.useAudioTagFallback !== false) {
              playSynthFallback(soundId);
            }
          });
      }
    } catch (e) {
      console.warn('[AudioDiagnostic] Fallback a sintetizador por excepción:', e.message);
      if (options?.useAudioTagFallback !== false) {
        playSynthFallback(soundId);
      }
    }
  } else {
    playSynthFallback(soundId);
  }
};

export const speakText = (text) => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'es-ES';
  utt.rate = 0.9;
  utt.pitch = 1;
  window.speechSynthesis.speak(utt);
};

export const vibrateShort = () => {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
  } catch (_) {}
};

export const vibrateLong = () => {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([300, 150, 300, 150, 500]);
    }
  } catch (_) {}
};

export const vibratePulse = () => {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 100]);
  } catch (_) {}
};

