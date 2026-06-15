"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language, translations } from './translations';

export type { Language } from './translations';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.pt;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'pt';

    const savedLang = localStorage.getItem('language') as Language | null;
    if (savedLang === 'pt' || savedLang === 'en') {
      return savedLang;
    }

    const browserLang = (navigator.language || 'pt').split('-')[0];
    if (browserLang === 'pt' || browserLang === 'en') {
      return browserLang as Language;
    }

    return 'pt';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') localStorage.setItem('language', lang);
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return {
      language: 'pt' as Language,
      setLanguage: () => {},
      t: translations['pt'],
    };
  }
  return ctx;
}
