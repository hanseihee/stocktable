import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import koTranslations from './locales/ko.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations
      },
      ko: {
        translation: koTranslations
      }
    },
    lng: 'en', // 기본 언어
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export const changeLanguage = (lng: string) => {
  i18n.changeLanguage(lng);
};

export default i18n; 