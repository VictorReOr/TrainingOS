import React, { useState, useEffect } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { EXECUTION_PRESET_DEFAULTS } from '../../data/executionPresets.js';

/**
 * ExecutionTypeSelector
 *
 * Bottom-sheet para seleccionar el tipo de ejecución de un bloque.
 * Sigue exactamente el patrón visual del proyecto (backdrop fade + sheet slide-up
 * + rounded-t-3xl + handle superior) — igual que SaveOptionsSheet/ExerciseLibrarySheet.
 *
 * Props:
 *   open     — boolean, controla si el sheet está montado
 *   value    — BlockExecutionType actual (execution?.type) o null/undefined
 *   onClose  — () => void, cierra sin cambios
 *   onChange — (executionObject | undefined) => void
 *              Si el usuario elige un tipo: recibe { type, restProfile, exerciseRoles: {} }
 *              Si elige 'Quitar estructura': recibe undefined
 */
export default function ExecutionTypeSelector({ open, value, onClose, onChange }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (open) setTimeout(() => setIsVisible(true), 10);
    else setIsVisible(false);
  }, [open]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 280);
  };

  const handleSelect = (typeKey) => {
    const preset = EXECUTION_PRESET_DEFAULTS[typeKey];
    const executionObject = {
      type: typeKey,
      restProfile: {
        mode: 'PRESET',
        presetId: preset.defaultRestPresetId,
      },
      exerciseRoles: {},
    };
    onChange(executionObject);
    handleClose();
  };

  const handleRemove = () => {
    onChange(undefined);
    handleClose();
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className={`fixed inset-0 bg-black/60 z-[80] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 w-full bg-white border-t border-border shadow-2xl rounded-t-3xl z-[80] transition-transform duration-300 ease-out"
        style={{
          paddingBottom: 'calc(1.5rem + var(--safe-bottom, 0px))',
          transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
        }}
      >
        {/* Handle */}
        <div className="w-10 h-1.5 bg-border rounded-full mx-auto mt-3 mb-1" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border/50">
          <h3 className="font-condensed font-black text-xl text-text">Estructura de ejecución</h3>
          <button
            onClick={handleClose}
            className="p-1.5 bg-bg text-muted hover:text-text rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Lista de tipos */}
        <div className="px-4 pt-3 flex flex-col gap-2 max-h-[60vh] overflow-y-auto pb-4">
          {Object.entries(EXECUTION_PRESET_DEFAULTS).map(([typeKey, cfg]) => {
            const isActive = value === typeKey;
            return (
              <button
                key={typeKey}
                onClick={() => handleSelect(typeKey)}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl border text-left transition-all active:scale-[0.98] shadow-sm ${
                  isActive
                    ? 'border-accent bg-accent/10'
                    : 'border-border bg-card hover:border-accent'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[15px] text-text">{cfg.label}</p>
                  <p className="text-xs text-muted mt-0.5">{cfg.preview}</p>
                </div>
                {isActive && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-accent/20 text-accent tracking-widest border border-accent/30 shrink-0">
                    ACTIVO
                  </span>
                )}
                {!isActive && <ChevronRight size={16} className="text-muted shrink-0" />}
              </button>
            );
          })}

          {/* Opción: quitar estructura */}
          <button
            onClick={handleRemove}
            className="flex items-center gap-4 px-4 py-3.5 rounded-2xl border border-dashed border-border text-left transition-all hover:border-muted active:scale-[0.98] mt-1"
          >
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[15px] text-muted">Quitar estructura</p>
              <p className="text-xs text-muted/70 mt-0.5">Vuelve al comportamiento por defecto (Serie Recta implícito)</p>
            </div>
            <X size={16} className="text-muted/60 shrink-0" />
          </button>
        </div>
      </div>
    </>
  );
}
