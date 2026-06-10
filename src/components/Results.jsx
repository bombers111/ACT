import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip,
} from 'recharts';
import { criteriaData } from '../utils/mca';
import { getRecommendations } from '../utils/mca';

function ScoreBar({ score, color }) {
  return (
    <div className="score-bar-outer">
      <div
        className="score-bar-inner"
        style={{ width: `${score}%`, background: color }}
      />
      <span className="score-bar-label">{score}%</span>
    </div>
  );
}

function LevelBadge({ level }) {
  return (
    <span className="level-badge" style={{ background: level.color }}>
      {level.label}
    </span>
  );
}

export default function Results({ results, onRetake }) {
  const { overallScore, criteriaScores, weakest, level } = results;
  const { criteria } = criteriaData;

  const radarData = criteria.map((c) => ({
    subject: c.title.replace(' & ', '\n& '),
    score: criteriaScores[c.id] ?? 0,
    fullMark: 100,
  }));

  function getColor(score) {
    if (score >= 80) return '#3a7d44';
    if (score >= 60) return '#8ab545';
    if (score >= 40) return '#e8a838';
    return '#d9534f';
  }

  return (
    <div className="results-screen">
      {/* Overall score hero */}
      <div className="results-hero" style={{ borderColor: level.color }}>
        <div className="hero-top">
          <span className="hero-score" style={{ color: level.color }}>{overallScore}</span>
          <span className="hero-denom">/100</span>
        </div>
        <LevelBadge level={level} />
        <p className="hero-msg">
          {overallScore >= 80
            ? 'Excellent! Your farm meets regenerative standards. Keep monitoring and inspiring others.'
            : overallScore >= 60
            ? 'You are on the right path. A few key changes will bring you to full regenerative status.'
            : 'You are in transition. The priorities below show where to focus your energy first.'}
        </p>
      </div>

      {/* Radar chart */}
      <div className="results-section">
        <h2>Your Profile Across 10 Criteria</h2>
        <div className="radar-wrap">
          <ResponsiveContainer width="100%" height={340}>
            <RadarChart data={radarData} margin={{ top: 20, right: 40, bottom: 20, left: 40 }}>
              <PolarGrid stroke="#ddd" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: '#444', fontSize: 11 }}
              />
              <Radar
                name="Your farm"
                dataKey="score"
                stroke={level.color}
                fill={level.color}
                fillOpacity={0.25}
              />
              <Tooltip formatter={(v) => `${v}%`} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Per-criterion scores */}
      <div className="results-section">
        <h2>Score per Criterion</h2>
        <div className="criteria-scores-list">
          {criteria.map((c) => {
            const score = criteriaScores[c.id] ?? 0;
            return (
              <div key={c.id} className="criteria-score-row">
                <span className="cs-icon">{c.icon}</span>
                <span className="cs-title">{c.title}</span>
                <ScoreBar score={score} color={getColor(score)} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Top 3 priorities */}
      <div className="results-section priorities-section">
        <h2>🎯 Your Top 3 Priorities</h2>
        <p className="priorities-intro">
          These are your lowest-scoring criteria. Focus here first for the biggest impact.
        </p>
        <div className="priorities-list">
          {weakest.map((w, i) => (
            <div key={w.id} className="priority-card">
              <div className="priority-header">
                <span className="priority-rank">#{i + 1}</span>
                <span className="priority-icon">{w.icon}</span>
                <span className="priority-title">{w.title}</span>
                <span className="priority-score" style={{ color: getColor(w.score) }}>
                  {w.score}%
                </span>
              </div>
              <div className="priority-rec">
                <strong>Next step:</strong> {getRecommendations(w.id, w.score)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All recommendations */}
      <div className="results-section">
        <h2>📋 All Recommendations</h2>
        <div className="all-recs-list">
          {criteria.map((c) => {
            const score = criteriaScores[c.id] ?? 0;
            const rec = getRecommendations(c.id, score);
            return (
              <details key={c.id} className="rec-detail">
                <summary>
                  <span>{c.icon} {c.title}</span>
                  <span className="rec-score" style={{ color: getColor(score) }}>{score}%</span>
                </summary>
                <p className="rec-text">{rec}</p>
              </details>
            );
          })}
        </div>
      </div>

      {/* Two-level status */}
      <div className="results-section level-section">
        <h2>📍 Your Status</h2>
        <div className="level-info">
          <div className={`level-box ${overallScore < 80 ? 'active' : ''}`} style={{ borderColor: '#e8a838' }}>
            <strong style={{ color: '#e8a838' }}>In Transition</strong>
            <p>You are working towards regenerative practices. Keep going – every step counts.</p>
          </div>
          <div className={`level-box ${overallScore >= 80 ? 'active' : ''}`} style={{ borderColor: '#3a7d44' }}>
            <strong style={{ color: '#3a7d44' }}>Regenerative</strong>
            <p>Your farm meets all 10 Iberian Regenerative Agriculture Criteria.</p>
          </div>
        </div>
      </div>

      <button className="btn-secondary retake-btn" onClick={onRetake}>
        ↩ Retake Assessment
      </button>
    </div>
  );
}
