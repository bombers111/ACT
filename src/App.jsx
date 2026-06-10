import { useState } from 'react';
import Auth from './components/Auth';
import Welcome from './components/Welcome';
import Survey from './components/Survey';
import Results from './components/Results';
import Dashboard from './components/Dashboard';
import { runMCA } from './utils/mca';
import { saveResult } from './utils/storage';
import './App.css';

export default function App() {
  const [screen, setScreen] = useState('auth');
  const [profile, setProfile] = useState(null); // null = guest
  const [results, setResults] = useState(null);

  function handleAuth(selectedProfile) {
    setProfile(selectedProfile);
    // If profile has existing results, go to dashboard; otherwise welcome
    if (selectedProfile) {
      setScreen('dashboard');
    } else {
      setScreen('welcome');
    }
  }

  function handleStart() {
    setScreen('survey');
  }

  function handleComplete(answers) {
    const mca = runMCA(answers);
    setResults(mca);
    if (profile) {
      saveResult(profile.id, mca);
    }
    setScreen('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleRetake() {
    setResults(null);
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
    setScreen('auth');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-inner">
          <span className="header-title">ACT — Agro-regenerative Citrus Tool</span>
          <div className="header-right">
            {profile && (
              <button className="header-profile-btn" onClick={handleDashboard}>
                <span className="header-initial">{profile.name[0].toUpperCase()}</span>
                <span className="header-profile-name">{profile.name}</span>
              </button>
            )}
            {!profile && screen !== 'auth' && (
              <span className="header-guest">Guest</span>
            )}
            <span className="header-subtitle">Valencia, Spain</span>
          </div>
        </div>
      </header>

      <main className="app-main">
        {screen === 'auth' && <Auth onContinue={handleAuth} />}
        {screen === 'welcome' && <Welcome onStart={handleStart} />}
        {screen === 'survey' && <Survey onComplete={handleComplete} />}
        {screen === 'results' && results && (
          <Results
            results={results}
            profile={profile}
            onRetake={handleRetake}
            onDashboard={handleDashboard}
          />
        )}
        {screen === 'dashboard' && profile && (
          <Dashboard
            profile={profile}
            onNewAssessment={handleStart}
            onSignOut={handleSignOut}
          />
        )}
      </main>

      <footer className="app-footer">
        Based on the Iberian Regenerative Agriculture Criteria 2026 (CREAF / Asociación de Agricultura Regenerativa Ibérica) &amp; scientific literature.
      </footer>
    </div>
  );
}
