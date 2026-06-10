import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { getResults } from '../utils/storage';
import { criteriaData } from '../utils/mca';

function getColor(score) {
  if (score >= 80) return '#3a7d44';
  if (score >= 60) return '#8ab545';
  if (score >= 40) return '#e8a838';
  return '#d9534f';
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', {
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

function CriteriaComparison({ older, newer }) {
  const { criteria } = criteriaData;
  return (
    <div className="comparison-grid">
      <div className="comparison-head">
        <span>Criterion</span>
        <span>{formatDate(older.date)}</span>
        <span>{formatDate(newer.date)}</span>
        <span>Change</span>
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
  const results = getResults(profile.id);
  const reversed = [...results].reverse();

  const chartData = results.map((r, i) => ({
    label: `#${i + 1}`,
    date: formatDate(r.date),
    score: r.overallScore,
  }));

  return (
    <div className="dashboard-screen">
      <div className="dashboard-topbar">
        <div className="dashboard-identity">
          <span className="dashboard-initial">{profile.name[0].toUpperCase()}</span>
          <div>
            <strong>{profile.name}</strong>
            <span>{results.length} assessment{results.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <div className="dashboard-top-actions">
          <button className="btn-primary" onClick={onNewAssessment}>New Assessment</button>
          <button className="btn-secondary" onClick={onSignOut}>Sign Out</button>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="dashboard-empty">
          <p>No assessments recorded yet.</p>
          <p>Complete your first assessment to start tracking your farm's progress.</p>
          <button className="btn-primary" style={{ marginTop: 16 }} onClick={onNewAssessment}>
            Start Assessment
          </button>
        </div>
      ) : (
        <>
          {results.length > 1 && (
            <div className="results-section">
              <h2>Score over time</h2>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#666' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#666' }} unit="%" />
                  <Tooltip
                    formatter={(v) => [`${v}/100`, 'Score']}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.date || label}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#1a3d2b"
                    strokeWidth={2}
                    dot={{ r: 5, fill: '#1a3d2b' }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {results.length >= 2 && (
            <div className="results-section">
              <h2>Progress comparison</h2>
              <p className="priorities-intro">
                Comparing your first and most recent assessment.
              </p>
              <CriteriaComparison older={results[0]} newer={results[results.length - 1]} />
            </div>
          )}

          <div className="results-section">
            <h2>Assessment history</h2>
            <div className="assessment-list">
              {reversed.map((r, i) => (
                <div key={r.id} className="assessment-row">
                  <div className="assessment-meta">
                    <span className="assessment-num">#{results.length - i}</span>
                    <span className="assessment-date">{formatDate(r.date)}</span>
                    <LevelBadge level={r.level} />
                  </div>
                  <div className="assessment-score" style={{ color: getColor(r.overallScore) }}>
                    {r.overallScore}<span style={{ fontSize: '0.9rem', color: '#aaa' }}>/100</span>
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
