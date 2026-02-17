(function (global) {
  'use strict';

  const QUIZ_STAGES = {
    INF: 'infinitive',
    PRET: 'preterite',
    PART2: 'participle2',
    DONE: 'done',
  };

  function makeSmartOptions(items, key, correctItem, count, shuffleFn) {
    const maxCount = Number.isInteger(count) ? count : 5;
    const shuffle = typeof shuffleFn === 'function' ? shuffleFn : (arr) => arr.slice();
    const correct = correctItem[key];
    const allVals = Array.from(new Set(items.map((x) => x[key]).filter((v) => v && v !== correct)));
    const first = (correct || '').charAt(0).toLowerCase();
    const same = allVals.filter((v) => v.charAt(0).toLowerCase() === first);
    const rest = allVals.filter((v) => v.charAt(0).toLowerCase() !== first);
    const picks = [...shuffle(same).slice(0, maxCount), ...shuffle(rest)].slice(0, maxCount);
    return shuffle([correct, ...picks]);
  }

  function getQuizStage(quizState) {
    if (!quizState || !quizState.de) return QUIZ_STAGES.INF;
    if (!quizState.pret) return QUIZ_STAGES.PRET;
    if (!quizState.p2) return QUIZ_STAGES.PART2;
    return QUIZ_STAGES.DONE;
  }

  function transitionQuizState(quizState, action) {
    const state = quizState || { de: null, pret: null, p2: null };
    if (!action || typeof action !== 'object') return state;

    switch (action.type) {
      case 'QUIZ_RESET':
        return { de: null, pret: null, p2: null };
      case 'QUIZ_SET_DE':
        return { ...state, de: action.value || null };
      case 'QUIZ_SET_PRET':
        return { ...state, pret: action.value || null };
      case 'QUIZ_SET_P2':
        return { ...state, p2: action.value || null };
      default:
        return state;
    }
  }

  const api = {
    QUIZ_STAGES,
    getQuizStage,
    makeSmartOptions,
    transitionQuizState,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  global.QuizLogic = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
