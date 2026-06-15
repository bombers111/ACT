const ENDPOINT = import.meta.env.VITE_SURVEY_ENDPOINT;

export async function submitSurvey(payload) {
  if (!ENDPOINT) {
    throw new Error('Survey endpoint not configured. Set VITE_SURVEY_ENDPOINT in .env');
  }
  // Google Apps Script requires no-cors mode — we send as form data
  // and cannot read the response, but the row is written to the sheet.
  const form = new FormData();
  form.append('data', JSON.stringify(payload));

  await fetch(ENDPOINT, {
    method: 'POST',
    mode: 'no-cors',
    body: form,
  });
  // no-cors means response is opaque — we can't check status,
  // so we optimistically treat reaching here as success.
}
