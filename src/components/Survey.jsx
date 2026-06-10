import { useState, useEffect } from 'react';
import criteriaEn from '../data/criteria.json';
import criteriaEs from '../data/criteria_es.json';
import criteriaVal from '../data/criteria_val.json';
import explanations from '../data/explanations.json';
import { saveDraft, loadDraft } from '../utils/storage';
import { useLang } from '../contexts/LangContext';

const criteriaMap = { en: criteriaEn, es: criteriaEs, val: criteriaVal };

export default function Survey({ onComplete }) {
  const { lang, t } = useLang();
  const { criteria } = criteriaMap[lang] || criteriaEn;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(() => loadDraft());
  const [openWhy, setOpenWhy] = useState(null); // `criterionId_questionId`

  const criterion = criteria[currentIndex];
  const totalCriteria = criteria.length;
  const progressPct = Math.round((currentIndex / totalCriteria) * 100);

  // Scroll to top when criterion changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentIndex]);

  // Auto-save draft on every answer change
  useEffect(() => {
    saveDraft(answers);
  }, [answers]);

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
    if (currentIndex < totalCriteria - 1) {
      setCurrentIndex((i) => i + 1);
      setOpenWhy(null);
    } else {
      onComplete(answers);
    }
  }

  function handleBack() {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setOpenWhy(null);
    }
  }

  function toggleWhy(key) {
    setOpenWhy((prev) => (prev === key ? null : key));
  }

  return (
    <div className="survey-screen">
      <div className="survey-header">
        <div className="progress-bar-outer">
          <div className="progress-bar-inner" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="progress-label">
          {t.criterionLabel} {currentIndex + 1} {t.ofLabel} {totalCriteria}
        </div>
      </div>

      <div className="criterion-card">
        <div className="criterion-header">
          <div>
            <h2>{criterion.title}</h2>
            <p className="criterion-desc">{criterion.description}</p>
          </div>
        </div>

        <div className="questions-list">
          {criterion.questions.map((question, qi) => {
            const whyKey = `${criterion.id}_${question.id}`;
            const selected = getAnswer(question.id);
            const whyText = selected
              ? explanations[criterion.id]?.[question.id]?.[selected]
              : null;

            return (
              <div key={question.id} className="question-block">
                <p className="question-text">
                  <span className="q-num">{qi + 1}.</span> {question.text}
                </p>
                <div className="options-list">
                  {question.options.map((opt) => {
                    const isSelected = selected === opt.score;
                    return (
                      <button
                        key={opt.score}
                        className={`option-btn ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleAnswer(question.id, opt.score)}
                      >
                        <span className="option-score">{opt.score}</span>
                        <span className="option-label">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>

                {whyText && (
                  <div className="why-block">
                    <button
                      className="why-toggle"
                      onClick={() => toggleWhy(whyKey)}
                    >
                      {t.whyThisMatters}
                      <span className={`why-chevron ${openWhy === whyKey ? 'open' : ''}`}>›</span>
                    </button>
                    {openWhy === whyKey && (
                      <p className="why-text">{whyText}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="source-note">{t.sourceLabel} {criterion.source}</div>
      </div>

      <div className="survey-nav">
        {currentIndex > 0 && (
          <button className="btn-secondary" onClick={handleBack}>{t.previous}</button>
        )}
        <button
          className="btn-primary"
          onClick={handleNext}
          disabled={!allAnswered()}
        >
          {currentIndex === totalCriteria - 1 ? t.seeResults : t.next}
        </button>
      </div>

      {!allAnswered() && (
        <p className="unanswered-note">
          {t.answerAll} {criterion.questions.length} {t.questionsToContinue}
        </p>
      )}
    </div>
  );
}
