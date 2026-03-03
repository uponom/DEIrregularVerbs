const test = require('node:test');
const assert = require('node:assert/strict');

const {
  SORT_MODES,
  buildVerbList,
  getAvailableLevels,
} = require('../src/verbs-list.js');

const SAMPLE = [
  {
    id: 'a',
    level: 'B1',
    de: 'werden',
    pras: 'wird',
    pret: 'wurde',
    part2: 'geworden',
    aux: 'sein',
    ru: 'становиться',
    ua: 'ставати',
    en: 'become',
  },
  {
    id: 'b',
    level: 'A1',
    de: 'essen',
    pras: 'isst',
    pret: 'aß',
    part2: 'gegessen',
    aux: 'haben',
    ru: 'есть',
    ua: 'їсти',
    en: 'eat',
  },
  {
    id: 'c',
    level: 'A2',
    de: 'lesen',
    pras: 'liest',
    pret: 'las',
    part2: 'gelesen',
    aux: 'haben',
    ru: 'читать',
    ua: 'читати',
    en: 'read',
  },
];

test('getAvailableLevels returns sorted unique levels', () => {
  const levels = getAvailableLevels(SAMPLE);
  assert.deepEqual(levels, ['A1', 'A2', 'B1']);
});

test('buildVerbList sorts by infinitive by default', () => {
  const list = buildVerbList(SAMPLE, { uiLang: 'RU', selectedLevels: null, sortMode: SORT_MODES.INFINITIVE });
  assert.deepEqual(list.map((x) => x.de), ['essen', 'lesen', 'werden']);
});

test('buildVerbList sorts by translation for active UI language', () => {
  const list = buildVerbList(SAMPLE, { uiLang: 'EN', selectedLevels: null, sortMode: SORT_MODES.TRANSLATION });
  assert.deepEqual(list.map((x) => x.translation), ['become', 'eat', 'read']);
});

test('buildVerbList filters by selected levels', () => {
  const list = buildVerbList(SAMPLE, { uiLang: 'RU', selectedLevels: ['A1'], sortMode: SORT_MODES.INFINITIVE });
  assert.equal(list.length, 1);
  assert.equal(list[0].de, 'essen');
});

test('buildVerbList returns no rows when selected levels are empty', () => {
  const list = buildVerbList(SAMPLE, { uiLang: 'RU', selectedLevels: [], sortMode: SORT_MODES.INFINITIVE });
  assert.equal(list.length, 0);
});
