import { createContext, useContext, useState } from 'react';
import { ui } from '../i18n/ui';

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(
    () => localStorage.getItem('act_lang') || 'en'
  );

  function setLang(l) {
    localStorage.setItem('act_lang', l);
    setLangState(l);
  }

  const t = ui[lang] || ui.en;

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
