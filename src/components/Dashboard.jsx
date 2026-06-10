import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { getResults, deleteResult } from '../utils/storage';
import criteriaEn from '../data/criteria.json';
import criteriaEs from '../data/criteria_es.json';
import criteriaVal from '../data/criteria_val.json';
import { useLang } from '../contexts/LangContext';

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

  const reversed = [...results].reverse();
  const chartData = results.map((r, i) => ({
    label: `#${i + 1}`, date: formatDate(r.date), score: r.overallScore,
  }));

  function handleDelete(resultId) {
    deleteResult(profile.id, resultId);
    setResults(getResults(profile.id));
    setConfirmDelete(null);
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
          {results.length > 1 && (
            <div className="results-section">
              <h2>{t.scoreOverTime}</h2>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#666' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#666' }} unit="%" />
                  <Tooltip formatter={(v) => [`${v}/100`, 'Score']}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.date || label} />
                  <Line type="monotone" dataKey="score" stroke="#1a3d2b" strokeWidth={2}
                    dot={{ r: 5, fill: '#1a3d2b' }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {results.length >= 2 && (
            <div className="results-section">
              <h2>{t.progressComparison}</h2>
              <p className="priorities-intro">{t.comparingFirst}</p>
              <CriteriaComparison
                older={results[0]} newer={results[results.length - 1]}
                criteria={criteria} t={t}
              />
            </div>
          )}

          <div className="results-section">
            <h2>{t.assessmentHistory}</h2>
            <div className="assessment-list">
              {reversed.map((r, i) => (
                <div key={r.id} className="assessment-row">
                  <div className="assessment-meta">
                    <span className="assessment-num">#{results.length - i}</span>
                    <span className="assessment-date">{formatDate(r.date)}</span>
                    <LevelBadge level={r.level} />
                  </div>
                  <div className="assessment-row-right">
                    <div className="assessment-score" style={{ color: getColor(r.overallScore) }}>
                      {r.overallScore}<span style={{ fontSize: '0.9rem', color: '#aaa' }}>/100</span>
                    </div>
                    <button className="delete-btn" onClick={() => setConfirmDelete(r.id)}>{t.deleteBtn}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
