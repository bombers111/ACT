import { useState } from 'react';
import { useLang } from '../contexts/LangContext';

export default function FarmMetadata({ onContinue, onSkip }) {
  const { t } = useLang();
  const [meta, setMeta] = useState({
    farmSize: '',
    yearsFarming: '',
    municipality: '',
    organicCert: '',
  });

  function set(field, value) {
    setMeta((prev) => ({ ...prev, [field]: value }));
  }

  function handleContinue() {
    const clean = {
      farmSize: meta.farmSize ? parseFloat(meta.farmSize) : null,
      yearsFarming: meta.yearsFarming ? parseInt(meta.yearsFarming) : null,
      municipality: meta.municipality.trim() || null,
      organicCert: meta.organicCert || null,
    };
    onContinue(clean);
  }

  return (
    <div className="meta-screen">
      <div className="meta-card">
        <h2>{t.farmDetailsTitle}</h2>
        <p className="meta-subtitle">{t.farmDetailsSubtitle}</p>

        <div className="meta-fields">
          <div className="meta-field">
            <label>{t.farmSizeLabel}</label>
            <input
              type="number"
              min="0"
              step="0.1"
              placeholder="e.g. 3.5"
              value={meta.farmSize}
              onChange={(e) => set('farmSize', e.target.value)}
            />
          </div>

          <div className="meta-field">
            <label>{t.yearsFarmingLabel}</label>
            <input
              type="number"
              min="0"
              step="1"
              placeholder="e.g. 12"
              value={meta.yearsFarming}
              onChange={(e) => set('yearsFarming', e.target.value)}
            />
          </div>

          <div className="meta-field">
            <label>{t.municipalityLabel}</label>
            <input
              type="text"
              placeholder="e.g. Alzira"
              value={meta.municipality}
              onChange={(e) => set('municipality', e.target.value)}
              maxLength={60}
            />
          </div>

          <div className="meta-field">
            <label>{t.organicCertLabel}</label>
            <div className="meta-radio-group">
              {['yes', 'no'].map((v) => (
                <label key={v} className="meta-radio-label">
                  <input
                    type="radio"
                    name="organicCert"
                    value={v}
                    checked={meta.organicCert === v}
                    onChange={() => set('organicCert', v)}
                  />
                  {t[v]}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="meta-actions">
          <button className="btn-primary" onClick={handleContinue}>
            {t.continueToSurvey}
          </button>
          <button className="btn-secondary" onClick={onSkip}>
            {t.skip}
          </button>
        </div>
      </div>
    </div>
  );
}
