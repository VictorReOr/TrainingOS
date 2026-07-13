import React, { useState } from 'react';
import { useFeedback } from '../context/FeedbackContext';
import { useAthlete } from '../context/AthleteContext';
import { useRole } from '../hooks/useRole';
import { Star, Send } from 'lucide-react';

// ══════════════════════════════════════════════════════
// FeedbackSection — TrainingOS
// Componente reutilizable de feedback bidireccional
// Props: sessionId, atletaId, readOnly?, darkMode?
// ══════════════════════════════════════════════════════

const relativeDate = (isoString) => {
  const d = new Date(isoString);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'ahora';
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `hace ${diffH}h`;
  const diffDays = Math.floor(diffH / 24);
  if (diffDays === 1) return 'ayer';
  if (diffDays < 7) return `hace ${diffDays} días`;
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
};

function StarRating({ value, onChange, readOnly = false, size = 28 }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          className={`transition-transform ${!readOnly ? 'active:scale-110 cursor-pointer' : 'cursor-default'}`}
        >
          <Star
            size={size}
            fill={star <= value ? '#FF6B00' : 'none'}
            color={star <= value ? '#FF6B00' : '#E8E8E4'}
            strokeWidth={2}
          />
        </button>
      ))}
    </div>
  );
}

export default function FeedbackSection({ sessionId, atletaId, readOnly = false, darkMode = false, forceRole = null }) {
  const { getFeedbackForSession, addFeedback, markAsRead } = useFeedback();
  const { athlete } = useAthlete();
  const { isCoach: hookIsCoach } = useRole();

  const [texto, setTexto] = useState('');
  const [valoracion, setValoracion] = useState(0);
  const [error, setError] = useState('');

  const feedbacks = getFeedbackForSession(sessionId, atletaId);
  const isCoach = forceRole ? forceRole === 'coach' : hookIsCoach;
  const currentRole = forceRole || (hookIsCoach ? 'coach' : 'athlete');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!texto.trim()) {
      setError('Escribe un comentario');
      return;
    }
    if (currentRole === 'athlete' && valoracion === 0) {
      setError('Selecciona una valoración');
      return;
    }

    addFeedback({
      sessionId,
      atletaId,
      autorId: athlete.id,
      autorRole: currentRole,
      autorName: athlete.name || 'Anónimo',
      texto: texto.trim(),
      valoracion: currentRole === 'athlete' ? valoracion : null,
    });

    setTexto('');
    setValoracion(0);
  };

  // Color classes based on darkMode
  const cls = {
    bg: darkMode ? 'bg-white/5' : 'bg-white',
    border: darkMode ? 'border-white/10' : 'border-[#E8E8E4]',
    text: darkMode ? 'text-white' : 'text-[#1C1C1E]',
    muted: darkMode ? 'text-white/50' : 'text-[#6E6E73]',
    surface: darkMode ? 'bg-white/5' : 'bg-[#F5F5F0]',
    input: darkMode ? 'bg-white/10 border-white/15 text-white placeholder:text-white/30' : 'bg-[#F5F5F0] border-[#E8E8E4] text-[#1C1C1E] placeholder:text-[#A1A1AA]',
  };

  // Empty state
  if (feedbacks.length === 0 && readOnly) {
    return (
      <div className={`flex flex-col items-center justify-center py-6 ${cls.muted}`}>
        <span className="text-3xl mb-2">💬</span>
        <p className="text-sm font-medium">Sin comentarios aún</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Lista de comentarios */}
      {feedbacks.length === 0 && !readOnly ? (
        <div className={`flex flex-col items-center justify-center py-6 ${cls.muted}`}>
          <span className="text-3xl mb-2">💬</span>
          <p className="text-sm font-medium text-center">
            {isCoach ? 'Deja feedback a tu atleta' : 'Cuéntale a tu entrenador cómo te fue'}
          </p>
        </div>
      ) : (
        feedbacks.map(fb => {
          const isCoachComment = fb.autorRole === 'coach';
          const isMe = fb.autorId === athlete.id;
          const isUnread = !fb.leido && !isMe;

          // Mark as read when rendered
          if (isUnread) {
            setTimeout(() => markAsRead(fb.id), 500);
          }

          return (
            <div
              key={fb.id}
              className={`relative rounded-2xl p-4 ${
                isCoachComment
                  ? (darkMode ? 'bg-[#FF6B00]/10 border-l-[3px] border-l-[#FF6B00]' : 'bg-[#FFF3EC] border-l-[3px] border-l-[#FF6B00]')
                  : (darkMode ? 'bg-white/5' : 'bg-[#F5F5F0]')
              }`}
            >
              {/* Unread dot */}
              {isUnread && (
                <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#FF6B00] animate-pulse" />
              )}

              {/* Header: avatar + name + badge + date */}
              <div className="flex items-center gap-2.5 mb-2">
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0 ${
                    isCoachComment ? 'bg-[#FF6B00]' : 'bg-[#1C1C1E]'
                  }`}
                >
                  {(fb.autorName || '?').charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-sm truncate ${cls.text}`}>
                      {isMe ? 'Yo' : fb.autorName}
                    </span>
                    <span
                      className={`text-[9px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded ${
                        isCoachComment
                          ? 'bg-[#FF6B00]/15 text-[#FF6B00]'
                          : (darkMode ? 'bg-white/10 text-white/50' : 'bg-[#E8E8E4] text-[#6E6E73]')
                      }`}
                    >
                      {isCoachComment ? 'ENTRENADOR' : (isMe ? 'YO' : 'ATLETA')}
                    </span>
                  </div>
                  <span className={`text-[10px] ${cls.muted}`}>{relativeDate(fb.fecha)}</span>
                </div>
              </div>

              {/* Text */}
              <p className={`text-sm leading-relaxed ${cls.text}`}>{fb.texto}</p>

              {/* Stars (only for athlete feedback) */}
              {fb.autorRole === 'athlete' && fb.valoracion && (
                <div className="mt-2">
                  <StarRating value={fb.valoracion} readOnly size={18} />
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Formulario */}
      {!readOnly && (
        <form onSubmit={handleSubmit} className={`border ${cls.border} rounded-2xl p-4 ${cls.bg}`}>
          <textarea
            value={texto}
            onChange={e => { setTexto(e.target.value); setError(''); }}
            placeholder={isCoach ? 'Deja feedback sobre esta sesión...' : '¿Cómo te fue en esta sesión?'}
            rows={3}
            className={`w-full rounded-xl px-3 py-2.5 text-sm border outline-none resize-none ${cls.input} focus:border-[#FF6B00] transition-colors`}
          />

          {/* Stars for athlete */}
          {!isCoach && (
            <div className="flex items-center gap-2 mt-3">
              <span className={`text-xs font-bold ${cls.muted}`}>Valoración:</span>
              <StarRating value={valoracion} onChange={setValoracion} />
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-xs text-red-500 font-bold mt-2">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="mt-3 w-full py-2.5 bg-[#FF6B00] text-white font-condensed font-bold text-sm rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-sm"
          >
            <Send size={14} /> Enviar
          </button>
        </form>
      )}
    </div>
  );
}
