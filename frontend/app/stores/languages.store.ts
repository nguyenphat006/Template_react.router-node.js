// libs/src/stores/languages.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '../i18n/i18n.config';

interface LanguageState {
  language: string;
  setLanguage: (lang: string) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'vi',
      setLanguage: (lang) => {
        set({ language: lang });
        // Change i18n language immediately
        if (i18n.isInitialized) {
          i18n.changeLanguage(lang);
        }
      },
    }),
    {
      name: 'app-language',
    }
  )
);