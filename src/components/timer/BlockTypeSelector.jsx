import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Check, X } from 'lucide-react';

const LS_KEY = 'trainingos_custom_block_types';

const PALETTE = [
  '#e8412a', '#f5a623', '#e67e22', '#27ae60',
  '#3d7dd4', '#8e44ad', '#16a085', '#e8eaf0',
];

export const PREDEFINED_TYPES = [
  { id: 'preparacion',   name: 'Preparación',   color: '#f5a623', custom: false },
  { id: 'calentamiento', name: 'Calentamiento', color: '#e67e22', custom: false },
  { id: 'trabajo',       name: 'Trabajo',       color: '#FF6B00', custom: false },
  { id: 'descanso',      name: 'Descanso',      color: '#3d7dd4', custom: false },
  { id: 'cooldown',      name: 'Cooldown',      color: '#27ae60', custom: false },
];

// Hook para custom types con persistencia
export function useCustomBlockTypes() {
  const [customTypes, setCustomTypes] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  const saveCustomTypes = (types) => {
    setCustomTypes(types);
    localStorage.setItem(LS_KEY, JSON.stringify(types));
  };

  const addCustomType = (name, color) => {
    const newType = {
      id: 'custom_' + Date.now(),
      name: name.trim(),
      color,
      custom: true,
    };
    saveCustomTypes([...customTypes, newType]);
    return newType;
  };

  const removeCustomType = (id) => {
    saveCustomTypes(customTypes.filter(t => t.id !== id));
  };

  const allTypes = [...PREDEFINED_TYPES, ...customTypes];

  return { customTypes, allTypes, addCustomType, removeCustomType };
}

// ─────────────────────────────────────────────
// COMPONENTE: BlockTypeSelector
// Props:
//   value     — id del tipo actual del bloque
//   color     — color del tipo actual
//   onChange  — función({ id, name, color }) cuando cambia
// ─────────────────────────────────────────────
export default function BlockTypeSelector({ value, color, onChange }) {
  const { allTypes, addCustomType, removeCustomType } = useCustomBlockTypes();

  const [open, setOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Modo "añadir custom"
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#e8412a');
  const nameInputRef = useRef(null);

  // Animación del sheet
  useEffect(() => {
    if (open) setTimeout(() => setIsVisible(true), 10);
    else setIsVisible(false);
  }, [open]);

  // Focus al abrir el form inline
  useEffect(() => {
    if (showAddForm && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [showAddForm]);

  const currentType = allTypes.find(t => t.id === value);
  const displayColor = currentType?.color || color;
  const displayName = currentType?.name || value;

  const handleSelect = (type) => {
    onChange({ id: type.id, name: type.name, color: type.color });
    setIsVisible(false);
    setTimeout(() => { setOpen(false); setShowAddForm(false); }, 280);
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => { setOpen(false); setShowAddForm(false); }, 280);
  };

  const handleAddCustom = () => {
    if (!newName.trim()) return;
    const newType = addCustomType(newName, newColor);
    onChange({ id: newType.id, name: newType.name, color: newType.color });
    setNewName('');
    setNewColor('#e8412a');
    setShowAddForm(false);
    setIsVisible(false);
    setTimeout(() => setOpen(false), 280);
  };

  const handleDeleteCustom = (e, id) => {
    e.stopPropagation();
    removeCustomType(id);
    // If deleted type was selected, revert to 'trabajo'
    if (value === id) {
      onChange({ id: 'trabajo', name: 'Trabajo', color: '#27ae60' });
    }
  };

  return (
    <>
      {/* TRIGGER BUTTON — muestra el tipo actual */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 bg-bg border border-border rounded-lg text-xs font-black uppercase transition-colors hover:border-muted active:scale-95"
        style={{ color: displayColor }}
      >
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: displayColor }}
        />
        {displayName}
        <span className="text-muted normal-case font-normal">▾</span>
      </button>

      {/* BOTTOM SHEET */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            onClick={handleClose}
            className={`fixed inset-0 bg-black/60 z-[90] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
          />

          {/* Sheet */}
          <div
            className={`fixed bottom-0 left-0 w-full bg-[#1a1f2e] border-t border-white/10 rounded-t-3xl z-[90] transition-transform duration-300 ease-out`}
            style={{
              paddingBottom: 'calc(1.5rem + var(--safe-bottom, 0px))',
              transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
            }}
          >
            {/* Handle */}
            <div className="w-10 h-1.5 bg-border rounded-full mx-auto mt-3 mb-1" />

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
              <h3 className="font-condensed font-black text-xl text-text">Tipo de Bloque</h3>
              <button onClick={handleClose} className="p-1.5 bg-surface text-muted rounded-full">
                <X size={18} />
              </button>
            </div>

            {/* Type list */}
            <div className="px-4 pt-3 flex flex-col gap-1.5 max-h-[60vh] overflow-y-auto">
              {allTypes.map(type => (
                <div key={type.id} className="flex items-center gap-2">
                  <button
                    onClick={() => handleSelect(type)}
                    className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-left ${
                      value === type.id
                        ? 'border-white/20 bg-white/5'
                        : 'border-border bg-surface hover:border-muted'
                    }`}
                  >
                    {/* Color dot */}
                    <div
                      className="w-4 h-4 rounded-full shrink-0"
                      style={{ backgroundColor: type.color }}
                    />
                    {/* Name */}
                    <span className="font-bold text-[15px] flex-1">{type.name}</span>
                    {/* Custom badge */}
                    {type.custom && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/10 text-muted tracking-widest">
                        CUSTOM
                      </span>
                    )}
                    {/* Selected check */}
                    {value === type.id && (
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: type.color }}
                      >
                        <Check size={12} strokeWidth={3} className="text-white" />
                      </div>
                    )}
                  </button>

                  {/* Delete button — solo custom */}
                  {type.custom && (
                    <button
                      onClick={(e) => handleDeleteCustom(e, type.id)}
                      className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-muted hover:text-accent hover:border-accent/40 transition-colors shrink-0"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}

              {/* ── ADD CUSTOM FORM / BUTTON ── */}
              {showAddForm ? (
                <div className="mt-2 p-4 bg-surface rounded-2xl border border-blue/40 flex flex-col gap-3">
                  <p className="text-xs font-bold text-blue tracking-widest">NUEVO TIPO PERSONALIZADO</p>
                  
                  {/* Name input */}
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddCustom(); if (e.key === 'Escape') setShowAddForm(false); }}
                    placeholder="Ej: Asalto, Poomsae, Saco..."
                    className="w-full bg-bg border border-border rounded-xl px-4 py-3 font-bold text-text placeholder:text-muted/50 outline-none focus:border-blue text-sm"
                  />

                  {/* Color picker */}
                  <div>
                    <p className="text-xs text-muted font-bold mb-2">Color</p>
                    <div className="flex gap-2 flex-wrap">
                      {PALETTE.map(c => (
                        <button
                          key={c}
                          onClick={() => setNewColor(c)}
                          className={`w-9 h-9 rounded-full transition-transform ${newColor === c ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-surface' : 'hover:scale-105'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Preview */}
                  {newName.trim() && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-bg rounded-xl border border-border">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: newColor }} />
                      <span className="font-bold text-sm" style={{ color: newColor }}>{newName}</span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/10 text-muted tracking-widest ml-1">CUSTOM</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setShowAddForm(false); setNewName(''); }}
                      className="flex-1 py-3 rounded-xl bg-bg border border-border text-muted font-bold text-sm"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleAddCustom}
                      disabled={!newName.trim()}
                      className="flex-1 py-3 rounded-xl font-bold text-sm text-white disabled:opacity-40 transition-all active:scale-[0.98]"
                      style={{ backgroundColor: newColor }}
                    >
                      Guardar Tipo
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-dashed border-border text-muted hover:border-blue hover:text-blue transition-colors mt-1"
                >
                  <div className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center shrink-0">
                    <Plus size={10} strokeWidth={3} />
                  </div>
                  <span className="font-bold text-[15px]">Añadir tipo personalizado</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
