const PROFILES_KEY = 'act_profiles';
const resultsKey = (id) => `act_results_${id}`;
const DRAFT_KEY = 'act_survey_draft';

export function getProfiles() {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function createProfile(name) {
  const profiles = getProfiles();
  const profile = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(PROFILES_KEY, JSON.stringify([...profiles, profile]));
  return profile;
}

export function deleteProfile(id) {
  const profiles = getProfiles().filter((p) => p.id !== id);
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  localStorage.removeItem(resultsKey(id));
}

export function getResults(profileId) {
  try {
    const raw = localStorage.getItem(resultsKey(profileId));
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function getLastResult(profileId) {
  const results = getResults(profileId);
  return results.length > 0 ? results[results.length - 1] : null;
}

export function deleteResult(profileId, resultId) {
  const results = getResults(profileId).filter((r) => r.id !== resultId);
  localStorage.setItem(resultsKey(profileId), JSON.stringify(results));
}

export function saveResult(profileId, result, farmMeta = null) {
  const results = getResults(profileId);
  const entry = {
    id: `${Date.now()}`,
    date: new Date().toISOString(),
    overallScore: result.overallScore,
    criteriaScores: result.criteriaScores,
    level: result.level,
    farmMeta,
  };
  localStorage.setItem(resultsKey(profileId), JSON.stringify([...results, entry]));
  return entry;
}

// Survey draft (mid-survey save) — not tied to a profile
export function saveDraft(answers) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(answers));
}

export function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}
