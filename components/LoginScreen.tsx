
import React, { useState } from 'react';
import { Anchor, Mail, Lock, ArrowRight, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulación de petición de red
    setTimeout(() => {
      // Credenciales de prueba (Hardcoded para demo)
      // En producción esto iría contra una API real
      if (email.toLowerCase() === 'admin' && password === '174545219') {
        setIsLoading(false);
        onLogin();
      } else {
        setIsLoading(false);
        setError('Credenciales inválidas. Verifique su usuario y contraseña.');
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen flex bg-white animate-in fade-in duration-700">
      {/* SECCIÓN IZQUIERDA: BRANDING */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-16 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1494412574643-35d324688b33?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="p-3 bg-indigo-600 rounded-md shadow-lg shadow-indigo-900/50">
            <Anchor size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tighter uppercase">ZERO<span className="text-indigo-500">HUB</span></h1>
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Yard Management System</p>
          </div>
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <h2 className="text-4xl font-bold leading-tight">Control Total de su Operación Logística Portuaria.</h2>
          <p className="text-slate-400 font-normal leading-relaxed">
            Gestione ingresos, despachos, inventarios y documentación en tiempo real con la plataforma más avanzada del mercado.
          </p>
          <div className="flex gap-4 pt-4">
             <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-sm border border-white/10">
                <CheckCircle2 size={16} className="text-green-400" />
                <span className="text-xs font-medium uppercase tracking-wide">Trazabilidad</span>
             </div>
             <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-sm border border-white/10">
                <CheckCircle2 size={16} className="text-green-400" />
                <span className="text-xs font-medium uppercase tracking-wide">Seguridad</span>
             </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500 font-medium uppercase tracking-widest">
          © {new Date().getFullYear()} ZeroHub Logistics Terminal v2.5
        </div>
      </div>

      {/* SECCIÓN DERECHA: FORMULARIO */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-24 bg-white relative">
        <div className="w-full max-w-md space-y-10">
          <div className="space-y-2 text-center lg:text-left">
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Bienvenido</h3>
            <p className="text-slate-500 font-normal">Ingrese sus credenciales para acceder al sistema.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-widest ml-1">Usuario / Correo</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  type="text" 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-md font-normal text-slate-800 text-sm outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  placeholder=""
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-widest">Contraseña</label>
                <a href="#" className="text-[10px] font-medium text-indigo-600 hover:text-indigo-700 uppercase tracking-wide">¿Olvidó su clave?</a>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-md font-normal text-slate-800 text-sm outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  placeholder=""
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors p-2"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-md flex items-center gap-3 text-red-600 animate-in slide-in-from-top-2">
                <AlertCircle size={18} />
                <span className="text-xs font-medium">{error}</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-4 bg-slate-900 text-white rounded-md font-bold text-xs uppercase tracking-[0.2em] hover:bg-indigo-600 active:translate-y-0.5 transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Autenticando...
                </>
              ) : (
                <>
                  Iniciar Sesión <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="pt-8 border-t border-slate-100 text-center lg:text-left">
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
              Al ingresar, acepta los <a href="#" className="text-indigo-600 hover:underline">términos de servicio</a> y <a href="#" className="text-indigo-600 hover:underline">política de privacidad</a> de ZeroHub.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
