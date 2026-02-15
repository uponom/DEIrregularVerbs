const test = require('node:test');
const assert = require('node:assert/strict');

const { APP_VERSION, getAppVersion } = require('../src/app-version.js');

test('getAppVersion returns APP_VERSION', () => {
  assert.equal(getAppVersion(), APP_VERSION);
});

test('APP_VERSION matches integer version pattern', () => {
  assert.match(APP_VERSION, /^\d+$/);
});
