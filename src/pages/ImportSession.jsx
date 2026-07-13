import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DownloadCloud, ArrowLeft, Search, Play, CheckCircle, AlertTriangle,
  Clock, Dumbbell, ChevronDown, ChevronRight
} from 'lucide-react';
import { getSharedSession } from '../services/sheets';
import { usePlanner } from '../context/PlannerContext';
import { useSession } from '../context/SessionContext';

// ─── Inline session preview ───────────────────────────────────────────────────
function SessionPreview({ data, code, imported, onImport, onExecute, onBack }) {
  const totalExercises = data.blocks?.reduce((s, b) => s + (b.exercises?.length || 0), 0) || 0;
  const totalDuration  = data.blocks?.reduce((s, b) => s + (parseInt(b.duration) || 0), 0) || 0;

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F0] text-[#1C1C1E]">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 bg-white border-b border-[#E8E8E4] sticky top-0 z-30 flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 border border-[#E8E8E4] rounded-full flex items-center justify-center active:scale-95 transition-transform"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-condensed font-black text-[22px] leading-none text-[#1C1C1E] truncate">{data.name || 'Sesión Compartida'}</h1>
          <p className="text-[11px] font-bold text-[#FF6B00]/80 uppercase tracking-widest mt-0.5">Código: {code.toUpperCase()}</p>
        </div>
      </div>

      {/* Meta row */}
      <div className="bg-[#FFF3EC] border-b border-[#FF6B00]/20 px-5 py-3 flex items-center gap-6">
        <div className="flex items-center gap-1.5 text-[#E85D04] text-sm font-bold">
          <Clock size={14} /> {totalDuration > 0 ? `${totalDuration} min` : 'Sin duración'}
        </div>
        <div className="flex items-center gap-1.5 text-[#E85D04] text-sm font-bold">
          <Dumbbell size={14} /> {totalExercises} ejercicios
        </div>
      </div>

      {/* Blocks */}
      <div className="flex-1 px-4 py-4 space-y-3 overflow-y-auto" style={{ paddingBottom: 'calc(7rem + env(safe-area-inset-bottom))' }}>
        {data.blocks && data.blocks.length > 0 ? data.blocks.map((block, bi) => (
          <div key={block.id || bi} className="bg-white border border-[#E8E8E4] rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E8E8E4] bg-[#F9FAFB]">
              <span className="text-lg w-7 text-center">{block.icon || '💪'}</span>
              <h3 className="flex-1 font-condensed font-black text-sm tracking-widest uppercase text-[#1C1C1E] truncate">
                {block.name || `Bloque ${bi + 1}`}
              </h3>
              {block.duration && (
                <span className="text-[11px] font-bold text-[#6E6E73] border border-[#E8E8E4] px-2 py-0.5 rounded-lg">
                  {block.duration}
                </span>
              )}
            </div>

            <div className="divide-y divide-[#F5F5F0]">
              {(block.exercises || []).map((ex, ei) => (
                <div key={ex.id || ei} className="flex items-start gap-3 px-4 py-3">
                  <span className="font-condensed font-black text-xs text-[#D4D4D8] w-5 pt-0.5">{String(ei + 1).padStart(2, '0')}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[14px] text-[#1C1C1E] leading-snug">{ex.name}</p>
                    <p className="text-xs text-[#6E6E73] mt-0.5">
                      {ex.series && `${ex.series} series`}
                      {ex.reps && ` · ${ex.reps} reps`}
                      {ex.restSeconds > 0 && ` · ${ex.restSeconds}s rest`}
                    </p>
                    {ex.notes && <p className="text-xs text-[#A1A1AA] italic mt-0.5">💡 {ex.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )) : (
          <div className="bg-white border border-[#E8E8E4] rounded-2xl p-10 text-center">
            <Dumbbell size={32} className="mx-auto text-[#D4D4D8] mb-3" />
            <p className="font-bold text-[#6E6E73]">Sin bloques de ejercicios</p>
          </div>
        )}
      </div>

      {/* Action footer */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-[#E8E8E4] p-4 flex gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] z-40">
        <button
          onClick={onImport}
          disabled={imported}
          className="flex-1 py-3.5 bg-[#F5F5F0] border border-[#E8E8E4] rounded-2xl font-condensed font-bold text-[#1C1C1E] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50 text-sm uppercase tracking-wide"
        >
          {imported
            ? <><CheckCircle size={18} className="text-green-600" /> Guardado</>
            : <><DownloadCloud size={18} /> A Biblioteca</>
          }
        </button>
        <button
          onClick={onExecute}
          className="flex-[1.2] py-3.5 bg-[#FF6B00] shadow-[0_4px_16px_rgba(255,107,0,0.3)] rounded-2xl font-condensed font-black text-white flex items-center justify-center gap-2 active:scale-[0.98] transition-transform uppercase tracking-wide"
        >
          <Play size={18} fill="white" /> Entrenar
        </button>
      </div>
    </div>
  );
}

// ─── Main ImportSession page ──────────────────────────────────────────────────
export default function ImportSession() {
  const { code: urlCode } = useParams();
  const navigate = useNavigate();
  const { saveSessionTemplate } = usePlanner();
  const { loadSession } = useSession();

  const [inputCode, setInputCode]   = useState(urlCode || '');
  const [loading, setLoading]       = useState(false);
  const [errorMsg, setErrorMsg]     = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [imported, setImported]     = useState(false);

  // Auto-search when a code is in the URL
  useEffect(() => {
    if (urlCode && urlCode.length >= 5) {
      doSearch(urlCode);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlCode]);

  const doSearch = async (code) => {
    const target = code.toUpperCase().trim();
    if (target.length < 5) return;
    setLoading(true);
    setErrorMsg('');
    setPreviewData(null);
    setImported(false);

    try {
      const res = await getSharedSession(target);
      setPreviewData(res.data);
    } catch (e) {
      setErrorMsg(e.message || 'Código no válido o expirado.');
    } finally {
      setLoading(false);
    }
  };

  const handleImportToLibrary = () => {
    if (!previewData) return;
    saveSessionTemplate({ ...previewData, id: `session-import-${Date.now()}` });
    setImported(true);
  };

  const handleExecuteNow = () => {
    if (!previewData) return;
    loadSession({ ...previewData, id: `session-import-${Date.now()}` });
    navigate('/session');
  };

  // Show preview page when data loaded
  if (previewData) {
    return (
      <SessionPreview
        data={previewData}
        code={inputCode}
        imported={imported}
        onImport={handleImportToLibrary}
        onExecute={handleExecuteNow}
        onBack={() => setPreviewData(null)}
      />
    );
  }

  // ── Search screen ──────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F0] text-[#1C1C1E]">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 bg-white border-b border-[#E8E8E4] sticky top-0 z-30 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 border border-[#E8E8E4] rounded-full flex items-center justify-center active:scale-95 transition-transform"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-condensed font-black text-[28px] leading-tight">Importar Sesión</h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-5 justify-center" style={{ maxWidth: 480, margin: '0 auto', width: '100%' }}>
        <div className="bg-white border border-[#E8E8E4] rounded-3xl p-6 shadow-sm text-center relative overflow-hidden">
          {/* Decorative BG icon */}
          <div className="absolute -top-4 -right-4 opacity-[0.04] pointer-events-none">
            <DownloadCloud size={140} />
          </div>

          <div className="w-16 h-16 rounded-full bg-[#FFF3EC] mx-auto flex items-center justify-center mb-5">
            <DownloadCloud size={28} className="text-[#FF6B00]" />
          </div>

          <h2 className="font-condensed font-black text-2xl text-[#1C1C1E] mb-2">Recibir Sesión</h2>
          <p className="text-[#6E6E73] text-sm mb-7 leading-relaxed">
            Introduce el código de 8 caracteres que te envió tu entrenador para importar la sesión a tu app.
          </p>

          {/* Code input */}
          <input
            id="import-code-input"
            type="text"
            maxLength={8}
            value={inputCode}
            onChange={e => setInputCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && doSearch(inputCode)}
            placeholder="A3FX9K2P"
            autoCapitalize="characters"
            spellCheck={false}
            className="w-full text-center bg-[#F5F5F0] border-2 border-[#E8E8E4] focus:border-[#FF6B00] focus:bg-[#FFF3EC] outline-none rounded-2xl py-4 font-condensed font-black text-4xl tracking-[0.25em] uppercase text-[#1C1C1E] transition-all duration-150 mb-5 placeholder:text-[#D4D4D8] placeholder:tracking-normal"
          />

          {/* Error */}
          {errorMsg && (
            <div className="flex items-center justify-center gap-2 text-[#EF4444] text-sm font-bold bg-[#FEF2F2] border border-[#FCA5A5]/30 rounded-xl py-3 px-4 mb-5">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Search button */}
          <button
            id="import-search-btn"
            onClick={() => doSearch(inputCode)}
            disabled={loading || inputCode.length < 5}
            className="w-full py-4 bg-[#FF6B00] shadow-[0_4px_16px_rgba(255,107,0,0.3)] rounded-2xl font-condensed font-black text-xl text-white uppercase flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-40"
          >
            {loading
              ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><Search size={20} /> Buscar Sesión</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
