import React, { useState, useMemo, useEffect } from 'react';
import { Trophy, TrendingUp, ClipboardList, ChevronRight, X, ChevronDown, Search, Share2, RotateCcw, Activity, Heart } from 'lucide-react';
import { usePR } from '../context/PRContext';
import { useAthlete } from '../context/AthleteContext';
import { useSession } from '../context/SessionContext';
import { useFeedback } from '../context/FeedbackContext';
import { useReadiness } from '../context/ReadinessContext';
import SportSelector from '../components/SportSelector';
import FeedbackSection from '../components/FeedbackSection';
import { useEvolutionData } from '../hooks/useEvolutionData';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceArea, CartesianGrid, Cell,
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const SESSION_TYPES = {
  gym_fuerza: { label: 'GYM FUERZA', color: '#FF6B00' },
  gym_hipertrofia: { label: 'GYM HIP', color: '#3d7dd4' },
  tkd: { label: 'TKD', color: '#E85D04' },
  cardio: { label: 'CARDIO', color: '#27ae60' }
};

const relativeDate = (isoString) => {
  const d = new Date(isoString); const now = new Date();
  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'hoy'; if (diffDays === 1) return 'ayer';
  return `hace ${diffDays} días`;
};
const formatDate = (iso) => new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
const formatShortDate = (iso) => { const d = new Date(iso); return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`; };

const groupSessionsByWeek = (logs) => {
  const groups = [];
  const now = new Date();
  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay() || 7; // Sunday is 0, make it 7.
    d.setDate(d.getDate() - day + 1);
    d.setHours(0,0,0,0);
    return d;
  };
  
  const currentWeekStart = getStartOfWeek(now).getTime();
  
  logs.forEach(log => {
    const d = new Date(log.fecha);
    const wStart = getStartOfWeek(d);
    
    let label = '';
    if (wStart.getTime() === currentWeekStart) {
      label = 'Esta semana';
    } else {
      label = `Semana del ${wStart.getDate()} ${wStart.toLocaleString('es-ES', {month: 'short'})}`;
    }
    
    let group = groups.find(g => g.label === label);
    if (!group) {
      group = { label, date: wStart, sessions: [] };
      groups.push(group);
    }
    group.sessions.push(log);
  });
  
  return groups.sort((a,b) => b.date - a.date);
};

// Custom tooltip
const ChartTooltip = ({ active, payload, mode }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  const wrapperCls = "bg-white border border-[#E8E8E4] rounded-2xl p-3 shadow-xl";
  const lbl = <p className="text-[#6E6E73] text-[10px] font-bold mb-1 uppercase tracking-wider">{formatDate(data.fecha)}</p>;

  if (mode === '1rm') return (
    <div className={wrapperCls}>{lbl}
      <p className="text-[#FF6B00] font-condensed font-black text-2xl leading-none mb-1">
        {data.valor}<span className="text-sm font-sans font-normal text-[#6E6E73] ml-0.5">kg</span>
      </p>
      <p className="text-[#1C1C1E] text-xs font-bold">{data.cargaReal}kg × {data.repsReales}</p>
    </div>
  );
  if (mode === 'vol') return (
    <div className={wrapperCls}>{lbl}
      <p className="text-[#FF6B00] font-condensed font-black text-2xl leading-none">
        {data.volumenTotal?.toLocaleString()}<span className="text-sm font-sans font-normal text-[#6E6E73] ml-0.5">kg</span>
      </p>
      <p className="text-[10px] text-[#6E6E73] font-bold mt-1">Volumen Total</p>
    </div>
  );
  if (mode === 'rpe') return (
    <div className={wrapperCls}>{lbl}
      <p className="text-[#1C1C1E] font-condensed font-black text-2xl leading-none">
        {data.rpeMedio}<span className="text-sm font-sans font-normal text-[#6E6E73] ml-0.5">/ 10</span>
      </p>
      <p className="text-[10px] text-[#6E6E73] font-bold mt-1">Fatiga RPE Medio</p>
    </div>
  );
  if (mode === 'meso') return (
    <div className={`${wrapperCls} border-l-4`} style={{ borderLeftColor: data.mesoColor }}>{lbl}
      <p className="text-[#1C1C1E] font-condensed font-black text-2xl leading-none">
        {data.maxPR}<span className="text-sm font-sans font-normal text-[#6E6E73] ml-0.5">kg</span>
      </p>
      <p className="text-[10px] text-[#6E6E73] font-bold mt-1">PR Máximo</p>
    </div>
  );
  return null;
};

// Sparkline SVG con gradiente fill
const Sparkline = ({ data }) => {
  if (!data || data.length < 2) return null;
  const points = [...data].slice(0, 5).reverse();
  const max = Math.max(...points); const min = Math.min(...points);
  const W = 72; const H = 28;
  const coords = (val, i) => {
    const x = (i / (points.length - 1)) * W;
    const y = H - (max === min ? H / 2 : ((val - min) / (max - min)) * H);
    return { x, y };
  };
  const pts = points.map(coords);
  const polyline = pts.map(p => `${p.x},${p.y}`).join(' ');
  const fillPath = `M${pts[0].x},${pts[0].y} ${pts.slice(1).map(p => `L${p.x},${p.y}`).join(' ')} L${pts[pts.length-1].x},${H} L${pts[0].x},${H} Z`;

  return (
    <svg width={W} height={H} className="overflow-visible">
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill="url(#sg)" />
      <polyline points={polyline} fill="none" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length-1].x} cy={pts[pts.length-1].y} r="3" fill="#FF6B00" stroke="white" strokeWidth="1.5" />
    </svg>
  );
};

// PR History Sheet
const HistorySheet = ({ exerciseName, history, onClose }) => {
  const maxValor = Math.max(...history.map(h => h.valor));
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
      <div className="bg-white w-full rounded-t-[32px] pt-4 pb-12 px-5 flex flex-col shadow-2xl relative z-10 animate-slide-up h-[80vh] border-t border-[#E8E8E4]">
        <div className="w-10 h-1 bg-[#E8E8E4] rounded-full mx-auto mb-5" />
        <div className="flex justify-between items-center mb-5">
          <div>
            <p className="text-[10px] font-condensed font-bold text-[#6E6E73] tracking-widest uppercase mb-0.5">Historial</p>
            <h3 className="font-condensed font-black text-2xl text-[#1C1C1E]">{exerciseName}</h3>
          </div>
          <button onClick={onClose} className="p-2 bg-[#F5F5F0] rounded-full text-[#6E6E73] hover:text-[#1C1C1E] transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto hide-scrollbar -mx-1 px-1 space-y-2.5">
          {history.length === 0 ? (
            <p className="text-center text-[#6E6E73] mt-10">No hay registros</p>
          ) : history.map(record => {
            const isPR = record.valor === maxValor;
            return (
              <div key={record.id} className={`bg-[#F5F5F0] rounded-2xl border flex justify-between items-center px-4 py-3.5 ${isPR ? 'border-[#FF6B00] border-l-4' : 'border-[#E8E8E4]'}`}>
                <div>
                  <div className="text-[#6E6E73] text-xs font-bold mb-1">{formatDate(record.fecha)}</div>
                  <div className="text-[#1C1C1E] font-condensed font-bold text-xl">
                    {record.cargaReal}kg × {record.repsReales}
                    <span className="text-[#6E6E73] text-sm ml-1 font-sans font-normal">reps</span>
                  </div>
                </div>
                <div className="text-right">
                  {isPR && <span className="inline-block bg-[#FF6B00] text-white font-black text-[10px] px-2 py-0.5 rounded-full mb-1">🏆 PR</span>}
                  <div className="font-condensed font-black text-2xl text-[#FF6B00]">
                    {Math.round(record.valor)}<span className="text-sm font-sans font-normal text-[#6E6E73] ml-0.5">kg</span>
                  </div>
                  <div className="text-[10px] text-[#6E6E73]">1RM estimado</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Section header
const SectionHeader = ({ title, sub }) => (
  <div className="mb-3">
    <h2 className="font-condensed font-black text-xl text-[#1C1C1E] uppercase tracking-wide leading-none">{title}</h2>
    {sub && <p className="text-[#6E6E73] text-xs mt-0.5">{sub}</p>}
  </div>
);

// Session Detail Bottom Sheet
const SessionDetailSheet = ({ log, onClose, handleRepeat }) => {
  if (!log) return null;
  const tType = SESSION_TYPES[log.sessionType] || { label: 'SESIÓN', color: '#6E6E73' };
  const { getFeedbackForSession, markSessionFeedbackAsRead } = useFeedback();
  const sessionFeedbacks = getFeedbackForSession(log.sessionId || log.id, log.atletaId || 'v-atleta-1');

  // Mark as read when sheet opens
  React.useEffect(() => {
    markSessionFeedbackAsRead(log.sessionId || log.id, log.atletaId || 'v-atleta-1');
  }, []);
  
  const handleShareLocal = () => {
    const min = Math.floor(log.duracion / 60);
    const msj = `💪 ¡Sesión en TrainingOS!\n🔥 ${log.sessionName}\n📅 ${formatDate(log.fecha)}\n🏋️‍♂️ Volumen: ${log.volumenTotal?.toLocaleString() || 0} kg\n🔋 RPE: ${log.rpeMedio}\n⏱️ ${min} min\n✅ ${log.ejerciciosCompletados}/${log.ejerciciosTotal} ejercicios`;
    if (navigator.share) {
      try { navigator.share({ title: 'Resumen Entreno', text: msj }); } catch {}
    } else {
      navigator.clipboard.writeText(msj);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
      <div className="bg-white w-full rounded-t-[32px] pt-4 pb-8 px-5 flex flex-col shadow-2xl relative z-10 animate-slide-up h-[95vh] border-t border-[#E8E8E4]">
        <div className="w-10 h-1 bg-[#E8E8E4] rounded-full mx-auto mb-5" />
        
        <div className="flex justify-between items-start mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-condensed font-black tracking-widest px-2 py-0.5 rounded uppercase" style={{ color: tType.color, backgroundColor: `${tType.color}20` }}>
                {tType.label}
              </span>
              <span className="text-[10px] font-bold text-[#6E6E73] uppercase tracking-wider">{formatDate(log.fecha)}</span>
            </div>
            <h3 className="font-condensed font-black text-3xl leading-none text-[#1C1C1E]">{log.sessionName}</h3>
          </div>
          <button onClick={onClose} className="p-2 bg-[#F5F5F0] rounded-full text-[#6E6E73] hover:text-[#1C1C1E] transition-colors shrink-0">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-[#F5F5F0] border border-[#E8E8E4] rounded-2xl p-3">
            <p className="text-[10px] text-[#6E6E73] font-bold uppercase tracking-widest mb-1">Volumen</p>
            <p className="font-condensed font-black text-2xl text-[#1C1C1E]">{log.volumenTotal?.toLocaleString()}<span className="text-sm font-sans font-normal ml-0.5">kg</span></p>
          </div>
          <div className="bg-[#F5F5F0] border border-[#E8E8E4] rounded-2xl p-3">
            <p className="text-[10px] text-[#6E6E73] font-bold uppercase tracking-widest mb-1">RPE Medio</p>
            <p className="font-condensed font-black text-2xl text-[#1C1C1E]">{log.rpeMedio}<span className="text-sm font-sans font-normal ml-0.5">/10</span></p>
          </div>
          <div className="bg-[#F5F5F0] border border-[#E8E8E4] rounded-2xl p-3">
            <p className="text-[10px] text-[#6E6E73] font-bold uppercase tracking-widest mb-1">Duración</p>
            <p className="font-condensed font-black text-2xl text-[#1C1C1E]">{Math.floor((log.duracion || 0)/60)}<span className="text-sm font-sans font-normal ml-0.5">min</span></p>
          </div>
          <div className="bg-[#F5F5F0] border border-[#E8E8E4] rounded-2xl p-3">
            <p className="text-[10px] text-[#6E6E73] font-bold uppercase tracking-widest mb-1">Ejercicios</p>
            <p className="font-condensed font-black text-2xl text-[#1C1C1E]">{log.ejerciciosCompletados}<span className="text-sm font-sans font-normal text-[#6E6E73] ml-1">/ {log.ejerciciosTotal}</span></p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar -mx-2 px-2 pb-4">
          <h4 className="font-condensed font-bold text-lg text-[#1C1C1E] uppercase tracking-wide mb-3">Desglose</h4>
          {(log.ejercicios || []).map((ex, i) => (
            <div key={i} className="mb-4">
              <p className="font-bold text-[#1C1C1E] text-sm mb-2">{ex.nombre}</p>
              <div className="bg-white border border-[#E8E8E4] rounded-xl overflow-hidden">
                {(ex.seriesLog || []).filter(s => s.done).map((serie, sIdx) => (
                  <div key={sIdx} className="flex items-center px-4 py-2 border-b border-[#E8E8E4] last:border-b-0 text-sm">
                    <div className="w-10 text-[#6E6E73] font-condensed font-bold">S{sIdx + 1}</div>
                    <div className="w-20 font-bold text-[#1C1C1E]">{serie.carga} kg</div>
                    <div className="w-20 font-bold text-[#1C1C1E]">{serie.reps} reps</div>
                    <div className="text-right flex-1 text-[#6E6E73] text-xs font-bold bg-[#F5F5F0] px-2 py-0.5 rounded-md inline-block max-w-fit ml-auto">
                      RPE {serie.rpe || '-'}
                    </div>
                  </div>
                ))}
                {(!ex.seriesLog || ex.seriesLog.filter(s => s.done).length === 0) && (
                  <div className="px-4 py-3 text-sm text-[#6E6E73] italic">No se registró carga</div>
                )}
              </div>
            </div>
          ))}

          {/* Feedback */}
          <div className="mt-4 border-t border-[#E8E8E4] pt-4">
            <h4 className="font-condensed font-bold text-lg text-[#1C1C1E] uppercase tracking-wide mb-3">
              💬 Feedback ({sessionFeedbacks.length})
            </h4>
            <FeedbackSection
              sessionId={log.sessionId || log.id}
              atletaId={log.atletaId || 'v-atleta-1'}
            />
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <button onClick={handleShareLocal} className="w-14 shrink-0 bg-white border border-[#E8E8E4] text-[#6E6E73] rounded-2xl flex items-center justify-center hover:border-[#6E6E73] active:scale-95 transition-all">
            <Share2 size={20} />
          </button>
          <button onClick={() => handleRepeat(log)} className="flex-1 bg-[#FF6B00] text-white font-condensed font-black text-xl rounded-2xl py-3.5 shadow-sm active:scale-[0.98] transition-transform flex justify-center items-center gap-2">
            <RotateCcw size={20} /> REPETIR SESIÓN
          </button>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════
export default function Evolution() {
  const navigate = useNavigate();
  const { prs, getPRForExercise, getPRHistory } = usePR();
  const { activeSport } = useAthlete();
  const { loadSession } = useSession();
  const { exercisesWithPRs, sessionLogs, getMesocycleComparison, getExerciseChartData, hasData, isDemoMode } = useEvolutionData();

  const [activeTab, setActiveTab]                     = useState('prs');
  const [activeCategory, setActiveCategory]           = useState('Todos');
  const [selectedHistoryExercise, setSelectedHistoryExercise] = useState(null);
  const [selectedChartExId, setSelectedChartExId]     = useState('');
  
  // History State
  const [historySearch, setHistorySearch]             = useState('');
  const [historyFilter, setHistoryFilter]             = useState('Todas');
  const [selectedHistoryLog, setSelectedHistoryLog]   = useState(null);

  useEffect(() => {
    if (activeTab === 'graficas' && exercisesWithPRs.length > 0) {
      if (!selectedChartExId || !exercisesWithPRs.some(e => e.exerciseId === selectedChartExId))
        setSelectedChartExId(exercisesWithPRs[0].exerciseId);
    }
  }, [activeTab, exercisesWithPRs, selectedChartExId]);

  const uniqueExerciseIds = useMemo(() => [...new Set(prs.map(pr => pr.exerciseId))], [prs]);
  const categoryChips     = ['Todos', 'Fuerza', 'Potencia', 'Core', 'TKD'];
  const historyChips      = ['Todas', 'Gym', 'TKD', 'Cardio', 'Esta semana', 'Este mes'];

  const cards = uniqueExerciseIds.map(id => {
    const bestRecord = getPRForExercise(id);
    const history    = getPRHistory(id);
    let cat = 'Fuerza';
    if (bestRecord?.exerciseName) {
      if (bestRecord.exerciseName.toLowerCase().includes('clean')) cat = 'Potencia';
      if (bestRecord.exerciseName.toLowerCase().includes('core') || bestRecord.exerciseName.toLowerCase().includes('plancha')) cat = 'Core';
    }
    return { id, name: bestRecord.exerciseName, cat, sport: 'GYM', valor: Math.round(bestRecord.valor), carga: bestRecord.cargaReal, reps: bestRecord.repsReales, fecha: bestRecord.fecha, history };
  });

  const filteredCards = cards.filter(c => activeCategory === 'Todos' || c.cat === activeCategory);

  const chart1Data = useMemo(() => getExerciseChartData(selectedChartExId), [selectedChartExId, getExerciseChartData]);
  const chart4Data = useMemo(() => getMesocycleComparison(selectedChartExId), [selectedChartExId, getMesocycleComparison]);
  
  const overloadChartData = useMemo(() => {
    if (!selectedChartExId) return [];
    const history = [];
    const sortedLogs = [...sessionLogs].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    sortedLogs.forEach(log => {
      const ex = (log.ejercicios || []).find(e => e.id === selectedChartExId);
      if (ex && ex.seriesLog && ex.seriesLog.length > 0) {
        const loads = ex.seriesLog.map(s => parseFloat(s.carga)).filter(v => !isNaN(v) && v > 0);
        if (loads.length > 0) {
          const avgLoad = loads.reduce((a, b) => a + b, 0) / loads.length;
          history.push({
            fecha: log.fecha,
            cargaReal: avgLoad,
            prescribedLoad: ex.prescribedLoad || avgLoad,
            avgRPE: ex.avgRPE || 8.0,
            rpeTarget: ex.rpeTarget || 8.0
          });
        }
      }
    });
    return history;
  }, [selectedChartExId, sessionLogs]);

  const { athlete } = useAthlete();
  const potentialPct = useMemo(() => {
    if (!selectedChartExId) return 0;
    const bestRecord = getPRForExercise(selectedChartExId);
    if (!bestRecord) return 0;
    const e1RM = bestRecord.valor;
    const level = athlete?.level || 'intermedio';
    const factor = level === 'novato' ? 2.5 : level === 'avanzado' ? 1.2 : 1.5;
    const pMax = e1RM * factor;
    return Math.round((e1RM / pMax) * 100);
  }, [selectedChartExId, prs, athlete]);

  const meanRPE    = useMemo(() => {
    if (!sessionLogs.length) return 7;
    return sessionLogs.reduce((acc, curr) => acc + curr.rpeMedio, 0) / sessionLogs.length;
  }, [sessionLogs]);
  const rpeColor   = meanRPE < 7 ? '#27ae60' : meanRPE <= 8.5 ? '#FF6B00' : '#EF4444';

  const { 
    wellnessLogs, 
    cmjLogs, 
    cardioTests, 
    bodyMetrics, 
    cmjStats,
    saveMetrics
  } = useReadiness();

  const [activeTestSubTab, setActiveTestSubTab] = useState('wellness');

  // Body Composition Form States
  const [showAddMetrics, setShowAddMetrics] = useState(false);
  const [metricDate, setMetricDate] = useState(() => new Date().toLocaleDateString('sv'));
  const [metricWeight, setMetricWeight] = useState('');
  const [metricFat, setMetricFat] = useState('');
  const [metricWaist, setMetricWaist] = useState('');
  const [metricArm, setMetricArm] = useState('');
  const [metricThigh, setMetricThigh] = useState('');
  const [isSavingMetrics, setIsSavingMetrics] = useState(false);

  const handleSaveMetrics = async (e) => {
    e.preventDefault();
    if (!metricWeight) return;
    setIsSavingMetrics(true);
    try {
      await saveMetrics({
        fecha: metricDate ? new Date(metricDate + 'T12:00:00').toISOString() : new Date().toISOString(),
        peso: metricWeight,
        grasa: metricFat,
        medidaCintura: metricWaist,
        medidaBrazo: metricArm,
        medidaMuslo: metricThigh
      });
      setMetricWeight('');
      setMetricFat('');
      setMetricWaist('');
      setMetricArm('');
      setMetricThigh('');
      setMetricDate(new Date().toLocaleDateString('sv'));
      setShowAddMetrics(false);
    } catch (err) {
      console.error('Error saving metrics', err);
    } finally {
      setIsSavingMetrics(false);
    }
  };

  const TABS = [
    { key: 'prs',      label: 'PRs',      Icon: Trophy },
    { key: 'graficas', label: 'Gráficas', Icon: TrendingUp },
    { key: 'tests',    label: 'Tests',    Icon: Activity },
    { key: 'historial',label: 'Historial',Icon: ClipboardList },
  ];

  // History filtering
  const filteredHistory = useMemo(() => {
    return sessionLogs.filter(log => {
      if (historySearch && !(log.sessionName || '').toLowerCase().includes(historySearch.toLowerCase())) return false;
      const type = log.sessionType || '';
      if (historyFilter === 'Gym' && !type.includes('gym')) return false;
      if (historyFilter === 'TKD' && type !== 'tkd') return false;
      if (historyFilter === 'Cardio' && type !== 'cardio') return false;
      
      const d = new Date(log.fecha);
      const now = new Date();
      if (historyFilter === 'Esta semana') {
        const diffDays = (now - d) / (1000 * 60 * 60 * 24);
        if (diffDays > 7) return false;
      }
      if (historyFilter === 'Este mes') {
        if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return false;
      }
      return true;
    });
  }, [sessionLogs, historySearch, historyFilter]);

  const historyGroups = useMemo(() => groupSessionsByWeek(filteredHistory), [filteredHistory]);

  const tTotalSes = sessionLogs.length;
  const tVolMed = tTotalSes > 0 ? sessionLogs.reduce((a,c) => a + (c.volumenTotal || 0), 0) / tTotalSes : 0;
  
  // Calculate streak roughly
  const calcStreak = () => {
    let s = 0;
    const sorted = [...sessionLogs].sort((a,b) => new Date(b.fecha) - new Date(a.fecha));
    const uniqueDays = [...new Set(sorted.map(x => new Date(x.fecha).toDateString()))];
    const now = new Date();
    let current = new Date(now);
    let checkDay = current.toDateString();
    
    // Si hoy no entrenó, miramos si entrenó ayer para la racha continua.
    if (!uniqueDays.includes(checkDay)) {
       current.setDate(current.getDate() - 1);
       checkDay = current.toDateString();
    }
    
    while(uniqueDays.includes(checkDay)) {
      s++;
      current.setDate(current.getDate() - 1);
      checkDay = current.toDateString();
    }
    return s;
  };
  const activeStreak = calcStreak();

  const handleRepeatParams = (log) => {
    const reconstructedBlocks = [
      {
        id: `block-${Date.now()}`,
        name: 'Restaurado del Historial',
        type: 'principal',
        exercises: (log.ejercicios || []).map((ex, i) => ({
          id: ex.id || `ex-${i}`,
          name: ex.nombre || `Ejercicio ${i+1}`,
          series: ex.seriesLog ? ex.seriesLog.length : 3,
        }))
      }
    ];

    loadSession({
      id: log.sessionId,
      name: log.sessionName,
      type: log.sessionType,
      dayBadge: 'REPETICIÓN',
      blocks: reconstructedBlocks
    });
    navigate('/session');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F5F5F0]">

      {/* HEADER */}
      <div className="px-5 pt-6 pb-3 sticky top-0 bg-white border-b border-[#E8E8E4] z-30">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-[10px] font-condensed font-bold text-[#FF6B00] tracking-widest uppercase mb-0.5">TrainingOS</p>
            <h1 className="font-condensed font-black text-[42px] leading-none text-[#1C1C1E]">EVOLUCIÓN</h1>
          </div>
          <SportSelector />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#F5F5F0] p-1 rounded-2xl">
          {TABS.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 flex justify-center items-center gap-1.5 py-2.5 rounded-xl text-sm font-condensed font-black tracking-wide transition-all ${
                activeTab === key
                  ? 'bg-[#FF6B00] text-white shadow-sm'
                  : 'text-[#6E6E73] hover:text-[#1C1C1E]'
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {/* Category chips PRs */}
        {activeTab === 'prs' && (
          <div className="flex overflow-x-auto gap-2 hide-scrollbar pt-3 -mx-5 px-5 pb-0.5">
            {categoryChips.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  activeCategory === cat
                    ? 'border-[#FF6B00] text-[#FF6B00] bg-[#FFF3EC]'
                    : 'border-[#E8E8E4] text-[#6E6E73] bg-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Category chips Tests */}
        {activeTab === 'tests' && (
          <div className="flex overflow-x-auto gap-2 hide-scrollbar pt-3 -mx-5 px-5 pb-0.5">
            {[
              { id: 'wellness', label: 'Wellness' },
              { id: 'cmj', label: 'Salto CMJ' },
              { id: 'cardio', label: 'Cardio' },
              { id: 'composition', label: 'Composición' }
            ].map(sub => (
              <button
                key={sub.id}
                onClick={() => setActiveTestSubTab(sub.id)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  activeTestSubTab === sub.id
                    ? 'border-[#FF6B00] text-[#FF6B00] bg-[#FFF3EC]'
                    : 'border-[#E8E8E4] text-[#6E6E73] bg-white'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>
        )}

        {/* Category chips History */}
        {activeTab === 'historial' && (
          <div className="flex overflow-x-auto gap-2 hide-scrollbar pt-3 -mx-5 px-5 pb-0.5">
            {historyChips.map(cat => (
              <button
                key={cat}
                onClick={() => setHistoryFilter(cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  historyFilter === cat
                    ? 'border-[#FF6B00] text-[#FF6B00] bg-[#FFF3EC]'
                    : 'border-[#E8E8E4] text-[#6E6E73] bg-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="flex-1 px-4 pb-24 overflow-y-auto pt-4">

        {/* ── HISTORIAL tab ── */}
        {activeTab === 'historial' && (
          <div className="animate-fade-in-up">
            {/* STATS GLOBALES */}
            <div className="bg-white border border-[#E8E8E4] rounded-2xl flex divide-x divide-[#E8E8E4] shadow-sm mb-4">
              <div className="flex-1 py-3 px-2 text-center">
                <div className="text-[10px] text-[#6E6E73] font-condensed font-bold uppercase tracking-widest mb-0.5">TOTAL</div>
                <div className="font-condensed font-black text-[#1C1C1E] text-xl leading-none">{tTotalSes} <span className="text-xs font-sans font-normal text-[#6E6E73]">ses.</span></div>
              </div>
              <div className="flex-1 py-3 px-2 text-center">
                <div className="text-[10px] text-[#6E6E73] font-condensed font-bold uppercase tracking-widest mb-0.5">VOL MED</div>
                <div className="font-condensed font-black text-[#1C1C1E] text-xl leading-none">{Math.round(tVolMed).toLocaleString()} <span className="text-xs font-sans font-normal text-[#6E6E73]">kg</span></div>
              </div>
              <div className="flex-1 py-3 px-2 text-center">
                <div className="text-[10px] text-[#6E6E73] font-condensed font-bold uppercase tracking-widest mb-0.5">RACHA</div>
                <div className="font-condensed font-black text-[#FF6B00] text-xl leading-none">{activeStreak > 2 ? '🔥' : ''} {activeStreak} <span className="text-xs font-sans font-normal text-[#6E6E73]">días</span></div>
              </div>
            </div>

            {/* SEARCH */}
            <div className="relative mb-5">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6E6E73]" />
              <input 
                type="text" 
                placeholder="Buscar sesión..." 
                value={historySearch}
                onChange={e => setHistorySearch(e.target.value)}
                className="w-full bg-white border border-[#E8E8E4] rounded-xl py-3 pl-10 pr-4 text-sm font-bold placeholder:font-normal focus:border-[#FF6B00] outline-none shadow-sm"
              />
            </div>

            {/* LISTA AGRUPADA O VACIO */}
            {sessionLogs.length === 0 ? (
              <div className="mt-8 flex flex-col items-center justify-center text-center px-6">
                <div className="w-24 h-24 bg-[#FFF3EC] border border-[#FDDCB5] rounded-3xl flex items-center justify-center mb-5">
                  <span className="text-5xl">📋</span>
                </div>
                <h3 className="font-condensed font-black text-2xl text-[#1C1C1E] mb-2">Sin sesiones registradas</h3>
                <p className="text-[#6E6E73] text-sm max-w-[280px] leading-relaxed">
                  Guarda tu primera sesión para ver el historial aquí
                </p>
                <button
                  onClick={() => navigate('/session')}
                  className="mt-6 bg-[#FF6B00] text-white font-condensed font-black px-8 py-3.5 rounded-2xl shadow-[0_4px_16px_rgba(255,107,0,0.3)] active:scale-95 transition-transform flex items-center gap-2"
                >
                  Ir a entrenar →
                </button>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="text-center text-[#6E6E73] mt-10 text-sm">No se encontraron sesiones con esos filtros.</div>
            ) : (
              historyGroups.map((group, gIdx) => (
                <div key={gIdx} className="mb-6">
                  {/* Divisor agrupador */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1 h-px bg-[#E8E8E4]" />
                    <span className="text-[10px] font-condensed font-bold uppercase tracking-widest text-[#6E6E73]">{group.label}</span>
                    <div className="flex-1 h-px bg-[#E8E8E4]" />
                  </div>
                  
                  {/* Tarjetas */}
                  <div className="space-y-3">
                    {group.sessions.map((log, lIdx) => {
                      const tType = SESSION_TYPES[log.sessionType] || { label: 'SESIÓN', color: '#6E6E73' };
                      const rpeC = log.rpeMedio < 7 ? '#27ae60' : log.rpeMedio <= 8.5 ? '#FF6B00' : '#EF4444';
                      const isDemo = String(log.id).includes('mock');

                      return (
                        <div 
                          key={lIdx} 
                          onClick={() => setSelectedHistoryLog(log)}
                          className={`bg-white border border-[#E8E8E4] rounded-2xl overflow-hidden shadow-sm active:scale-[0.98] transition-transform stagger-${Math.min(lIdx+1, 7)} relative`}
                        >
                          <div className="bg-[#F5F5F0] px-4 py-2 border-b border-[#E8E8E4] flex justify-between items-center">
                            <div className="text-xs font-bold text-[#6E6E73] flex items-center gap-2">
                              {formatDate(log.fecha)}
                              {isDemo && <span className="bg-[#FEF2F2] text-[#EF4444] border border-[#FCA5A5] text-[9px] px-1.5 py-0.5 rounded leading-none">DEMO</span>}
                            </div>
                            <div className="text-[9px] font-condensed font-black tracking-widest px-2 py-0.5 rounded uppercase" style={{ color: tType.color, backgroundColor: `${tType.color}15` }}>
                              {tType.label}
                            </div>
                          </div>
                          
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-4">
                              <h3 className="font-condensed font-black text-xl text-[#1C1C1E] leading-tight pr-4">{log.sessionName}</h3>
                              <div className="text-right shrink-0 bg-[#F5F5F0] px-2 py-1 rounded-lg">
                                <div className="text-[#1C1C1E] font-condensed font-bold text-lg leading-none">{Math.floor((log.duracion || 0)/60)}<span className="text-xs font-sans ml-0.5">m</span></div>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center border-t border-[#E8E8E4] pt-3">
                              <div className="flex flex-col">
                                <span className="text-[10px] text-[#6E6E73] font-bold uppercase">Volumen</span>
                                <span className="text-[#1C1C1E] font-condensed font-black text-lg leading-none">📦 {(log.volumenTotal || 0).toLocaleString()} <span className="text-xs font-sans text-[#6E6E73] font-normal">kg</span></span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] text-[#6E6E73] font-bold uppercase">RPE</span>
                                <span className="font-condensed font-black text-lg leading-none" style={{ color: rpeC }}>🔋 {log.rpeMedio}</span>
                              </div>
                              <div className="flex flex-col pr-1">
                                <span className="text-[10px] text-[#6E6E73] font-bold uppercase">Ejercicios</span>
                                <span className="text-[#1C1C1E] font-condensed font-black text-lg leading-none">✅ {log.ejerciciosCompletados}/{log.ejerciciosTotal}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── PRs vacío ── */}
        {activeTab === 'prs' && filteredCards.length === 0 && (
          <div className="mt-8 flex flex-col items-center justify-center animate-fade-in-up text-center px-6">
            <div className="w-24 h-24 bg-[#FFF3EC] border border-[#FDDCB5] rounded-3xl flex items-center justify-center mb-5">
              <span className="text-5xl">🏆</span>
            </div>
            <h3 className="font-condensed font-black text-2xl text-[#1C1C1E] mb-2">
              Tu primera marca está<br />a una sesión de distancia
            </h3>
            <p className="text-[#6E6E73] text-sm max-w-[280px] leading-relaxed">
              Completa series con carga para que TrainingOS detecte tus PRs automáticamente
            </p>
            <button
              onClick={() => navigate('/session')}
              className="mt-6 bg-[#FF6B00] text-white font-condensed font-black px-8 py-3.5 rounded-2xl shadow-[0_4px_16px_rgba(255,107,0,0.3)] active:scale-95 transition-transform flex items-center gap-2"
            >
              Ir a entrenar →
            </button>
          </div>
        )}

        {/* ── PRs cards ── */}
        {activeTab === 'prs' && filteredCards.length > 0 && (
          <div className="space-y-3 animate-fade-in-up">
            {filteredCards.map((card, ci) => (
              <div
                key={card.id}
                className={`bg-white border border-[#E8E8E4] rounded-2xl overflow-hidden shadow-sm relative flex stagger-${Math.min(ci+1,7)}`}
              >
                {/* Green left bar */}
                <div className="w-1 bg-[#FF6B00] shrink-0" />

                <div className="p-4 flex-1">
                  {/* Top row */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-sans font-bold text-base text-[#1C1C1E] leading-tight">{card.name}</h3>
                      <div className="flex gap-2 mt-1.5">
                        <span className="text-[10px] font-black tracking-wider border border-[#E8E8E4] text-[#6E6E73] px-2 py-0.5 rounded-lg uppercase">
                          {card.cat}
                        </span>
                        <span className="text-[10px] font-black tracking-wider border border-[#E8E8E4] text-[#6E6E73] px-2 py-0.5 rounded-lg uppercase">
                          {card.sport}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedHistoryExercise(card)}
                      className="w-8 h-8 flex items-center justify-center bg-[#F5F5F0] border border-[#E8E8E4] rounded-full text-[#6E6E73] hover:text-[#1C1C1E] hover:border-[#6E6E73] transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  {/* Main metric + sparkline */}
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-[10px] font-condensed font-bold text-[#6E6E73] tracking-widest uppercase mb-1">
                        1RM ESTIMADO
                      </div>
                      <div className="font-condensed font-black text-5xl leading-none text-[#FF6B00] tabular-nums">
                        {card.valor}
                        <span className="text-lg font-sans font-normal text-[#6E6E73] ml-1">kg</span>
                      </div>
                      <div className="text-sm text-[#6E6E73] font-medium mt-1">
                        {card.carga}kg × {card.reps} reps
                        <span className="text-xs text-[#6E6E73]/60 ml-2">· {relativeDate(card.fecha)}</span>
                      </div>
                    </div>
                    <div className="pb-1 pr-1">
                      <Sparkline data={card.history.map(h => h.valor)} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── GRÁFICAS vacío ── */}
        {activeTab === 'graficas' && !hasData && (
          <div className="animate-fade-in-up space-y-4">
            {/* Mensaje motivacional */}
            <div className="mt-4 flex flex-col items-center justify-center text-center px-6">
              <div className="w-24 h-24 bg-[#FFF3EC] border border-[#FDDCB5] rounded-3xl flex items-center justify-center mb-5">
                <span className="text-5xl">📈</span>
              </div>
              <h3 className="font-condensed font-black text-2xl text-[#1C1C1E] mb-2">Tus gráficas aparecerán aquí</h3>
              <p className="text-[#6E6E73] text-sm max-w-[280px] leading-relaxed">
                Completa y guarda sesiones para ver tu evolución de fuerza, volumen y fatiga
              </p>
              <button
                onClick={() => navigate('/session')}
                className="mt-6 bg-[#FF6B00] text-white font-condensed font-black px-8 py-3.5 rounded-2xl shadow-[0_4px_16px_rgba(255,107,0,0.3)] active:scale-95 transition-transform flex items-center gap-2"
              >
                Empezar a entrenar →
              </button>
            </div>

            {/* Gráfica demo — Progresión de Fuerza */}
            <div className="bg-white border border-[#E8E8E4] rounded-2xl p-5 shadow-sm relative">
              <div className="absolute top-4 right-4 text-[10px] border border-[#FCA5A5] text-[#EF4444] px-2 py-0.5 rounded-lg font-bold bg-[#FEF2F2]">DEMO</div>
              <SectionHeader title="Progresión de Fuerza" sub="Estimado de 1 Repetición Máxima (Epley)" />
              <div style={{ width: '100%', height: 200 }}>
                <ResponsiveContainer>
                  <LineChart
                    data={[
                      { fecha: '2024-01-10', valor: 80 },
                      { fecha: '2024-01-24', valor: 85 },
                      { fecha: '2024-02-07', valor: 83 },
                      { fecha: '2024-02-21', valor: 90 },
                      { fecha: '2024-03-07', valor: 95 },
                      { fecha: '2024-03-21', valor: 100 },
                    ]}
                    margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E4" vertical={false} />
                    <XAxis dataKey="fecha" tickFormatter={formatShortDate} tick={{ fill: '#6E6E73', fontSize: 10 }} stroke="#E8E8E4" tickMargin={8} />
                    <YAxis domain={['auto','auto']} tick={{ fill: '#6E6E73', fontSize: 10 }} stroke="#E8E8E4" />
                    <Line type="monotone" dataKey="valor" stroke="#FF6B00" strokeWidth={2.5} strokeDasharray="6 3" dot={{ r: 4, fill: '#FF6B00', stroke: 'white', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfica demo — Volumen */}
            <div className="bg-white border border-[#E8E8E4] rounded-2xl p-5 shadow-sm relative">
              <div className="absolute top-4 right-4 text-[10px] border border-[#FCA5A5] text-[#EF4444] px-2 py-0.5 rounded-lg font-bold bg-[#FEF2F2]">DEMO</div>
              <SectionHeader title="Volumen Por Sesión" sub="Carga total desplazada (Carga × Reps)" />
              <div style={{ width: '100%', height: 180 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={[
                      { fecha: '2024-01-10', volumenTotal: 3200 },
                      { fecha: '2024-01-17', volumenTotal: 4100 },
                      { fecha: '2024-01-24', volumenTotal: 3800 },
                      { fecha: '2024-02-07', volumenTotal: 5200 },
                      { fecha: '2024-02-14', volumenTotal: 4900 },
                      { fecha: '2024-02-21', volumenTotal: 6100 },
                    ]}
                    margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
                  >
                    <XAxis dataKey="fecha" tickFormatter={formatShortDate} tick={{ fill: '#6E6E73', fontSize: 10 }} stroke="#E8E8E4" tickMargin={8} />
                    <Bar dataKey="volumenTotal" fill="#FF6B00" radius={[6,6,0,0]} opacity={0.5} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <button
              onClick={() => navigate('/session')}
              className="w-full bg-[#FF6B00] text-white font-condensed font-black text-xl rounded-2xl py-4 shadow-[0_4px_16px_rgba(255,107,0,0.3)] active:scale-[0.98] transition-transform"
            >
              EMPEZAR A ENTRENAR →
            </button>
          </div>
        )}

        {/* ── GRÁFICAS ── */}
        {activeTab === 'graficas' && hasData && (
          <div className="space-y-4 animate-fade-in-up">

            {/* Card wrapper */}
            {[
              {
                title: 'Progresión de Fuerza',
                sub: 'Estimado de 1 Repetición Máxima (Epley)',
                content: (
                  <>
                    <div className="relative mb-4 bg-[#F5F5F0] border border-[#E8E8E4] rounded-xl">
                      <select
                        value={selectedChartExId}
                        onChange={e => setSelectedChartExId(e.target.value)}
                        className="w-full appearance-none bg-transparent py-3 pl-4 pr-10 text-[#1C1C1E] font-bold outline-none"
                      >
                        {exercisesWithPRs.map(ex => (
                          <option key={ex.exerciseId} value={ex.exerciseId}>{ex.exerciseName}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-0 bottom-0 flex items-center pointer-events-none text-[#6E6E73]">
                        <ChevronDown size={16} />
                      </div>
                    </div>
                    {chart1Data.length > 1 ? (
                      <div style={{ width: '100%', height: 200 }}>
                        <ResponsiveContainer>
                          <LineChart data={chart1Data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E4" vertical={false} />
                            <XAxis dataKey="fecha" tickFormatter={formatShortDate} tick={{ fill: '#6E6E73', fontSize: 10 }} stroke="#E8E8E4" tickMargin={8} />
                            <YAxis domain={['auto','auto']} tick={{ fill: '#6E6E73', fontSize: 10 }} stroke="#E8E8E4" />
                            <Tooltip content={<ChartTooltip mode="1rm" />} cursor={{ stroke: '#FF6B00', strokeWidth: 1, strokeDasharray: '4 4' }} />
                            <Line type="monotone" dataKey="valor" stroke="#FF6B00" strokeWidth={2.5} dot={{ r: 4, fill: '#FF6B00', stroke: 'white', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#FF6B00' }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-[#E8E8E4] rounded-2xl text-[#6E6E73] text-sm text-center px-4">
                        Completa más sesiones para ver la progresión.
                      </div>
                    )}
                  </>
                ),
              },
              {
                title: 'Progresión de Sobrecarga',
                sub: 'Historial de cargas de entreno reales vs. prescripción científica del motor',
                content: (
                  <>
                    <div className="flex gap-3 mb-4">
                      <div className="bg-[#FFF3EC] border border-[#FF6B00]/20 rounded-xl p-3 flex-1 flex flex-col items-center">
                        <span className="text-[10px] text-[#6E6E73] font-bold uppercase tracking-wider mb-0.5">Potencial Realizado</span>
                        <span className="font-condensed font-black text-2xl text-[#FF6B00]">{potentialPct}%</span>
                      </div>
                      <div className="bg-[#F5F5F0] border border-[#E8E8E4] rounded-xl p-3 flex-1 flex flex-col items-center">
                        <span className="text-[10px] text-[#6E6E73] font-bold uppercase tracking-wider mb-0.5">Historial</span>
                        <span className="font-condensed font-black text-2xl text-[#1C1C1E]">{overloadChartData.length} registros</span>
                      </div>
                    </div>
                    {overloadChartData.length > 1 ? (
                      <div style={{ width: '100%', height: 200 }}>
                        <ResponsiveContainer>
                          <LineChart data={overloadChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E4" vertical={false} />
                            <XAxis dataKey="fecha" tickFormatter={formatShortDate} tick={{ fill: '#6E6E73', fontSize: 10 }} stroke="#E8E8E4" tickMargin={8} />
                            <YAxis domain={['auto','auto']} tick={{ fill: '#6E6E73', fontSize: 10 }} stroke="#E8E8E4" />
                            <Tooltip cursor={{ stroke: '#FF6B00', strokeWidth: 1, strokeDasharray: '4 4' }} />
                            <Line type="monotone" name="Carga Real" dataKey="cargaReal" stroke="#FF6B00" strokeWidth={2.5} dot={{ r: 4, fill: '#FF6B00', stroke: 'white', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#FF6B00' }} />
                            <Line type="monotone" name="Prescrita" dataKey="prescribedLoad" stroke="#3d7dd4" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-[#E8E8E4] rounded-2xl text-[#6E6E73] text-sm text-center px-4">
                        Completa al menos 2 sesiones con este ejercicio para ver la comparativa de sobrecarga.
                      </div>
                    )}
                  </>
                ),
              },
              {
                title: 'Volumen Por Sesión',
                sub: 'Carga total desplazada (Carga × Reps)',
                content: (
                  <div style={{ width: '100%', height: 180 }}>
                    <ResponsiveContainer>
                      <BarChart data={sessionLogs} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                        <XAxis dataKey="fecha" tickFormatter={formatShortDate} tick={{ fill: '#6E6E73', fontSize: 10 }} stroke="#E8E8E4" tickMargin={8} />
                        <Tooltip content={<ChartTooltip mode="vol" />} cursor={{ fill: '#F5F5F0', opacity: 0.8 }} />
                        <Bar dataKey="volumenTotal" fill="#FF6B00" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ),
              },
              {
                title: 'Fatiga (RPE Medio)',
                sub: 'Percepción de esfuerzo promedio en sesiones recientes',
                content: (
                  <div style={{ width: '100%', height: 180 }}>
                    <ResponsiveContainer>
                      <LineChart data={sessionLogs} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E4" vertical={false} />
                        <ReferenceArea y1={7} y2={8.5} fill="#FF6B00" fillOpacity={0.06} />
                        <XAxis dataKey="fecha" tickFormatter={formatShortDate} tick={{ fill: '#6E6E73', fontSize: 10 }} stroke="#E8E8E4" tickMargin={8} />
                        <YAxis domain={[5, 10]} ticks={[5,6,7,8,9,10]} tick={{ fill: '#6E6E73', fontSize: 10 }} stroke="#E8E8E4" />
                        <Tooltip content={<ChartTooltip mode="rpe" />} cursor={{ stroke: rpeColor, strokeWidth: 1, strokeDasharray: '4 4' }} />
                        <Line type="monotone" dataKey="rpeMedio" stroke={rpeColor} strokeWidth={2.5} dot={{ r: 4, fill: rpeColor, stroke: 'white', strokeWidth: 2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ),
              },
              {
                title: 'Comparativa Mesociclos',
                sub: 'Mejor marca histórica (1RM) por mesociclo',
                content: chart4Data.length >= 2 ? (
                  <div style={{ width: '100%', height: 140 }}>
                    <ResponsiveContainer>
                      <BarChart data={chart4Data} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E4" horizontal={false} />
                        <XAxis type="number" hide domain={[0, 'dataMax']} />
                        <YAxis dataKey="mesoName" type="category" width={90} tick={{ fill: '#6E6E73', fontSize: 10 }} stroke="none" />
                        <Tooltip content={<ChartTooltip mode="meso" />} cursor={{ fill: '#F5F5F0', opacity: 0.6 }} />
                        <Bar dataKey="maxPR" radius={[0, 6, 6, 0]} barSize={20}>
                          {chart4Data.map((entry, idx) => <Cell key={`c-${idx}`} fill={entry.mesoColor} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-24 flex items-center justify-center border-2 border-dashed border-[#E8E8E4] rounded-2xl text-[#6E6E73] text-sm text-center px-4">
                    Completa al menos 2 mesociclos para ver la comparativa.
                  </div>
                ),
              },
            ].map(({ title, sub, content }) => (
              <div key={title} className="bg-white border border-[#E8E8E4] rounded-2xl p-5 shadow-sm relative">
                {isDemoMode && (
                  <div className="absolute top-4 right-4 text-[10px] border border-[#FCA5A5] text-[#EF4444] px-2 py-0.5 rounded-lg font-bold bg-[#FEF2F2]">DEMO</div>
                )}
                <SectionHeader title={title} sub={sub} />
                {content}
              </div>
            ))}
          </div>
        )}

        {/* ── TESTS ── */}
        {activeTab === 'tests' && (
          <div className="space-y-4 animate-fade-in-up">
            {activeTestSubTab === 'wellness' && (
              <div className="bg-white border border-[#E8E8E4] rounded-2xl p-5 shadow-sm space-y-4">
                <SectionHeader 
                  title="Historial de Wellness Index" 
                  sub="Disposición general acumulada del atleta" 
                />
                
                {wellnessLogs.length > 0 ? (
                  <>
                    <div style={{ width: '100%', height: 180 }}>
                      <ResponsiveContainer>
                        <LineChart data={[...wellnessLogs].reverse()} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E4" vertical={false} />
                          <XAxis dataKey="fecha" tickFormatter={formatShortDate} tick={{ fill: '#6E6E73', fontSize: 10 }} stroke="#E8E8E4" />
                          <YAxis domain={[1, 5]} ticks={[1,2,3,4,5]} tick={{ fill: '#6E6E73', fontSize: 10 }} stroke="#E8E8E4" />
                          <Tooltip content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-white border border-[#E8E8E4] p-3 rounded-xl shadow-lg text-xs space-y-1 font-sans">
                                  <p className="font-bold text-[#1C1C1E]">{formatDate(data.fecha)}</p>
                                  <p className="text-blue-600 font-semibold">Sueño: {data.sleep}/5</p>
                                  <p className="text-purple-600 font-semibold">Estrés: {data.stress}/5</p>
                                  <p className="text-red-500 font-semibold">Agujetas: {data.doms}/5</p>
                                  <p className="text-amber-500 font-semibold">Fatiga: {data.fatigue}/5</p>
                                </div>
                              );
                            }
                            return null;
                          }} />
                          <Line type="monotone" name="Sueño" dataKey="sleep" stroke="#007AFF" strokeWidth={2} dot={{ r: 3 }} />
                          <Line type="monotone" name="Fatiga" dataKey="fatigue" stroke="#FF6B00" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {wellnessLogs.map(log => {
                        const score = (log.sleep + log.stress + log.doms + log.fatigue) / 4;
                        return (
                          <div key={log.id} className="flex justify-between items-center py-2 border-b border-[#E8E8E4] text-xs">
                            <div>
                              <span className="font-bold block text-[#1C1C1E]">{formatDate(log.fecha)}</span>
                              <span className="text-[#6E6E73]">Sueño: {log.sleep} · Estrés: {log.stress} · Agujetas: {log.doms} · Fatiga: {log.fatigue}</span>
                            </div>
                            <span className={`font-condensed font-black text-sm px-2 py-0.5 rounded ${
                              score >= 4 ? 'bg-green-100 text-green-700' : score >= 2.5 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {score.toFixed(1)}/5
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-[#E8E8E4] rounded-2xl text-[#6E6E73] text-xs p-4 text-center">
                    <span>Sin registros de check-in Wellness.</span>
                    <span className="text-[10px] text-[#8E8E93] mt-1">Completa tu check-in diario al iniciar una sesión.</span>
                  </div>
                )}
              </div>
            )}

            {activeTestSubTab === 'cmj' && (
              <div className="bg-white border border-[#E8E8E4] rounded-2xl p-5 shadow-sm space-y-4">
                <SectionHeader 
                  title="Test de Salto CMJ" 
                  sub="Fatiga neuromuscular objetiva acumulada" 
                />
                
                {cmjLogs.length > 0 ? (
                  <>
                    <div className="bg-[#FFFDF0] border border-yellow-500/20 rounded-xl p-4 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-[#6E6E73] font-bold block uppercase tracking-wider">Media 30 Días</span>
                        <span className="font-condensed font-black text-2xl text-[#1C1C1E]">{cmjStats.avg30d} cm</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#6E6E73] font-bold block uppercase tracking-wider">Último Salto</span>
                        <span className="font-condensed font-black text-2xl text-[#FF6B00]">{cmjStats.lastJump} cm</span>
                      </div>
                    </div>

                    <div style={{ width: '100%', height: 180 }}>
                      <ResponsiveContainer>
                        <LineChart data={[...cmjLogs].reverse()} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E4" vertical={false} />
                          <XAxis dataKey="fecha" tickFormatter={formatShortDate} tick={{ fill: '#6E6E73', fontSize: 10 }} stroke="#E8E8E4" />
                          <YAxis tick={{ fill: '#6E6E73', fontSize: 10 }} stroke="#E8E8E4" />
                          <Tooltip content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-white border border-[#E8E8E4] p-3 rounded-xl shadow-lg text-xs font-sans">
                                  <p className="font-bold text-[#1C1C1E]">{formatDate(data.fecha)}</p>
                                  <p className="text-[#FF6B00] font-black">Salto: {data.valor} cm</p>
                                </div>
                              );
                            }
                            return null;
                          }} />
                          <Line type="monotone" dataKey="valor" stroke="#FF6B00" strokeWidth={2.5} dot={{ r: 4, fill: '#FF6B00', stroke: 'white', strokeWidth: 2 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {cmjLogs.map(log => (
                        <div key={log.id} className="flex justify-between items-center py-2 border-b border-[#E8E8E4] text-xs">
                          <span className="font-bold text-[#1C1C1E]">{formatDate(log.fecha)}</span>
                          <span className="font-condensed font-black text-sm text-[#1C1C1E]">{log.valor} cm</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-[#E8E8E4] rounded-2xl text-[#6E6E73] text-xs p-4 text-center">
                    <span>Sin registros de salto vertical.</span>
                    <span className="text-[10px] text-[#8E8E93] mt-1">Registra tu test de salto en el check-in diario.</span>
                  </div>
                )}
              </div>
            )}

            {activeTestSubTab === 'cardio' && (
              <div className="bg-white border border-[#E8E8E4] rounded-2xl p-5 shadow-sm space-y-4">
                <SectionHeader 
                  title="Capacidad Cardiovascular (VO2Max)" 
                  sub="Evolución de tu potencia aeróbica" 
                />

                {cardioTests.length > 0 ? (
                  <>
                    <div style={{ width: '100%', height: 180 }}>
                      <ResponsiveContainer>
                        <LineChart data={[...cardioTests].reverse()} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E4" vertical={false} />
                          <XAxis dataKey="fecha" tickFormatter={formatShortDate} tick={{ fill: '#6E6E73', fontSize: 10 }} stroke="#E8E8E4" />
                          <YAxis tick={{ fill: '#6E6E73', fontSize: 10 }} stroke="#E8E8E4" />
                          <Tooltip content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-white border border-[#E8E8E4] p-3 rounded-xl shadow-lg text-xs space-y-1 font-sans">
                                  <p className="font-bold text-[#1C1C1E]">{formatDate(data.fecha)}</p>
                                  <p className="text-green-600 font-bold">VO2Max: {data.valor} ml/kg/min</p>
                                  <p className="text-[#6E6E73] font-semibold">Test: {data.tipo === 'cooper' ? `Cooper (${data.valorOriginal}m)` : `Beep Test (${data.valorOriginal} km/h)`}</p>
                                </div>
                              );
                            }
                            return null;
                          }} />
                          <Line type="monotone" dataKey="valor" stroke="#34C759" strokeWidth={2.5} dot={{ r: 4, fill: '#34C759', stroke: 'white', strokeWidth: 2 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {cardioTests.map(log => (
                        <div key={log.id} className="flex justify-between items-center py-2 border-b border-[#E8E8E4] text-xs">
                          <div>
                            <span className="font-bold block text-[#1C1C1E]">{formatDate(log.fecha)}</span>
                            <span className="text-[#6E6E73] capitalize">{log.tipo === 'cooper' ? `Test de Cooper: ${log.valorOriginal}m` : `Course-Navette: ${log.valorOriginal} km/h`}</span>
                          </div>
                          <span className="font-condensed font-black text-sm text-green-700 bg-green-50 px-2.5 py-1 rounded">
                            {log.valor} ml/kg/min
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-[#E8E8E4] rounded-2xl text-[#6E6E73] text-xs p-4 text-center">
                    <span>Sin registros de tests cardiovasculares.</span>
                    <span className="text-[10px] text-[#8E8E93] mt-1">Pídele a tu Coach que te planifique un Test de Cooper o Beep Test.</span>
                  </div>
                )}
              </div>
            )}

            {activeTestSubTab === 'composition' && (
              <div className="bg-white border border-[#E8E8E4] rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <SectionHeader 
                    title="Composición Corporal" 
                    sub="Peso corporal y porcentaje de grasa" 
                  />
                  {!showAddMetrics && (
                    <button
                      onClick={() => setShowAddMetrics(true)}
                      className="px-3 py-1.5 bg-[#FFF3EC] text-[#FF6B00] border border-[#FDDCB5] rounded-xl font-condensed font-black text-xs hover:bg-[#FF6B00] hover:text-white transition-colors"
                    >
                      + NUEVO REGISTRO
                    </button>
                  )}
                </div>

                {/* Formulario de registro */}
                {showAddMetrics && (
                  <form onSubmit={handleSaveMetrics} className="bg-[#F5F5F0] border border-[#E8E8E4] rounded-2xl p-4 space-y-3 animate-fade-in-up">
                    <h4 className="font-condensed font-black text-xs text-[#1C1C1E] uppercase tracking-wider">
                      Registrar Composición Corporal
                    </h4>
                    
                    <div className="mb-3">
                      <label className="block text-[10px] text-[#6E6E73] font-bold uppercase mb-1">Fecha de Registro</label>
                      <input
                        type="date"
                        required
                        value={metricDate}
                        onChange={e => setMetricDate(e.target.value)}
                        className="w-full bg-white border border-[#E8E8E4] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#FF6B00]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-[#6E6E73] font-bold uppercase mb-1">Peso (kg) *</label>
                        <input
                          type="number"
                          step="0.1"
                          required
                          value={metricWeight}
                          onChange={e => setMetricWeight(e.target.value)}
                          placeholder="75.5"
                          className="w-full bg-white border border-[#E8E8E4] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#FF6B00]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-[#6E6E73] font-bold uppercase mb-1">Grasa (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={metricFat}
                          onChange={e => setMetricFat(e.target.value)}
                          placeholder="14.2"
                          className="w-full bg-white border border-[#E8E8E4] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#FF6B00]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[9px] text-[#6E6E73] font-bold uppercase mb-1">Cintura (cm)</label>
                        <input
                          type="number"
                          step="0.5"
                          value={metricWaist}
                          onChange={e => setMetricWaist(e.target.value)}
                          placeholder="82"
                          className="w-full bg-white border border-[#E8E8E4] rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#FF6B00]"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-[#6E6E73] font-bold uppercase mb-1">Brazo (cm)</label>
                        <input
                          type="number"
                          step="0.5"
                          value={metricArm}
                          onChange={e => setMetricArm(e.target.value)}
                          placeholder="36"
                          className="w-full bg-white border border-[#E8E8E4] rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#FF6B00]"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-[#6E6E73] font-bold uppercase mb-1">Muslo (cm)</label>
                        <input
                          type="number"
                          step="0.5"
                          value={metricThigh}
                          onChange={e => setMetricThigh(e.target.value)}
                          placeholder="58"
                          className="w-full bg-white border border-[#E8E8E4] rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#FF6B00]"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddMetrics(false)}
                        className="px-3 py-1.5 border border-[#E8E8E4] rounded-xl font-condensed font-bold text-xs text-[#6E6E73] bg-white hover:bg-[#FAFAFA]"
                      >
                        CANCELAR
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingMetrics}
                        className="px-4 py-1.5 bg-[#FF6B00] text-white rounded-xl font-condensed font-black text-xs shadow-md disabled:opacity-50"
                      >
                        {isSavingMetrics ? 'GUARDANDO...' : 'GUARDAR'}
                      </button>
                    </div>
                  </form>
                )}

                {bodyMetrics.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {bodyMetrics.map(log => (
                      <div key={log.id} className="flex justify-between items-start py-2.5 border-b border-[#E8E8E4] text-xs">
                        <div>
                          <span className="font-bold text-[#1C1C1E] block">{formatDate(log.fecha)}</span>
                          {(log.medidaCintura || log.medidaBrazo || log.medidaMuslo) && (
                            <span className="text-[10px] text-[#6E6E73] mt-0.5 block">
                              {[
                                log.medidaCintura && `📏 Cintura: ${log.medidaCintura}cm`,
                                log.medidaBrazo && `💪 Brazo: ${log.medidaBrazo}cm`,
                                log.medidaMuslo && `🍗 Muslo: ${log.medidaMuslo}cm`,
                              ].filter(Boolean).join('  |  ')}
                            </span>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-condensed font-black text-sm text-[#1C1C1E] block">
                            {log.peso} kg
                          </span>
                          {log.grasa && (
                            <span className="text-[10px] text-green-600 font-bold block">
                              {log.grasa}% grasa
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-[#E8E8E4] rounded-2xl text-[#6E6E73] text-xs p-4 text-center">
                    <span>Sin registros de composición corporal.</span>
                    <span className="text-[10px] text-[#8E8E93] mt-1">Registra tu peso para ver tu progreso histórico aquí.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* History PR Sheet */}
      {selectedHistoryExercise && (
        <HistorySheet
          exerciseName={selectedHistoryExercise.name}
          history={selectedHistoryExercise.history}
          onClose={() => setSelectedHistoryExercise(null)}
        />
      )}

      {/* History Session Sheet */}
      {selectedHistoryLog && (
        <SessionDetailSheet
          log={selectedHistoryLog}
          onClose={() => setSelectedHistoryLog(null)}
          handleRepeat={handleRepeatParams}
        />
      )}
    </div>
  );
}
