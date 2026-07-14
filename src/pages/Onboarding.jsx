import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAthlete } from '../context/AthleteContext';
import { User, Users, ShieldCheck, Dumbbell, Circle, CheckCircle2, ChevronRight, Plus, Award } from 'lucide-react';

const ROLES = [
  { id: 'athlete', title: 'ATLETA', desc: 'Gestiono mis propios entrenamientos', icon: <User size={32} /> },
  { id: 'coach', title: 'ENTRENADOR', desc: 'Gestiono atletas y diseño programas', icon: <Users size={32} /> },
  { id: 'both', title: 'AMBOS', desc: 'Soy atleta y también entreno a otros', icon: <ShieldCheck size={32} /> }
];

const LEVELS = [
  { id: 'novato', title: 'NOVATO', desc: 'Menos de 1 año entrenando de forma consistente', emoji: '🟢' },
  { id: 'intermedio', title: 'INTERMEDIO', desc: '1 a 3 años de entrenamiento consistente', emoji: '🟡' },
  { id: 'avanzado', title: 'AVANZADO', desc: 'Más de 3 años, competidor o cercano a tus máximos', emoji: '🔴' }
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
      { id: 'gym', label: 'Gimnasio', icon: '🏋️', active: true } // Default starting point
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
    <div className="min-h-screen bg-white flex flex-col items-center">
      
      {/* Progress Indicator */}
      <div className="w-full pt-12 pb-6 px-6 flex justify-center gap-3">
        {[1, 2, 3, 4].map(i => (
          <div 
            key={i} 
            className={`h-1.5 rounded-full transition-all duration-300 ${
              step >= i ? 'w-8 bg-[#FF6B00]' : 'w-4 bg-[#E8E8E4]'
            }`} 
          />
        ))}
      </div>

      <div className="flex-1 w-full max-w-sm px-6 flex flex-col justify-center animate-fade-in">
        
        {/* STEP 1 */}
        {step === 1 && (
          <div className="w-full animate-slide-left">
            <div className="w-24 h-24 bg-[#FFF3EC] text-[#FF6B00] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
              <Dumbbell size={48} />
            </div>
            <h1 className="font-condensed font-black text-4xl text-[#1C1C1E] text-center mb-2">
              Bienvenido a<br/><span className="text-[#FF6B00]">TrainingOS</span>
            </h1>
            <p className="text-[#6E6E73] text-center mb-10 text-sm">
              Tu sistema operativo de entrenamiento definitivo.
            </p>

            <div className="space-y-3 mt-6">
              <label className="text-xs font-bold text-[#6E6E73] tracking-widest uppercase ml-1">
                ¿Cómo te llamamos?
              </label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Tu nombre o apodo"
                className="w-full bg-[#F5F5F0] border-2 border-transparent focus:border-[#FF6B00] focus:bg-white text-xl font-bold rounded-2xl p-4 outline-none transition-all placeholder:text-[#A1A1AA] placeholder:font-normal"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="w-full animate-slide-left">
            <h2 className="font-condensed font-black text-3xl text-[#1C1C1E] mb-2 leading-tight">
              ¿Cómo usarás<br/>TrainingOS?
            </h2>
            <p className="text-[#6E6E73] text-sm mb-8">Personalizaremos tu experiencia según tu rol.</p>

            <div className="space-y-4">
              {ROLES.map(role => {
                const isActive = formData.role === role.id;
                return (
                  <button 
                    key={role.id}
                    onClick={() => setFormData({ ...formData, role: role.id })}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                      isActive 
                        ? 'border-[#FF6B00] bg-[#FFF3EC]' 
                        : 'border-[#E8E8E4] bg-white hover:border-[#1C1C1E]'
                    }`}
                  >
                    <div className={`p-3 rounded-xl ${isActive ? 'bg-[#FF6B00] text-white' : 'bg-[#F5F5F0] text-[#6E6E73]'}`}>
                      {role.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-condensed font-black text-xl text-[#1C1C1E] leading-none mb-1">{role.title}</h3>
                      <p className={`text-xs ${isActive ? 'text-[#E85D04]' : 'text-[#6E6E73]'}`}>
                        {role.desc}
                      </p>
                    </div>
                    <div>
                      {isActive ? <CheckCircle2 className="text-[#FF6B00]" /> : <Circle className="text-[#E8E8E4]" />}
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
            <h2 className="font-condensed font-black text-3xl text-[#1C1C1E] mb-2 leading-tight">
              ¿Qué deportes<br/>practicas?
            </h2>
            <p className="text-[#6E6E73] text-sm mb-6">Selecciona todos los que apliquen (mínimo 1).</p>

            <div className="flex-1 overflow-y-auto hide-scrollbar pb-12">
              <div className="grid grid-cols-2 gap-3 mb-6">
                {DEFAULT_SPORTS.map(sport => {
                  const isActive = formData.sports.some(s => s.id === sport.id);
                  return (
                    <button
                      key={sport.id}
                      onClick={() => toggleSport(sport)}
                      className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                        isActive 
                          ? 'border-[#FF6B00] bg-[#FFF3EC] text-[#FF6B00]' 
                          : 'border-[#E8E8E4] bg-white text-[#6E6E73]'
                      }`}
                    >
                      <span className="text-3xl">{sport.icon}</span>
                      <span className={`font-bold text-sm ${isActive ? 'text-[#1C1C1E]' : 'text-[#6E6E73]'}`}>{sport.label}</span>
                    </button>
                  )
                })}
                
                {/* Custom sports added */}
                {formData.sports.filter(s => String(s.id).startsWith('custom-')).map(sport => (
                  <button
                    key={sport.id}
                    onClick={() => toggleSport(sport)}
                    className="p-4 rounded-2xl border-2 border-[#FF6B00] bg-[#FFF3EC] text-[#FF6B00] flex flex-col items-center justify-center gap-2 transition-all"
                  >
                    <span className="text-3xl">{sport.icon}</span>
                    <span className="font-bold text-sm text-[#1C1C1E]">{sport.label}</span>
                  </button>
                ))}

                {/* Add Custom Button */}
                <button
                  onClick={() => setShowCustomSport(true)}
                  className="p-4 rounded-2xl border-2 border-dashed border-[#E8E8E4] bg-[#F5F5F0] text-[#6E6E73] flex flex-col items-center justify-center gap-2 transition-all hover:border-[#1C1C1E]"
                >
                  <Plus size={32} />
                  <span className="font-bold text-sm">Añadir otro</span>
                </button>
              </div>

              {showCustomSport && (
                <div className="bg-[#F5F5F0] p-3 rounded-2xl flex gap-2 animate-fade-in-up">
                  <input
                    type="text"
                    value={customSportInput}
                    onChange={e => setCustomSportInput(e.target.value)}
                    placeholder="Ej. Tenis"
                    className="flex-1 bg-white border border-[#E8E8E4] rounded-xl px-4 py-2 font-bold outline-none focus:border-[#FF6B00]"
                    autoFocus
                  />
                  <button 
                    onClick={addCustomSport}
                    className="bg-[#FF6B00] text-white font-bold px-4 rounded-xl active:scale-95"
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
            <div className="w-24 h-24 bg-[#FFF3EC] text-[#FF6B00] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
              <Award size={48} />
            </div>
            <h2 className="font-condensed font-black text-3xl text-[#1C1C1E] mb-2 leading-tight">
              ¿Cuál es tu nivel<br/>de experiencia?
            </h2>
            <p className="text-[#6E6E73] text-sm mb-8">Esto nos ayuda a calibrar tu plan de entrenamiento.</p>

            <div className="space-y-4">
              {LEVELS.map(level => {
                const isActive = formData.level === level.id;
                return (
                  <button 
                    key={level.id}
                    onClick={() => setFormData({ ...formData, level: level.id })}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                      isActive 
                        ? 'border-[#FF6B00] bg-[#FFF3EC]' 
                        : 'border-[#E8E8E4] bg-white hover:border-[#1C1C1E]'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${isActive ? 'bg-[#FF6B00]/10' : 'bg-[#F5F5F0]'}`}>
                      {level.emoji}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-condensed font-black text-xl text-[#1C1C1E] leading-none mb-1">{level.title}</h3>
                      <p className={`text-xs ${isActive ? 'text-[#E85D04]' : 'text-[#6E6E73]'}`}>
                        {level.desc}
                      </p>
                    </div>
                    <div>
                      {isActive ? <CheckCircle2 className="text-[#FF6B00]" /> : <Circle className="text-[#E8E8E4]" />}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

      </div>

      {/* FIXED BOTTOM BAR */}
      <div className="w-full p-6 border-t border-[#E8E8E4] bg-white">
        <button 
          onClick={handleNext}
          disabled={(step === 1 && !formData.name.trim()) || (step === 3 && formData.sports.length === 0)}
          className="w-full bg-[#FF6B00] text-white font-condensed font-black text-xl rounded-2xl py-4 shadow-[0_4px_20px_rgba(255,107,0,0.3)] disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          {step === 4 ? 'EMPEZAR' : 'CONTINUAR'}
          {step < 4 && <ChevronRight size={24} />}
        </button>
      </div>
    </div>
  );
}
