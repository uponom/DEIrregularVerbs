const test = require('node:test');
const assert = require('node:assert/strict');

const {
  normalizeScalar,
  normalizeVerbRecord,
  normalizeVerbRecords,
} = require('../src/data/verb-schema.js');

test('normalizeScalar trims scalar values and handles nullish values', () => {
  assert.equal(normalizeScalar('  A1 '), 'A1');
  assert.equal(normalizeScalar(42), '42');
  assert.equal(normalizeScalar(null), '');
  assert.equal(normalizeScalar(undefined), '');
});

test('normalizeVerbRecord converts legacy record fields to canonical schema', () => {
  const normalized = normalizeVerbRecord({
    Level: 'a2',
    Infinitiv: ' gehen ',
    Praesens3: 'geht',
    Praeteritum: 'ging',
    Partizip2: 'gegangen',
    AuxVerb: 'sein',
    RU: 'идти',
    UA: 'йти',
    EN: 'go',
    InfChar: null,
    P3Char: 'E',
    PraetChar: 'I',
    P2Char: 'A',
    Notes: 'common',
  });

  assert.equal(normalized.level, 'A2');
  assert.equal(normalized.infinitive, 'gehen');
  assert.equal(normalized.present3, 'geht');
  assert.equal(normalized.preterite, 'ging');
  assert.equal(normalized.participle2, 'gegangen');
  assert.equal(normalized.auxiliary, 'sein');
  assert.equal(normalized.translations.ru, 'идти');
  assert.equal(normalized.translations.ua, 'йти');
  assert.equal(normalized.translations.en, 'go');
  assert.equal(normalized.classes.infinitive, '');
  assert.equal(normalized.classes.present3, 'E');
  assert.equal(normalized.classes.preterite, 'I');
  assert.equal(normalized.classes.participle2, 'A');
  assert.equal(normalized.note, 'common');
});

test('normalizeVerbRecord keeps already canonical records stable', () => {
  const normalized = normalizeVerbRecord({
    id: 'gehen-1',
    level: 'B1',
    infinitive: 'gehen',
    present3: 'geht',
    preterite: 'ging',
    participle2: 'gegangen',
    auxiliary: 'sein',
    variant: 'figurative',
    note: 'test note',
    translations: {
      ru: 'идти',
      ua: 'йти',
      en: 'go',
    },
    infinitiveClass: 'E',
    present3Class: 'I',
    preteriteClass: 'A',
    participle2Class: 'E',
  });

  assert.equal(normalized.id, 'gehen-1');
  assert.equal(normalized.level, 'B1');
  assert.equal(normalized.infinitive, 'gehen');
  assert.equal(normalized.preterite, 'ging');
  assert.equal(normalized.participle2, 'gegangen');
  assert.equal(normalized.variant, 'figurative');
  assert.equal(normalized.note, 'test note');
  assert.equal(normalized.translations.ru, 'идти');
  assert.equal(normalized.classes.infinitive, 'E');
  assert.equal(normalized.classes.present3, 'I');
  assert.equal(normalized.classes.preterite, 'A');
  assert.equal(normalized.classes.participle2, 'E');
});

test('normalizeVerbRecords returns an empty list for non-array input', () => {
  assert.deepEqual(normalizeVerbRecords(null), []);
  assert.deepEqual(normalizeVerbRecords({}), []);
});
