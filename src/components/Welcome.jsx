import { useLang } from '../contexts/LangContext';
import { getLastResult } from '../utils/storage';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function Welcome({ profile, onStart }) {
  const { t } = useLang();
  const lastResult = profile ? getLastResult(profile.id) : null;

  return (
    <div className="welcome-screen">
      <div className="welcome-card">
        <div className="logo-area">
          <h1>ACT</h1>
          <p className="logo-sub">Agro-regenerative Citrus Tool</p>
        </div>

        {lastResult && (
          <div className="last-assessment-banner">
            <span>{t.lastAssessment}</span>
            <strong>{formatDate(lastResult.date)} — {lastResult.overallScore}/100</strong>
            <span className="last-level-dot" style={{ background: lastResult.level?.color }} />
          </div>
        )}

        <div className="welcome-body">
          <p className="welcome-intro">{t.welcomeIntro}</p>

          <div className="welcome-how">
            <div className="how-step">
              <div>
                <strong>{t.step1Title}</strong>
                <p>{t.step1Desc}</p>
              </div>
            </div>
            <div className="how-step">
              <div>
                <strong>{t.step2Title}</strong>
                <p>{t.step2Desc}</p>
              </div>
            </div>
            <div className="how-step">
              <div>
                <strong>{t.step3Title}</strong>
                <p>{t.step3Desc}</p>
              </div>
            </div>
          </div>

          <div className="welcome-note">{t.welcomeNote}</div>
        </div>

        <button className="btn-primary btn-large" onClick={onStart}>
          {t.startAssessment}
        </button>
      </div>
    </div>
  );
}
