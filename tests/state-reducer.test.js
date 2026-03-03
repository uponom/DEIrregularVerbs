const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadStateModule() {
  const sourcePath = path.join(__dirname, '..', 'src', 'state.js');
  const source = fs.readFileSync(sourcePath, 'utf8');
  const transformed = `${source.replace(/^export\s+/gm, '')}\nmodule.exports = { ACTIONS, createInitialState, reduceState };\n`;

  const context = {
    module: { exports: {} },
    exports: {},
  };
  vm.createContext(context);
  vm.runInContext(transformed, context, { filename: 'state.js' });
  return context.module.exports;
}

const { ACTIONS, createInitialState, reduceState } = loadStateModule();

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
