import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ko from './locales/ko.json';
import ja from './locales/ja.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ko: { translation: ko },
    ja: { translation: ja }
  },
  lng: 'en', // 기본 언어
  fallbackLng: 'en', // 언어가 없을 경우 기본 언어
  interpolation: {
    escapeValue: false // React는 XSS를 방지하므로 escape가 필요 없음
  }
});

export default i18n;