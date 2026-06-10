import { useState } from 'react';
import { getProfiles, createProfile, getResults } from '../utils/storage';

export default function Auth({ onContinue }) {
  const [view, setView] = useState('main');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const profiles = getProfiles();

  function handleGuest() {
    onContinue(null);
  }

  function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) { setError('Please enter a name.'); return; }
    if (profiles.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('A profile with this name already exists.'); return;
    }
    const profile = createProfile(trimmed);
    onContinue(profile);
  }

  function handleSelect(profile) {
    onContinue(profile);
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
                <p className="auth-section-label">Continue as</p>
                <div className="profile-list">
                  {profiles.map((p) => {
                    const count = getResults(p.id).length;
                    return (
                      <button key={p.id} className="profile-btn" onClick={() => handleSelect(p)}>
                        <span className="profile-initial">{p.name[0].toUpperCase()}</span>
                        <div className="profile-info">
                          <strong>{p.name}</strong>
                          <span>{count} assessment{count !== 1 ? 's' : ''}</span>
                        </div>
                        <span className="profile-arrow">›</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="auth-divider">
              {profiles.length > 0 ? 'or' : 'Get started'}
            </div>

            <div className="auth-actions">
              <button className="btn-primary" onClick={() => { setView('create'); setError(''); }}>
                Create Profile
              </button>
              <button className="btn-secondary" onClick={handleGuest}>
                Continue as Guest
              </button>
            </div>

            <p className="auth-note">
              Profiles are stored locally on this device. Creating a profile lets you track your progress over time.
            </p>
          </>
        )}

        {view === 'create' && (
          <div className="auth-section">
            <p className="auth-section-label">Create a profile</p>
            <p className="auth-create-hint">
              Use your name or your farm name. Your data stays on this device.
            </p>
            <input
              className="auth-input"
              type="text"
              placeholder="e.g. Finca El Naranjal"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              autoFocus
              maxLength={40}
            />
            {error && <p className="auth-error">{error}</p>}
            <div className="auth-actions">
              <button className="btn-primary" onClick={handleCreate} disabled={!name.trim()}>
                Create Profile
              </button>
              <button className="btn-secondary" onClick={() => setView('main')}>
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
