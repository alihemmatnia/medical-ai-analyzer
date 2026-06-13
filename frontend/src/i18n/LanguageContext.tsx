import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { translations } from './translations';

export type Language = 'en' | 'fa' | 'ar' | 'he' | 'fr' | 'de' | 'es';

interface LanguageContextProps {
  language: Language;
  direction: 'ltr' | 'rtl';
  setLanguage: (lang: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

const isRtl = (lang: Language): boolean => ['fa', 'ar', 'he'].includes(lang);

const getNestedTranslation = (obj: any, path: string): string => {
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return path;
    }
  }
  return typeof current === 'string' ? current : path;
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    if (saved && ['en', 'fa', 'ar', 'he', 'fr', 'de', 'es'].includes(saved)) {
      return saved as Language;
    }
    return 'en';
  });

  const direction = isRtl(language) ? 'rtl' : 'ltr';

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
  }, [language, direction]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string, replacements?: Record<string, string | number>): string => {
    const langTranslations = translations[language] || translations['en'];
    let text = getNestedTranslation(langTranslations, key);

    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        text = text.replace(new RegExp(`{${k}}`, 'g'), String(v));
        text = text.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
      });
    }

    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, direction, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
