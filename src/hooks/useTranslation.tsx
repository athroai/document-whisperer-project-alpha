
import { useState, useEffect, createContext, useContext } from 'react';
import translations from '@/i18n';

type Language = 'en' | 'cy' | 'es' | 'fr' | 'de';

interface TranslationContextType {
  language: Language;
  t: (key: string, params?: Record<string, string | number>) => string;
  changeLanguage: (lang: Language) => void;
}

const TranslationContext = createContext<TranslationContextType>({
  language: 'en',
  t: (key: string) => key,
  changeLanguage: () => {},
});

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  
  useEffect(() => {
    // Try to get language from localStorage first
    const storedLanguage = localStorage.getItem('preferredLanguage') as Language | null;
    
    if (storedLanguage && ['en', 'cy', 'es', 'fr', 'de'].includes(storedLanguage)) {
      setLanguage(storedLanguage);
    } else {
      // Default to English
      setLanguage('en');
    }
  }, []);
  
  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let result = translations[language] || translations.en;
    
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        // Fallback to English if translation not found
        let fallback = translations.en;
        for (const fk of keys) {
          if (fallback && typeof fallback === 'object' && fk in fallback) {
            fallback = fallback[fk];
          } else {
            return key; // Return key if not found in English either
          }
        }
        return typeof fallback === 'string' ? fallback : key;
      }
    }
    
    let translated = typeof result === 'string' ? result : key;
    
    // Replace parameters if provided
    if (params && typeof translated === 'string') {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        const regex = new RegExp(`{${paramKey}}`, 'g');
        translated = translated.replace(regex, String(paramValue));
      });
    }
    
    return translated;
  };
  
  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('preferredLanguage', lang);
  };
  
  return (
    <TranslationContext.Provider value={{ language, t, changeLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => useContext(TranslationContext);
