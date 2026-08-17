// utils/audio.js
// Gestor de sonido nativo usando Web Audio API, evitando depender de MP3s estáticos.

const createTone = (frequency, type = 'sine', duration = 0.2) => {
  if (!window.AudioContext && !window.webkitAudioContext) return;
  
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  // Fade out suave para evitar "clics" de altavoz
  gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

  oscillator.start(audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + duration);
};

export const playShortBeep = () => createTone(880, 'sine', 0.15); // A5 (Agudo rápido, cuenta atrás)
export const playLongBeep = () => createTone(440, 'square', 0.6); // A4 (Fin de ronda/descanso)
export const playWorkBeep = () => createTone(1050, 'sine', 0.4); // Agudo de alerta para "¡Trabajo!"
export const playRestBeep = () => createTone(300, 'square', 0.4); // Grave chill de "Descanso"

export const playBell = () => {
  if (!window.AudioContext && !window.webkitAudioContext) return;
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(1047, audioCtx.currentTime); // C6
  oscillator.frequency.exponentialRampToValueAtTime(523, audioCtx.currentTime + 0.8); // C5

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);

  oscillator.start(audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + 0.8);
};

export const playWhistle = () => {
  createTone(2800, 'sine', 0.25);
  createTone(2950, 'sine', 0.25);
};

export const playDoubleBeep = () => {
  createTone(880, 'sine', 0.1);
  setTimeout(() => createTone(1046.5, 'sine', 0.2), 120);
};

export const playChime = () => {
  createTone(523.25, 'sine', 0.3);
  setTimeout(() => createTone(659.25, 'sine', 0.3), 100);
  setTimeout(() => createTone(783.99, 'sine', 0.4), 200);
};

export const SOUND_PRESETS = [
  { id: 'beep_long', name: 'Beep Clásico', type: 'audio_primary' },
  { id: 'bell', name: 'Campana de Boxeo', type: 'audio_primary' },
  { id: 'whistle', name: 'Silbato Digital', type: 'audio_primary' },
  { id: 'double_beep', name: 'Doble Beep', type: 'audio_primary' },
  { id: 'chime', name: 'Chime Armónico', type: 'audio_primary' },
];

// Mapeo de archivos primarios HTML5 <audio> presentes en /sounds/
// Mapea las keys reales de trainingos_completion_sound a los archivos MP4/MP3 en public/sounds/
const SOUND_FILES = {
  bell: '/sounds/Campana.mp4',
  whistle: '/sounds/Silbato.mp4',
  // NOTA: Para beep_long, double_beep y chime, si el archivo aún no se ha subido a public/sounds/,
  // audio.play() captura el 404 o fileUrl nulo y ejecuta inmediatamente el fallback de Web Audio API.
};

// Fallback sintetizado via Web Audio API si el elemento HTML5 <audio> no puede reproducir
const playSynthFallback = (soundId) => {
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
 * Requisito B.1: Reproducir sonido usando elemento HTML5 <audio> como MÉTODO PRIMARIO
 * (solicita Audio Focus al SO y atenúa Spotify/música de fondo),
 * cayendo a Web Audio API sintético como MÉTODO FALLBACK.
 *
 * @param {string} soundId - ID del tono seleccionado ('bell' | 'whistle' | 'beep_long' | 'double_beep' | 'chime')
 * @param {Object} [options={ useAudioTagFallback: true }]
 */
export const playSound = (soundId, options = { useAudioTagFallback: true }) => {
  const fileUrl = SOUND_FILES[soundId] || null;

  if (fileUrl) {
    console.log(`[playSound] Reproduciendo vía <audio> HTML5: ${fileUrl} (soundId: ${soundId})`);
    try {
      const audio = new Audio();
      audio.src = fileUrl;
      audio.preload = 'auto';
      audio.currentTime = 0;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log(`[playSound] Éxito <audio> HTML5 para: ${fileUrl}`);
          })
          .catch(err => {
            console.warn(`[playSound] Fallback a Web Audio API — motivo: ${err.name} - ${err.message}`);
            if (options?.useAudioTagFallback !== false) {
              playSynthFallback(soundId);
            }
          });
      }
    } catch (e) {
      console.warn(`[playSound] Fallback a Web Audio API — motivo: Excepción ${e.message}`);
      if (options?.useAudioTagFallback !== false) {
        playSynthFallback(soundId);
      }
    }
  } else {
    console.log(`[playSound] Fallback a Web Audio API — motivo: sin archivo mapeado para ${soundId}`);
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
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([200, 100, 200]);
  } catch (_) {}
};

export const vibratePulse = () => {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 100]);
  } catch (_) {}
};
