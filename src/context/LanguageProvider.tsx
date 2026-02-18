'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import es from '@/locales/es.json';
import en from '@/locales/en.json';
import ma from '@/locales/ma.json';
import type { Language } from '@/lib/types';

const translations = { es, en, ma };

// Helper to access nested keys
const getNestedTranslation = (obj: any, key: string): string | undefined => {
    return key.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>('es');
  const [loadedTranslations, setLoadedTranslations] = useState(translations.es);

  useEffect(() => {
    // This effect runs on the client after hydration
    const storedLang = localStorage.getItem('language') as Language | null;
    if (storedLang && ['es', 'en', 'ma'].includes(storedLang)) {
      setLanguage(storedLang);
    }
  }, []);

  useEffect(() => {
    setLoadedTranslations(translations[language]);
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ma' ? 'rtl' : 'ltr';
  }, [language]);

  const t = (key: string): string => {
    return getNestedTranslation(loadedTranslations, key) || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
