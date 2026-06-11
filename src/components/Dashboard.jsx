import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts';
import { getResults, deleteResult } from '../utils/storage';
import criteriaEn from '../data/criteria.json';
import criteriaEs from '../data/criteria_es.json';
import criteriaVal from '../data/criteria_val.json';
import { useLang } from '../contexts/LangContext';
import Results from './Results';
import criteriaDefinitions from '../data/criteriaDefinitions.json';

const criteriaMap = { en: criteriaEn, es: criteriaEs, val: criteriaVal };

function getColor(score) {
  if (score >= 80) return '#3a7d44';
  if (score >= 60) return '#8ab545';
  if (score >= 40) return '#e8a838';
  return '#d9534f';
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function LevelBadge({ level }) {
  return (
    <span className="level-badge" style={{ background: level.color, fontSize: '0.78rem', padding: '3px 10px' }}>
      {level.label}
    </span>
  );
}

function exportCSV(profile, results, criteria) {
  const headers = ['Profile', 'Date', 'Overall Score', 'Level',
    'Farm Size (ha)', 'Years Farming', 'Municipality', 'Organic Cert',
    ...criteria.map((c) => c.title)];
  const rows = results.map((r) => [
    profile.name,
    new Date(r.date).toLocaleDateString('en-GB'),
    r.overallScore,
    r.level?.label ?? '',
    r.farmMeta?.farmSize ?? '',
    r.farmMeta?.yearsFarming ?? '',
    r.farmMeta?.municipality ?? '',
    r.farmMeta?.organicCert ?? '',
    ...criteria.map((c) => r.criteriaScores[c.id] ?? ''),
  ]);
  const csv = [headers, ...rows].map((row) => row.map((v) => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ACT_${profile.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function CriteriaComparison({ older, newer, criteria, t }) {
  return (
    <div className="comparison-grid">
      <div className="comparison-head">
        <span>{t.criterionCol}</span>
        <span>{formatDate(older.date)}</span>
        <span>{formatDate(newer.date)}</span>
        <span>{t.changeCol}</span>
      </div>
      {criteria.map((c) => {
        const a = older.criteriaScores[c.id] ?? 0;
        const b = newer.criteriaScores[c.id] ?? 0;
        const diff = b - a;
        return (
          <div key={c.id} className="comparison-row">
            <span className="comparison-name">{c.title}</span>
            <span style={{ color: getColor(a) }}>{a}%</span>
            <span style={{ color: getColor(b) }}>{b}%</span>
            <span className={diff > 0 ? 'diff-up' : diff < 0 ? 'diff-down' : 'diff-same'}>
              {diff > 0 ? `+${diff}` : diff === 0 ? '—' : diff}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function Dashboard({ profile, onNewAssessment, onSignOut }) {
  const { lang, t } = useLang();
  const { criteria } = criteriaMap[lang] || criteriaEn;
  const [results, setResults] = useState(() => getResults(profile.id));
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [viewingResult, setViewingResult] = useState(null);

  const reversed = [...results].reverse();
  const chartData = results.map((r, i) => ({
    label: `#${i + 1}`, date: formatDate(r.date), score: r.overallScore,
  }));

  function handleDelete(resultId) {
    deleteResult(profile.id, resultId);
    setResults(getResults(profile.id));
    setConfirmDelete(null);
    if (viewingResult?.id === resultId) setViewingResult(null);
  }

  // Show individual result detail view
  if (viewingResult) {
    return (
      <div className="dashboard-screen">
        <div className="result-detail-header">
          <button className="btn-secondary result-back-btn" onClick={() => setViewingResult(null)}>
            ← {t.backToDashboard ?? 'Back to Dashboard'}
          </button>
          <span className="result-detail-date">{formatDate(viewingResult.date)}</span>
        </div>
        <Results
          results={viewingResult}
          profile={profile}
          onRetake={null}
          onDashboard={() => setViewingResult(null)}
          isHistorical
        />
      </div>
    );
  }

  return (
    <div className="dashboard-screen">
      {confirmDelete && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <p>{t.confirmDelete}</p>
            <div className="modal-actions">
              <button className="btn-primary btn-danger" onClick={() => handleDelete(confirmDelete)}>{t.deleteBtn}</button>
              <button className="btn-secondary" onClick={() => setConfirmDelete(null)}>{t.cancelBtn}</button>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-topbar">
        <div className="dashboard-identity">
          <span className="dashboard-initial">{profile.name[0].toUpperCase()}</span>
          <div>
            <strong>{profile.name}</strong>
            <span>{results.length} {results.length === 1 ? t.assessmentSingular : t.assessmentsPlural}</span>
          </div>
        </div>
        <div className="dashboard-top-actions">
          <button className="btn-primary" onClick={onNewAssessment}>{t.newAssessment}</button>
          {results.length > 0 && (
            <button className="btn-secondary" onClick={() => exportCSV(profile, results, criteriaEn.criteria)}>
              {t.exportCSV}
            </button>
          )}
          <button className="btn-secondary" onClick={onSignOut}>{t.signOut}</button>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="dashboard-empty">
          <p>{t.noAssessmentsYet}</p>
          <p>{t.noAssessmentsHint}</p>
          <button className="btn-primary" style={{ marginTop: 16 }} onClick={onNewAssessment}>{t.startFirst}</button>
        </div>
      ) : (
        <>
          <div className="results-section">
            <h2>{t.scoreOverTime ?? 'Score over time'}</h2>
            <div className="score-bands-legend">
              <span className="band-chip" style={{ background: '#3a7d44' }}>80–100 {t.levelRegenerative ?? 'Regenerative'}</span>
              <span className="band-chip" style={{ background: '#8ab545' }}>60–79 {t.levelApproaching ?? 'Approaching'}</span>
              <span className="band-chip" style={{ background: '#e8a838' }}>0–59 {t.levelTransition ?? 'In Transition'}</span>
            </div>
            {results.length > 1 ? (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#666' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#666' }} unit="%" />
                  <Tooltip formatter={(v) => [`${v}/100`, 'Score']}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.date || label} />
                  <ReferenceLine y={80} stroke="#3a7d44" strokeDasharray="5 4" strokeWidth={1.5}
                    label={{ value: 'Regenerative', position: 'insideTopRight', fontSize: 10, fill: '#3a7d44' }} />
                  <ReferenceLine y={60} stroke="#8ab545" strokeDasharray="5 4" strokeWidth={1.5}
                    label={{ value: 'Approaching', position: 'insideTopRight', fontSize: 10, fill: '#8ab545' }} />
                  <Line type="monotone" dataKey="score" stroke="#1a3d2b" strokeWidth={2}
                    dot={{ r: 5, fill: '#1a3d2b' }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="priorities-intro" style={{ marginTop: 8 }}>{t.needMoreAssessments ?? 'Complete a second assessment to see your progress over time.'}</p>
            )}
          </div>

          <div className="results-section">
            <h2>{t.assessmentHistory}</h2>
            <p className="priorities-intro">{t.clickToView ?? 'Click an assessment to view its full results.'}</p>
            <div className="assessment-list">
              {reversed.map((r, i) => (
                <div
                  key={r.id}
                  className="assessment-row assessment-row-clickable"
                  onClick={() => { setViewingResult(r); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                >
                  <div className="assessment-meta">
                    <span className="assessment-num">#{results.length - i}</span>
                    <span className="assessment-date">{formatDate(r.date)}</span>
                    <LevelBadge level={r.level} />
                  </div>
                  <div className="assessment-row-right">
                    <div className="assessment-score" style={{ color: getColor(r.overallScore) }}>
                      {r.overallScore}<span style={{ fontSize: '0.9rem', color: '#aaa' }}>/100</span>
                    </div>
                    <span className="view-hint">View →</span>
                    <button
                      className="delete-btn"
                      onClick={(e) => { e.stopPropagation(); setConfirmDelete(r.id); }}
                    >
                      {t.deleteBtn}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Combined: Progress comparison + Criteria definitions */}
          <div className="results-section criteria-ref-section">
            <h2>{t.criteriaReference ?? 'The 10 Criteria of Regenerative Agriculture'}</h2>
            <p className="priorities-intro">
              {results.length >= 2
                ? (t.criteriaReferenceWithProgress ?? 'Comparing your first and most recent assessment. Click any criterion to read its official definition from the CREAF / REGEN 2026 paper.')
                : (t.criteriaReferenceIntro ?? 'As defined by the Iberian Regenerative Agriculture Association & CREAF (2026). Click any criterion to read its definition.')}
            </p>
            <div className="criteria-ref-list">
              {criteriaDefinitions.map((c) => {
                const appCrit = criteria.find((cr) => cr.id === c.id);
                const older = results.length >= 2 ? results[0] : null;
                const newer = results.length >= 2 ? results[results.length - 1] : null;
                const scoreOld = older ? (older.criteriaScores[c.id] ?? 0) : null;
                const scoreNew = newer ? (newer.criteriaScores[c.id] ?? 0) : null;
                const diff = scoreOld !== null ? scoreNew - scoreOld : null;
                return (
                  <details key={c.id} className="criteria-ref-item">
                    <summary className="criteria-ref-summary">
                      <span className="criteria-ref-num">{c.number}</span>
                      <span className="criteria-ref-title">{appCrit?.title ?? c.title}</span>
                      {scoreNew !== null && (
                        <span className="criteria-ref-scores">
                          <span style={{ color: getColor(scoreNew), fontWeight: 700 }}>{scoreNew}%</span>
                          {diff !== null && (
                            <span className={diff > 0 ? 'diff-up' : diff < 0 ? 'diff-down' : 'diff-same'} style={{ fontSize: '0.78rem', marginLeft: 4 }}>
                              {diff > 0 ? `+${diff}` : diff === 0 ? '—' : diff}
                            </span>
                          )}
                        </span>
                      )}
                      <span className="criteria-ref-chevron">›</span>
                    </summary>
                    <div className="criteria-ref-body">
                      {scoreOld !== null && (
                        <div className="criteria-ref-compare">
                          <span>{formatDate(older.date)}: <strong style={{ color: getColor(scoreOld) }}>{scoreOld}%</strong></span>
                          <span className="criteria-ref-arrow">→</span>
                          <span>{formatDate(newer.date)}: <strong style={{ color: getColor(scoreNew) }}>{scoreNew}%</strong></span>
                        </div>
                      )}
                      <p className="criteria-ref-definition">{c.definition}</p>
                      <p className="criteria-ref-detail">{c.detail}</p>
                    </div>
                  </details>
                );
              })}
            </div>
            <p className="criteria-ref-source">
              Source: Iberian Regenerative Agriculture Association and CREAF. (2026).{' '}
              <em>Criteria that define regenerative agriculture, as agreed by the Iberian practicing and scientific community.</em>{' '}
              <a href="https://doi.org/10.5281/zenodo.18798828" target="_blank" rel="noreferrer">
                doi.org/10.5281/zenodo.18798828
              </a>
            </p>
          </div>
        </>
      )}
    </div>
  );
}
