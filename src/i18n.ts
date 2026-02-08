import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import vi from "./locales/vi.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import de from "./locales/de.json";
import ja from "./locales/ja.json";
import ko from "./locales/ko.json";
import zh from "./locales/zh.json";
import ru from "./locales/ru.json";
import pt from "./locales/pt.json";
import it from "./locales/it.json";
import hi from "./locales/hi.json";

export const LANGUAGES = {
  en: "English",
  vi: "Tiếng Việt",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  ja: "日本語",
  ko: "한국어",
  zh: "中文",
  ru: "Русский",
  pt: "Português",
  it: "Italiano",
  hi: "हिन्दी",
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: true,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: { translation: en },
      vi: { translation: vi },
      es: { translation: es },
      fr: { translation: fr },
      de: { translation: de },
      ja: { translation: ja },
      ko: { translation: ko },
      zh: { translation: zh },
      ru: { translation: ru },
      pt: { translation: pt },
      it: { translation: it },
      hi: { translation: hi },
    },
  });

export default i18n;
