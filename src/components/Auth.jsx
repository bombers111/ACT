import { useState } from 'react';
import { getProfiles, createProfile, getResults } from '../utils/storage';
import { useLang } from '../contexts/LangContext';

export default function Auth({ onContinue }) {
  const { t } = useLang();
  const [view, setView] = useState('main');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const profiles = getProfiles();

  function handleGuest() { onContinue(null); }

  function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) { setError(t.enterName); return; }
    if (profiles.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
      setError(t.profileExists); return;
    }
    onContinue(createProfile(trimmed));
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>ACT</h1>
          <p className="auth-logo-sub">Agro-regenerative Citrus Tool</p>
        </div>

        {view === 'main' && (
          <>
            {profiles.length > 0 && (
              <div className="auth-section">
                <p className="auth-section-label">{t.continueAs}</p>
                <div className="profile-list">
                  {profiles.map((p) => {
                    const count = getResults(p.id).length;
                    return (
                      <button key={p.id} className="profile-btn" onClick={() => onContinue(p)}>
                        <span className="profile-initial">{p.name[0].toUpperCase()}</span>
                        <div className="profile-info">
                          <strong>{p.name}</strong>
                          <span>{count} {count === 1 ? t.assessmentSingular : t.assessmentsPlural}</span>
                        </div>
                        <span className="profile-arrow">›</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="auth-divider">{profiles.length > 0 ? 'or' : t.getStarted}</div>

            <div className="auth-actions">
              <button className="btn-primary" onClick={() => { setView('create'); setError(''); }}>
                {t.createProfile}
              </button>
              <button className="btn-secondary" onClick={handleGuest}>
                {t.continueGuest}
              </button>
            </div>

            <p className="auth-note">{t.profilesLocal}</p>
          </>
        )}

        {view === 'create' && (
          <div className="auth-section">
            <p className="auth-section-label">{t.createProfile}</p>
            <p className="auth-create-hint">{t.createProfileHint}</p>
            <input
              className="auth-input"
              type="text"
              placeholder={t.profilePlaceholder}
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              autoFocus
              maxLength={40}
            />
            {error && <p className="auth-error">{error}</p>}
            <div className="auth-actions">
              <button className="btn-primary" onClick={handleCreate} disabled={!name.trim()}>
                {t.createProfile}
              </button>
              <button className="btn-secondary" onClick={() => setView('main')}>
                {t.back}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
