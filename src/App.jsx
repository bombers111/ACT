import { useState } from 'react';
import Welcome from './components/Welcome';
import Survey from './components/Survey';
import Results from './components/Results';
import { runMCA } from './utils/mca';
import './App.css';

export default function App() {
  const [screen, setScreen] = useState('welcome');
  const [results, setResults] = useState(null);

  function handleStart() {
    setScreen('survey');
  }

  function handleComplete(answers) {
    const mca = runMCA(answers);
    setResults(mca);
    setScreen('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleRetake() {
    setResults(null);
    setScreen('welcome');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-inner">
          <span className="header-logo">🍊</span>
          <span className="header-title">ACT — Agro-regenerative Citrus Tool</span>
          <span className="header-subtitle">Valencia, Spain</span>
        </div>
      </header>

      <main className="app-main">
        {screen === 'welcome' && <Welcome onStart={handleStart} />}
        {screen === 'survey' && <Survey onComplete={handleComplete} />}
        {screen === 'results' && results && (
          <Results results={results} onRetake={handleRetake} />
        )}
      </main>

      <footer className="app-footer">
        Based on the Iberian Regenerative Agriculture Criteria 2026 (CREAF / Asociación de Agricultura Regenerativa Ibérica) &amp; scientific literature.
      </footer>
    </div>
  );
}
