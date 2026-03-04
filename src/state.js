export const ACTIONS = {
  NEXT_ITEM: 'NEXT_ITEM',
  NEXT_ITEM_AND_RESET_QUIZ: 'NEXT_ITEM_AND_RESET_QUIZ',
  SET_MODE: 'SET_MODE',
  SET_UI_LANG: 'SET_UI_LANG',
  SET_TTS: 'SET_TTS',
  TOGGLE_TTS: 'TOGGLE_TTS',
  OPEN_VERBS_MODAL: 'OPEN_VERBS_MODAL',
  CLOSE_VERBS_MODAL: 'CLOSE_VERBS_MODAL',
  TOGGLE_VERBS_SORT: 'TOGGLE_VERBS_SORT',
  TOGGLE_MAIN_LEVEL_FILTER: 'TOGGLE_MAIN_LEVEL_FILTER',
  TOGGLE_MODAL_LEVEL_FILTER: 'TOGGLE_MODAL_LEVEL_FILTER',
  TOGGLE_PARENT_ONLY: 'TOGGLE_PARENT_ONLY',
  TOGGLE_MODAL_PARENT_ONLY: 'TOGGLE_MODAL_PARENT_ONLY',
  TOGGLE_MODAL_PARENT_EXPANDED: 'TOGGLE_MODAL_PARENT_EXPANDED',
  RESET_LEVEL_FILTERS: 'RESET_LEVEL_FILTERS',
  QUIZ_RESET: 'QUIZ_RESET',
  QUIZ_SET_DE: 'QUIZ_SET_DE',
  QUIZ_SET_PRET: 'QUIZ_SET_PRET',
  QUIZ_SET_P2: 'QUIZ_SET_P2',
};

export function createQuizProgress() {
  return { de: null, pret: null, p2: null };
}

export function createInitialState() {
  return {
    mode: 'learn',
    uiLang: 'RU',
    tts: false,
    index: 0,
    q: createQuizProgress(),
    verbsModalOpen: false,
    verbsSortMode: 'infinitive',
    selectedMainLevels: null,
    selectedModalLevels: null,
    parentOnly: false,
    modalParentOnly: false,
    expandedModalParentId: null,
  };
}

export function shuffle(arr) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function createItems(rawVerbs, normalizer) {
  const normalized = normalizer ? normalizer(rawVerbs) : [];
  const mapped = normalized.map((v) => ({
    id: v.id,
    parent: v.parent || '',
    level: v.level,
    ru: v.translations.ru,
    ua: v.translations.ua,
    en: v.translations.en,
    de: v.infinitive,
    pras: v.present3,
    pret: v.preterite,
    part2: v.participle2,
    aux: v.auxiliary,
  }));
  return shuffle(mapped).filter((x) => x.de && (x.ru || x.ua || x.en));
}

export function filterByParentOnly(items, parentOnly) {
  const safeItems = Array.isArray(items) ? items : [];
  if (!parentOnly) return safeItems;
  return safeItems.filter((item) => !item.parent);
}

export function createChildrenMap(items) {
  const map = new Map();
  const safeItems = Array.isArray(items) ? items : [];

  safeItems.forEach((item) => {
    if (!item.parent) return;
    if (!map.has(item.parent)) map.set(item.parent, []);
    map.get(item.parent).push(item);
  });

  for (const list of map.values()) {
    list.sort((a, b) => (a.de || '').localeCompare(b.de || '', 'de'));
  }

  return map;
}

export function createChildRows(childrenMap, parentId, uiLang) {
  if (!childrenMap || !parentId) return [];
  const children = childrenMap.get(parentId) || [];
  return children.map((item) => ({
    id: item.id,
    de: item.de,
    translation: translate(item, uiLang),
  }));
}

export function translate(item, uiLang) {
  if (uiLang === 'UA') return item.ua || item.ru || item.en || '';
  if (uiLang === 'EN') return item.en || item.ru || item.ua || '';
  return item.ru || item.ua || item.en || '';
}

export function reduceState(state, action, context) {
  const currentState = state || createInitialState();
  const itemsLength = Number.isInteger(context?.itemsLength) ? context.itemsLength : 0;

  if (!action || typeof action !== 'object') {
    return currentState;
  }

  switch (action.type) {
    case ACTIONS.NEXT_ITEM:
      if (!itemsLength) return currentState;
      return {
        ...currentState,
        index: (currentState.index + 1) % itemsLength,
      };
    case ACTIONS.NEXT_ITEM_AND_RESET_QUIZ:
      if (!itemsLength) return { ...currentState, q: createQuizProgress() };
      return {
        ...currentState,
        index: (currentState.index + 1) % itemsLength,
        q: createQuizProgress(),
      };
    case ACTIONS.SET_MODE:
      return {
        ...currentState,
        mode: action.value === 'quiz' ? 'quiz' : 'learn',
        q: action.value === 'quiz' ? createQuizProgress() : currentState.q,
      };
    case ACTIONS.SET_UI_LANG:
      return {
        ...currentState,
        uiLang: action.value || 'RU',
      };
    case ACTIONS.SET_TTS:
      return {
        ...currentState,
        tts: Boolean(action.value),
      };
    case ACTIONS.TOGGLE_TTS:
      return {
        ...currentState,
        tts: !currentState.tts,
      };
    case ACTIONS.OPEN_VERBS_MODAL:
      return {
        ...currentState,
        verbsModalOpen: true,
      };
    case ACTIONS.CLOSE_VERBS_MODAL:
      return {
        ...currentState,
        verbsModalOpen: false,
        expandedModalParentId: null,
      };
    case ACTIONS.TOGGLE_VERBS_SORT:
      return {
        ...currentState,
        verbsSortMode: currentState.verbsSortMode === 'infinitive' ? 'translation' : 'infinitive',
      };
    case ACTIONS.TOGGLE_PARENT_ONLY:
      return {
        ...currentState,
        parentOnly: !currentState.parentOnly,
      };
    case ACTIONS.TOGGLE_MODAL_PARENT_ONLY:
      return {
        ...currentState,
        modalParentOnly: !currentState.modalParentOnly,
        expandedModalParentId: null,
      };
    case ACTIONS.TOGGLE_MODAL_PARENT_EXPANDED:
      return {
        ...currentState,
        expandedModalParentId:
          currentState.expandedModalParentId === action.value ? null : (action.value || null),
      };
    case ACTIONS.TOGGLE_MAIN_LEVEL_FILTER:
    case ACTIONS.TOGGLE_MODAL_LEVEL_FILTER: {
      const allLevels = Array.isArray(context?.levels) ? context.levels : [];
      const selectedKey = action.type === ACTIONS.TOGGLE_MAIN_LEVEL_FILTER ? 'selectedMainLevels' : 'selectedModalLevels';
      const selected = Array.isArray(currentState[selectedKey]) ? currentState[selectedKey] : allLevels.slice();
      const level = action.value;
      if (!level) return currentState;
      const hasLevel = selected.includes(level);
      if (hasLevel && selected.length === 1) {
        return currentState;
      }
      const nextSelected = hasLevel ? selected.filter((x) => x !== level) : [...selected, level];
      return {
        ...currentState,
        [selectedKey]: nextSelected,
      };
    }
    case ACTIONS.RESET_LEVEL_FILTERS:
      return {
        ...currentState,
        selectedMainLevels: null,
        selectedModalLevels: null,
        expandedModalParentId: null,
      };
    case ACTIONS.QUIZ_RESET:
      return {
        ...currentState,
        q: createQuizProgress(),
      };
    case ACTIONS.QUIZ_SET_DE:
      return {
        ...currentState,
        q: { ...currentState.q, de: action.value || null },
      };
    case ACTIONS.QUIZ_SET_PRET:
      return {
        ...currentState,
        q: { ...currentState.q, pret: action.value || null },
      };
    case ACTIONS.QUIZ_SET_P2:
      return {
        ...currentState,
        q: { ...currentState.q, p2: action.value || null },
      };
    default:
      return currentState;
  }
}

export function createStore(initialState, contextProvider) {
  let state = initialState;

  function getState() {
    return state;
  }

  function dispatch(action) {
    state = reduceState(state, action, contextProvider ? contextProvider() : {});
    return state;
  }

  return {
    dispatch,
    getState,
  };
}
