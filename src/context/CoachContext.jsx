import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_ATHLETES } from '../data/mockAthletes';

const CoachContext = createContext();
const LS_KEY = 'trainingos_athletes';

export function CoachProvider({ children }) {
  const [athletes, setAthletes] = useState(() => {
    try {
      const stored = localStorage.getItem(LS_KEY);
      return stored ? JSON.parse(stored) : MOCK_ATHLETES;
    } catch {
      return MOCK_ATHLETES;
    }
  });
  const [selectedAthleteId, setSelectedAthleteId] = useState(null);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(athletes));
  }, [athletes]);

  const addAthlete = (data) => {
    setAthletes(prev => [...prev, data]);
  };

  const removeAthlete = (id) => {
    setAthletes(prev => prev.filter(a => a.id !== id));
  };

  const updateAthlete = (id, updatedFields) => {
    setAthletes(prev => prev.map(a => a.id === id ? { ...a, ...updatedFields } : a));
  };

  const selectAthlete = (id) => {
    setSelectedAthleteId(id);
  };

  const getAthleteById = (id) => {
    return athletes.find(a => a.id === id) || null;
  };

  const selectedAthlete = getAthleteById(selectedAthleteId);

  return (
    <CoachContext.Provider value={{
      athletes,
      selectedAthlete,
      selectedAthleteId,
      addAthlete,
      removeAthlete,
      updateAthlete,
      selectAthlete,
      getAthleteById
    }}>
      {children}
    </CoachContext.Provider>
  );
}

export const useCoach = () => useContext(CoachContext);
