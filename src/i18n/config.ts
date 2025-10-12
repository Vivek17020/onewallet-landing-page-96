import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import hi from './locales/hi.json';

// Initialize i18n with error handling
const initI18n = () => {
  try {
    i18n
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        resources: {
          en: { translation: en },
          hi: { translation: hi }
        },
        fallbackLng: 'hi',
        lng: 'hi',
        interpolation: {
          escapeValue: false
        },
        react: {
          useSuspense: false
        }
      });
  } catch (error) {
    console.error('i18n initialization error:', error);
  }
};

initI18n();

export default i18n;
