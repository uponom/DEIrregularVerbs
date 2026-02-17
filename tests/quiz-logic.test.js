const test = require('node:test');
const assert = require('node:assert/strict');

const {
  QUIZ_STAGES,
  getQuizStage,
  makeSmartOptions,
  transitionQuizState,
} = require('../src/quiz-logic.js');

function deterministicShuffle(values) {
  return values.slice();
}

test('makeSmartOptions returns correct value and requested distractor count', () => {
  const items = [
    { de: 'sehen' },
    { de: 'singen' },
    { de: 'sein' },
    { de: 'lesen' },
    { de: 'laufen' },
    { de: 'geben' },
    { de: 'nehmen' },
  ];

  const options = makeSmartOptions(items, 'de', { de: 'sehen' }, 3, deterministicShuffle);
  assert.equal(options.includes('sehen'), true);
  assert.equal(options.length, 4);
});

test('getQuizStage returns expected stage based on selected forms', () => {
  assert.equal(getQuizStage({ de: null, pret: null, p2: null }), QUIZ_STAGES.INF);
  assert.equal(getQuizStage({ de: 'sehen', pret: null, p2: null }), QUIZ_STAGES.PRET);
  assert.equal(getQuizStage({ de: 'sehen', pret: 'sah', p2: null }), QUIZ_STAGES.PART2);
  assert.equal(getQuizStage({ de: 'sehen', pret: 'sah', p2: 'gesehen' }), QUIZ_STAGES.DONE);
});

test('transitionQuizState applies quiz step transitions', () => {
  const initial = { de: null, pret: null, p2: null };
  const afterDe = transitionQuizState(initial, { type: 'QUIZ_SET_DE', value: 'sehen' });
  const afterPret = transitionQuizState(afterDe, { type: 'QUIZ_SET_PRET', value: 'sah' });
  const afterP2 = transitionQuizState(afterPret, { type: 'QUIZ_SET_P2', value: 'gesehen' });
  const afterReset = transitionQuizState(afterP2, { type: 'QUIZ_RESET' });

  assert.deepEqual(afterDe, { de: 'sehen', pret: null, p2: null });
  assert.deepEqual(afterPret, { de: 'sehen', pret: 'sah', p2: null });
  assert.deepEqual(afterP2, { de: 'sehen', pret: 'sah', p2: 'gesehen' });
  assert.deepEqual(afterReset, { de: null, pret: null, p2: null });
});
