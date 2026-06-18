import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import criteriaData from '../data/criteria.json';
import surveyConfig from '../data/surveyConfig.json';
import { submitSurvey } from '../utils/surveySubmit';

const { criteria } = criteriaData;
const { expertDomains, sections, ui } = surveyConfig;

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

function SectionHeader({ title, description, step, t }) {
  return (
    <div className="es-section-header">
      <div className="es-section-label">{t.sectionLabel} {step + 1} {t.of} {TOTAL_SECTIONS}</div>
      <h2 className="es-section-title">{title}</h2>
      <p className="es-section-desc">{description}</p>
    </div>
  );
}

function LangToggle({ lang, setLang }) {
  return (
    <div className="es-lang-toggle">
      <button
        className={`es-lang-btn ${lang === 'en' ? 'active' : ''}`}
        onClick={() => setLang('en')}
      >EN</button>
      <button
        className={`es-lang-btn ${lang === 'es' ? 'active' : ''}`}
        onClick={() => setLang('es')}
      >ES</button>
    </div>
  );
}

// ── Section 0: Profile ────────────────────────────────────────────────
function ProfileSection({ profile, onChange, t, lang }) {
  return (
    <div className="es-form-fields">
      <div className="es-field">
        <label className="es-label">{t.nameLabel} <span className="es-optional">{t.nameOptional}</span></label>
        <input
          className="es-input"
          type="text"
          placeholder={t.namePlaceholder}
          value={profile.expertId}
          onChange={e => onChange('expertId', e.target.value)}
        />
      </div>

      <div className="es-field">
        <label className="es-label">{t.domainLabel} <span className="es-required">{t.domainRequired}</span></label>
        <select
          className="es-input"
          value={profile.domain}
          onChange={e => onChange('domain', e.target.value)}
        >
          <option value="">{t.domainPlaceholder}</option>
          {expertDomains[lang].map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div className="es-field">
        <label className="es-label">{t.yearsLabel} <span className="es-required">*</span></label>
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
          {t.familiarityLabel}
          <span className="es-slider-val"> — {profile.valenciaFamiliarity}/5</span>
        </label>
        <div className="es-slider-row">
          <span className="es-slider-label">{t.familiarityLow}</span>
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={profile.valenciaFamiliarity}
            onChange={e => onChange('valenciaFamiliarity', parseInt(e.target.value))}
            className="es-slider"
          />
          <span className="es-slider-label">{t.familiarityHigh}</span>
        </div>
      </div>
    </div>
  );
}

// ── Section 1: Ratings ────────────────────────────────────────────────
function RatingsSection({ ratings, elaborations, onRating, onElab, t, lang }) {
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
            <span>{t.notImportant}</span>
            <span>{t.criticallyImportant}</span>
          </div>

          <button
            className="es-elab-toggle"
            onClick={() => setOpenElab(o => ({ ...o, [c.id]: !o[c.id] }))}
          >
            {openElab[c.id] ? t.hideRationale : t.addRationale} <span className="es-optional">(optional)</span>
          </button>
          {openElab[c.id] && (
            <textarea
              className="es-textarea"
              rows={3}
              placeholder={sections[lang].weights.elaborationPrompt}
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
function FreeTextSection({ freeText, onChange, t, lang }) {
  function updateCriterion(index, field, value) {
    const updated = freeText.missingCriteria.map((c, i) =>
      i === index ? { ...c, [field]: value } : c
    );
    onChange('missingCriteria', updated);
  }

  function addCriterion() {
    onChange('missingCriteria', [...freeText.missingCriteria, { text: '', weight: 5 }]);
  }

  function removeCriterion(index) {
    onChange('missingCriteria', freeText.missingCriteria.filter((_, i) => i !== index));
  }

  return (
    <div className="es-form-fields">
      <div className="es-field">
        <label className="es-label">{sections[lang].freeText.q1}</label>

        {freeText.missingCriteria.map((c, i) => (
          <div key={i} className="es-missing-criterion-block">
            <div className="es-missing-criterion-header">
              <span className="es-missing-criterion-num">{t.criterionNum} {i + 1}</span>
              {freeText.missingCriteria.length > 1 && (
                <button className="es-remove-btn" onClick={() => removeCriterion(i)}>{t.removeCriterion}</button>
              )}
            </div>
            <textarea
              className="es-textarea"
              rows={3}
              placeholder={t.missingPlaceholder}
              value={c.text}
              onChange={e => updateCriterion(i, 'text', e.target.value)}
            />
            {c.text.trim().length > 0 && (
              <div className="es-missing-weight">
                <label className="es-label" style={{ marginTop: 8 }}>
                  {t.missingWeightLabel}
                  <span className="es-slider-val"> — {c.weight} / 10</span>
                </label>
                <div className="es-rating-row">
                  <input
                    type="range"
                    min={1} max={10} step={1}
                    value={c.weight}
                    onChange={e => updateCriterion(i, 'weight', Number(e.target.value))}
                    className="es-slider"
                  />
                </div>
                <div className="es-rating-labels">
                  <span>{t.notImportant}</span>
                  <span>{t.criticallyImportant}</span>
                </div>
              </div>
            )}
          </div>
        ))}

        <button className="es-add-criterion-btn" onClick={addCriterion}>
          {t.addCriterion}
        </button>
      </div>

      <div className="es-field">
        <label className="es-label">{sections[lang].freeText.q2}</label>
        <textarea
          className="es-textarea"
          rows={5}
          placeholder={t.otherPlaceholder}
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

  const [lang, setLang] = useState('en');
  const t = ui[lang];

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

  const [freeText, setFreeText] = useState({ missingCriteria: [{ text: '', weight: 5 }], other: '' });

  function validateSection() {
    if (currentSection === 0) {
      if (!profile.domain) return t.errorDomain;
      if (!profile.yearsExperience) return t.errorYears;
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
      lang,
      expertId: profile.expertId || 'anonymous',
      domain: profile.domain,
      yearsExperience: profile.yearsExperience,
      valenciaFamiliarity: profile.valenciaFamiliarity,
      ratings,
      elaborations,
      freeText: {
        missingCriteria: freeText.missingCriteria.filter(c => c.text.trim().length > 0),
        other: freeText.other,
      },
    };

    try {
      await submitSurvey(payload);
      navigate('/ACT/survey/complete');
    } catch (e) {
      setError(`${lang === 'es' ? 'Error al enviar' : 'Submission failed'}: ${e.message}.`);
      setSubmitting(false);
    }
  }

  const sectionTitles = [
    sections[lang].profile.title,
    t.ratingsTitle,
    sections[lang].freeText.title,
  ];
  const sectionDescs = [
    sections[lang].profile.description,
    t.ratingsDesc,
    lang === 'es' ? 'Por favor, comparta sus reflexiones finales sobre el marco.' : 'Please share any final thoughts on the framework.',
  ];

  return (
    <div className="es-page">
      <header className="es-header">
        <div className="es-header-inner">
          <div className="es-header-top">
            <div>
              <span className="es-header-title">{t.headerTitle}</span>
              <span className="es-header-sub">{t.headerSub}</span>
            </div>
            <LangToggle lang={lang} setLang={setLang} />
          </div>
        </div>
      </header>

      <main className="es-main">
        <div className="es-card">
          <StepIndicator current={currentSection} />

          <SectionHeader
            title={sectionTitles[currentSection]}
            description={sectionDescs[currentSection]}
            step={currentSection}
            t={t}
          />

          {currentSection === 0 && (
            <ProfileSection
              profile={profile}
              onChange={(k, v) => setProfile(p => ({ ...p, [k]: v }))}
              t={t}
              lang={lang}
            />
          )}
          {currentSection === 1 && (
            <RatingsSection
              ratings={ratings}
              elaborations={elaborations}
              onRating={(id, val) => setRatings(r => ({ ...r, [id]: val }))}
              onElab={(id, val) => setElaborations(e => ({ ...e, [id]: val }))}
              t={t}
              lang={lang}
            />
          )}
          {currentSection === 2 && (
            <FreeTextSection
              freeText={freeText}
              onChange={(k, v) => setFreeText(f => ({ ...f, [k]: v }))}
              t={t}
              lang={lang}
            />
          )}

          {error && <div className="es-error">{error}</div>}

          <div className="es-nav">
            {currentSection > 0 && (
              <button className="es-btn-secondary" onClick={handleBack} disabled={submitting}>
                {t.back}
              </button>
            )}
            <div style={{ flex: 1 }} />
            {currentSection < TOTAL_SECTIONS - 1 ? (
              <button className="es-btn-primary" onClick={handleNext}>
                {t.next}
              </button>
            ) : (
              <button className="es-btn-primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? t.submitting : t.submit}
              </button>
            )}
          </div>
        </div>
      </main>

      <footer className="es-footer">
        {t.footer}
      </footer>
    </div>
  );
}
