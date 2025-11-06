import React, { useState, useEffect } from 'react';
import { Mail, Lock, User } from 'lucide-react';
import { LogoEconeura } from './LogoEconeura';

interface LoginProps {
  onLoginSuccess: (token: string, user: any) => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  // Force deploy trigger v1.0.1

  // Agregar animaciones CSS para efectos premium
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0%, 100% {
          transform: translateY(0px) translateX(0px);
          opacity: 0.3;
        }
        50% {
          transform: translateY(-20px) translateX(10px);
          opacity: 0.7;
        }
      }
      @keyframes gradient-shift {
        0%, 100% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Detectar callback de OAuth en URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const auth = params.get('auth');
    const provider = params.get('provider');
    const token = params.get('token');
    const email = params.get('email');
    const name = params.get('name');

    if (auth === 'success' && provider && token) {
      // OAuth exitoso - usar token de URL
      const user = {
        id: `oauth-${provider}`,
        email: decodeURIComponent(email || ''),
        name: decodeURIComponent(name || 'Usuario')
      };
      
      localStorage.setItem('econeura_token', token);
      localStorage.setItem('econeura_user', JSON.stringify(user));
      onLoginSuccess(token, user);
      
      // Limpiar URL
      window.history.replaceState({}, '', '/');
    } else if (auth === 'error') {
      setError('Error en autenticación OAuth. Inténtalo de nuevo.');
      window.history.replaceState({}, '', '/');
    }
  }, [onLoginSuccess]);

  // Función para iniciar OAuth (solo Google y Microsoft)
  const handleOAuthLogin = (provider: 'google' | 'microsoft') => {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const apiUrl = isLocalhost ? 'http://localhost:8080' : 'https://econeura-backend-prod.azurewebsites.net';
    
    window.location.href = `${apiUrl}/api/auth/${provider}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || (mode === 'register' && !name)) {
      setError('Por favor completa todos los campos');
      return;
    }
    setError('');

    // Validación simple de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email inválido');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login'
        ? { email, password }
        : { email, password, name };

      // Auto-detectar producción vs local
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const apiUrl = isLocalhost ? 'http://localhost:8080' : 'https://econeura-backend-prod.azurewebsites.net';

      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Authentication failed');
      }

      const data = await response.json();

      // Guardar token según "Remember me"
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('econeura_token', data.token);
      storage.setItem('econeura_user', JSON.stringify(data.user));

      // Limpiar del otro storage si existe
      const otherStorage = rememberMe ? sessionStorage : localStorage;
      otherStorage.removeItem('econeura_token');
      otherStorage.removeItem('econeura_user');

      onLoginSuccess(data.token, data.user);

    } catch (err: any) {
      // Mensajes de error específicos y útiles
      let errorMessage = 'Error de conexión';
      
      if (err.message) {
        // Errores específicos de la API
        if (err.message.includes('Invalid credentials') || err.message.includes('Authentication failed')) {
          errorMessage = 'Email o contraseña incorrectos';
        } else if (err.message.includes('User not found')) {
          errorMessage = mode === 'login' 
            ? 'Usuario no encontrado. ¿Necesitas registrarte?' 
            : 'Error al crear usuario';
        } else if (err.message.includes('Email already exists')) {
          errorMessage = 'Este email ya está registrado. ¿Quieres iniciar sesión?';
        } else if (err.message.includes('Network')) {
          errorMessage = 'Sin conexión a internet. Verifica tu red';
        } else if (err.message.includes('timeout')) {
          errorMessage = 'El servidor tardó demasiado en responder. Inténtalo de nuevo';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (provider: 'google' | 'microsoft') => {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const apiUrl = isLocalhost
      ? 'http://localhost:8080'
      : 'https://econeura-backend-prod.azurewebsites.net';

    window.location.href = `${apiUrl}/api/oauth/${provider}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background lights */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/15 rounded-full blur-[140px] animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-500/15 rounded-full blur-[140px]" style={{ animation: 'pulse 3s ease-in-out infinite 1s' }}></div>
      <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-emerald-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float 15s ${Math.random() * 3}s infinite ease-in-out`
            }}
          />
        ))}
      </div>

      <div className="bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-3xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] w-full max-w-md p-10 border border-white/10 relative overflow-hidden">
        {/* Inner glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5 pointer-events-none"></div>
        
        {/* Brillo superior */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent"></div>

        {/* Logo y Header */}
        <div className="text-center mb-10">
          {/* Logo circular premium profesional */}
          <div className="inline-block mb-6 mt-16">
            <div className="relative w-32 h-32 group">
              {/* Anillos orbitales - Efecto premium sutil */}
              <div className="absolute inset-[-15px] rounded-full border border-emerald-400/15 animate-spin" style={{ animationDuration: '20s' }}></div>
              <div className="absolute inset-[-10px] rounded-full border border-teal-400/10" style={{ animation: 'spin 15s linear infinite reverse' }}></div>
              
              {/* Resplandor exterior profesional */}
              <div className="absolute inset-[-20px] rounded-full bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 blur-2xl opacity-50 group-hover:opacity-80 transition-opacity duration-700"></div>
              
              {/* Sombra base profunda */}
              <div className="absolute inset-0 rounded-full" style={{ boxShadow: '0 20px 40px -10px rgba(16, 185, 129, 0.3), 0 10px 20px -5px rgba(6, 182, 212, 0.2)' }}></div>
              
              {/* Borde circular con gradiente animado */}
              <div 
                className="absolute inset-0 rounded-full transition-all duration-500 group-hover:scale-[1.02]"
                style={{
                  padding: '2px',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 1), rgba(20, 184, 166, 1), rgba(6, 182, 212, 1), rgba(16, 185, 129, 1))',
                  backgroundSize: '200% 200%',
                  animation: 'gradient-shift 8s ease infinite',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                  boxShadow: '0 0 25px rgba(16, 185, 129, 0.4), 0 0 50px rgba(6, 182, 212, 0.2), inset 0 0 15px rgba(255, 255, 255, 0.1)'
                }}
              ></div>
              
              {/* Inner glow efecto cristal */}
              <div className="absolute inset-[2px] rounded-full bg-gradient-to-br from-emerald-400/10 via-teal-400/10 to-cyan-400/10 backdrop-blur-sm"></div>
              <div className="absolute inset-[2px] rounded-full bg-gradient-to-tr from-white/5 via-transparent to-transparent"></div>
              
              {/* Imagen circular */}
              <div className="absolute inset-[2px] rounded-full overflow-hidden transform transition-all duration-500 group-hover:scale-[1.01] flex items-center justify-center bg-slate-900/40 backdrop-blur-md">
                <img
                  src="/logo.png"
                  alt="ECONEURA MAX PREMIUM Logo"
                  className="w-full h-full object-cover relative z-10"
                  style={{
                    filter: 'drop-shadow(0 4px 12px rgba(16, 185, 129, 0.5)) brightness(1.1) contrast(1.05)',
                    transform: 'scale(1.25) translateY(1px)',
                    transformOrigin: 'center center',
                    objectPosition: 'center center'
                  }}
                />
              </div>
              
              {/* Brillo superior - Efecto vidrio */}
              <div className="absolute inset-[2px] rounded-full bg-gradient-to-b from-white/15 via-transparent to-transparent pointer-events-none" style={{ clipPath: 'ellipse(80% 30% at 50% 20%)' }}></div>
            </div>
          </div>

          {/* Título ECONEURA */}
          <h1 className="text-4xl font-black tracking-tight text-white mb-3"
              style={{
                fontFamily: '"Inter", "SF Pro Display", system-ui, -apple-system, sans-serif',
                letterSpacing: '-0.03em',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
              }}>
            ECONEURA
          </h1>

          {/* Subtítulo */}
          <div className="space-y-2">
            <p className="text-xl font-semibold text-emerald-400"
               style={{
                 fontFamily: '"Inter", "SF Pro Display", system-ui, -apple-system, sans-serif',
                 letterSpacing: '-0.01em'
               }}>
              {mode === 'login' ? 'BIENVENIDO' : 'CREA TU CUENTA'}
            </p>
            <p className="text-sm text-slate-300 font-light leading-relaxed"
               style={{
                 fontFamily: '"Inter", "SF Pro Text", system-ui, -apple-system, sans-serif'
               }}>
              Accede a tu <span className="font-semibold text-emerald-400">ecosistema de inteligencia colectiva</span>
            </p>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-xl text-red-200 text-sm backdrop-blur-sm">
            {error}
          </div>
        )}

        {/* OAuth buttons */}
        <div className="space-y-3 mb-8">
          <button
            onClick={() => handleOAuthLogin('microsoft')}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/20 rounded-xl hover:from-blue-500/30 hover:to-purple-500/30 hover:border-white/40 hover:shadow-[0_10px_40px_rgba(99,102,241,0.3)] transition-all duration-300 font-semibold text-white shadow-lg backdrop-blur-md relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/10 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative z-10 flex items-center gap-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#f25022" d="M0 0h11.377v11.372H0z"/>
                <path fill="#00a4ef" d="M12.623 0H24v11.372H12.623z"/>
                <path fill="#7fba00" d="M0 12.628h11.377V24H0z"/>
                <path fill="#ffb900" d="M12.623 12.628H24V24H12.623z"/>
              </svg>
              Continuar con Microsoft
            </span>
          </button>

        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          <span className="text-sm text-slate-400 font-medium px-2">O con email</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nombre completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-gradient-to-r from-white/5 to-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:shadow-[0_0_20px_rgba(16,185,129,0.3)] outline-none transition-all duration-300 text-white placeholder:text-slate-400 backdrop-blur-md hover:bg-white/15"
                  placeholder="Juan Pérez"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-gradient-to-r from-white/5 to-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:shadow-[0_0_20px_rgba(16,185,129,0.3)] outline-none transition-all duration-300 text-white placeholder:text-slate-400 backdrop-blur-md hover:bg-white/15"
                placeholder="tu@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-gradient-to-r from-white/5 to-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:shadow-[0_0_20px_rgba(16,185,129,0.3)] outline-none transition-all duration-300 text-white placeholder:text-slate-400 backdrop-blur-md hover:bg-white/15"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Remember me checkbox */}
          {mode === 'login' && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/10 text-emerald-500 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="rememberMe" className="text-sm text-slate-300 cursor-pointer select-none">
                Mantener sesión iniciada
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white py-3.5 rounded-xl font-bold hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:scale-105 active:scale-95"
          >
            {loading ? 'Cargando...' : (mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta')}
          </button>
        </form>

        {/* Toggle mode */}
        <div className="mt-8 text-center">
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-sm text-emerald-400 hover:text-emerald-300 font-semibold hover:underline transition-all duration-200"
          >
            {mode === 'login'
              ? '¿No tienes cuenta? Regístrate'
              : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-white/10 text-center text-xs text-slate-400">
          Al continuar, aceptas nuestros{' '}
          <a href="/terms" target="_blank" className="text-emerald-400 hover:text-emerald-300 font-medium hover:underline transition-colors">
            Términos
          </a>{' '}
          y{' '}
          <a href="/privacy" target="_blank" className="text-emerald-400 hover:text-emerald-300 font-medium hover:underline transition-colors">
            Privacidad
          </a>
        </div>
      </div>
    </div>
  );
}

