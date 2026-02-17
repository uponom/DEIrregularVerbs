import {
  advanceIndex,
  createInitialState,
  createItems,
  createQuizProgress,
  setMode,
  setTts,
  setUiLang,
  shuffle,
  translate,
} from './state.js';
import { renderLearn } from './ui/learn.js';
import { makeSmartOptions, renderQuiz } from './ui/quiz.js';
import { createTtsService } from './services/tts.js';

const VERBS = Array.isArray(window.VERBS) ? window.VERBS : [];
const NORMALIZE_RECORDS = window.VerbSchema?.normalizeVerbRecords;
const ITEMS = createItems(VERBS, NORMALIZE_RECORDS);

const state = createInitialState();
const main = document.getElementById('main');
const ttsInfo = document.getElementById('ttsInfo');
const ttsService = createTtsService();

function getCurrentItem() {
  return ITEMS[state.index];
}

function renderTtsInfo() {
  ttsService.renderInfo(ttsInfo, state.tts, window.APP_VERSION || 'dev');
}

function render() {
  const item = getCurrentItem();
  if (!item) {
    main.textContent = 'No items available.';
    return;
  }

  if (state.mode === 'learn') {
    renderLearn(main, item, translate(item, state.uiLang), () => {
      advanceIndex(state, ITEMS.length);
      render();
    });

    if (state.tts) {
      ttsService.speakSequence([item.de, item.pret, item.part2], state.tts);
    }
    return;
  }

  if (!state.q) {
    state.q = createQuizProgress();
  }

  renderQuiz(main, {
    item,
    translation: translate(item, state.uiLang),
    quizState: state.q,
    setQuizState: (next) => {
      state.q = next;
    },
    rerender: render,
    onNextItem: () => {
      advanceIndex(state, ITEMS.length);
      state.q = createQuizProgress();
      render();
    },
    onSpeak: (parts) => ttsService.speakSequence(parts, state.tts),
    getOptions: (key, correctItem) => makeSmartOptions(ITEMS, key, correctItem, 5, shuffle),
  });
}

document.querySelector('#langGroup').onclick = (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  document.querySelectorAll('#langGroup button').forEach((btn) => btn.classList.remove('active'));
  button.classList.add('active');
  setUiLang(state, button.getAttribute('data-lang'));
  render();
};

document.querySelector('#modeLearn').onclick = () => {
  setMode(state, 'learn');
  document.querySelector('#modeLearn').classList.add('active');
  document.querySelector('#modeQuiz').classList.remove('active');
  render();
};

document.querySelector('#modeQuiz').onclick = () => {
  setMode(state, 'quiz');
  document.querySelector('#modeQuiz').classList.add('active');
  document.querySelector('#modeLearn').classList.remove('active');
  state.q = createQuizProgress();
  render();
};

document.querySelector('#ttsToggle').onchange = (event) => {
  setTts(state, event.target.checked);
  renderTtsInfo();
  render();
};

ttsService.init(() => {
  renderTtsInfo();
});

renderTtsInfo();
render();

if (window.PWA) {
  window.PWA.init({ swPath: './sw.js' }).catch(() => {});
}
