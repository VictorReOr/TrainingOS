// utils/audio.js
// Gestor de sonido nativo optimizado para móviles (Web Audio API + HTML5 Audio)

let sharedAudioCtx = null;
const audioElements = {};

/**
 * Obtiene o crea el AudioContext compartido (Singleton).
 * Garantiza que no se supere el límite de contextos del navegador móvil.
 */
export const getSharedAudioContext = () => {
  if (typeof window === 'undefined') return null;
  const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtxClass) return null;

  if (!sharedAudioCtx) {
    try {
      sharedAudioCtx = new AudioCtxClass();
    } catch (e) {
      console.warn('[AudioDiagnostic] No se pudo crear AudioContext:', e.message);
      return null;
    }
  }

  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }

  return sharedAudioCtx;
};

/**
 * Desbloquea el subsistema de audio ante la primera interacción táctil del usuario.
 */
export const unlockAudio = () => {
  const ctx = getSharedAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().then(() => {
      console.log('[AudioDiagnostic] AudioContext desbloqueado con éxito (state:', ctx.state, ')');
    }).catch(err => {
      console.warn('[AudioDiagnostic] Fallo al desbloquear AudioContext:', err);
    });
  }

  // Pre-cargar y desbloquear elementos de audio en móvil
  Object.entries(SOUND_FILES).forEach(([key, url]) => {
    if (!audioElements[key]) {
      try {
        const a = new Audio(url);
        a.preload = 'auto';
        a.volume = 1.0;
        audioElements[key] = a;
      } catch (_) {}
    }
  });
};

// Escuchadores de interacción para desbloqueo automático en navegadores móviles
if (typeof window !== 'undefined') {
  const handleFirstInteraction = () => {
    unlockAudio();
  };
  window.addEventListener('touchstart', handleFirstInteraction, { once: true, passive: true });
  window.addEventListener('touchend', handleFirstInteraction, { once: true, passive: true });
  window.addEventListener('pointerdown', handleFirstInteraction, { once: true, passive: true });
  window.addEventListener('click', handleFirstInteraction, { once: true, passive: true });
}

/**
 * Generador de tonos puros con envolvente ADSR suave.
 */
const createTone = (frequency, type = 'sine', duration = 0.2, volume = 0.8) => {
  const audioCtx = getSharedAudioContext();
  if (!audioCtx) return;

  try {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.exponentialRampToValueAtTime(volume, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration);
  } catch (e) {
    console.warn('[AudioDiagnostic] Error creando tono Web Audio API:', e.message);
  }
};

export const playShortBeep = () => {
  console.log('[AudioDiagnostic]', { type: 'short_beep', soundId: 'short_beep', timestamp: new Date().toISOString() });
  createTone(880, 'sine', 0.15, 0.9); // A5 (Agudo rápido, cuenta atrás)
};

export const playLongBeep = () => {
  console.log('[AudioDiagnostic]', { type: 'long_beep', soundId: 'beep_long', timestamp: new Date().toISOString() });
  // Tono compuesto potente para atravesar altavoces móviles
  createTone(523.25, 'sine', 0.6, 0.9); // C5
  setTimeout(() => createTone(659.25, 'sine', 0.6, 0.9), 50); // E5
  setTimeout(() => createTone(783.99, 'sine', 0.7, 1.0), 100); // G5
};

export const playWorkBeep = () => {
  console.log('[AudioDiagnostic]', { type: 'work_beep', soundId: 'work_beep', timestamp: new Date().toISOString() });
  createTone(1050, 'sine', 0.35, 1.0); // Agudo de alerta para "¡Trabajo!"
};

export const playRestBeep = () => {
  console.log('[AudioDiagnostic]', { type: 'rest_beep', soundId: 'rest_beep', timestamp: new Date().toISOString() });
  createTone(330, 'triangle', 0.4, 1.0); // Grave chill de "Descanso"
};

export const playBell = () => {
  const audioCtx = getSharedAudioContext();
  if (!audioCtx) return;

  try {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }

    const freqs = [1047, 1318, 1568]; // Acorde brillante campana
    freqs.forEach(freq => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, audioCtx.currentTime + 1.0);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      gain.gain.setValueAtTime(0.7, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.0);

      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 1.0);
    });
  } catch (e) {
    console.warn('[AudioDiagnostic] Error en playBell Web Audio API:', e.message);
  }
};

export const playWhistle = () => {
  createTone(2800, 'sine', 0.25, 0.9);
  setTimeout(() => createTone(2950, 'sine', 0.25, 0.9), 100);
};

export const playDoubleBeep = () => {
  createTone(880, 'sine', 0.12, 0.9);
  setTimeout(() => createTone(1046.5, 'sine', 0.22, 1.0), 130);
};

export const playChime = () => {
  createTone(523.25, 'sine', 0.3, 0.8);
  setTimeout(() => createTone(659.25, 'sine', 0.3, 0.8), 100);
  setTimeout(() => createTone(783.99, 'sine', 0.45, 1.0), 200);
};

export const SOUND_PRESETS = [
  { id: 'beep_long', name: 'Beep Clásico', type: 'audio_primary' },
  { id: 'bell', name: 'Campana de Boxeo', type: 'audio_primary' },
  { id: 'whistle', name: 'Silbato Digital', type: 'audio_primary' },
  { id: 'double_beep', name: 'Doble Beep', type: 'audio_primary' },
  { id: 'chime', name: 'Chime Armónico', type: 'audio_primary' },
];

const SOUND_FILES = {
  bell: '/sounds/Campana.mp4',
  whistle: '/sounds/Silbato.mp4',
};

const playSynthFallback = (soundId) => {
  console.log('[AudioDiagnostic] Reproduciendo vía sintetizador Web Audio API:', soundId);
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
 * Reproduce sonido usando elemento HTML5 <audio> o el sintetizador Web Audio API.
 *
 * @param {string} soundId - ID del tono seleccionado ('bell' | 'whistle' | 'beep_long' | 'double_beep' | 'chime')
 * @param {Object} [options={ useAudioTagFallback: true }]
 */
export const playSound = (soundId, options = { useAudioTagFallback: true }) => {
  unlockAudio();
  const fileUrl = SOUND_FILES[soundId] || null;
  console.log('[AudioDiagnostic]', { type: 'play_sound_request', soundId, hasFile: !!fileUrl, timestamp: new Date().toISOString() });

  if (fileUrl) {
    console.log('[AudioDiagnostic] Intentando reproducción <audio> HTML5:', fileUrl);
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
            console.log('[AudioDiagnostic] Éxito reproducción <audio> HTML5 para:', fileUrl);
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
    console.log('[AudioDiagnostic] Ejecutando sintetizador para:', soundId);
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


