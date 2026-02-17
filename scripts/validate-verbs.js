#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { normalizeScalar, normalizeVerbRecord, normalizeVerbRecords } = require('../src/data/verb-schema.js');

const ROOT = path.resolve(__dirname, '..');
const VERBS_DATA_FILE = path.join(ROOT, 'src', 'data', 'verbs.js');

function parseVerbsFromDataFile(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  const match = source.match(/window\.VERBS\s*=\s*\[(.|\r|\n)*?\];/);
  if (!match) {
    throw new Error('Cannot find `window.VERBS = [...]` in src/data/verbs.js');
  }

  const expr = match[0].replace(/^window\.VERBS\s*=\s*/, '').replace(/;\s*$/, '');
  let verbs;
  try {
    verbs = new Function(`return (${expr});`)();
  } catch (err) {
    throw new Error(`Failed to parse VERBS array: ${err.message}`);
  }

  if (!Array.isArray(verbs)) {
    throw new Error('Parsed VERBS is not an array');
  }

  return verbs;
}

const normalizeString = normalizeScalar;

function splitTranslations(value) {
  return normalizeString(value)
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

function translationSet(record) {
  const normalized = normalizeVerbRecord(record);
  return {
    RU: new Set(splitTranslations(normalized.translations.ru)),
    UA: new Set(splitTranslations(normalized.translations.ua)),
    EN: new Set(splitTranslations(normalized.translations.en)),
  };
}

function mergeTranslationSets(list) {
  const merged = { RU: new Set(), UA: new Set(), EN: new Set() };
  for (const item of list) {
    for (const lang of ['RU', 'UA', 'EN']) {
      for (const token of item[lang]) merged[lang].add(token);
    }
  }
  return merged;
}

function setsEqual(a, b) {
  if (a.size !== b.size) return false;
  for (const x of a) if (!b.has(x)) return false;
  return true;
}

function levelRank(level) {
  const v = normalizeString(level).toUpperCase();
  const order = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };
  return order[v] || Number.MAX_SAFE_INTEGER;
}

function dedupeKey(v) {
  const normalized = normalizeVerbRecord(v);
  return [normalized.infinitive, normalized.preterite, normalized.participle2].join('|');
}

function hasVariantMarker(v) {
  const normalized = normalizeVerbRecord(v);
  return Boolean(normalized.variant || normalized.note);
}

function validateRecords(verbs) {
  const normalizedRecords = normalizeVerbRecords(verbs);
  const errors = [];
  const warnings = [];
  const idRows = new Map();

  // Rule 1: Key = Infinitiv + Praeteritum + Partizip2
  const keyGroups = new Map();
  normalizedRecords.forEach((v, idx) => {
    const id = normalizeString(v.id);
    if (!id) {
      errors.push(`[MISSING_ID] row=${idx + 1} (id is required)`);
    } else {
      if (!idRows.has(id)) idRows.set(id, []);
      idRows.get(id).push(idx + 1);
    }

    const key = dedupeKey(v);
    if (!keyGroups.has(key)) keyGroups.set(key, []);
    keyGroups.get(key).push({ v, idx });
  });

  for (const [id, rows] of idRows.entries()) {
    if (rows.length > 1) {
      errors.push(`[DUPLICATE_ID] id=${id} rows=${rows.join(',')}`);
    }
  }

  // Rule 2 + 3 + 5:
  // - For exact duplicate key keep one record only
  // - Keep the record with the lowest Level
  // - Merge translations (RU/UA/EN) into the kept record
  for (const [key, group] of keyGroups.entries()) {
    if (group.length < 2) continue;

    const levels = group.map(({ v }) => normalizeString(v.level));
    const bestRank = Math.min(...group.map(({ v }) => levelRank(v.level)));
    const bestRows = group.filter(({ v }) => levelRank(v.level) === bestRank);
    if (bestRows.length !== 1) {
      warnings.push(
        `[DUPLICATE_LEVEL_TIE] key=${key} rows=${group.map((x) => x.idx + 1).join(',')} levels=${levels.join(',')}`
      );
    }

    const sets = group.map(({ v }) => translationSet(v));
    const merged = mergeTranslationSets(sets);

    // If translations differ inside a duplicate group, group must be merged into one canonical record.
    const allSame = sets.every((s) =>
      setsEqual(s.RU, merged.RU) && setsEqual(s.UA, merged.UA) && setsEqual(s.EN, merged.EN)
    );
    if (!allSame) {
      warnings.push(
        `[TRANSLATION_MERGE_REQUIRED] key=${key} rows=${group.map((x) => x.idx + 1).join(',')}`
      );
    }

    // Final enforced state should not contain multiple rows with the same dedupe key.
    errors.push(`[DUPLICATE_KEY] key=${key} rows=${group.map((x) => x.idx + 1).join(',')}`);
  }

  // Rule 4: same infinitive, different grammar variant -> keep both, but mark variant explicitly.
  const infGroups = new Map();
  normalizedRecords.forEach((v, idx) => {
    const inf = normalizeString(v.infinitive);
    if (!infGroups.has(inf)) infGroups.set(inf, []);
    infGroups.get(inf).push({ v, idx });
  });

  for (const [inf, group] of infGroups.entries()) {
    const keys = new Set(group.map(({ v }) => dedupeKey(v)));
    if (keys.size <= 1) continue;

    const missing = group.filter(({ v }) => !hasVariantMarker(v));
    if (missing.length > 0) {
      warnings.push(
        `[MISSING_VARIANT_MARKER] infinitive=${inf} rows=${missing.map((x) => x.idx + 1).join(',')} (expected Variant/Note field)`
      );
    }
  }

  // Optional sanity checks for required fields
  normalizedRecords.forEach((v, idx) => {
    const inf = normalizeString(v.infinitive);
    const pret = normalizeString(v.preterite);
    const part2 = normalizeString(v.participle2);
    if (!inf || !pret || !part2) {
      errors.push(`[MISSING_REQUIRED_FIELDS] row=${idx + 1} (Infinitiv/Praeteritum/Partizip2 are required)`);
    }

    const hasTranslation = Boolean(
      normalizeString(v.translations.ru) || normalizeString(v.translations.ua) || normalizeString(v.translations.en)
    );
    if (!hasTranslation) {
      errors.push(`[MISSING_TRANSLATION] row=${idx + 1} (one of RU/UA/EN is required)`);
    }
  });

  return { errors, warnings };
}

function main() {
  const verbs = parseVerbsFromDataFile(VERBS_DATA_FILE);
  const { errors, warnings } = validateRecords(verbs);

  if (warnings.length > 0) {
    console.log('Warnings:');
    for (const w of warnings) console.log(`  - ${w}`);
    console.log('');
  }

  if (errors.length > 0) {
    console.error('Validation failed:');
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  console.log(`Validation passed. Records checked: ${verbs.length}`);
}

if (require.main === module) {
  main();
}

module.exports = {
  dedupeKey,
  hasVariantMarker,
  levelRank,
  mergeTranslationSets,
  normalizeString,
  parseVerbsFromDataFile,
  setsEqual,
  splitTranslations,
  translationSet,
  validateRecords,
};
