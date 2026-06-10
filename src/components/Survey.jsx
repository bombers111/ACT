import { useState } from 'react';
import { criteriaData } from '../utils/mca';

export default function Survey({ onComplete }) {
  const { criteria } = criteriaData;
  const [currentCriterionIndex, setCurrentCriterionIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const criterion = criteria[currentCriterionIndex];
  const totalCriteria = criteria.length;
  const progressPct = Math.round((currentCriterionIndex / totalCriteria) * 100);

  function handleAnswer(questionId, score) {
    const key = `${criterion.id}_${questionId}`;
    setAnswers((prev) => ({ ...prev, [key]: score }));
  }

  function getAnswer(questionId) {
    return answers[`${criterion.id}_${questionId}`] ?? null;
  }

  function allAnswered() {
    return criterion.questions.every((q) => getAnswer(q.id) !== null);
  }

  function handleNext() {
    if (currentCriterionIndex < totalCriteria - 1) {
      setCurrentCriterionIndex((i) => i + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onComplete(answers);
    }
  }

  function handleBack() {
    if (currentCriterionIndex > 0) {
      setCurrentCriterionIndex((i) => i - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  return (
    <div className="survey-screen">
      {/* Progress bar */}
      <div className="survey-header">
        <div className="progress-bar-outer">
          <div className="progress-bar-inner" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="progress-label">
          Criterion {currentCriterionIndex + 1} of {totalCriteria}
        </div>
      </div>

      {/* Criterion card */}
      <div className="criterion-card">
        <div className="criterion-header">
          <span className="criterion-icon">{criterion.icon}</span>
          <div>
            <h2>{criterion.title}</h2>
            <p className="criterion-desc">{criterion.description}</p>
          </div>
        </div>

        <div className="questions-list">
          {criterion.questions.map((question, qi) => (
            <div key={question.id} className="question-block">
              <p className="question-text">
                <span className="q-num">{qi + 1}.</span> {question.text}
              </p>
              <div className="options-list">
                {question.options.map((opt) => {
                  const selected = getAnswer(question.id) === opt.score;
                  return (
                    <button
                      key={opt.score}
                      className={`option-btn ${selected ? 'selected' : ''}`}
                      onClick={() => handleAnswer(question.id, opt.score)}
                    >
                      <span className="option-score">
                        {opt.score === 1 ? '①' : opt.score === 2 ? '②' : opt.score === 3 ? '③' : '④'}
                      </span>
                      <span className="option-label">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="source-note">📚 Source: {criterion.source}</div>
      </div>

      {/* Navigation */}
      <div className="survey-nav">
        {currentCriterionIndex > 0 && (
          <button className="btn-secondary" onClick={handleBack}>
            ← Back
          </button>
        )}
        <button
          className="btn-primary"
          onClick={handleNext}
          disabled={!allAnswered()}
          title={!allAnswered() ? 'Please answer all questions before continuing' : ''}
        >
          {currentCriterionIndex === totalCriteria - 1 ? 'See My Results →' : 'Next →'}
        </button>
      </div>

      {!allAnswered() && (
        <p className="unanswered-note">Answer all {criterion.questions.length} questions to continue.</p>
      )}
    </div>
  );
}
