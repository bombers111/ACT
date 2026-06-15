/**
 * Analyze expert survey weight responses and compute normalized geometric means.
 *
 * Usage:
 *   1. Export the Google Sheet as CSV → save as scripts/responses.csv
 *   2. node scripts/analyzeWeights.js
 *
 * Output: mcaWeights object ready to paste into src/data/criteria.json
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const CSV_PATH = path.join(__dirname, 'responses.csv');

if (!fs.existsSync(CSV_PATH)) {
  console.error('Error: scripts/responses.csv not found.');
  console.error('Export your Google Sheet as CSV and save it there first.');
  process.exit(1);
}

const csv = fs.readFileSync(CSV_PATH, 'utf8');
const rows = parse(csv, { columns: true, skip_empty_lines: true });

// These must match the criterion IDs in criteria.json
const criteriaIds = [
  'contextuality',
  'water',
  'biodiversity',
  'vegetation_management',
  'soil_management',
  'soil_nutrition',
  'crop_diversification',
  'plant_health_inputs',
  'plastics_waste',
  'social_foundations',
  'soil_health',
];

console.log(`\nProcessing ${rows.length} response(s)...\n`);

const geoMeans = {};

for (const id of criteriaIds) {
  const col = `w_${id}`;
  const values = rows
    .map(r => parseFloat(r[col]))
    .filter(v => !isNaN(v) && v > 0);

  if (values.length === 0) {
    console.warn(`  Warning: no valid values found for column "${col}" — skipping`);
    geoMeans[id] = 0;
    continue;
  }

  const logMean = values.reduce((sum, v) => sum + Math.log(v), 0) / values.length;
  geoMeans[id] = Math.exp(logMean);

  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  console.log(`  ${id.padEnd(25)} n=${values.length}  avg=${avg.toFixed(1)}  geoMean=${geoMeans[id].toFixed(3)}`);
}

const total = Object.values(geoMeans).reduce((a, b) => a + b, 0);

if (total === 0) {
  console.error('\nError: no valid weight data found. Check column headers in CSV.');
  process.exit(1);
}

const mcaWeights = Object.fromEntries(
  criteriaIds.map(id => [id, parseFloat((geoMeans[id] / total).toFixed(4))])
);

// Adjust rounding so weights sum to exactly 1.0
const wSum = Object.values(mcaWeights).reduce((a, b) => a + b, 0);
const diff = parseFloat((1.0 - wSum).toFixed(4));
if (diff !== 0) {
  const lastKey = criteriaIds[criteriaIds.length - 1];
  mcaWeights[lastKey] = parseFloat((mcaWeights[lastKey] + diff).toFixed(4));
}

console.log('\n─────────────────────────────────────────');
console.log('Paste into src/data/criteria.json → mcaWeights:');
console.log('─────────────────────────────────────────\n');
console.log(JSON.stringify(mcaWeights, null, 2));
console.log(`\nSum check: ${Object.values(mcaWeights).reduce((a, b) => a + b, 0).toFixed(4)}`);
