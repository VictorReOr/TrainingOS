import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAthlete } from './AthleteContext';
import { saveFeedback as _saveFeedback, markFeedbackRead as _markFeedbackRead } from '../services/sheets';

// ══════════════════════════════════════════════════════
// FeedbackContext — TrainingOS
// Sistema de feedback bidireccional entrenador ↔ atleta
// Persistencia: localStorage + Sheets (fire-and-forget)
// ══════════════════════════════════════════════════════

const LS_KEY = 'trainingos_feedback';
const USE_SHEETS = !!import.meta.env.VITE_SHEETS_API_URL
  && import.meta.env.VITE_USE_MOCK !== 'true';

function _bgSync(label, fn) {
  const demoMode = localStorage.getItem('trainingos_demo_mode') === 'true';
  if (!USE_SHEETS || demoMode) return;
  Promise.resolve()
    .then(() => fn())
    .then(res => console.log(`[Sheets] ${label} → ok`, res?.id || ''))
    .catch(err => console.warn(`[Sheets] ${label} falló:`, err.message));
}

const FeedbackContext = createContext();

export function FeedbackProvider({ children }) {
  const { athlete } = useAthlete();

  const [feedbacks, setFeedbacks] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Persistir en localStorage ante cualquier cambio
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(feedbacks));
  }, [feedbacks]);

  /**
   * Devuelve los feedbacks de una sesión concreta para un atleta
   */
  const getFeedbackForSession = (sessionId, atletaId) => {
    return feedbacks
      .filter(f => f.sessionId === sessionId && f.atletaId === atletaId)
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  };

  /**
   * Añade un nuevo comentario de feedback
   */
  const addFeedback = (feedbackData) => {
    const record = {
      id: feedbackData.id || `fb-${Date.now()}`,
      sessionId: feedbackData.sessionId,
      atletaId: feedbackData.atletaId,
      autorId: feedbackData.autorId || athlete.id,
      autorRole: feedbackData.autorRole,
      autorName: feedbackData.autorName || athlete.name || 'Anónimo',
      texto: feedbackData.texto,
      valoracion: feedbackData.valoracion || null,
      fecha: feedbackData.fecha || new Date().toISOString(),
      leido: false,
    };

    setFeedbacks(prev => [...prev, record]);

    // Background sync a Google Sheets
    _bgSync('saveFeedback', () => _saveFeedback(record));
  };

  /**
   * Marca un feedback como leído
   */
  const markAsRead = (feedbackId) => {
    setFeedbacks(prev =>
      prev.map(f => f.id === feedbackId ? { ...f, leido: true } : f)
    );
    _bgSync('markFeedbackRead', () => _markFeedbackRead(feedbackId));
  };

  /**
   * Marca todos los feedbacks de una sesión como leídos (para el usuario actual)
   */
  const markSessionFeedbackAsRead = (sessionId, atletaId) => {
    const currentRole = athlete.role === 'coach' ? 'coach'
      : athlete.role === 'both' ? 'both' : 'athlete';

    setFeedbacks(prev =>
      prev.map(f => {
        if (f.sessionId !== sessionId || f.atletaId !== atletaId) return f;
        if (f.leido) return f;
        // Marcar como leído si el autor es del rol opuesto
        const isForMe = (currentRole === 'coach' || currentRole === 'both')
          ? f.autorRole === 'athlete'
          : f.autorRole === 'coach';
        if (isForMe) {
          _bgSync('markFeedbackRead', () => _markFeedbackRead(f.id));
          return { ...f, leido: true };
        }
        return f;
      })
    );
  };

  /**
   * Cuenta feedbacks no leídos dirigidos al usuario actual
   */
  const unreadCount = useMemo(() => {
    const currentRole = athlete.role === 'coach' ? 'coach'
      : athlete.role === 'both' ? 'both' : 'athlete';

    return feedbacks.filter(f => {
      if (f.leido) return false;
      // Es "para mí" si lo escribió alguien del rol opuesto
      if (currentRole === 'both') {
        // Si soy both, cualquier feedback no leído que yo no haya escrito me cuenta
        return f.autorId !== athlete.id;
      }
      if (currentRole === 'coach') return f.autorRole === 'athlete';
      return f.autorRole === 'coach';
    }).length;
  }, [feedbacks, athlete.role, athlete.id]);

  /**
   * Devuelve sesiones con feedback no leído (para la sección de Profile)
   */
  const sessionsWithUnread = useMemo(() => {
    const currentRole = athlete.role === 'coach' ? 'coach'
      : athlete.role === 'both' ? 'both' : 'athlete';

    const unreadFeedbacks = feedbacks.filter(f => {
      if (f.leido) return false;
      if (currentRole === 'both') return f.autorId !== athlete.id;
      if (currentRole === 'coach') return f.autorRole === 'athlete';
      return f.autorRole === 'coach';
    });

    // Agrupar por sessionId
    const map = {};
    unreadFeedbacks.forEach(f => {
      if (!map[f.sessionId]) {
        map[f.sessionId] = { sessionId: f.sessionId, atletaId: f.atletaId, count: 0, lastText: '' };
      }
      map[f.sessionId].count++;
      map[f.sessionId].lastText = f.texto;
    });

    return Object.values(map);
  }, [feedbacks, athlete.role, athlete.id]);

  return (
    <FeedbackContext.Provider value={{
      feedbacks,
      getFeedbackForSession,
      addFeedback,
      markAsRead,
      markSessionFeedbackAsRead,
      unreadCount,
      sessionsWithUnread,
    }}>
      {children}
    </FeedbackContext.Provider>
  );
}

export const useFeedback = () => useContext(FeedbackContext);
