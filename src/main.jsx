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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <PRProvider>
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
      </PRProvider>
    </BrowserRouter>
  </StrictMode>,
)

