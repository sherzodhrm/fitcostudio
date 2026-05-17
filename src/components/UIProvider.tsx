import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from '../locales/translations';

type Theme = 'dark' | 'creamy';

interface UIContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  lang: Language;
  setLang: (l: Language) => void;
  t: typeof translations['en'];
  onSettingsChange?: (settings: { theme?: Theme; lang?: Language }) => void;
}

const UIContext = createContext<UIContextType | null>(null);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => (localStorage.getItem('app-theme') as Theme) || 'dark');
  const [lang, setLangState] = useState<Language>(() => (localStorage.getItem('app-lang') as Language) || 'en');
  const [callback, setCallback] = useState<((s: any) => void) | undefined>();

  const setTheme = (t: Theme) => {
    setThemeState(t);
    if (callback) callback({ theme: t });
  };

  const setLang = (l: Language) => {
    setLangState(l);
    if (callback) callback({ lang: l });
  };

  useEffect(() => {
    localStorage.setItem('app-theme', theme);
    document.documentElement.className = theme;
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('app-lang', lang);
  }, [lang]);

  const value = {
    theme,
    setTheme,
    lang,
    setLang,
    t: translations[lang],
    onSettingsChange: setCallback
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within UIProvider');
  return context;
};
