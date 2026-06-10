/**
 * Appends a completed assessment to data/assessments.json in the GitHub repo.
 * Requires VITE_GH_TOKEN to be set as a GitHub Actions secret and injected at build time.
 * Token needs "Contents: Read and write" permission on the ACT repo (fine-grained PAT).
 */

const TOKEN = import.meta.env.VITE_GH_TOKEN;
const REPO = 'bombers111/ACT';
const FILE_PATH = 'data/assessments.json';
const API_BASE = `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`;

export async function pushAssessmentToGitHub(profileName, result) {
  if (!TOKEN) return { ok: false, reason: 'no_token' };

  const record = {
    id: result.id || `${Date.now()}`,
    date: result.date || new Date().toISOString(),
    profileName,
    overallScore: result.overallScore,
    level: result.level?.label ?? '',
    criteria: result.criteriaScores,
  };

  try {
    // Read current file (if it exists)
    let existing = [];
    let sha = null;

    const readRes = await fetch(API_BASE, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: 'application/vnd.github+json',
      },
    });

    if (readRes.ok) {
      const file = await readRes.json();
      sha = file.sha;
      existing = JSON.parse(atob(file.content.replace(/\n/g, '')));
    }

    existing.push(record);

    // Write updated file back
    const body = {
      message: `assessment: ${profileName} — ${record.date.slice(0, 10)} (${record.overallScore}/100)`,
      content: btoa(unescape(encodeURIComponent(JSON.stringify(existing, null, 2)))),
      branch: 'main',
    };
    if (sha) body.sha = sha;

    const writeRes = await fetch(API_BASE, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    return { ok: writeRes.ok };
  } catch (err) {
    console.error('GitHub push failed:', err);
    return { ok: false, reason: 'error' };
  }
}
