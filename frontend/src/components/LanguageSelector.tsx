import React from 'react';
import { Globe } from 'lucide-react';
import { Language } from '../i18n/translations';

interface LanguageSelectorProps {
  currentLang: Language;
  onChangeLang: (lang: Language) => void;
  darkMode?: boolean;
}

export function LanguageSelector({ currentLang, onChangeLang, darkMode = false }: LanguageSelectorProps) {
  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' }
  ];

  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`h-11 px-4 rounded-xl border-2 flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl ${
          darkMode
            ? 'border-slate-600 bg-slate-700/95 text-slate-100 hover:bg-slate-600 hover:border-slate-500'
            : 'border-slate-200 bg-white/95 text-slate-700 hover:bg-blue-50 hover:border-blue-300'
        } backdrop-blur-sm`}
        aria-label="Select language"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">{languages.find(l => l.code === currentLang)?.flag}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className={`absolute top-full right-0 mt-2 w-48 rounded-xl shadow-2xl overflow-hidden z-50 border ${
            darkMode
              ? 'bg-slate-800 border-slate-700'
              : 'bg-white border-slate-200'
          }`}>
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  onChangeLang(lang.code);
                  setOpen(false);
                }}
                className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${
                  currentLang === lang.code
                    ? darkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-50 text-blue-700'
                    : darkMode
                      ? 'text-slate-100 hover:bg-slate-700'
                      : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <span className="text-sm font-medium">{lang.label}</span>
                {currentLang === lang.code && (
                  <span className="ml-auto text-xs">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

