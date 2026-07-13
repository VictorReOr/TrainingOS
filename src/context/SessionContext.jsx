import React, { createContext, useContext, useState } from 'react';

// ══════════════════════════════════════════════════════
// SessionContext — TrainingOS
// Conecta el Planificador con Session.jsx.
// Arquitectura futura (Prompt 2.4):
//   loadSession() hará fetch a Sheets para hidratar
//   el detalle completo por sessionId antes de ejecutar.
//   Endpoint: Code.gs → /getSession?id={sessionId}
// ══════════════════════════════════════════════════════

const SessionContext = createContext();

export function SessionProvider({ children }) {
  const [activeSession, setActiveSession] = useState(null);

  /**
   * Carga una sesión planificada para ejecutarla.
   * sessionData debe tener la misma forma que MOCK_SESSION:
   *   { id, name, dayBadge, blocks: [{ id, name, type, icon, exercises: [...] }] }
   */
  const loadSession = (sessionData) => {
    setActiveSession(sessionData);
  };

  /**
   * Limpia la sesión activa (al terminar o navegar fuera).
   */
  const clearSession = () => {
    setActiveSession(null);
  };

  return (
    <SessionContext.Provider value={{ activeSession, loadSession, clearSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
