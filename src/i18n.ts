/**
 * i18n 설정 파일
 * 다국어 지원을 위한 설정 및 초기화
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ko from './locales/ko.json';
import ja from './locales/ja.json';

// 지원하는 언어 코드 상수
const SUPPORTED_LANGUAGES = {
  ENGLISH: 'en',
  KOREAN: 'ko',
  JAPANESE: 'ja'
};

// 기본 언어 설정
const DEFAULT_LANGUAGE = SUPPORTED_LANGUAGES.ENGLISH;

// localStorage에서 저장된 언어 설정을 가져옵니다
// 저장된 설정이 없으면 기본값으로 영어(en)를 사용합니다
const savedLanguage = localStorage.getItem('language') || DEFAULT_LANGUAGE;

// i18n 초기화 설정
i18n.use(initReactI18next).init({
  // 번역 리소스 설정
  resources: {
    [SUPPORTED_LANGUAGES.ENGLISH]: { translation: en },
    [SUPPORTED_LANGUAGES.KOREAN]: { translation: ko },
    [SUPPORTED_LANGUAGES.JAPANESE]: { translation: ja }
  },
  lng: savedLanguage, // 저장된 언어 설정을 사용
  fallbackLng: DEFAULT_LANGUAGE, // 언어가 없을 경우 기본 언어
  interpolation: {
    escapeValue: false // React는 XSS를 방지하므로 escape가 필요 없음
  }
});

/**
 * 언어 변경 함수
 * @param lng 변경할 언어 코드 (en, ko, ja)
 * 언어를 변경하고 localStorage에 저장하여 새로고침 후에도 유지되도록 함
 */
export const changeLanguage = (lng: string) => {
  // 지원하는 언어인지 확인
  if (Object.values(SUPPORTED_LANGUAGES).includes(lng)) {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  } else {
    console.warn(`Unsupported language: ${lng}. Falling back to ${DEFAULT_LANGUAGE}`);
    i18n.changeLanguage(DEFAULT_LANGUAGE);
    localStorage.setItem('language', DEFAULT_LANGUAGE);
  }
};

export default i18n;