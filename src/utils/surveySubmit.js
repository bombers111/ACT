const ENDPOINT = import.meta.env.VITE_SURVEY_ENDPOINT;

export async function submitSurvey(payload) {
  if (!ENDPOINT) {
    throw new Error('Survey endpoint not configured. Set VITE_SURVEY_ENDPOINT in .env');
  }
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Submission failed: ${response.status}`);
  }
  return response.json();
}
