import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useAthlete } from './context/AthleteContext';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Plan from './pages/Plan';
import Session from './pages/Session';
import Evolution from './pages/Evolution';
import TimerPage from './pages/TimerPage';
import GlobalRestModal from './components/GlobalRestModal';

// Planner pages
import SeasonList from './pages/planner/SeasonList';
import MesocycleList from './pages/planner/MesocycleList';
import SessionDetailView from './pages/planner/SessionDetailView';
import SessionEditor from './pages/planner/SessionEditor';

// Phase 4
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';

import { useRole } from './hooks/useRole';
import CoachDashboard from './pages/coach/CoachDashboard';
import AthleteDetail from './pages/coach/AthleteDetail';
import ImportSession from './pages/ImportSession';
import SplashScreen from './components/SplashScreen';
import Login from './pages/Login';
import Register from './pages/Register';

const CoachRoute = ({ children }) => {
  const { isCoach } = useRole();
  return isCoach ? children : <Navigate to="/" replace />;
};

export default function App() {
  const { currentUser } = useAuth();
  const { athlete } = useAthlete();
  const location = useLocation();

  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    const splashShown = sessionStorage.getItem('splash_shown');
    if (!splashShown) {
      setShowSplash(true);
      sessionStorage.setItem('splash_shown', 'true');
    }
  }, []);

  const showBottomNav = location.pathname !== '/onboarding';

  return (
    <>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <GlobalRestModal />
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 flex flex-col pb-16">
          <Routes>
            {!currentUser ? (
              <>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </>
            ) : !athlete.onboardingCompleted ? (
              <>
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="*" element={<Navigate to="/onboarding" replace />} />
              </>
            ) : (
              <>
                <Route path="/" element={<Home />} />
                <Route path="/plan" element={<Plan />} />
                <Route path="/plan/seasons" element={<SeasonList />} />
                <Route path="/plan/seasons/:seasonId" element={<MesocycleList />} />
                <Route path="/plan/session-detail" element={<SessionDetailView />} />
                <Route path="/plan/session/new" element={<SessionEditor />} />
                <Route path="/plan/session/:sessionId/edit" element={<SessionEditor />} />
                <Route path="/session" element={<Session />} />
                <Route path="/evolution" element={<Evolution />} />
                <Route path="/timer" element={<TimerPage />} />
                <Route path="/profile" element={<Profile />} />
                
                <Route path="/coach" element={<CoachRoute><CoachDashboard /></CoachRoute>} />
                <Route path="/coach/:id" element={<CoachRoute><AthleteDetail /></CoachRoute>} />
                
                <Route path="/import/:code?" element={<ImportSession />} />
                
                <Route path="/onboarding" element={<Navigate to="/plan" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            )}
          </Routes>
        </main>
        {showBottomNav && currentUser && athlete.onboardingCompleted && <BottomNav />}
      </div>
    </>
  );
}
