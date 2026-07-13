import React, { useState, useEffect } from 'react';
import { useAthlete } from '../context/AthleteContext';
import { ChevronDown, X } from 'lucide-react';

export default function SportSelector() {
  const { athlete, activeLabel, availableSports, activeSport, setActiveSport } = useAthlete();
  const [open, setOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [open]);

  const handleSelect = (id) => {
    setActiveSport(id);
    setIsVisible(false);
    setTimeout(() => setOpen(false), 280);
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => setOpen(false), 280);
  };

  return (
    <>
      {/* PILL TRIGGER */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border rounded-full text-sm font-bold text-text hover:border-accent hover:text-accent transition-colors active:scale-95"
        style={{ minWidth: 0 }}
      >
        <span className="truncate max-w-[120px]">{activeLabel}</span>
        <ChevronDown size={14} className="shrink-0 text-muted" />
      </button>

      {/* BOTTOM SHEET */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            onClick={handleClose}
            className={`fixed inset-0 bg-black/60 z-[80] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
          />

          {/* Sheet */}
          <div
            className={`fixed bottom-0 left-0 w-full bg-[#1a1f2e] border-t border-white/10 rounded-t-3xl z-[80] transition-transform duration-300 ease-out pb-[calc(1.5rem+var(--safe-bottom,0px))] ${
              isVisible ? 'translate-y-0' : 'translate-y-full'
            }`}
          >
            {/* Handle */}
            <div className="w-10 h-1.5 bg-border rounded-full mx-auto mt-3 mb-1" />

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
              <div>
                <p className="font-condensed font-black text-xl text-text">{athlete.name}</p>
                <p className="text-xs text-muted">Selecciona el deporte activo</p>
              </div>
              <button onClick={handleClose} className="p-1.5 bg-surface text-muted rounded-full">
                <X size={18} />
              </button>
            </div>

            {/* Sport List */}
            <div className="px-4 pt-3 flex flex-col gap-2">
              {/* Option: All */}
              <button
                onClick={() => handleSelect('all')}
                className={`flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl border transition-all ${
                  activeSport === 'all'
                    ? 'bg-accent/10 border-accent/60 text-accent'
                    : 'bg-surface border-border text-text hover:border-muted'
                }`}
              >
                <span className="text-2xl">{availableSports.map(s => s.icon).join('')}</span>
                <div className="flex flex-col items-start">
                  <span className="font-bold text-[15px]">Todos los deportes</span>
                  <span className="text-xs text-muted">{availableSports.map(s => s.label).join(' · ')}</span>
                </div>
                {activeSport === 'all' && (
                  <div className="ml-auto w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
              </button>

              {/* Individual sports */}
              {availableSports.map(sport => (
                <button
                  key={sport.id}
                  onClick={() => handleSelect(sport.id)}
                  className={`flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl border transition-all ${
                    activeSport === sport.id
                      ? 'bg-accent/10 border-accent/60 text-accent'
                      : 'bg-surface border-border text-text hover:border-muted'
                  }`}
                >
                  <span className="text-2xl">{sport.icon}</span>
                  <span className="font-bold text-[15px]">{sport.label}</span>
                  {activeSport === sport.id && (
                    <div className="ml-auto w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
