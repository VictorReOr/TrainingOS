import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { TimerProvider } from './context/TimerContext'
import { CircuitProvider } from './context/CircuitContext'
import { AthleteProvider } from './context/AthleteContext'
import { PlannerProvider } from './context/PlannerContext'
import { SessionProvider } from './context/SessionContext'
import { PRProvider } from './context/PRContext'
import { CoachProvider } from './context/CoachContext'
import { FeedbackProvider } from './context/FeedbackContext'
import { AuthProvider } from './context/AuthContext'
import { ReadinessProvider } from './context/ReadinessContext'
import { registerServiceWorker } from './utils/notifications'
import { repairCorruptExerciseNames } from './utils/mergeSessionLogs.js'

// Inicializar Service Worker para PWA y alertas con pantalla bloqueada
registerServiceWorker();

// Reparar nombres de ejercicio corruptos (nombre === id) en localStorage, una
// sola vez al arrancar. No bloquea el render: se ejecuta tras la primera tarea
// del event loop, cuando React ya ha pintado la UI inicial.
setTimeout(repairCorruptExerciseNames, 0);


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PRProvider>
          <ReadinessProvider>
            <CoachProvider>
            <PlannerProvider>
              <SessionProvider>
                <AthleteProvider>
                  <FeedbackProvider>
                    <TimerProvider>
                      <CircuitProvider>
                        <App />
                      </CircuitProvider>
                    </TimerProvider>
                  </FeedbackProvider>
                </AthleteProvider>
              </SessionProvider>
            </PlannerProvider>
          </CoachProvider>
          </ReadinessProvider>
        </PRProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)

