(function (global) {
  'use strict';

  function normalizeScalar(value) {
    if (value === null || value === undefined) return '';
    return String(value).trim();
  }

  function pickFirst(record, keys) {
    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(record, key) && record[key] !== undefined && record[key] !== null) {
        return record[key];
      }
    }
    return '';
  }

  function readTranslation(record, lang) {
    const source = record && typeof record === 'object' && record.translations && typeof record.translations === 'object'
      ? record.translations
      : record;

    return normalizeScalar(
      pickFirst(source, [lang.toLowerCase(), lang.toUpperCase()])
    );
  }

  function normalizeVerbRecord(record) {
    const safeRecord = record && typeof record === 'object' ? record : {};

    return {
      id: normalizeScalar(pickFirst(safeRecord, ['id', 'ID'])),
      parent: normalizeScalar(pickFirst(safeRecord, ['parent', 'Parent'])),
      level: normalizeScalar(pickFirst(safeRecord, ['level', 'Level'])).toUpperCase(),
      infinitive: normalizeScalar(pickFirst(safeRecord, ['infinitive', 'Infinitiv'])),
      present3: normalizeScalar(pickFirst(safeRecord, ['present3', 'Praesens3'])),
      preterite: normalizeScalar(pickFirst(safeRecord, ['preterite', 'Praeteritum'])),
      participle2: normalizeScalar(pickFirst(safeRecord, ['participle2', 'Partizip2'])),
      auxiliary: normalizeScalar(pickFirst(safeRecord, ['auxiliary', 'AuxVerb'])),
      classes: {
        infinitive: normalizeScalar(pickFirst(safeRecord, ['infinitiveClass', 'InfChar'])),
        present3: normalizeScalar(pickFirst(safeRecord, ['present3Class', 'P3Char'])),
        preterite: normalizeScalar(pickFirst(safeRecord, ['preteriteClass', 'PraetChar'])),
        participle2: normalizeScalar(pickFirst(safeRecord, ['participle2Class', 'P2Char'])),
      },
      variant: normalizeScalar(pickFirst(safeRecord, ['variant', 'Variant'])),
      note: normalizeScalar(pickFirst(safeRecord, ['note', 'Note', 'Notes'])),
      translations: {
        ru: readTranslation(safeRecord, 'RU'),
        ua: readTranslation(safeRecord, 'UA'),
        en: readTranslation(safeRecord, 'EN'),
      },
    };
  }

  function normalizeVerbRecords(records) {
    if (!Array.isArray(records)) return [];
    return records.map(normalizeVerbRecord);
  }

  const api = {
    normalizeScalar,
    normalizeVerbRecord,
    normalizeVerbRecords,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  global.VerbSchema = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
