// libs/src/i18n/i18n.config.ts - Auto-initialize
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';

// Get initial language from localStorage (SSR-safe)
const getInitialLanguage = () => {
  if (typeof window === 'undefined') return 'vi';
  try {
    const stored = localStorage.getItem('app-language');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed?.state?.language || 'vi';
    }
  } catch {}
  return 'vi';
};

// Auto-initialize on import
if (!i18n.isInitialized) {
  i18n
    .use(HttpBackend)
    .use(initReactI18next)
    .init({
      lng: getInitialLanguage(),
      fallbackLng: 'vi',
      ns: ['common', 'home-page', 'about', 'admissions'],
      defaultNS: 'common',
      interpolation: { 
        escapeValue: false 
      },
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
      },
      react: {
        useSuspense: false,
      },
      debug: false, // Set true to debug
    });
}

// Export instance
export { i18n };
export default i18n;