import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import criteriaData from '../data/criteria.json';
import surveyConfig from '../data/surveyConfig.json';
import { submitSurvey } from '../utils/surveySubmit';

const { criteria } = criteriaData;
const { expertDomains, sections } = surveyConfig;

const TOTAL_SECTIONS = 3;

function StepIndicator({ current }) {
  return (
    <div className="es-steps">
      {Array.from({ length: TOTAL_SECTIONS }).map((_, i) => (
        <div key={i} className={`es-step-dot ${i === current ? 'active' : i < current ? 'done' : ''}`} />
      ))}
    </div>
  );
}

function SectionHeader({ title, description, step }) {
  return (
    <div className="es-section-header">
      <div className="es-section-label">Section {step + 1} of {TOTAL_SECTIONS}</div>
      <h2 className="es-section-title">{title}</h2>
      <p className="es-section-desc">{description}</p>
    </div>
  );
}

// ── Section 0: Profile ────────────────────────────────────────────────
function ProfileSection({ profile, onChange }) {
  return (
    <div className="es-form-fields">
      <div className="es-field">
        <label className="es-label">Your name or anonymous ID <span className="es-optional">(optional)</span></label>
        <input
          className="es-input"
          type="text"
          placeholder="e.g. Dr. García or Expert-03"
          value={profile.expertId}
          onChange={e => onChange('expertId', e.target.value)}
        />
      </div>

      <div className="es-field">
        <label className="es-label">Primary area of expertise <span className="es-required">*</span></label>
        <select
          className="es-input"
          value={profile.domain}
          onChange={e => onChange('domain', e.target.value)}
        >
          <option value="">Select domain…</option>
          {expertDomains.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div className="es-field">
        <label className="es-label">Years of experience in your field <span className="es-required">*</span></label>
        <input
          className="es-input"
          type="number"
          min="0"
          max="60"
          placeholder="e.g. 12"
          value={profile.yearsExperience}
          onChange={e => onChange('yearsExperience', e.target.value)}
        />
      </div>

      <div className="es-field">
        <label className="es-label">
          Familiarity with Valencia / Valencian citrus farming
          <span className="es-slider-val"> — {profile.valenciaFamiliarity}/5</span>
        </label>
        <div className="es-slider-row">
          <span className="es-slider-label">Not familiar</span>
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={profile.valenciaFamiliarity}
            onChange={e => onChange('valenciaFamiliarity', parseInt(e.target.value))}
            className="es-slider"
          />
          <span className="es-slider-label">Very familiar</span>
        </div>
      </div>
    </div>
  );
}

// ── Section 1: Ratings ────────────────────────────────────────────────
function RatingsSection({ ratings, elaborations, onRating, onElab }) {
  const [openElab, setOpenElab] = useState({});

  return (
    <div className="es-criteria-list">
      {criteria.map(c => (
        <div key={c.id} className="es-criterion-card">
          <div className="es-criterion-name">{c.title}</div>
          <div className="es-criterion-desc" style={{ marginBottom: 14 }}>{c.description}</div>

          <div className="es-rating-row">
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={ratings[c.id] ?? 5}
              onChange={e => onRating(c.id, Number(e.target.value))}
              className="es-slider"
            />
            <span className="es-rating-val">{ratings[c.id] ?? 5} / 10</span>
          </div>
          <div className="es-rating-labels">
            <span>1 — Not important</span>
            <span>10 — Critically important</span>
          </div>

          <button
            className="es-elab-toggle"
            onClick={() => setOpenElab(o => ({ ...o, [c.id]: !o[c.id] }))}
          >
            {openElab[c.id] ? '▲ Hide' : '▼ Add rationale'} <span className="es-optional">(optional)</span>
          </button>
          {openElab[c.id] && (
            <textarea
              className="es-textarea"
              rows={3}
              placeholder={sections.weights.elaborationPrompt}
              value={elaborations[c.id] || ''}
              onChange={e => onElab(c.id, e.target.value)}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Section 2: Free text ──────────────────────────────────────────────
function FreeTextSection({ freeText, onChange }) {
  const showWeight = freeText.missing.trim().length > 0;

  return (
    <div className="es-form-fields">
      <div className="es-field">
        <label className="es-label">{sections.freeText.q1}</label>
        <textarea
          className="es-textarea"
          rows={5}
          placeholder="Describe any missing dimension…"
          value={freeText.missing}
          onChange={e => onChange('missing', e.target.value)}
        />
      </div>

      {showWeight && (
        <div className="es-field es-missing-weight">
          <label className="es-label">
            How important would this missing criterion be?
            <span className="es-slider-val"> — {freeText.missingWeight ?? 5} / 10</span>
          </label>
          <div className="es-rating-row">
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={freeText.missingWeight ?? 5}
              onChange={e => onChange('missingWeight', Number(e.target.value))}
              className="es-slider"
            />
          </div>
          <div className="es-rating-labels">
            <span>1 — Not important</span>
            <span>10 — Critically important</span>
          </div>
        </div>
      )}

      <div className="es-field">
        <label className="es-label">{sections.freeText.q2}</label>
        <textarea
          className="es-textarea"
          rows={5}
          placeholder="Any other comments…"
          value={freeText.other}
          onChange={e => onChange('other', e.target.value)}
        />
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────
export default function ExpertSurvey() {
  const navigate = useNavigate();

  const [currentSection, setCurrentSection] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [profile, setProfile] = useState({
    expertId: '',
    domain: '',
    yearsExperience: '',
    valenciaFamiliarity: 3,
  });

  const [ratings, setRatings] = useState(
    Object.fromEntries(criteria.map(c => [c.id, 5]))
  );

  const [elaborations, setElaborations] = useState(
    Object.fromEntries(criteria.map(c => [c.id, '']))
  );

  const [freeText, setFreeText] = useState({ missing: '', missingWeight: 5, other: '' });

  function validateSection() {
    if (currentSection === 0) {
      if (!profile.domain) return 'Please select your area of expertise.';
      if (!profile.yearsExperience) return 'Please enter your years of experience.';
    }
    return null;
  }

  function handleNext() {
    const err = validateSection();
    if (err) { setError(err); return; }
    setError(null);
    setCurrentSection(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleBack() {
    setError(null);
    setCurrentSection(s => s - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit() {
    const err = validateSection();
    if (err) { setError(err); return; }
    setError(null);
    setSubmitting(true);

    const payload = {
      timestamp: new Date().toISOString(),
      expertId: profile.expertId || 'anonymous',
      domain: profile.domain,
      yearsExperience: profile.yearsExperience,
      valenciaFamiliarity: profile.valenciaFamiliarity,
      ratings,
      elaborations,
      freeText: {
        missing: freeText.missing,
        missingWeight: freeText.missing.trim().length > 0 ? freeText.missingWeight : null,
        other: freeText.other,
      },
    };

    try {
      await submitSurvey(payload);
      navigate('/ACT/survey/complete');
    } catch (e) {
      setError(`Submission failed: ${e.message}. Please try again or contact the research team.`);
      setSubmitting(false);
    }
  }

  const sectionTitles = [
    sections.profile.title,
    'Rate each criterion independently',
    sections.freeText.title,
  ];
  const sectionDescs = [
    sections.profile.description,
    'Score each criterion from 1 to 10 based on how important it is for defining a regenerative citrus farm. Rate each one on its own — do not worry about the total. 1 = Not important, 10 = Critically important.',
    'Please share any final thoughts on the framework.',
  ];

  return (
    <div className="es-page">
      <header className="es-header">
        <div className="es-header-inner">
          <span className="es-header-title">ACT — Expert Weight Elicitation Survey</span>
          <span className="es-header-sub">Agro-regenerative Citrus Tool · Wageningen / CREAF 2026</span>
        </div>
      </header>

      <main className="es-main">
        <div className="es-card">
          <StepIndicator current={currentSection} />

          <SectionHeader
            title={sectionTitles[currentSection]}
            description={sectionDescs[currentSection]}
            step={currentSection}
          />

          {currentSection === 0 && (
            <ProfileSection
              profile={profile}
              onChange={(k, v) => setProfile(p => ({ ...p, [k]: v }))}
            />
          )}
          {currentSection === 1 && (
            <RatingsSection
              ratings={ratings}
              elaborations={elaborations}
              onRating={(id, val) => setRatings(r => ({ ...r, [id]: val }))}
              onElab={(id, val) => setElaborations(e => ({ ...e, [id]: val }))}
            />
          )}
          {currentSection === 2 && (
            <FreeTextSection
              freeText={freeText}
              onChange={(k, v) => setFreeText(f => ({ ...f, [k]: v }))}
            />
          )}

          {error && <div className="es-error">{error}</div>}

          <div className="es-nav">
            {currentSection > 0 && (
              <button className="es-btn-secondary" onClick={handleBack} disabled={submitting}>
                ← Back
              </button>
            )}
            <div style={{ flex: 1 }} />
            {currentSection < TOTAL_SECTIONS - 1 ? (
              <button className="es-btn-primary" onClick={handleNext}>
                Next →
              </button>
            ) : (
              <button className="es-btn-primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit response'}
              </button>
            )}
          </div>
        </div>
      </main>

      <footer className="es-footer">
        Based on the Iberian Regenerative Agriculture Criteria 2026 (CREAF / ARI).
        Expert responses are confidential and used only for MCA calibration.
      </footer>
    </div>
  );
}
