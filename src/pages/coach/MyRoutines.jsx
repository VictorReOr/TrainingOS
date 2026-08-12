import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Dumbbell, UserCheck, X, Check, Users, Plus } from 'lucide-react';
import { useCoach } from '../../context/CoachContext';
import { fetchWorkouts, assignRoutine } from '../../services/sheets';
import { parseWorkouts } from '../../utils/workoutParser';

export default function MyRoutines() {
  const navigate = useNavigate();
  const { athletes } = useCoach();

  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal de asignación
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [selectedAthleteIds, setSelectedAthleteIds] = useState([]);
  const [assigning, setAssigning] = useState(false);
  const [successToast, setSuccessToast] = useState(null);

  useEffect(() => {
    loadRoutines();
  }, []);

  const loadRoutines = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWorkouts();
      const parsed = parseWorkouts(res.rows || []);
      setRoutines(parsed);
    } catch (err) {
      console.warn('Error al obtener rutinas del coach:', err);
      setError('No se pudieron cargar las rutinas.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAssign = (routine) => {
    setSelectedRoutine(routine);
    setSelectedAthleteIds([]);
  };

  const toggleAthleteSelect = (id) => {
    setSelectedAthleteIds(prev =>
      prev.includes(id) ? prev.filter(aId => aId !== id) : [...prev, id]
    );
  };

  const handleConfirmAssign = async () => {
    if (!selectedRoutine || selectedAthleteIds.length === 0) return;
    setAssigning(true);
    try {
      await assignRoutine(selectedRoutine.id, selectedAthleteIds);
      setSuccessToast(`Rutina "${selectedRoutine.name}" asignada correctamente a ${selectedAthleteIds.length} atleta(s).`);
      setTimeout(() => setSuccessToast(null), 4000);
      setSelectedRoutine(null);
      setSelectedAthleteIds([]);
    } catch (err) {
      alert(`Error al asignar rutina: ${err.message || 'Error de red'}`);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="flex-1 bg-[#F5F5F0] flex flex-col min-h-screen text-[#1C1C1E] pb-24">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 bg-white border-b border-[#E8E8E4] sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/coach')}
            className="w-9 h-9 bg-[#F5F5F0] border border-[#E8E8E4] rounded-full flex items-center justify-center text-[#1C1C1E] active:scale-95 transition-all cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <p className="text-[10px] font-condensed font-bold text-[#FF6B00] tracking-widest uppercase mb-0.5">
              Coach
            </p>
            <h1 className="font-condensed font-black text-2xl leading-tight text-[#1C1C1E]">
              Mis Rutinas
            </h1>
          </div>
        </div>
        <button
          onClick={() => navigate('/plan')}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#FF6B00] text-white rounded-xl font-condensed font-bold text-xs uppercase tracking-wider active:scale-95 transition-all cursor-pointer shadow-sm"
        >
          <Plus size={16} /> Crear / Importar
        </button>
      </div>

      {/* Toast de éxito */}
      {successToast && (
        <div className="mx-4 mt-4 p-3 bg-green-600 text-white rounded-xl font-condensed font-bold text-sm uppercase tracking-wide flex items-center justify-between animate-fade-in shadow-md">
          <span>✅ {successToast}</span>
          <button onClick={() => setSuccessToast(null)} className="p-1 hover:bg-white/20 rounded-full">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Contenido principal */}
      <div className="p-4 space-y-4">
        {loading ? (
          <div className="text-center p-8 font-mono text-xs font-bold text-[#6E6E73] uppercase tracking-wider animate-pulse">
            Cargando rutinas...
          </div>
        ) : error ? (
          <div className="bg-white border border-red-200 rounded-2xl p-6 text-center text-red-600 font-mono text-xs">
            {error}
          </div>
        ) : routines.length === 0 ? (
          <div className="bg-white border border-dashed border-[#E8E8E4] rounded-2xl p-8 text-center space-y-3">
            <Dumbbell size={40} className="mx-auto text-[#FF6B00]/40" />
            <h3 className="font-condensed font-black text-xl text-[#1C1C1E] uppercase">No hay rutinas creadas</h3>
            <p className="font-mono text-xs text-[#6E6E73] max-w-xs mx-auto">
              Sube un archivo Excel/CSV desde la pestaña Planificador o asigna plantillas para gestionarlas aquí.
            </p>
            <button
              onClick={() => navigate('/plan')}
              className="inline-flex items-center gap-2 bg-[#1C1C1E] text-white px-4 py-2.5 rounded-xl font-condensed font-bold text-xs uppercase tracking-wider cursor-pointer active:scale-95 transition-all"
            >
              <Plus size={16} /> Importar Rutina en Plan
            </button>
          </div>
        ) : (
          routines.map(routine => (
            <div key={routine.id} className="bg-white border border-[#E8E8E4] rounded-2xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 bg-[#FFF3EC] border-b border-[#E8E8E4] flex items-center justify-between">
                <div>
                  <span className="font-mono text-[9px] font-bold text-[#FF6B00] uppercase tracking-widest block">RUTINA DE ENTRENAMIENTO</span>
                  <h3 className="font-condensed font-black text-xl text-[#1C1C1E] uppercase tracking-wide truncate">{routine.name}</h3>
                </div>
                <button
                  onClick={() => handleOpenAssign(routine)}
                  className="flex items-center gap-1.5 bg-[#FF6B00] text-white px-3 py-1.5 rounded-xl font-condensed font-black text-xs uppercase tracking-wider hover:bg-[#FF6B00]/90 cursor-pointer active:scale-95 transition-all shadow-sm"
                >
                  <UserCheck size={14} /> Asignar a Atletas
                </button>
              </div>

              <div className="p-4 bg-white space-y-3">
                <p className="font-mono text-[9px] font-bold text-[#6E6E73] uppercase tracking-widest">Días incluidos:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(routine.sessions).map(day => (
                    <div key={day} className="bg-[#F5F5F0] border border-[#E8E8E4] px-3 py-1.5 rounded-lg font-mono text-xs text-[#1C1C1E] uppercase font-bold capitalize">
                      {day} <span className="text-[#6E6E73] font-normal">· {routine.sessions[day].duration} min</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Sheet de asignación */}
      {selectedRoutine && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedRoutine(null)} />
          <div className="bg-white rounded-t-3xl w-full max-h-[85vh] flex flex-col relative animate-slide-up">
            <div className="w-12 h-1 bg-[#E8E8E4] rounded-full mx-auto my-3 shrink-0" />
            
            <div className="px-5 pb-4 border-b border-[#E8E8E4] flex items-center justify-between shrink-0">
              <div>
                <p className="font-mono text-[9px] font-bold text-[#FF6B00] uppercase tracking-widest">Asignar Rutina</p>
                <h3 className="font-condensed font-black text-2xl text-[#1C1C1E] uppercase tracking-wide truncate max-w-[260px]">
                  {selectedRoutine.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRoutine(null)}
                className="p-2 bg-[#F5F5F0] text-[#6E6E73] rounded-full hover:text-[#1C1C1E] transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              <p className="font-mono text-xs text-[#6E6E73] uppercase font-bold tracking-wider">
                Selecciona uno o más atletas para asignar esta rutina:
              </p>

              {athletes.length === 0 ? (
                /* Manejo elegante de lista vacía de atletas */
                <div className="bg-[#F5F5F0] border-2 border-dashed border-[#E8E8E4] rounded-2xl p-6 text-center space-y-2">
                  <Users size={32} className="mx-auto text-[#6E6E73]/50" />
                  <p className="font-condensed font-black text-base text-[#1C1C1E] uppercase">
                    Aún no tienes atletas supervisados
                  </p>
                  <p className="font-mono text-[11px] text-[#6E6E73]">
                    Añade atletas desde la pantalla principal de Coach para poder asignarles rutinas.
                  </p>
                  <button
                    onClick={() => navigate('/coach')}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1C1C1E] text-white rounded-xl font-condensed font-bold text-xs uppercase tracking-wider active:scale-95 transition-all"
                  >
                    Ir a Mis Atletas
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {athletes.map(athlete => {
                    const isSelected = selectedAthleteIds.includes(athlete.id);
                    return (
                      <button
                        key={athlete.id}
                        onClick={() => toggleAthleteSelect(athlete.id)}
                        className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left active:scale-[0.99] transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#FFF3EC] border-[#FF6B00] text-[#1C1C1E]'
                            : 'bg-white border-[#E8E8E4] text-[#1C1C1E] hover:border-[#6E6E73]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#FF6B00] text-white font-condensed font-black text-lg flex items-center justify-center shrink-0">
                            {athlete.avatar || athlete.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-condensed font-black text-base text-[#1C1C1E] uppercase leading-tight">
                              {athlete.name}
                            </p>
                            <p className="font-mono text-[10px] text-[#6E6E73] font-medium">
                              💪 {athlete.sport || 'Atleta'}
                            </p>
                          </div>
                        </div>

                        <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                          isSelected ? 'bg-[#FF6B00] border-[#FF6B00] text-white' : 'border-[#E8E8E4] bg-[#F5F5F0]'
                        }`}>
                          {isSelected && <Check size={14} strokeWidth={3} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {athletes.length > 0 && (
              <div className="p-5 border-t border-[#E8E8E4] shrink-0 bg-white">
                <button
                  onClick={handleConfirmAssign}
                  disabled={selectedAthleteIds.length === 0 || assigning}
                  className="w-full bg-[#FF6B00] text-white font-condensed font-black text-lg py-3.5 rounded-2xl uppercase tracking-wider shadow-md disabled:opacity-50 active:scale-[0.98] transition-all cursor-pointer"
                >
                  {assigning ? 'Asignando...' : `Confirmar Asignación (${selectedAthleteIds.length})`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
