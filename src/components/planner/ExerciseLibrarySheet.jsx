import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, Plus } from 'lucide-react';
import { EXERCISE_LIBRARY, CATEGORIES } from '../../data/exerciseLibrary';
import { useAthlete } from '../../context/AthleteContext';

export default function ExerciseLibrarySheet({ open, onClose, onSelectExercise }) {
  const { activeSport } = useAthlete();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setTimeout(() => setIsVisible(true), 10);
      setSearch(''); // reset on open
    } else {
      setIsVisible(false);
    }
  }, [open]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const filteredExercises = useMemo(() => {
    return EXERCISE_LIBRARY.filter(ex => {
      // 1. Filtro global de deporte
      if (activeSport !== 'all' && ex.sport !== 'all' && ex.sport !== activeSport) return false;
      // 2. Filtro local de categoría
      if (activeCategory !== 'Todos' && ex.category !== activeCategory) return false;
      // 3. Búsqueda por texto
      if (search.trim() && !ex.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [search, activeCategory, activeSport]);

  const handleCreateEmpty = () => {
    onSelectExercise({
      id: `ex-new-${Date.now()}`,
      name: '',
      series: '1',
      reps: '',
      restSeconds: 0,
    });
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className={`fixed inset-0 bg-black/70 z-[80] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Sheet (85vh) */}
      <div
        className={`fixed bottom-0 left-0 w-full bg-[#141720] rounded-t-3xl z-[80] transition-transform duration-300 ease-out flex flex-col`}
        style={{
          height: '85dvh',
          transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
        }}
      >
        <div className="w-10 h-1.5 bg-border rounded-full mx-auto mt-3 mb-1 shrink-0" />
        
        {/* Header & Search */}
        <div className="px-5 pt-2 pb-3 border-b border-border/50 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-condensed font-black text-2xl">Biblioteca de Ejercicios</h3>
            <button onClick={handleClose} className="p-1.5 bg-surface text-muted rounded-full hover:text-text transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar ejercicio..."
              className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-text placeholder:text-muted/50 outline-none focus:border-blue transition-colors"
            />
          </div>
        </div>

        {/* Categories (Scrollable) */}
        <div className="px-4 py-3 shrink-0 overflow-x-auto hide-scrollbar flex items-center gap-2 border-b border-white/5">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-colors ${
                activeCategory === cat 
                  ? 'bg-blue/20 border-blue/40 text-blue' 
                  : 'bg-surface border-border text-muted hover:text-text'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 py-2 relative">
          {filteredExercises.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted">
              <p className="font-bold">No hay ejercicios</p>
              <p className="text-xs mt-1">Prueba con otra búsqueda o añade uno nuevo.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 pb-20">
              {filteredExercises.map(ex => (
                <button
                  key={ex.id}
                  onClick={() => onSelectExercise({
                    id: `ex-lib-${Date.now()}`,
                    name: ex.name,
                    series: ex.defaultSeries,
                    reps: ex.defaultReps || '',
                    duration: ex.defaultDuration || '',
                    restSeconds: ex.defaultRest || 0,
                  })}
                  className="w-full flex items-center justify-between px-4 py-3.5 bg-surface rounded-2xl border border-border hover:border-muted active:scale-[0.98] transition-all text-left"
                >
                  <div>
                    <p className="font-bold text-sm text-text">{ex.name}</p>
                    <p className="text-[10px] uppercase font-black tracking-wider text-muted mt-0.5">
                      {ex.category} • {ex.sport === 'all' ? 'MIXTO' : ex.sport.toUpperCase()}
                    </p>
                  </div>
                  <Plus size={18} className="text-blue" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sticky Bottom Create Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#141720] via-[#141720] to-transparent pointer-events-none">
          <div className="pointer-events-auto">
            <button
              onClick={handleCreateEmpty}
              className="w-full py-3.5 bg-surface border border-accent rounded-xl font-bold text-accent shadow-lg shadow-black/50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Crear ejercicio nuevo vacío
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
