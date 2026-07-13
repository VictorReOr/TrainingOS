import { useAthlete } from '../context/AthleteContext';

export function useRole() {
  const { athlete, viewMode } = useAthlete();
  const actualRole = athlete.role;
  const activeRole = actualRole === 'both' ? viewMode : actualRole;

  return {
    isCoach: activeRole === 'coach',
    isAthlete: activeRole === 'athlete',
    isBoth: actualRole === 'both',
    role: activeRole,        // El rol que la UI debe mostrar
    actualRole: actualRole   // El rol real del usuario
  };
}
