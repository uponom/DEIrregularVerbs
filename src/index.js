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
import { renderVerbsModal } from './ui/verbs-modal.js';
import { createTtsService } from './services/tts.js';

const VERBS = Array.isArray(window.VERBS) ? window.VERBS : [];
const NORMALIZE_RECORDS = window.VerbSchema?.normalizeVerbRecords;
const ITEMS = createItems(VERBS, NORMALIZE_RECORDS);
const HAS_QUIZABLE_ITEMS = ITEMS.some((item) => item.de && item.pret && item.part2);
const VERBS_LIST = window.VerbsList || {
  SORT_MODES: { INFINITIVE: 'infinitive' },
  buildVerbList: () => [],
  getAvailableLevels: () => [],
};

const main = document.getElementById('main');
const ttsInfo = document.getElementById('ttsInfo');
const langGroup = document.getElementById('langGroup');
const modeLearnButton = document.getElementById('modeLearn');
const modeQuizButton = document.getElementById('modeQuiz');
const ttsToggleButton = document.getElementById('ttsToggleBtn');
const openVerbsButton = document.getElementById('openVerbsBtn');
const verbsModalRoot = document.getElementById('verbsModalRoot');
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

function getUiSpeechLang(uiLang) {
  if (uiLang === 'UA') return 'uk-UA';
  if (uiLang === 'EN') return 'en-US';
  return 'ru-RU';
}

function getSpeakSegments(item, uiLang) {
  const translation = translate(item, uiLang);
  return [
    { text: item.de, lang: 'de-DE' },
    { text: item.pret, lang: 'de-DE' },
    { text: item.part2, lang: 'de-DE' },
    { text: translation, lang: getUiSpeechLang(uiLang) },
  ];
}

function renderControls() {
  const state = getState();
  const labels = getLabels();

  document.documentElement.lang = labels.appLang;
  modeLearnButton.textContent = labels.modeLearn;
  modeQuizButton.textContent = labels.modeQuiz;

  const ttsEmoji = state.tts ? '🔊' : '🔇';
  ttsToggleButton.textContent = ttsEmoji;
  ttsToggleButton.title = state.tts ? labels.controls.ttsOnAria : labels.controls.ttsOffAria;
  ttsToggleButton.setAttribute('aria-label', ttsToggleButton.title);
  setPressed(ttsToggleButton, state.tts);

  openVerbsButton.title = labels.controls.openListAria;
  openVerbsButton.setAttribute('aria-label', labels.controls.openListAria);

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

function renderModal() {
  const state = getState();
  const labels = getLabels();
  const levels = VERBS_LIST.getAvailableLevels(ITEMS);
  const verbs = VERBS_LIST.buildVerbList(ITEMS, {
    uiLang: state.uiLang,
    level: state.verbsLevelFilter,
    sortMode: state.verbsSortMode,
  });

  renderVerbsModal(verbsModalRoot, {
    open: state.verbsModalOpen,
    labels,
    levels,
    activeLevel: state.verbsLevelFilter,
    sortMode: state.verbsSortMode,
    verbs,
    onClose: () => dispatch({ type: ACTIONS.CLOSE_VERBS_MODAL }),
    onSortToggle: () => dispatch({ type: ACTIONS.TOGGLE_VERBS_SORT }),
    onLevelSelect: (level) => dispatch({ type: ACTIONS.SET_VERBS_LEVEL_FILTER, value: level }),
  });
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
  renderModal();

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
      onSpeakCard: () => {
        ttsService.speakSegments(getSpeakSegments(item, state.uiLang), state.tts, { force: true });
      },
    });
    if (state.tts) {
      ttsService.speakSegments(getSpeakSegments(item, state.uiLang), true, { force: false });
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
      ttsService.speakSegments([{ text: value, lang: 'de-DE' }], state.tts, { force: false });
      scheduleDispatch({ type: ACTIONS.QUIZ_SET_DE, value });
    },
    onPickPret: (value) => {
      ttsService.speakSegments([{ text: value, lang: 'de-DE' }], state.tts, { force: false });
      scheduleDispatch({ type: ACTIONS.QUIZ_SET_PRET, value });
    },
    onPickP2: (value) => {
      ttsService.speakSegments(getSpeakSegments(item, state.uiLang), state.tts, { force: false });
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
ttsToggleButton.onclick = () => dispatch({ type: ACTIONS.TOGGLE_TTS });
openVerbsButton.onclick = () => dispatch({ type: ACTIONS.OPEN_VERBS_MODAL });

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && getState().verbsModalOpen) {
    dispatch({ type: ACTIONS.CLOSE_VERBS_MODAL });
  }
});

ttsService.init(() => {
  renderTtsInfo();
});

renderApp();

if (window.PWA) {
  window.PWA.init({ swPath: './sw.js' }).catch(() => {});
}
