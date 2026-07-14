import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Save, Plus, Eye, CalendarDays, X, CheckCircle } from 'lucide-react';
import BlockTypeSelector, { PREDEFINED_TYPES } from '../../components/timer/BlockTypeSelector';
import EditableBlock from '../../components/planner/EditableBlock';
import ExerciseLibrarySheet from '../../components/planner/ExerciseLibrarySheet';
import SessionReadView from '../../components/planner/SessionReadView';
import { usePlanner } from '../../context/PlannerContext';
import { SESSION_TYPES } from '../../data/mockPlanner';
import ExportSessionModal from '../../components/ExportSessionModal';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const generateId = (prefix = 'id') => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const makeFreshBlock = () => ({
  id: generateId('blk'),
  type: 'trabajo',
  color: '#27ae60',
  name: '',
  duration: '',
  exercises: [],
});

const BLANK_SESSION = {
  name: '',
  type: 'gym_potencia',
  blocks: [],
};

const DAYS_ES    = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo'];
const DAYS_FULL  = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
const DAYS_SHORT = ['L','M','X','J','V','S','D'];

const getWeekDates = (offset = 0) => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff + offset * 7);
  monday.setHours(0,0,0,0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
};

const isToday = (date) => date.toDateString() === new Date().toDateString();

const formatISO = (d) => { const pad = n => n.toString().padStart(2, '0'); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function SessionEditor() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const isEditMode = Boolean(sessionId);

  const { sessionTemplates, saveSessionTemplate, deleteSessionTemplate, assignSessionToDay } = usePlanner();

  // ── Draft State ─────────────────────────────────────────────────────────────
  const [draft, setDraft] = useState(() => {
    if (isEditMode) {
      const existing = sessionTemplates.find(t => t.id === sessionId);
      return existing ? { ...existing } : { ...BLANK_SESSION, id: sessionId };
    }
    return { ...BLANK_SESSION, id: generateId('session') };
  });

  const [initialDraft] = useState(() => JSON.stringify(draft));
  const hasChanges = JSON.stringify(draft) !== initialDraft;

  // ── UI State ────────────────────────────────────────────────────────────────
  const [libSheetOpen, setLibSheetOpen]     = useState(false);
  const [targetBlockIdx, setTargetBlockIdx] = useState(null);
  const [saveSheetOpen, setSaveSheetOpen]   = useState(false);
  const [showExport, setShowExport]         = useState(false);
  const [previewOpen, setPreviewOpen]       = useState(false);
  const [dayPickerOpen, setDayPickerOpen]   = useState(false);
  const [dayPickerWeekOffset, setDayPickerWeekOffset] = useState(0);
  const [toast, setToast]                   = useState('');

  // Toast helper
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  // ── Draft Helpers ────────────────────────────────────────────────────────────
  const updateDraft = (field, value) => setDraft(prev => ({ ...prev, [field]: value }));

  const handleBlockChange = (idx, updatedBlock) => {
    const newBlocks = [...draft.blocks];
    newBlocks[idx] = updatedBlock;
    updateDraft('blocks', newBlocks);
  };

  const handleAddBlock = (typeObj) => {
    const newBlock = {
      ...makeFreshBlock(),
      type: typeObj.id,
      color: typeObj.color,
    };
    updateDraft('blocks', [...draft.blocks, newBlock]);
  };

  const handleDeleteBlock = (idx) => {
    updateDraft('blocks', draft.blocks.filter((_, i) => i !== idx));
  };

  const handleDuplicateBlock = (idx) => {
    const copy = { ...draft.blocks[idx], id: generateId('blk') };
    const newBlocks = [...draft.blocks];
    newBlocks.splice(idx + 1, 0, copy);
    updateDraft('blocks', newBlocks);
  };

  const handleMoveBlock = (idx, dir) => {
    const newBlocks = [...draft.blocks];
    const target = idx + dir;
    if (target < 0 || target >= newBlocks.length) return;
    [newBlocks[idx], newBlocks[target]] = [newBlocks[target], newBlocks[idx]];
    updateDraft('blocks', newBlocks);
  };

  // ── Biblioteca de Ejercicios ─────────────────────────────────────────────────
  const openLibrary = (blockIndex) => {
    setTargetBlockIdx(blockIndex);
    setLibSheetOpen(true);
  };

  // Bug2 fix: usa setDraft(prev => ...) para evitar la closure sobre draft.blocks
  const handleExerciseSelected = useCallback((exercise) => {
    if (targetBlockIdx === null) {
      showToast('Error: no se pudo añadir el ejercicio');
      return;
    }
    setDraft(prev => {
      const newBlocks = [...prev.blocks];
      newBlocks[targetBlockIdx] = {
        ...newBlocks[targetBlockIdx],
        exercises: [
          ...newBlocks[targetBlockIdx].exercises,
          { ...exercise, id: generateId('ex') },
        ],
      };
      return { ...prev, blocks: newBlocks };
    });
    setLibSheetOpen(false);
  }, [targetBlockIdx]); // sin draft.blocks en deps — usa el updater funcional

  // ── Navegación hacia atrás con guarda ─────────────────────────────────────
  const handleBack = () => {
    if (hasChanges && !window.confirm('¿Salir sin guardar los cambios?')) return;
    navigate(-1);
  };

  // ── Validación ───────────────────────────────────────────────────────────────
  const isValid = draft.name.trim().length > 0 && draft.blocks.length > 0;

  // ── Guardado como plantilla ──────────────────────────────────────────────────
  // Helper: persiste sin navegar
  const _persistDraft = () => {
    const template = {
      ...draft,
      updatedAt: new Date().toISOString(),
      exercises: draft.blocks.reduce((acc, b) => acc + b.exercises.length, 0),
      duration: draft.blocks.reduce((acc, b) => acc + (parseInt(b.duration) || 0), 0),
    };
    saveSessionTemplate(template);
    return template;
  };

  const handleSaveTemplate = () => {
    _persistDraft();
    setSaveSheetOpen(false);
    showToast('Sesión guardada ✓');
    setTimeout(() => navigate('/plan'), 1200);
  };

  // ── Guardar y asignar a día — NO llama handleSaveTemplate (evita navigate prematuro)
  const handleSaveAndAssign = () => {
    _persistDraft();
    setSaveSheetOpen(false);
    setTimeout(() => setDayPickerOpen(true), 200);
  };

  // ── Vista previa ──────────────────────────────────────────────────────────────
  const handlePreview = () => {
    setSaveSheetOpen(false);
    setTimeout(() => setPreviewOpen(true), 200);
  };

  const handleExport = () => {
    setSaveSheetOpen(false);
    setTimeout(() => setShowExport(true), 200);
  };

  // Construye un objeto compatible con SessionReadView
  const previewSession = {
    sessionId: draft.id,
    name: draft.name || 'Sin nombre',
    icon: SESSION_TYPES[draft.type]?.icon || '🏋️',
    duration: draft.blocks.reduce((acc, b) => acc + (parseInt(b.duration) || 0), 0),
    exercises: draft.blocks.reduce((acc, b) => acc + b.exercises.length, 0),
    intensity: 'Media',
    type: draft.type,
  };

  // ── Eliminar Sesión (modo edición) ───────────────────────────────────────────
  const handleDelete = () => {
    if (!window.confirm('¿Eliminar esta sesión? Esta acción no se puede deshacer.')) return;
    deleteSessionTemplate(sessionId);
    navigate('/plan');
  };

  const sessionTypeEntries = Object.entries(SESSION_TYPES).filter(([k]) => k !== 'descanso');

  return (
    <div className="flex flex-col min-h-screen bg-bg text-text">

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-surface border-b border-border/50 px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-border bg-card shrink-0 active:scale-95 transition-transform"
          >
            <ChevronLeft size={20} />
          </button>

          <input
            type="text"
            value={draft.name}
            onChange={(e) => updateDraft('name', e.target.value)}
            placeholder="Nombre de la sesión..."
            className="flex-1 min-w-0 bg-transparent outline-none font-condensed font-black text-2xl text-text placeholder:text-muted/40 leading-tight"
          />

          <button
            disabled={!isValid}
            onClick={() => setSaveSheetOpen(true)}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent font-bold text-white text-sm disabled:opacity-30 active:scale-95 transition-all shadow-md shadow-accent/25"
          >
            <Save size={15} />
            {isEditMode ? 'Guardar cambios' : 'Guardar'}
          </button>
        </div>

        {/* ── TYPE PILLS ── */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto hide-scrollbar pb-0.5">
          {sessionTypeEntries.map(([key, cfg]) => {
            const active = draft.type === key;
            return (
              <button
                key={key}
                onClick={() => updateDraft('type', key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all shrink-0 ${
                  active ? 'border-transparent text-white' : 'border-border text-muted hover:text-text bg-surface'
                }`}
                style={active ? { backgroundColor: cfg.color, boxShadow: `0 0 12px ${cfg.color}50` } : {}}
              >
                <span>{cfg.icon}</span>
                <span>{cfg.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── CUERPO — BLOQUES ─────────────────────────────────────────────────── */}
      <div
        className="flex-1 px-4 pt-4"
        style={{ paddingBottom: isEditMode ? '8rem' : '6rem' }}
      >
        {draft.blocks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-5xl mb-4">📋</div>
            <p className="font-bold text-lg text-text">Sin bloques todavía</p>
            <p className="text-muted text-sm mt-1">Añade el primer bloque de ejercicios abajo</p>
          </div>
        )}

        {draft.blocks.map((block, idx) => (
          <EditableBlock
            key={block.id}
            block={block}
            blockIndex={idx}
            isFirst={idx === 0}
            isLast={idx === draft.blocks.length - 1}
            onChange={(updated) => handleBlockChange(idx, updated)}
            onDelete={() => handleDeleteBlock(idx)}
            onDuplicate={() => handleDuplicateBlock(idx)}
            onMoveUp={() => handleMoveBlock(idx, -1)}
            onMoveDown={() => handleMoveBlock(idx, +1)}
            onAddExerciseClick={openLibrary}
          />
        ))}

        {/* -- Añadir Bloque (dashed button) ─── */}
        <AddBlockButton onAdd={handleAddBlock} />
      </div>

      {/* ── FOOTER DELETE (solo modo edición) ────────────────────────────────── */}
      {isEditMode && (
        <div className="fixed bottom-16 left-0 right-0 px-4 py-3 bg-bg border-t border-border/30">
          <button
            onClick={handleDelete}
            className="w-full py-3 rounded-xl border border-accent/40 text-accent font-bold text-sm hover:bg-accent/10 active:scale-[0.98] transition-all"
          >
            Eliminar sesión
          </button>
        </div>
      )}

      {/* ── BIBLIOTECA DE EJERCICIOS ──────────────────────────────────────────── */}
      <ExerciseLibrarySheet
        open={libSheetOpen}
        onClose={() => setLibSheetOpen(false)}
        onSelectExercise={handleExerciseSelected}
      />

      {/* ── SAVE SHEET ───────────────────────────────────────────────────────── */}
      <SaveOptionsSheet
        open={saveSheetOpen}
        isEditMode={isEditMode}
        onClose={() => setSaveSheetOpen(false)}
        onSaveTemplate={handleSaveTemplate}
        onSaveAndAssign={handleSaveAndAssign}
        onPreview={handlePreview}
        onExport={handleExport}
      />

      {/* ── DAY PICKER SHEET ─────────────────────────────────────────────────── */}
      {dayPickerOpen && (
        <DayPickerSheet
          weekOffset={dayPickerWeekOffset}
          onSetOffset={setDayPickerWeekOffset}
          onClose={() => setDayPickerOpen(false)}
          onSelect={(date, dayLabel) => {
            // Bug1 fix: asigna la sesión a la fecha real del día seleccionado
            const sessionData = {
              ...draft,
              sessionId: draft.id,
              icon: SESSION_TYPES[draft.type]?.icon || '🏋️',
              intensity: 'Media',
              intensityLevel: 3,
              sport: 'all',
              exercises: draft.blocks.reduce((acc, b) => acc + b.exercises.length, 0),
              duration: draft.blocks.reduce((acc, b) => acc + (parseInt(b.duration) || 0), 0),
            };
            assignSessionToDay(formatISO(date), sessionData);
            setDayPickerOpen(false);
            showToast(`"»${draft.name}«" asignado al ${dayLabel} ✓`);
            setTimeout(() => navigate('/plan'), 1200);
          }}
        />
      )}

      {/* ── PREVIEW (reutiliza SessionReadView) ──────────────────────────────── */}
      {previewOpen && (
        <SessionReadView
          session={previewSession}
          dayDate={new Date()}
          dayLabel="Vista Previa"
          onClose={() => setPreviewOpen(false)}
        />
      )}

      {/* ── EXPORT MODAL ─────────────────────────────────────────────────────── */}
      {showExport && (
        <ExportSessionModal 
          sessionData={draft} 
          onClose={() => setShowExport(false)} 
        />
      )}

      {/* ── TOAST ────────────────────────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 bg-surface border border-border rounded-2xl px-5 py-3 shadow-xl text-sm font-bold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle size={16} className="text-green shrink-0" />
          {toast}
        </div>
      )}
    </div>
  );
}

// ─── AddBlockButton ───────────────────────────────────────────────────────────
function AddBlockButton({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const handleOpen = () => {
    setOpen(true);
    setTimeout(() => setIsVisible(true), 10);
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => setOpen(false), 280);
  };

  const handleSelect = (typeObj) => {
    handleClose();
    onAdd(typeObj);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="w-full py-4 mb-4 flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border text-muted font-bold text-sm hover:border-accent/40 hover:text-accent transition-all active:scale-[0.98]"
      >
        <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center">
          <Plus size={14} strokeWidth={3} />
        </div>
        Añadir Bloque
      </button>

      {open && (
        <>
          <div
            onClick={handleClose}
            className={`fixed inset-0 bg-black/60 z-[70] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
          />
          <div
            className="fixed bottom-0 left-0 w-full bg-[#1a1f2e] border-t border-white/10 rounded-t-3xl z-[70] transition-transform duration-300 ease-out"
            style={{
              paddingBottom: 'calc(1.5rem + var(--safe-bottom,0px))',
              transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
            }}
          >
            <div className="w-10 h-1.5 bg-border rounded-full mx-auto mt-3 mb-1" />
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
              <h3 className="font-condensed font-black text-xl">Selecciona el tipo de bloque</h3>
              <button onClick={handleClose} className="p-1.5 bg-surface rounded-full text-muted"><X size={18} /></button>
            </div>
            <div className="px-4 pt-3 flex flex-col gap-2 max-h-[60vh] overflow-y-auto pb-4">
              {PREDEFINED_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => handleSelect(type)}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-surface border border-border hover:border-muted text-left active:scale-[0.98] transition-all"
                >
                  <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: type.color }} />
                  <span className="font-bold text-[15px]">{type.name}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ─── SaveOptionsSheet ─────────────────────────────────────────────────────────
function SaveOptionsSheet({ open, isEditMode, onClose, onSaveTemplate, onSaveAndAssign, onPreview, onExport }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (open) setTimeout(() => setIsVisible(true), 10);
    else setIsVisible(false);
  }, [open]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 280);
  };

  if (!open) return null;

  return (
    <>
      <div
        onClick={handleClose}
        className={`fixed inset-0 bg-black/60 z-[80] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      />
      <div
        className="fixed bottom-0 left-0 w-full bg-[#1a1f2e] rounded-t-3xl border-t border-white/10 z-[80] transition-transform duration-300 ease-out"
        style={{
          paddingBottom: 'calc(1.5rem + var(--safe-bottom,0px))',
          transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
        }}
      >
        <div className="w-10 h-1.5 bg-border rounded-full mx-auto mt-3 mb-1" />
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
          <h3 className="font-condensed font-black text-xl">¿Qué quieres hacer?</h3>
          <button onClick={handleClose} className="p-1.5 bg-surface rounded-full text-muted"><X size={18} /></button>
        </div>
        <div className="px-4 pt-3 pb-2 flex flex-col gap-2">
          <button
            onClick={onSaveTemplate}
            className="flex items-start gap-4 px-4 py-4 bg-surface rounded-2xl border border-border hover:border-muted text-left active:scale-[0.98] transition-all"
          >
            <span className="text-2xl shrink-0">💾</span>
            <div>
              <p className="font-bold text-[15px]">Guardar como plantilla</p>
              <p className="text-xs text-muted mt-0.5">Disponible para asignar a cualquier día del calendario</p>
            </div>
          </button>
          <button
            onClick={onSaveAndAssign}
            className="flex items-start gap-4 px-4 py-4 bg-surface rounded-2xl border border-border hover:border-muted text-left active:scale-[0.98] transition-all"
          >
            <span className="text-2xl shrink-0">📅</span>
            <div>
              <p className="font-bold text-[15px]">Guardar y asignar a un día</p>
              <p className="text-xs text-muted mt-0.5">Guarda la plantilla y la coloca directamente en el calendario</p>
            </div>
          </button>
          <button
            onClick={onPreview}
            className="flex items-start gap-4 px-4 py-4 bg-surface rounded-2xl border border-border hover:border-muted text-left active:scale-[0.98] transition-all"
          >
            <span className="text-2xl shrink-0">👁</span>
            <div>
              <p className="font-bold text-[15px]">Vista previa</p>
              <p className="text-xs text-muted mt-0.5">See how this session looks before saving</p>
            </div>
          </button>
          <button
            onClick={onExport}
            className="flex items-start gap-4 px-4 py-4 bg-surface rounded-2xl border border-border hover:border-muted text-left active:scale-[0.98] transition-all"
          >
            <span className="text-2xl shrink-0">📤</span>
            <div>
              <p className="font-bold text-[15px]">Exportar sesión</p>
              <p className="text-xs text-muted mt-0.5">Genera un código corto para compartir</p>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}

// ─── DayPickerSheet ───────────────────────────────────────────────────────────
function DayPickerSheet({ weekOffset, onSetOffset, onClose, onSelect }) {
  const [isVisible, setIsVisible] = useState(false);
  const dates = getWeekDates(weekOffset);
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 280);
  };

  return (
    <>
      <div
        onClick={handleClose}
        className={`fixed inset-0 bg-black/60 z-[80] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      />
      <div
        className="fixed bottom-0 left-0 w-full bg-[#1a1f2e] border-t border-white/10 rounded-t-3xl z-[80] transition-transform duration-300 ease-out"
        style={{
          paddingBottom: 'calc(1.5rem + var(--safe-bottom,0px))',
          transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
        }}
      >
        <div className="w-10 h-1.5 bg-border rounded-full mx-auto mt-3 mb-1" />
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
          <h3 className="font-condensed font-black text-xl">¿Qué día?</h3>
          <button onClick={handleClose} className="p-1.5 bg-surface rounded-full text-muted"><X size={18} /></button>
        </div>

        {/* Week navigation */}
        <div className="flex items-center justify-between px-5 py-3">
          <button
            onClick={() => onSetOffset(weekOffset - 1)}
            disabled={weekOffset <= -2}
            className="text-muted font-bold text-sm disabled:opacity-30 hover:text-text transition-colors px-2"
          >
            ← Anterior
          </button>
          <span className="text-sm text-muted font-bold">
            {dates[0].getDate()} {months[dates[0].getMonth()]} – {dates[6].getDate()} {months[dates[6].getMonth()]}
          </span>
          <button
            onClick={() => onSetOffset(weekOffset + 1)}
            disabled={weekOffset >= 2}
            className="text-muted font-bold text-sm disabled:opacity-30 hover:text-text transition-colors px-2"
          >
            Siguiente →
          </button>
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1.5 px-4 pb-4">
          {dates.map((date, i) => {
            const today = isToday(date);
            return (
              <button
                key={i}
                onClick={() => onSelect(date, DAYS_FULL[i])}
                className={`flex flex-col items-center py-3 rounded-2xl border text-center transition-all active:scale-95 ${
                  today
                    ? 'border-accent/50 bg-accent/10 text-accent'
                    : 'border-border bg-surface text-text hover:border-muted'
                }`}
              >
                <span className="text-[10px] font-black tracking-wider text-muted">{DAYS_SHORT[i]}</span>
                <span className="font-condensed font-black text-lg leading-none mt-0.5">{date.getDate()}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
