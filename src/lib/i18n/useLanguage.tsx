"use client";

import React, { createContext, useContext, useSyncExternalStore } from 'react';
import { Language, translations } from './translations';

export type { Language } from './translations';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.pt;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'language';
const LANGUAGE_CHANGE_EVENT = 'languagechange';

function getLanguageSnapshot(): Language {
  if (typeof window === 'undefined') return 'pt';

  const savedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (savedLang === 'pt' || savedLang === 'en') {
    return savedLang;
  }

  const browserLang = (navigator.language || 'pt').split('-')[0];
  return browserLang === 'en' ? 'en' : 'pt';
}

function getServerSnapshot(): Language {
  return 'pt';
}

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener(LANGUAGE_CHANGE_EVENT, callback);

  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(LANGUAGE_CHANGE_EVENT, callback);
  };
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = useSyncExternalStore(subscribe, getLanguageSnapshot, getServerSnapshot);

  const setLanguage = (lang: Language) => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    window.dispatchEvent(new Event(LANGUAGE_CHANGE_EVENT));
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
