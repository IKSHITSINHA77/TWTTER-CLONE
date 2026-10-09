// src/context/LanguageContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { EXACT_SUPPORTED_LANGUAGES, UI_TRANSLATIONS, SupportedLanguage } from '@/lib/translationService';

interface LanguageContextType {
  currentLanguage: string;
  setLanguageDirectly: (code: string) => void;
  translate: (key: string) => string;
  availableLanguages: SupportedLanguage[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');

  useEffect(() => {
    const saved = localStorage.getItem('site_language');
    if (saved && EXACT_SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
      setCurrentLanguage(saved);
    }
  }, []);

  const setLanguageDirectly = (code: string) => {
    setCurrentLanguage(code);
    localStorage.setItem('site_language', code);
  };

  const translate = (key: string): string => {
    return UI_TRANSLATIONS[currentLanguage]?.[key] || UI_TRANSLATIONS['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguageDirectly,
        translate,
        availableLanguages: EXACT_SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};