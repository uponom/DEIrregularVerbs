export function createInitialState() {
  return {
    mode: 'learn',
    uiLang: 'RU',
    tts: false,
    index: 0,
    q: null,
  };
}

export function createQuizProgress() {
  return { de: null, pret: null, p2: null };
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

export function translate(item, uiLang) {
  if (uiLang === 'UA') return item.ua;
  if (uiLang === 'EN') return item.en;
  return item.ru;
}

export function advanceIndex(state, itemsLength) {
  if (!itemsLength) return;
  state.index = (state.index + 1) % itemsLength;
}

export function setMode(state, mode) {
  state.mode = mode;
  if (mode === 'quiz') {
    state.q = createQuizProgress();
  }
}

export function setUiLang(state, uiLang) {
  state.uiLang = uiLang;
}

export function setTts(state, enabled) {
  state.tts = Boolean(enabled);
}
