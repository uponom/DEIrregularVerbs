const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const swPath = path.join(__dirname, '..', 'src', 'sw.js');
const swSource = fs.readFileSync(swPath, 'utf8');

test('service worker imports app-version script', () => {
  assert.match(swSource, /importScripts\(['\"]\.\/app-version\.js['\"]\)/);
});

test('service worker cache version uses APP_VERSION', () => {
  assert.match(swSource, /const\s+CACHE_VERSION\s*=\s*self\.APP_VERSION\s*\|\|\s*['\"]dev['\"]/);
});
