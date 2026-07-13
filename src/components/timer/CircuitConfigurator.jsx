import React, { useState } from 'react';
import { useCircuit } from '../../context/CircuitContext';
import { Plus, Trash2, Copy, MoveUp, MoveDown, Save, Music, Play } from 'lucide-react';
import BlockTypeSelector from './BlockTypeSelector';

const PALETTE = ['#e8412a','#f5a623','#e67e22','#27ae60','#3d7dd4','#8e44ad','#16a085','#FF6B00'];
const SOUNDS = [
  { id: 'none',       label: 'Sin sonido' },
  { id: 'beep_short', label: 'Beep Corto' },
  { id: 'beep_long',  label: 'Beep Largo' },
  { id: 'bell',       label: 'Campana' },
  { id: 'voice',      label: 'Voz (Siguiente)' },
];

export default function CircuitConfigurator() {
  const {
    circuitName, setCircuitName,
    circuitBlocks, setCircuitBlocks,
    setExecutionStatus,
    saveTemplate, savedTemplates, loadTemplate,
  } = useCircuit();

  const [showTemplates, setShowTemplates] = useState(false);

  const totalSeconds = circuitBlocks.reduce((acc, b) => acc + b.timeSeconds * b.sets, 0);
  const totalMins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const totalSecs = (totalSeconds % 60).toString().padStart(2, '0');

  const addBlock = () => {
    setCircuitBlocks([...circuitBlocks, {
      id: 'blk_' + Date.now(),
      type: 'trabajo', name: 'Trabajo',
      sets: 1, timeSeconds: 30,
      reps: '', color: '#27ae60', sound: 'beep_short',
    }]);
  };

  const updateBlock = (index, field, value) => {
    const b = [...circuitBlocks]; b[index][field] = value; setCircuitBlocks(b);
  };

  const updateBlockType = (index, typeObj) => {
    const b = [...circuitBlocks];
    const wasDefault = ['Preparación','Calentamiento','Trabajo','Descanso','Cooldown','Libre'].includes(b[index].name);
    b[index].type  = typeObj.id;
    b[index].color = typeObj.color;
    if (wasDefault || !b[index].name.trim()) b[index].name = typeObj.name;
    setCircuitBlocks(b);
  };

  const updateBlockTime = (index, part, val) => {
    const b = [...circuitBlocks];
    let m = Math.floor(b[index].timeSeconds / 60);
    let s = b[index].timeSeconds % 60;
    if (part === 'm') m = parseInt(val) || 0;
    if (part === 's') s = parseInt(val) || 0;
    b[index].timeSeconds = m * 60 + s;
    setCircuitBlocks(b);
  };

  const removeBlock    = (i) => setCircuitBlocks(circuitBlocks.filter((_, idx) => idx !== i));
  const duplicateBlock = (i) => {
    const b = [...circuitBlocks];
    b.splice(i + 1, 0, { ...b[i], id: 'blk_' + Date.now() });
    setCircuitBlocks(b);
  };
  const moveBlock = (i, dir) => {
    if (i + dir < 0 || i + dir >= circuitBlocks.length) return;
    const b = [...circuitBlocks];
    [b[i], b[i + dir]] = [b[i + dir], b[i]];
    setCircuitBlocks(b);
  };

  const startCircuit = () => { if (circuitBlocks.length > 0) setExecutionStatus('running'); };

  return (
    <div className="flex flex-col h-full bg-[#F5F5F0] text-[#1C1C1E]">

      {/* HEADER */}
      <div className="flex items-center gap-2 px-4 pt-5 pb-3 bg-white border-b border-[#E8E8E4] sticky top-0 z-20 shadow-sm shrink-0">
        <input
          type="text"
          value={circuitName}
          onChange={e => setCircuitName(e.target.value)}
          className="flex-1 min-w-0 bg-transparent font-condensed font-black text-2xl text-[#1C1C1E] outline-none placeholder:text-[#A1A1AA] truncate"
          placeholder="Nuevo Circuito"
        />
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-[#F5F5F0] rounded-xl border border-[#E8E8E4] text-xs font-bold text-[#6E6E73] hover:text-[#1C1C1E] transition-colors"
        >
          <Save size={14} />
          <span className="hidden sm:inline">Plantillas</span>
        </button>
      </div>

      {/* TEMPLATES PANEL */}
      {showTemplates && (
        <div className="px-4 py-4 bg-white border-b border-[#E8E8E4] z-10 animate-fade-in">
          <h3 className="font-condensed text-[#6E6E73] font-bold text-[10px] tracking-widest uppercase mb-3">MIS PLANTILLAS</h3>
          <div className="flex flex-col gap-2">
            {savedTemplates.map(tpl => (
              <div key={tpl.id} className="flex justify-between items-center bg-[#F5F5F0] p-3 rounded-xl border border-[#E8E8E4]">
                <span className="font-bold text-sm text-[#1C1C1E] truncate pr-4">{tpl.name}</span>
                <button
                  onClick={() => { loadTemplate(tpl); setShowTemplates(false); }}
                  className="bg-[#FF6B00] text-white px-3 py-1 rounded-lg text-xs font-bold"
                >
                  Cargar
                </button>
              </div>
            ))}
            {savedTemplates.length === 0 && (
              <span className="text-[#A1A1AA] text-xs">No hay plantillas guardadas.</span>
            )}
          </div>
          <button
            onClick={() => { saveTemplate(); setShowTemplates(false); }}
            className="mt-4 w-full py-2 bg-[#F5F5F0] text-[#1C1C1E] font-bold rounded-xl border border-[#E8E8E4] text-sm hover:border-[#1C1C1E] transition-colors"
          >
            + Guardar circuito actual
          </button>
        </div>
      )}

      {/* BLOQUES */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 space-y-3" style={{ paddingBottom: 'calc(8rem + var(--safe-bottom, 0px))' }}>

        {circuitBlocks.map((block, i) => (
          <div
            key={block.id}
            className="bg-white rounded-2xl overflow-hidden border border-[#E8E8E4] shadow-sm"
            style={{ borderLeftWidth: '4px', borderLeftColor: block.color }}
          >
            {/* Block header */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b border-[#E8E8E4]"
              style={{ backgroundColor: `${block.color}10` }}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <BlockTypeSelector
                  value={block.type}
                  color={block.color}
                  onChange={(typeObj) => updateBlockType(i, typeObj)}
                />
                <input
                  type="text"
                  value={block.name}
                  onChange={e => updateBlock(i, 'name', e.target.value)}
                  className="flex-1 bg-transparent font-condensed font-black text-base text-[#1C1C1E] outline-none truncate placeholder:text-[#A1A1AA] min-w-0"
                  placeholder="Nombre del bloque"
                />
              </div>
              <div className="flex items-center gap-0.5 shrink-0 ml-2">
                <button onClick={() => moveBlock(i, -1)} disabled={i === 0}
                  className="p-1.5 text-[#A1A1AA] hover:text-[#1C1C1E] disabled:opacity-30 transition-colors">
                  <MoveUp size={15} />
                </button>
                <button onClick={() => moveBlock(i, 1)} disabled={i === circuitBlocks.length - 1}
                  className="p-1.5 text-[#A1A1AA] hover:text-[#1C1C1E] disabled:opacity-30 transition-colors">
                  <MoveDown size={15} />
                </button>
                <button onClick={() => duplicateBlock(i)}
                  className="p-1.5 text-[#A1A1AA] hover:text-[#3d7dd4] transition-colors">
                  <Copy size={15} />
                </button>
                <button onClick={() => removeBlock(i)}
                  className="p-1.5 text-[#A1A1AA] hover:text-red-500 transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {/* Block body */}
            <div className="p-4 flex flex-col gap-4">

              {/* Series + Reps */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#F5F5F0] border border-[#E8E8E4] rounded-xl p-3">
                  <span className="text-[10px] font-condensed font-bold text-[#6E6E73] uppercase tracking-widest block mb-2">Series</span>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => updateBlock(i, 'sets', Math.max(1, block.sets - 1))}
                      className="w-8 h-8 flex items-center justify-center bg-white border border-[#E8E8E4] rounded-full text-[#1C1C1E] font-black text-lg shadow-sm active:scale-95 transition-transform"
                    >−</button>
                    <span className="font-condensed font-black text-2xl text-[#1C1C1E]">{block.sets}</span>
                    <button
                      onClick={() => updateBlock(i, 'sets', block.sets + 1)}
                      className="w-8 h-8 flex items-center justify-center bg-white border border-[#E8E8E4] rounded-full text-[#1C1C1E] font-black text-lg shadow-sm active:scale-95 transition-transform"
                    >+</button>
                  </div>
                </div>

                <div className="bg-[#F5F5F0] border border-[#E8E8E4] rounded-xl p-3">
                  <label className="text-[10px] font-condensed font-bold text-[#6E6E73] uppercase tracking-widest block mb-2">
                    Reps <span className="normal-case font-normal opacity-50">(opc)</span>
                  </label>
                  <input
                    type="text"
                    value={block.reps}
                    onChange={e => updateBlock(i, 'reps', e.target.value)}
                    placeholder="15, Max..."
                    className="w-full bg-transparent font-condensed font-black text-xl text-[#1C1C1E] outline-none placeholder:text-[#D4D4D8] placeholder:font-normal placeholder:text-base"
                  />
                </div>
              </div>

              {/* Tiempo */}
              <div className="bg-[#F5F5F0] border border-[#E8E8E4] rounded-xl p-3 flex items-center gap-4">
                <span className="text-[10px] font-condensed font-bold text-[#6E6E73] uppercase tracking-widest w-14 shrink-0">Tiempo</span>
                <div className="flex-1 flex justify-center items-center gap-2">
                  <div className="flex flex-col items-center">
                    <input
                      type="number"
                      value={Math.floor(block.timeSeconds / 60).toString().padStart(2, '0')}
                      onChange={e => updateBlockTime(i, 'm', e.target.value)}
                      className="w-14 bg-white border border-[#E8E8E4] text-center font-condensed font-black text-3xl rounded-xl py-1.5 outline-none text-[#1C1C1E] shadow-sm"
                    />
                    <span className="text-[9px] text-[#A1A1AA] font-bold mt-1">MIN</span>
                  </div>
                  <span className="font-black text-2xl text-[#D4D4D8] pb-4">:</span>
                  <div className="flex flex-col items-center">
                    <input
                      type="number"
                      value={(block.timeSeconds % 60).toString().padStart(2, '0')}
                      onChange={e => updateBlockTime(i, 's', e.target.value)}
                      className="w-14 bg-white border border-[#E8E8E4] text-center font-condensed font-black text-3xl rounded-xl py-1.5 outline-none text-[#1C1C1E] shadow-sm"
                    />
                    <span className="text-[9px] text-[#A1A1AA] font-bold mt-1">SEG</span>
                  </div>
                </div>
              </div>

              {/* Color + Sonido */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  {block.type === 'libre' ? (
                    <select
                      value={block.color}
                      onChange={e => updateBlock(i, 'color', e.target.value)}
                      className="w-7 h-7 rounded-full border-2 border-white appearance-none outline-none cursor-pointer shadow-sm"
                      style={{ backgroundColor: block.color }}
                    >
                      {PALETTE.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: block.color }} />
                  )}
                  <span className="text-[10px] font-bold text-[#A1A1AA] capitalize">{block.type}</span>
                </div>

                <div className="flex items-center gap-1.5 bg-[#F5F5F0] border border-[#E8E8E4] px-3 py-1.5 rounded-lg">
                  <Music size={13} className="text-[#A1A1AA]" />
                  <select
                    value={block.sound}
                    onChange={e => updateBlock(i, 'sound', e.target.value)}
                    className="bg-transparent text-xs font-bold text-[#6E6E73] outline-none appearance-none w-28"
                  >
                    {SOUNDS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
              </div>

            </div>
          </div>
        ))}

        {/* EMPTY STATE */}
        {circuitBlocks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="w-20 h-20 bg-white border-2 border-dashed border-[#E8E8E4] rounded-3xl flex items-center justify-center mb-5 shadow-sm">
              <Plus size={36} className="text-[#D4D4D8]" />
            </div>
            <h3 className="font-condensed font-black text-2xl text-[#1C1C1E] mb-1">Tu circuito está vacío</h3>
            <p className="text-sm text-[#6E6E73] max-w-xs">Añade bloques de trabajo, descanso o calentamiento con el botón inferior.</p>
            <button
              onClick={addBlock}
              className="mt-6 flex items-center gap-2 bg-[#FF6B00] text-white font-condensed font-black px-6 py-3 rounded-2xl shadow-[0_4px_16px_rgba(255,107,0,0.3)] active:scale-95 transition-transform"
            >
              <Plus size={18} /> AÑADIR PRIMER BLOQUE
            </button>
          </div>
        )}
      </div>

      {/* FAB — solo visible cuando hay bloques */}
      {circuitBlocks.length > 0 && (
        <div className="fixed right-5 z-50" style={{ bottom: 'calc(5.5rem + var(--safe-bottom, 0px))' }}>
          <button
            onClick={addBlock}
            className="w-14 h-14 bg-[#3d7dd4] rounded-full shadow-[0_6px_20px_rgba(61,125,212,0.35)] flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-transform"
          >
            <Plus size={28} />
          </button>
        </div>
      )}

      {/* FOOTER */}
      <div
        className="fixed bottom-0 left-0 w-full bg-white border-t border-[#E8E8E4] px-5 py-4 z-40 flex items-center gap-4 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
        style={{ paddingBottom: 'calc(1rem + var(--safe-bottom, 0px))' }}
      >
        <div className="flex flex-col flex-1">
          <span className="text-[10px] font-condensed font-bold text-[#6E6E73] uppercase tracking-widest">Total</span>
          <span className="font-condensed font-black text-3xl text-[#1C1C1E] leading-none">{totalMins}:{totalSecs}</span>
        </div>
        <button
          onClick={startCircuit}
          disabled={circuitBlocks.length === 0}
          className="flex-1 py-4 bg-[#FF6B00] rounded-2xl font-condensed font-black text-xl text-white shadow-[0_4px_16px_rgba(255,107,0,0.3)] active:scale-[0.98] transition-transform disabled:opacity-40 disabled:active:scale-100 flex items-center justify-center gap-2"
        >
          <Play size={20} fill="white" /> INICIAR
        </button>
      </div>

    </div>
  );
}
