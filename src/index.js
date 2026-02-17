import { getStrings } from './i18n.js';
import {
  ACTIONS,
  createInitialState,
  createItems,
  createStore,
  shuffle,
  translate,
} from './state.js';
import { renderEmptyState, renderLearn } from './ui/learn.js';
import { makeSmartOptions, renderQuiz } from './ui/quiz.js';
import { createTtsService } from './services/tts.js';

const VERBS = Array.isArray(window.VERBS) ? window.VERBS : [];
const NORMALIZE_RECORDS = window.VerbSchema?.normalizeVerbRecords;
const ITEMS = createItems(VERBS, NORMALIZE_RECORDS);
const HAS_QUIZABLE_ITEMS = ITEMS.some((item) => item.de && item.pret && item.part2);

const main = document.getElementById('main');
const ttsInfo = document.getElementById('ttsInfo');
const ttsToggle = document.getElementById('ttsToggle');
const langGroup = document.getElementById('langGroup');
const modeLearnButton = document.getElementById('modeLearn');
const modeQuizButton = document.getElementById('modeQuiz');
const ttsService = createTtsService();

const store = createStore(createInitialState(), () => ({ itemsLength: ITEMS.length }));

function getState() {
  return store.getState();
}

function getCurrentItem() {
  const state = getState();
  return ITEMS[state.index];
}

function getLabels() {
  return getStrings(getState().uiLang);
}

function setPressed(button, isPressed) {
  button.classList.toggle('active', isPressed);
  button.setAttribute('aria-pressed', String(isPressed));
}

function renderControls() {
  const state = getState();
  const labels = getLabels();

  document.documentElement.lang = labels.appLang;
  document.querySelector('#ttsLabel').textContent = labels.ttsLabel;
  modeLearnButton.textContent = labels.modeLearn;
  modeQuizButton.textContent = labels.modeQuiz;
  ttsToggle.checked = state.tts;

  setPressed(modeLearnButton, state.mode === 'learn');
  setPressed(modeQuizButton, state.mode === 'quiz');

  Array.from(langGroup.querySelectorAll('button')).forEach((button) => {
    const isActive = button.getAttribute('data-lang') === state.uiLang;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
}

function renderTtsInfo() {
  const state = getState();
  const labels = getLabels();
  ttsService.renderInfo(ttsInfo, state.tts, window.APP_VERSION || 'dev', labels.ttsInfo);
}

function dispatch(action) {
  store.dispatch(action);
  renderApp();
}

function scheduleDispatch(action) {
  setTimeout(() => dispatch(action), 200);
}

function renderApp() {
  const state = getState();
  const labels = getLabels();
  const item = getCurrentItem();
  renderControls();
  renderTtsInfo();

  if (!item) {
    renderEmptyState(main, labels);
    return;
  }

  if (state.mode === 'learn') {
    renderLearn(main, {
      item,
      translation: translate(item, state.uiLang),
      labels,
      fallback: labels.fallback,
      onNext: () => dispatch({ type: ACTIONS.NEXT_ITEM }),
    });
    if (state.tts) {
      ttsService.speakSequence([item.de, item.pret, item.part2], true);
    }
    return;
  }

  const canQuizForms = item.de && item.pret && item.part2;
  if (!canQuizForms) {
    if (!HAS_QUIZABLE_ITEMS || ITEMS.length <= 1) {
      renderEmptyState(main, labels);
      return;
    }
    dispatch({ type: ACTIONS.NEXT_ITEM_AND_RESET_QUIZ });
    return;
  }

  renderQuiz(main, {
    item,
    translation: translate(item, state.uiLang),
    quizState: state.q,
    labels,
    fallback: labels.fallback,
    feedbackLabels: labels.feedback,
    onPickDe: (value) => {
      ttsService.speakSequence([value], state.tts);
      scheduleDispatch({ type: ACTIONS.QUIZ_SET_DE, value });
    },
    onPickPret: (value) => {
      ttsService.speakSequence([value], state.tts);
      scheduleDispatch({ type: ACTIONS.QUIZ_SET_PRET, value });
    },
    onPickP2: (value) => {
      ttsService.speakSequence([item.de, item.pret, item.part2], state.tts);
      scheduleDispatch({ type: ACTIONS.QUIZ_SET_P2, value });
    },
    onNextItem: () => {
      dispatch({ type: ACTIONS.NEXT_ITEM_AND_RESET_QUIZ });
    },
    getOptions: (key, correctItem) => makeSmartOptions(ITEMS, key, correctItem, 5, shuffle),
  });
}

langGroup.onclick = (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  dispatch({ type: ACTIONS.SET_UI_LANG, value: button.getAttribute('data-lang') });
};

modeLearnButton.onclick = () => dispatch({ type: ACTIONS.SET_MODE, value: 'learn' });
modeQuizButton.onclick = () => {
  dispatch({ type: ACTIONS.SET_MODE, value: 'quiz' });
};
ttsToggle.onchange = (event) => dispatch({ type: ACTIONS.SET_TTS, value: event.target.checked });

ttsService.init(() => {
  renderTtsInfo();
});

renderApp();

if (window.PWA) {
  window.PWA.init({ swPath: './sw.js' }).catch(() => {});
}
