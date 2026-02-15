#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX_HTML = path.join(ROOT, 'src', 'index.html');

function parseVerbsFromIndexHtml(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  const match = source.match(/const\s+VERBS\s*=\s*\[(.|\r|\n)*?\];/);
  if (!match) {
    throw new Error('Cannot find `const VERBS = [...]` in src/index.html');
  }

  const expr = match[0].replace(/^const\s+VERBS\s*=\s*/, '').replace(/;\s*$/, '');
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

function normalizeString(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function splitTranslations(value) {
  return normalizeString(value)
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

function translationSet(record) {
  return {
    RU: new Set(splitTranslations(record.RU)),
    UA: new Set(splitTranslations(record.UA)),
    EN: new Set(splitTranslations(record.EN)),
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
  return [normalizeString(v.Infinitiv), normalizeString(v.Praeteritum), normalizeString(v.Partizip2)].join('|');
}

function hasVariantMarker(v) {
  return Boolean(normalizeString(v.Variant) || normalizeString(v.Note) || normalizeString(v.Notes));
}

function validateRecords(verbs) {
  const errors = [];
  const warnings = [];

  // Rule 1: Key = Infinitiv + Praeteritum + Partizip2
  const keyGroups = new Map();
  verbs.forEach((v, idx) => {
    const key = dedupeKey(v);
    if (!keyGroups.has(key)) keyGroups.set(key, []);
    keyGroups.get(key).push({ v, idx });
  });

  // Rule 2 + 3 + 5:
  // - For exact duplicate key keep one record only
  // - Keep the record with the lowest Level
  // - Merge translations (RU/UA/EN) into the kept record
  for (const [key, group] of keyGroups.entries()) {
    if (group.length < 2) continue;

    const levels = group.map(({ v }) => normalizeString(v.Level));
    const bestRank = Math.min(...group.map(({ v }) => levelRank(v.Level)));
    const bestRows = group.filter(({ v }) => levelRank(v.Level) === bestRank);
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
  verbs.forEach((v, idx) => {
    const inf = normalizeString(v.Infinitiv);
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
  verbs.forEach((v, idx) => {
    const inf = normalizeString(v.Infinitiv);
    const pret = normalizeString(v.Praeteritum);
    const part2 = normalizeString(v.Partizip2);
    if (!inf || !pret || !part2) {
      errors.push(`[MISSING_REQUIRED_FIELDS] row=${idx + 1} (Infinitiv/Praeteritum/Partizip2 are required)`);
    }

    const hasTranslation = Boolean(normalizeString(v.RU) || normalizeString(v.UA) || normalizeString(v.EN));
    if (!hasTranslation) {
      errors.push(`[MISSING_TRANSLATION] row=${idx + 1} (one of RU/UA/EN is required)`);
    }
  });

  return { errors, warnings };
}

function main() {
  const verbs = parseVerbsFromIndexHtml(INDEX_HTML);
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
  parseVerbsFromIndexHtml,
  setsEqual,
  splitTranslations,
  translationSet,
  validateRecords,
};
