import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, Mail, Lock, User, UserCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function Register() {
  const { register, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('athlete'); // athlete, coach, both
  const [localError, setLocalError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password || !name) {
      setLocalError('Por favor, rellena todos los campos.');
      return;
    }
    if (password.length < 6) {
      setLocalError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      await register(email, password, name, role);
      navigate('/');
    } catch (err) {
      setLocalError(err.message || 'Error al registrar usuario');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 overflow-y-auto">
      <div className="flex-1 flex flex-col items-center justify-center p-6 py-12">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-6">
          <Dumbbell className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-2">
          TrainingOS
        </h1>
        <p className="text-slate-400 text-center mb-8">
          Únete a la plataforma
        </p>

        <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold mb-6 text-white text-center">
            Crear Cuenta
          </h2>

          {(error || localError) && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{localError || error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5 ml-1">
                Nombre Completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Tu nombre"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5 ml-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="ejemplo@correo.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5 ml-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2 ml-1">
                ¿Qué rol vas a tener?
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('athlete')}
                  className={`py-2 px-1 rounded-lg text-xs font-medium transition-colors border ${
                    role === 'athlete'
                      ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  Atleta
                </button>
                <button
                  type="button"
                  onClick={() => setRole('coach')}
                  className={`py-2 px-1 rounded-lg text-xs font-medium transition-colors border ${
                    role === 'coach'
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  Coach
                </button>
                <button
                  type="button"
                  onClick={() => setRole('both')}
                  className={`py-2 px-1 rounded-lg text-xs font-medium transition-colors border ${
                    role === 'both'
                      ? 'bg-purple-600/20 border-purple-500 text-purple-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  Ambos
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl mt-6 flex items-center justify-center gap-2 transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creando...
                </>
              ) : (
                'Registrarme'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-slate-400 text-sm">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Inicia Sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
