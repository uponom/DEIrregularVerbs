const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  dedupeKey,
  levelRank,
  parseVerbsFromDataFile,
  splitTranslations,
  validateRecords,
} = require('../scripts/validate-verbs.js');

test('splitTranslations trims tokens and drops empty values', () => {
  const result = splitTranslations(' one, two ,, three ');
  assert.deepEqual(result, ['one', 'two', 'three']);
});

test('parseVerbsFromDataFile parses window.VERBS assignment', () => {
  const tmpDir = fs.mkdtempSync('/tmp/verbs-data-');
  const tmpFile = path.join(tmpDir, 'verbs.js');
  fs.writeFileSync(
    tmpFile,
    "window.VERBS = [{\"Infinitiv\":\"gehen\",\"Praeteritum\":\"ging\",\"Partizip2\":\"gegangen\",\"RU\":\"идти\"}];\n"
  );

  const verbs = parseVerbsFromDataFile(tmpFile);
  assert.equal(Array.isArray(verbs), true);
  assert.equal(verbs.length, 1);
  assert.equal(verbs[0].Infinitiv, 'gehen');
});

test('dedupeKey uses Infinitiv + Praeteritum + Partizip2', () => {
  const key = dedupeKey({
    Infinitiv: 'sehen',
    Praeteritum: 'sah',
    Partizip2: 'gesehen',
  });
  assert.equal(key, 'sehen|sah|gesehen');
});

test('levelRank prefers lower CEFR levels', () => {
  assert.equal(levelRank('A1') < levelRank('A2'), true);
  assert.equal(levelRank('A2') < levelRank('B1'), true);
  assert.equal(levelRank('unknown') > levelRank('C2'), true);
});

test('validateRecords flags duplicate key as error', () => {
  const records = [
    { Level: 'A2', Infinitiv: 'sehen', Praeteritum: 'sah', Partizip2: 'gesehen', RU: 'видеть' },
    { Level: 'A1', Infinitiv: 'sehen', Praeteritum: 'sah', Partizip2: 'gesehen', RU: 'увидеть' },
  ];

  const result = validateRecords(records);
  assert.equal(result.errors.some((x) => x.includes('[DUPLICATE_KEY]')), true);
  assert.equal(result.warnings.some((x) => x.includes('[TRANSLATION_MERGE_REQUIRED]')), true);
});

test('validateRecords flags missing required fields and translations', () => {
  const records = [
    { Level: 'A1', Infinitiv: '', Praeteritum: 'ging', Partizip2: 'gegangen', RU: '' },
  ];

  const result = validateRecords(records);
  assert.equal(result.errors.some((x) => x.includes('[MISSING_REQUIRED_FIELDS]')), true);
  assert.equal(result.errors.some((x) => x.includes('[MISSING_TRANSLATION]')), true);
});

test('validateRecords warns if grammar variants are not marked', () => {
  const records = [
    { Level: 'A1', Infinitiv: 'backen', Praeteritum: 'buk', Partizip2: 'gebacken', RU: 'печь' },
    { Level: 'A1', Infinitiv: 'backen', Praeteritum: 'backte', Partizip2: 'gebacken', RU: 'печь' },
  ];

  const result = validateRecords(records);
  assert.equal(result.warnings.some((x) => x.includes('[MISSING_VARIANT_MARKER]')), true);
});
