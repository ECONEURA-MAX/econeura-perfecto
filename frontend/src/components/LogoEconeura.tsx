import React from 'react';

interface LogoEconeuraProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  darkMode?: boolean;
}

export function LogoEconeura({ 
  size = 'md', 
  showText = true, 
  className = '',
  darkMode = false 
}: LogoEconeuraProps) {
  const sizeClasses = {
    sm: 'h-10',
    md: 'h-16', 
    lg: 'h-20',
    xl: 'h-24'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl', 
    xl: 'text-3xl'
  };

  return (
    <div className={`flex items-center gap-3 group ${className}`}>
      {/* Logo definitivo */}
      <img 
        src={`/logo.png?v=${Date.now()}`}
        alt="ECONEURA MAX PREMIUM" 
        className={`${sizeClasses[size]} w-auto transition-all duration-300 group-hover:scale-105`}
        style={{
          filter: darkMode ? 'brightness(1.1) contrast(1.05)' : 'brightness(1) contrast(1.1)'
        }}
      />
      
      {/* Texto ECONEURA con efectos premium */}
      {showText && (
        <div className="relative group">
          {/* Sombra inferior para relieve premium */}
          <span
            className={`absolute top-[2px] left-[1px] ${textSizes[size]} font-black tracking-tight text-slate-500/60 blur-[0.5px]`}
            style={{
              fontFamily: '"Inter", "SF Pro Display", system-ui, -apple-system, sans-serif',
              letterSpacing: '-0.03em',
              fontWeight: 900
            }}
            aria-hidden="true"
          >
            ECONEURA
          </span>

          {/* Texto principal con efectos premium */}
          <span
            className={`relative ${textSizes[size]} font-black tracking-tight transition-all duration-300 group-hover:scale-105 ${
              darkMode
                ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent'
                : 'text-slate-900'
            }`}
            style={{
              fontFamily: '"Inter", "SF Pro Display", system-ui, -apple-system, sans-serif',
              letterSpacing: '-0.03em',
              fontWeight: 900,
              textShadow: darkMode
                ? '0 2px 8px rgba(16, 185, 129, 0.4), 0 4px 16px rgba(16, 185, 129, 0.2), 0 8px 32px rgba(16, 185, 129, 0.1)'
                : '0 2px 0 rgba(255, 255, 255, 0.9), 0 -1px 0 rgba(0, 0, 0, 0.15), 0 3px 8px rgba(0, 0, 0, 0.08), 0 6px 16px rgba(0, 0, 0, 0.04)',
              filter: 'contrast(1.1) brightness(1.05)'
            }}
          >
            ECONEURA
          </span>
          
          {/* Efecto de brillo sutil */}
          <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${
            darkMode ? 'bg-gradient-to-r from-emerald-400 to-cyan-400' : 'bg-gradient-to-r from-emerald-500 to-cyan-500'
          } blur-sm`} />
        </div>
      )}
    </div>
  );
}
