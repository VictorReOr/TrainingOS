import { useAthlete } from '../context/AthleteContext';

export function useRole() {
  const { athlete } = useAthlete();
  return {
    isCoach: athlete.role === 'coach' || athlete.role === 'both',
    isAthlete: athlete.role === 'athlete' || athlete.role === 'both',
    isBoth: athlete.role === 'both',
    role: athlete.role
  };
}
