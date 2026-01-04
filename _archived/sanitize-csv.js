// scripts/sanitize-csv.js
// Normalize headers, trim fields, and remove empty rows for Snipe-IT import
const fs = require('fs');
const path = require('path');

const inputPath = path.resolve(__dirname, '../public/snipeit_import.csv');
const outputPath = path.resolve(__dirname, '../public/snipeit_import_sanitized.csv');

function normalizeHeader(h) {
  return h.toLowerCase().replace(/\s+/g, '_').trim();
}

function main() {
  const raw = fs.readFileSync(inputPath, 'utf8');
  const lines = raw.split(/\r?\n/);
  // Remove BOM if present
  if (lines[0].charCodeAt(0) === 0xfeff) {
    lines[0] = lines[0].slice(1);
  }

  const headers = lines[0].split(',').map((h) => h.trim());
  const normHeaders = headers.map(normalizeHeader);

  // Check duplicates case- and space-insensitive
  const seen = new Set();
  const dups = [];
  normHeaders.forEach((h, idx) => {
    if (seen.has(h)) dups.push(headers[idx]);
    seen.add(h);
  });

  // Map to Snipe-IT friendly names
  const mapping = {
    'asset_tag': 'asset_tag',
    'name': 'name',
    'model_name': 'model_name',
    'manufacturer': 'manufacturer',
    'category': 'category',
    'status': 'status_label',
    'notes': 'notes',
    'serial': 'serial',
    'requestable': 'requestable',
  };

  const outHeaders = normHeaders.map((h) => mapping[h] || h);

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line || /^\s*$/.test(line)) continue; // skip empty
    const cols = line.split(',').map((c) => c.trim());
    const isEmptyRow = cols.every((c) => c === '' || c === 'NULL');
    if (isEmptyRow) continue;

    // Basic field cleanup
    const cleaned = cols.map((c) => c.replace(/\s+\|\s+/g, ' | ').trim());
    rows.push(cleaned);
  }

  const out = [outHeaders.join(',')].concat(rows.map((r) => r.join(','))).join('\n');
  fs.writeFileSync(outputPath, out, 'utf8');

  console.log('Sanitized CSV written to:', outputPath);
  if (dups.length) {
    console.log('Duplicate columns detected (normalized):', dups.join(', '));
  } else {
    console.log('No duplicate columns detected.');
  }
  console.log('Original rows:', lines.length - 1, 'Output rows:', rows.length);
}

main();
