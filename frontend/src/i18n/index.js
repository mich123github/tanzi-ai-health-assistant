import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: { translation: { welcome: "Welcome", describe_symptoms: "Describe your symptoms" } },
  chy: { translation: { welcome: "Moni", describe_symptoms: "Fotokozerani zizindikiro zanu" } }
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
});

export default i18n;
