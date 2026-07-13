import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const LS_KEY = 'trainingos_athlete_profile';

const DEFAULT_ATHLETE = {
  id: 'atleta-' + Date.now(),
  name: '',
  role: 'both', // 'athlete' | 'coach' | 'both'
  sports: [
    { id: 'gym',    label: 'Gimnasio',   icon: '🏋️', active: true  },
    { id: 'tkd',    label: 'Taekwondo',  icon: '🥋', active: true  },
    { id: 'cardio', label: 'Cardio',     icon: '🚴', active: false },
  ],
  activeSport: 'all', // 'all' | 'gym' | 'tkd' | 'cardio'
  primarySport: 'gym',
  onboardingCompleted: false
};

const AthleteContext = createContext();

export function AthleteProvider({ children }) {
  const [athlete, setAthlete] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return DEFAULT_ATHLETE;
      const parsed = JSON.parse(raw);
      // Fallback estricto para forzar onboarding a usuarios legacy
      if (parsed.onboardingCompleted !== true) {
        return { ...parsed, onboardingCompleted: false };
      }
      return parsed;
    } catch {
      return DEFAULT_ATHLETE;
    }
  });

  // Persist on change
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(athlete));
  }, [athlete]);

  const setActiveSport = (id) => {
    setAthlete(prev => {
      const updated = { ...prev, activeSport: id };
      localStorage.setItem(LS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const updateProfile = (data) => {
    setAthlete(prev => ({
      ...prev,
      ...data,
      onboardingCompleted: true
    }));
  };

  const addSport = (sport) => {
    setAthlete(prev => ({
      ...prev,
      sports: [...prev.sports, sport]
    }));
  };

  const toggleSport = (sportId) => {
    setAthlete(prev => ({
      ...prev,
      sports: prev.sports.map(s => s.id === sportId ? { ...s, active: !s.active } : s)
    }));
  };

  const setPrimarySport = (sportId) => {
    setAthlete(prev => ({ ...prev, primarySport: sportId }));
  };

  // Computed label for the pill button
  const activeLabel = useMemo(() => {
    if (athlete.activeSport === 'all') {
      const activeSports = athlete.sports.filter(s => s.active);
      return activeSports.map(s => s.icon).join(' ') + ' Todos';
    }
    const sport = athlete.sports.find(s => s.id === athlete.activeSport);
    return sport ? `${sport.icon} ${sport.label}` : 'Todos';
  }, [athlete]);

  // Sports available (active ones + 'all' option)
  const availableSports = useMemo(() => {
    return athlete.sports.filter(s => s.active);
  }, [athlete.sports]);

  return (
    <AthleteContext.Provider value={{
      athlete,
      setActiveSport,
      activeLabel,
      availableSports,
      activeSport: athlete.activeSport,
      updateProfile,
      addSport,
      toggleSport,
      setPrimarySport
    }}>
      {children}
    </AthleteContext.Provider>
  );
}

export const useAthlete = () => useContext(AthleteContext);
