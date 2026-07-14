import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAthlete } from '../context/AthleteContext';
import { User, Users, ShieldCheck, Dumbbell, Circle, CheckCircle2, ChevronRight, Plus, Award } from 'lucide-react';

const ROLES = [
  { id: 'athlete', title: 'ATLETA', desc: 'Gestiono mis propios entrenamientos', icon: <User size={24} /> },
  { id: 'coach', title: 'ENTRENADOR', desc: 'Gestiono atletas y diseño programas', icon: <Users size={24} /> },
  { id: 'both', title: 'AMBOS', desc: 'Soy atleta y también entreno a otros', icon: <ShieldCheck size={24} /> }
];

const LEVELS = [
  { id: 'novato', title: 'NOVATO', desc: 'Menos de 1 año entrenando de forma consistente' },
  { id: 'intermedio', title: 'INTERMEDIO', desc: '1 a 3 años de entrenamiento consistente' },
  { id: 'avanzado', title: 'AVANZADO', desc: 'Más de 3 años, competidor o cercano a tus máximos' }
];

const DEFAULT_SPORTS = [
  { id: 'gym', label: 'Gimnasio', icon: '🏋️' },
  { id: 'tkd', label: 'Taekwondo', icon: '🥋' },
  { id: 'box', label: 'Boxeo', icon: '🥊' },
  { id: 'judo', label: 'Judo', icon: '🤼' },
  { id: 'swim', label: 'Natación', icon: '🏊' },
  { id: 'cycle', label: 'Ciclismo', icon: '🚴' },
  { id: 'run', label: 'Running', icon: '🏃' },
  { id: 'cf', label: 'Crossfit', icon: '⚔️' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { updateProfile } = useAthlete();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    role: 'athlete',
    sports: [
      { id: 'gym', label: 'Gimnasio', icon: '🏋️', active: true }
    ],
    level: 'intermedio'
  });
  
  const [showCustomSport, setShowCustomSport] = useState(false);
  const [customSportInput, setCustomSportInput] = useState('');

  const handleNext = () => {
    if (step === 1 && !formData.name.trim()) return;
    if (step === 3 && formData.sports.length === 0) return;
    if (step === 4) {
      updateProfile(formData);
      navigate('/plan');
      return;
    }
    setStep(s => s + 1);
  };

  const toggleSport = (sport) => {
    setFormData(prev => {
      const exists = prev.sports.find(s => s.id === sport.id);
      if (exists) {
        return { ...prev, sports: prev.sports.filter(s => s.id !== sport.id) };
      } else {
        return { ...prev, sports: [...prev.sports, { ...sport, active: true }] };
      }
    });
  };

  const addCustomSport = () => {
    if (!customSportInput.trim()) return;
    const newSport = {
      id: `custom-${Date.now()}`,
      label: customSportInput.trim(),
      icon: '🎯',
      active: true
    };
    setFormData(prev => ({ ...prev, sports: [...prev.sports, newSport] }));
    setCustomSportInput('');
    setShowCustomSport(false);
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center pb-8">
      
      {/* Progress Indicator */}
      <div className="w-full pt-12 pb-6 px-6 flex justify-center gap-3">
        {[1, 2, 3, 4].map(i => (
          <div 
            key={i} 
            className={`h-1.5 rounded-full transition-all duration-300 ${
              step >= i ? 'w-8 bg-signal-orange' : 'w-4 bg-border'
            }`} 
          />
        ))}
      </div>

      <div className="flex-1 w-full max-w-sm px-6 flex flex-col justify-center animate-fade-in">
        
        {/* STEP 1 */}
        {step === 1 && (
          <div className="w-full animate-slide-left">
            <div className="w-20 h-20 stamp-circle border-signal-orange text-signal-orange bg-card mx-auto mb-8 -rotate-6 flex items-center justify-center">
              <Dumbbell size={32} />
            </div>
            <h1 className="font-display font-black text-4xl text-ink text-center mb-2 uppercase tracking-wide">
              Bienvenido a<br/><span className="text-signal-orange">TrainingOS</span>
            </h1>
            <p className="font-mono text-xs text-muted text-center mb-10 uppercase tracking-wider">
              Tu sistema operativo de entrenamiento.
            </p>

            <div className="space-y-3 mt-6">
              <label className="font-mono text-[9px] text-muted tracking-widest uppercase ml-1 block font-bold">
                ¿Cómo te llamamos?
              </label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Tu nombre o apodo"
                className="w-full bg-card border border-border text-xl font-condensed font-black rounded-xl p-4 outline-none focus:border-signal-orange transition-all placeholder:text-muted/50 placeholder:font-normal uppercase tracking-wide text-ink"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="w-full animate-slide-left">
            <h2 className="font-display font-black text-3xl text-ink mb-1.5 uppercase tracking-wide leading-tight">
              ¿Cómo usarás<br/>TrainingOS?
            </h2>
            <p className="font-mono text-xs text-muted mb-8 uppercase tracking-wider">Personalizaremos tu experiencia según tu rol.</p>

            <div className="space-y-4">
              {ROLES.map(role => {
                const isActive = formData.role === role.id;
                return (
                  <button 
                    key={role.id}
                    onClick={() => setFormData({ ...formData, role: role.id })}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left cursor-pointer ${
                      isActive 
                        ? 'border-signal-orange bg-signal-orange text-ink' 
                        : 'border-border bg-card text-ink hover:border-ink'
                    }`}
                  >
                    <div className={`p-3 rounded-lg ${isActive ? 'bg-ink text-white' : 'bg-bg/40 text-muted border border-border'}`}>
                      {role.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-condensed font-black text-lg leading-none mb-1 uppercase tracking-wide">{role.title}</h3>
                      <p className={`text-xs ${isActive ? 'text-ink/80 font-bold' : 'text-muted font-normal'}`}>
                        {role.desc}
                      </p>
                    </div>
                    <div>
                      {isActive ? <CheckCircle2 className="text-ink" /> : <Circle className="text-border" />}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="w-full animate-slide-left flex flex-col h-[70vh]">
            <h2 className="font-display font-black text-3xl text-ink mb-1.5 uppercase tracking-wide leading-tight">
              ¿Qué deportes<br/>practicas?
            </h2>
            <p className="font-mono text-xs text-muted mb-6 uppercase tracking-wider">Selecciona todos los que apliquen (mínimo 1).</p>

            <div className="flex-1 overflow-y-auto hide-scrollbar pb-12">
              <div className="grid grid-cols-2 gap-3 mb-6">
                {DEFAULT_SPORTS.map(sport => {
                  const isActive = formData.sports.some(s => s.id === sport.id);
                  return (
                    <button
                      key={sport.id}
                      onClick={() => toggleSport(sport)}
                      className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                        isActive 
                          ? 'border-signal-orange bg-signal-orange text-ink font-bold' 
                          : 'border-border bg-card text-muted hover:border-ink'
                      }`}
                    >
                      {sport.icon && (
                        <div className="w-8 h-8 stamp-circle border-border flex items-center justify-center text-sm shrink-0">
                          {sport.icon}
                        </div>
                      )}
                      <span className="font-condensed font-black text-sm uppercase tracking-wider">{sport.label}</span>
                    </button>
                  )
                })}
                
                {/* Custom sports added */}
                {formData.sports.filter(s => String(s.id).startsWith('custom-')).map(sport => (
                  <button
                    key={sport.id}
                    onClick={() => toggleSport(sport)}
                    className="p-4 rounded-xl border border-signal-orange bg-signal-orange text-ink flex flex-col items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {sport.icon && (
                      <div className="w-8 h-8 stamp-circle border-ink flex items-center justify-center text-sm shrink-0">
                        {sport.icon}
                      </div>
                    )}
                    <span className="font-condensed font-black text-sm text-ink uppercase tracking-wider">{sport.label}</span>
                  </button>
                ))}

                {/* Add Custom Button */}
                <button
                  onClick={() => setShowCustomSport(true)}
                  className="p-4 rounded-xl border-2 border-dashed border-border bg-card text-muted flex flex-col items-center justify-center gap-2 transition-all hover:border-ink cursor-pointer"
                >
                  <Plus size={24} />
                  <span className="font-mono text-[9px] font-bold uppercase tracking-wider">Añadir otro</span>
                </button>
              </div>

              {showCustomSport && (
                <div className="bg-bg/25 border border-border p-3 rounded-xl flex gap-2 animate-fade-in-up">
                  <input
                    type="text"
                    value={customSportInput}
                    onChange={e => setCustomSportInput(e.target.value)}
                    placeholder="Ej. Tenis"
                    className="flex-1 bg-card border border-border rounded-xl px-4 py-2 font-mono text-sm outline-none focus:border-signal-orange text-ink"
                    autoFocus
                  />
                  <button 
                    onClick={addCustomSport}
                    className="bg-signal-orange text-ink font-display font-black px-4 rounded-xl cursor-pointer uppercase tracking-wider text-xs"
                  >
                    Añadir
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="w-full animate-slide-left">
            <div className="w-20 h-20 stamp-circle border-signal-orange text-signal-orange bg-card mx-auto mb-8 -rotate-6 flex items-center justify-center">
              <Award size={32} />
            </div>
            <h2 className="font-display font-black text-3xl text-ink mb-1.5 uppercase tracking-wide leading-tight">
              ¿Cuál es tu nivel<br/>de experiencia?
            </h2>
            <p className="font-mono text-xs text-muted mb-8 uppercase tracking-wider">Esto nos ayuda a calibrar tu plan de entrenamiento.</p>

            <div className="space-y-4">
              {LEVELS.map(lvl => {
                const isActive = formData.level === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    onClick={() => setFormData({ ...formData, level: lvl.id })}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left cursor-pointer ${
                      isActive 
                        ? 'border-signal-orange bg-signal-orange text-ink font-bold' 
                        : 'border-border bg-card text-ink hover:border-ink'
                    }`}
                  >
                    <div className="flex-1">
                      <h3 className="font-condensed font-black text-lg leading-none mb-1 uppercase tracking-wide">{lvl.title}</h3>
                      <p className={`text-xs ${isActive ? 'text-ink/80 font-bold' : 'text-muted font-normal'}`}>
                        {lvl.desc}
                      </p>
                    </div>
                    <div>
                      {isActive ? <CheckCircle2 className="text-ink" /> : <Circle className="text-border" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* BOTTOM NAV CTA */}
        <div className="mt-8">
          <button
            onClick={handleNext}
            className="w-full py-3.5 bg-signal-orange text-ink font-display font-black text-xl rounded-xl active:scale-[0.98] transition-transform tracking-wider uppercase flex justify-center items-center gap-1 cursor-pointer"
          >
            CONTINUAR <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
