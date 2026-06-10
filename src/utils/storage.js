const PROFILES_KEY = 'act_profiles';
const resultsKey = (id) => `act_results_${id}`;

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

export function saveResult(profileId, result) {
  const results = getResults(profileId);
  const entry = {
    id: `${Date.now()}`,
    date: new Date().toISOString(),
    overallScore: result.overallScore,
    criteriaScores: result.criteriaScores,
    level: result.level,
  };
  localStorage.setItem(resultsKey(profileId), JSON.stringify([...results, entry]));
  return entry;
}
