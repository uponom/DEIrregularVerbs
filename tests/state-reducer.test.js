const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadStateModule() {
  const sourcePath = path.join(__dirname, '..', 'src', 'state.js');
  const source = fs.readFileSync(sourcePath, 'utf8');
  const transformed = `${source.replace(/^export\s+/gm, '')}\nmodule.exports = {\n  ACTIONS,\n  createInitialState,\n  reduceState,\n  createItems,\n  filterByParentOnly,\n  createChildrenMap,\n  createChildRows,\n};\n`;

  const context = {
    module: { exports: {} },
    exports: {},
  };
  vm.createContext(context);
  vm.runInContext(transformed, context, { filename: 'state.js' });
  return context.module.exports;
}

const {
  ACTIONS,
  createInitialState,
  reduceState,
  createItems,
  filterByParentOnly,
  createChildrenMap,
  createChildRows,
} = loadStateModule();

const CONTEXT = { levels: ['A1', 'A2'] };

test('main and modal level filters are independent', () => {
  let state = createInitialState();
  state = reduceState(state, { type: ACTIONS.TOGGLE_MAIN_LEVEL_FILTER, value: 'A1' }, CONTEXT);
  state = reduceState(state, { type: ACTIONS.TOGGLE_MODAL_LEVEL_FILTER, value: 'A2' }, CONTEXT);

  assert.deepEqual(state.selectedMainLevels, ['A2']);
  assert.deepEqual(state.selectedModalLevels, ['A1']);
});

test('cannot disable the last selected level in main filters', () => {
  let state = createInitialState();
  state = reduceState(state, { type: ACTIONS.TOGGLE_MAIN_LEVEL_FILTER, value: 'A1' }, CONTEXT);
  state = reduceState(state, { type: ACTIONS.TOGGLE_MAIN_LEVEL_FILTER, value: 'A2' }, CONTEXT);

  assert.deepEqual(state.selectedMainLevels, ['A2']);
});

test('cannot disable the last selected level in modal filters', () => {
  let state = createInitialState();
  state = reduceState(state, { type: ACTIONS.TOGGLE_MODAL_LEVEL_FILTER, value: 'A1' }, CONTEXT);
  state = reduceState(state, { type: ACTIONS.TOGGLE_MODAL_LEVEL_FILTER, value: 'A2' }, CONTEXT);

  assert.deepEqual(state.selectedModalLevels, ['A2']);
});

test('parent-only mode toggles in reducer', () => {
  let state = createInitialState();
  assert.equal(state.parentOnly, false);
  state = reduceState(state, { type: ACTIONS.TOGGLE_PARENT_ONLY }, CONTEXT);
  assert.equal(state.parentOnly, true);
  state = reduceState(state, { type: ACTIONS.TOGGLE_PARENT_ONLY }, CONTEXT);
  assert.equal(state.parentOnly, false);
});

test('learn alphabetical mode is enabled by default and toggles in reducer', () => {
  let state = createInitialState();
  assert.equal(state.learnAlphabetical, true);
  state = reduceState(state, { type: ACTIONS.TOGGLE_LEARN_ALPHABETICAL }, CONTEXT);
  assert.equal(state.learnAlphabetical, false);
  state = reduceState(state, { type: ACTIONS.TOGGLE_LEARN_ALPHABETICAL }, CONTEXT);
  assert.equal(state.learnAlphabetical, true);
});

test('set index normalizes requested index by available items length', () => {
  let state = createInitialState();
  state = reduceState(state, { type: ACTIONS.SET_INDEX, value: 5 }, { levels: CONTEXT.levels, itemsLength: 4 });
  assert.equal(state.index, 1);

  state = reduceState(state, { type: ACTIONS.SET_INDEX, value: -1 }, { levels: CONTEXT.levels, itemsLength: 4 });
  assert.equal(state.index, 3);

  state = reduceState(state, { type: ACTIONS.SET_INDEX, value: 'x' }, { levels: CONTEXT.levels, itemsLength: 4 });
  assert.equal(state.index, 3);
});

test('modal parent-only mode toggles and resets expanded row', () => {
  let state = createInitialState();
  assert.equal(state.modalParentOnly, false);
  assert.equal(state.expandedModalParentId, null);

  state = reduceState(state, { type: ACTIONS.TOGGLE_MODAL_PARENT_ONLY }, CONTEXT);
  assert.equal(state.modalParentOnly, true);

  state = reduceState(state, { type: ACTIONS.TOGGLE_MODAL_PARENT_EXPANDED, value: 'p1' }, CONTEXT);
  assert.equal(state.expandedModalParentId, 'p1');

  state = reduceState(state, { type: ACTIONS.TOGGLE_MODAL_PARENT_ONLY }, CONTEXT);
  assert.equal(state.modalParentOnly, false);
  assert.equal(state.expandedModalParentId, null);
});

test('modal expanded parent toggles and closes on modal close', () => {
  let state = createInitialState();
  state = reduceState(state, { type: ACTIONS.TOGGLE_MODAL_PARENT_EXPANDED, value: 'p1' }, CONTEXT);
  assert.equal(state.expandedModalParentId, 'p1');

  state = reduceState(state, { type: ACTIONS.TOGGLE_MODAL_PARENT_EXPANDED, value: 'p1' }, CONTEXT);
  assert.equal(state.expandedModalParentId, null);

  state = reduceState(state, { type: ACTIONS.TOGGLE_MODAL_PARENT_EXPANDED, value: 'p2' }, CONTEXT);
  state = reduceState(state, { type: ACTIONS.CLOSE_VERBS_MODAL }, CONTEXT);
  assert.equal(state.expandedModalParentId, null);
});

test('createItems keeps parent link from normalized records', () => {
  const raw = [
    { id: 'root', Parent: '', Infinitiv: 'kommen', RU: 'приходить' },
    { id: 'child', Parent: 'root', Infinitiv: 'ankommen', RU: 'прибывать' },
  ];
  const normalizer = (records) => records.map((record) => ({
    id: record.id,
    parent: record.Parent,
    level: 'A1',
    infinitive: record.Infinitiv,
    present3: '',
    preterite: 'x',
    participle2: 'y',
    auxiliary: 'haben',
    classes: { infinitive: '', present3: '', preterite: '', participle2: '' },
    variant: '',
    note: '',
    translations: { ru: record.RU, ua: '', en: '' },
  }));

  const items = createItems(raw, normalizer);
  const child = items.find((item) => item.id === 'child');
  assert.ok(child);
  assert.equal(child.parent, 'root');
});

test('filterByParentOnly returns only base verbs when enabled', () => {
  const sample = [
    { id: 'a', parent: '' },
    { id: 'b', parent: 'a' },
  ];
  assert.deepEqual(filterByParentOnly(sample, false).map((x) => x.id), ['a', 'b']);
  assert.deepEqual(filterByParentOnly(sample, true).map((x) => x.id), ['a']);
});

test('children map groups by parent and child rows are sorted by infinitive', () => {
  const sample = [
    { id: 'p', parent: '', de: 'kommen', ru: 'приходить', ua: '', en: '' },
    { id: 'c2', parent: 'p', de: 'zurueckkommen', ru: 'возвращаться', ua: '', en: '' },
    { id: 'c1', parent: 'p', de: 'ankommen', ru: 'прибывать', ua: '', en: '' },
  ];

  const map = createChildrenMap(sample);
  const rows = createChildRows(map, 'p', 'RU');
  assert.deepEqual(Array.from(rows, (row) => row.de), ['ankommen', 'zurueckkommen']);
  assert.deepEqual(Array.from(rows, (row) => row.translation), ['прибывать', 'возвращаться']);
});
