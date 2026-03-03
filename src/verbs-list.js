(function (global) {
  'use strict';

  const SORT_MODES = {
    INFINITIVE: 'infinitive',
    TRANSLATION: 'translation',
  };

  function uniqueSorted(values) {
    return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
  }

  function getAvailableLevels(items) {
    return uniqueSorted((items || []).map((item) => item.level));
  }

  function pickTranslation(item, uiLang) {
    if (uiLang === 'UA') return item.ua || item.ru || item.en || '';
    if (uiLang === 'EN') return item.en || item.ru || item.ua || '';
    return item.ru || item.ua || item.en || '';
  }

  function filterByLevel(items, level) {
    if (!level || level === 'ALL') return (items || []).slice();
    return (items || []).filter((item) => item.level === level);
  }

  function filterByLevels(items, selectedLevels, availableLevels) {
    const list = items || [];
    const levels = availableLevels || getAvailableLevels(list);
    if (selectedLevels === null || selectedLevels === undefined) {
      return list.slice();
    }
    const selected = Array.isArray(selectedLevels) ? selectedLevels : [];
    if (!selected.length) return [];
    if (selected.length === levels.length) return list.slice();
    const selectedSet = new Set(selected);
    return list.filter((item) => selectedSet.has(item.level));
  }

  function sortItems(items, sortMode, uiLang) {
    const copy = (items || []).slice();
    const mode = sortMode || SORT_MODES.INFINITIVE;
    if (mode === SORT_MODES.TRANSLATION) {
      copy.sort((a, b) => pickTranslation(a, uiLang).localeCompare(pickTranslation(b, uiLang)));
      return copy;
    }
    copy.sort((a, b) => (a.de || '').localeCompare(b.de || ''));
    return copy;
  }

  function buildVerbList(items, options) {
    const safeOptions = options || {};
    const uiLang = safeOptions.uiLang || 'RU';
    const sortMode = safeOptions.sortMode || SORT_MODES.INFINITIVE;
    const levels = getAvailableLevels(items || []);
    const filtered = filterByLevels(items, safeOptions.selectedLevels, levels);
    return sortItems(filtered, sortMode, uiLang).map((item) => ({
      id: item.id,
      level: item.level,
      de: item.de,
      pras: item.pras,
      pret: item.pret,
      part2: item.part2,
      aux: item.aux,
      translation: pickTranslation(item, uiLang),
    }));
  }

  const api = {
    SORT_MODES,
    buildVerbList,
    filterByLevel,
    filterByLevels,
    getAvailableLevels,
    pickTranslation,
    sortItems,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  global.VerbsList = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
