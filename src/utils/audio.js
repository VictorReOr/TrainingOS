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
  { id: 'beep_long', name: 'Beep Clásico', type: 'synth' },
  { id: 'bell', name: 'Campana de Boxeo', type: 'synth' },
  { id: 'whistle', name: 'Silbato Digital', type: 'synth' },
  { id: 'double_beep', name: 'Doble Beep', type: 'synth' },
  { id: 'chime', name: 'Chime Armónico', type: 'synth' },
];

export const playSound = (soundId) => {
  const preset = SOUND_PRESETS.find(s => s.id === soundId);
  if (!preset) {
    playLongBeep();
    return;
  }

  if (preset.type === 'file' && preset.url) {
    const audio = new Audio(preset.url);
    audio.play().catch(err => console.warn('[Audio] Error al reproducir audio estático:', err));
  } else {
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

export const vibrateShort = () => { if (navigator.vibrate) navigator.vibrate(50); };
export const vibrateLong = () => { if (navigator.vibrate) navigator.vibrate([200, 100, 200]); };
export const vibratePulse = () => { if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 100]); };
