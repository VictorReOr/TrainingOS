import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

export default function Login() {
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    if (!email || !password) {
      setLocalError('Por favor, rellena todos los campos.');
      return;
    }
    try {
      await login(email, password);
      // Tras login exitoso, App.jsx ya se encarga de re-renderizar
      // Pero podemos forzar navegación al Home por si acaso
      navigate('/');
    } catch (err) {
      setLocalError(err.message || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F0] text-[#1C1C1E]">
      {/* Header Visual */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 pb-0">
        <div className="w-16 h-16 bg-[#FFF3EC] border border-[#FDDCB5] rounded-2xl flex items-center justify-center shadow-sm mb-4">
          <Dumbbell className="w-8 h-8 text-[#E85D04]" />
        </div>
        <h1 className="text-4xl font-condensed font-black text-[#1C1C1E] mb-1">
          TrainingOS
        </h1>
        <p className="text-[#6E6E73] text-center mb-8 text-sm">
          Tu plataforma integral de rendimiento
        </p>

        {/* Formulario */}
        <div className="w-full max-w-sm bg-white border border-[#E8E8E4] rounded-3xl p-6 shadow-sm">
          <h2 className="text-2xl font-condensed font-black mb-6 text-[#1C1C1E] text-center">
            Iniciar Sesión
          </h2>

          {(error || localError) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{localError || error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-condensed font-bold tracking-widest uppercase text-[#6E6E73] mb-1.5 ml-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A1A1AA]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-[#E8E8E4] rounded-xl py-3 pl-10 pr-4 text-[#1C1C1E] placeholder-[#A1A1AA] focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-all"
                  placeholder="atleta@trainingos.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-condensed font-bold tracking-widest uppercase text-[#6E6E73] mb-1.5 ml-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A1A1AA]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-[#E8E8E4] rounded-xl py-3 pl-10 pr-4 text-[#1C1C1E] placeholder-[#A1A1AA] focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#FF6B00] hover:bg-[#E85D04] disabled:opacity-50 text-white font-condensed font-black text-xl py-3.5 rounded-2xl mt-4 flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(255,107,0,0.25)] active:scale-[0.98] transition-all tracking-wide"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Conectando...
                </>
              ) : (
                'ENTRAR'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[#6E6E73] text-sm">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-[#FF6B00] font-bold hover:underline transition-colors">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
      
      <div className="h-12"></div>
    </div>
  );
}
