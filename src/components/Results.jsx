import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip, Legend,
} from 'recharts';
import criteriaEn from '../data/criteria.json';
import criteriaEs from '../data/criteria_es.json';
import criteriaVal from '../data/criteria_val.json';
import { getRecommendations } from '../utils/mca';
import { useLang } from '../contexts/LangContext';

const criteriaMap = { en: criteriaEn, es: criteriaEs, val: criteriaVal };

function getColor(score) {
  if (score >= 80) return '#3a7d44';
  if (score >= 60) return '#8ab545';
  if (score >= 40) return '#e8a838';
  return '#d9534f';
}

function ScoreBar({ score, color }) {
  return (
    <div className="score-bar-outer">
      <div className="score-bar-inner" style={{ width: `${score}%`, background: color }} />
      <span className="score-bar-label">{score}%</span>
    </div>
  );
}

function LevelBadge({ level }) {
  return (
    <span className="level-badge" style={{ background: level.color }}>{level.label}</span>
  );
}

export default function Results({ results, profile, onRetake, onDashboard }) {
  const { lang, t } = useLang();
  const { criteria } = criteriaMap[lang] || criteriaEn;
  const { overallScore, criteriaScores, weakest, level } = results;

  // Build benchmark data at 80 for all criteria
  const radarData = criteria.map((c) => ({
    subject: c.title.length > 16 ? c.title.replace(' & ', '\n& ').replace(' y ', '\n& ') : c.title,
    score: criteriaScores[c.id] ?? 0,
    benchmark: 80,
  }));

  const heroMsg = overallScore >= 80 ? t.msgExcellent
    : overallScore >= 60 ? t.msgGood
    : t.msgTransition;

  return (
    <div className="results-screen">
      {/* Hero */}
      <div className="results-hero" style={{ borderColor: level.color }}>
        <div className="hero-top">
          <span className="hero-score" style={{ color: level.color }}>{overallScore}</span>
          <span className="hero-denom">/100</span>
        </div>
        <LevelBadge level={level} />
        <p className="hero-msg">{heroMsg}</p>
      </div>

      {/* Radar */}
      <div className="results-section">
        <h2>{t.yourProfile}</h2>
        <div className="radar-wrap">
          <ResponsiveContainer width="100%" height={340}>
            <RadarChart data={radarData} margin={{ top: 20, right: 40, bottom: 20, left: 40 }}>
              <PolarGrid stroke="#ddd" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#444', fontSize: 11 }} />
              <Radar name={t.benchmarkLabel} dataKey="benchmark"
                stroke="#bbb" fill="transparent" strokeDasharray="5 4" strokeWidth={1.5} />
              <Radar name="Score" dataKey="score"
                stroke={level.color} fill={level.color} fillOpacity={0.25} strokeWidth={2} />
              <Legend formatter={(name) => name === 'Score' ? (profile?.name || 'Your farm') : name} />
              <Tooltip formatter={(v) => `${v}%`} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Score per criterion */}
      <div className="results-section">
        <h2>{t.scorePerCriterion}</h2>
        <div className="criteria-scores-list">
          {criteria.map((c) => {
            const score = criteriaScores[c.id] ?? 0;
            return (
              <div key={c.id} className="criteria-score-row">
                <span className="cs-title">{c.title}</span>
                <ScoreBar score={score} color={getColor(score)} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Top 3 priorities */}
      <div className="results-section priorities-section">
        <h2>{t.top3Priorities}</h2>
        <p className="priorities-intro">{t.prioritiesIntro}</p>
        <div className="priorities-list">
          {weakest.map((w, i) => (
            <div key={w.id} className="priority-card">
              <div className="priority-header">
                <span className="priority-rank">#{i + 1}</span>
                <span className="priority-title">{criteria.find(c => c.id === w.id)?.title ?? w.title}</span>
                <span className="priority-score" style={{ color: getColor(w.score) }}>{w.score}%</span>
              </div>
              <div className="priority-rec">
                <strong>{t.nextStep}</strong> {getRecommendations(w.id, w.score)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All recommendations */}
      <div className="results-section">
        <h2>{t.allRecommendations}</h2>
        <div className="all-recs-list">
          {criteria.map((c) => {
            const score = criteriaScores[c.id] ?? 0;
            return (
              <details key={c.id} className="rec-detail">
                <summary>
                  <span>{c.title}</span>
                  <span className="rec-score" style={{ color: getColor(score) }}>{score}%</span>
                </summary>
                <p className="rec-text">{getRecommendations(c.id, score)}</p>
              </details>
            );
          })}
        </div>
      </div>

      {/* Status */}
      <div className="results-section level-section">
        <h2>{t.yourStatus}</h2>
        <div className="level-info">
          <div className={`level-box ${overallScore < 80 ? 'active' : ''}`} style={{ borderColor: '#e8a838' }}>
            <strong style={{ color: '#e8a838' }}>In Transition</strong>
            <p>{t.inTransitionDesc}</p>
          </div>
          <div className={`level-box ${overallScore >= 80 ? 'active' : ''}`} style={{ borderColor: '#3a7d44' }}>
            <strong style={{ color: '#3a7d44' }}>Regenerative</strong>
            <p>{t.regenerativeDesc}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="results-actions">
        {profile && (
          <button className="btn-primary" onClick={onDashboard}>{t.viewDashboard}</button>
        )}
        <button className="btn-secondary" onClick={() => window.print()}>{t.printResults}</button>
        <button className="btn-secondary" onClick={onRetake}>{t.retakeAssessment}</button>
      </div>

      {profile && <p className="saved-note">{t.savedToProfile}</p>}
    </div>
  );
}
