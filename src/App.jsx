import { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Welcome from './components/Welcome';
import FarmMetadata from './components/FarmMetadata';
import Survey from './components/Survey';
import Results from './components/Results';
import Dashboard from './components/Dashboard';
import { runMCA } from './utils/mca';
import { saveResult, clearDraft } from './utils/storage';
import { pushAssessmentToGitHub } from './utils/github';
import { useLang } from './contexts/LangContext';
import { LANGS } from './i18n/ui';

export default function App() {
  const { lang, setLang, t } = useLang();
  const [screen, setScreen] = useState('auth');
  const [profile, setProfile] = useState(null);
  const [results, setResults] = useState(null);
  const [farmMeta, setFarmMeta] = useState(null);
  const [dark, setDark] = useState(
    () => localStorage.getItem('act_dark') === 'true'
  );

  useEffect(() => {
    localStorage.setItem('act_dark', dark);
  }, [dark]);

  function handleAuth(selectedProfile) {
    setProfile(selectedProfile);
    setScreen(selectedProfile ? 'dashboard' : 'welcome');
  }

  function handleStart() {
    setScreen('metadata');
  }

  function handleMetadata(meta) {
    setFarmMeta(meta);
    setScreen('survey');
  }

  function handleComplete(answers) {
    const mca = runMCA(answers);
    setResults(mca);
    clearDraft();
    if (profile) {
      const saved = saveResult(profile.id, mca, farmMeta);
      pushAssessmentToGitHub(profile.name, { ...mca, ...saved, farmMeta });
    }
    setScreen('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleRetake() {
    setResults(null);
    setFarmMeta(null);
    setScreen('welcome');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleDashboard() {
    setScreen('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSignOut() {
    setProfile(null);
    setResults(null);
    setFarmMeta(null);
    setScreen('auth');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="app-container" data-dark={dark}>
      <header className="app-header">
        <div className="header-inner">
          <span className="header-title">{t.appTitle}</span>
          <div className="header-right">
            {profile && (
              <button className="header-profile-btn" onClick={handleDashboard}>
                <span className="header-initial">{profile.name[0].toUpperCase()}</span>
                <span className="header-profile-name">{profile.name}</span>
              </button>
            )}
            {!profile && screen !== 'auth' && (
              <span className="header-guest">{t.guest}</span>
            )}
            <div className="lang-toggle">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  className={`lang-btn ${lang === l.code ? 'active' : ''}`}
                  onClick={() => setLang(l.code)}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <button
              className="dark-toggle"
              onClick={() => setDark((d) => !d)}
              title={dark ? t.lightMode : t.darkMode}
            >
              {dark ? '☀' : '☾'}
            </button>
            <span className="header-subtitle">{t.location}</span>
          </div>
        </div>
      </header>

      <main className="app-main">
        {screen === 'auth'      && <Auth onContinue={handleAuth} />}
        {screen === 'welcome'   && <Welcome profile={profile} onStart={handleStart} />}
        {screen === 'metadata'  && <FarmMetadata onContinue={handleMetadata} onSkip={() => handleMetadata(null)} />}
        {screen === 'survey'    && <Survey onComplete={handleComplete} />}
        {screen === 'results'   && results && (
          <Results results={results} profile={profile} onRetake={handleRetake} onDashboard={handleDashboard} />
        )}
        {screen === 'dashboard' && profile && (
          <Dashboard profile={profile} onNewAssessment={handleStart} onSignOut={handleSignOut} />
        )}
      </main>

      <footer className="app-footer">{t.footer}</footer>
    </div>
  );
}
