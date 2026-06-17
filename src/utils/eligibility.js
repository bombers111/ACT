/**
 * Compute eligibility verdict from knockout answers.
 *
 * @param {Object} knockoutAnswers  - { [id]: boolean | null }
 * @param {Array}  knockouts        - knockout config array from criteria.json
 * @returns {{ eligible: boolean, failures: Array<{ id, label }> }}
 */
export function computeEligibility(knockoutAnswers, knockouts) {
  const failures = knockouts.filter(k => {
    const answer = knockoutAnswers[k.id];
    return answer === k.failsOn;
  });

  return {
    eligible: failures.length === 0,
    failures: failures.map(k => ({ id: k.id, label: k.label })),
  };
}
