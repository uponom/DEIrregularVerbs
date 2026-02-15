const test = require('node:test');
const assert = require('node:assert/strict');

const {
  isLocalhost,
  isSecureForServiceWorker,
  normalizeScopePath,
  registerServiceWorker,
} = require('../src/pwa.js');

function createEventTarget() {
  const listeners = new Map();
  return {
    addEventListener(event, handler) {
      if (!listeners.has(event)) listeners.set(event, []);
      listeners.get(event).push(handler);
    },
    dispatch(event) {
      const handlers = listeners.get(event) || [];
      handlers.forEach((h) => h());
    },
  };
}

test('isLocalhost detects allowed local hosts', () => {
  assert.equal(isLocalhost('localhost'), true);
  assert.equal(isLocalhost('127.0.0.1'), true);
  assert.equal(isLocalhost('[::1]'), true);
  assert.equal(isLocalhost('example.com'), false);
});

test('isSecureForServiceWorker accepts https and localhost', () => {
  assert.equal(isSecureForServiceWorker({ protocol: 'https:', hostname: 'example.com' }), true);
  assert.equal(isSecureForServiceWorker({ protocol: 'http:', hostname: 'localhost' }), true);
  assert.equal(isSecureForServiceWorker({ protocol: 'http:', hostname: 'example.com' }), false);
});

test('normalizeScopePath returns a directory scope', () => {
  assert.equal(normalizeScopePath('/src/index.html'), '/src/');
  assert.equal(normalizeScopePath('/index.html'), '/');
  assert.equal(normalizeScopePath(''), './');
});

test('registerServiceWorker skips insecure contexts', async () => {
  const result = await registerServiceWorker({
    navigator: { serviceWorker: {} },
    location: { protocol: 'http:', hostname: 'example.com', pathname: '/src/index.html' },
  });

  assert.deepEqual(result, { registered: false, reason: 'insecure-context' });
});

test('registerServiceWorker registers and wires update handler', async () => {
  const installing = createEventTarget();
  installing.state = 'installing';

  const registration = createEventTarget();
  registration.installing = installing;
  registration.waiting = { postMessage() {} };

  const controllerTarget = createEventTarget();
  controllerTarget.controller = {};

  let lastRegisterArgs;
  controllerTarget.register = async (swPath, options) => {
    lastRegisterArgs = { swPath, options };
    return registration;
  };

  let refreshed = false;
  let refreshNotified = false;

  const result = await registerServiceWorker({
    navigator: { serviceWorker: controllerTarget },
    location: {
      protocol: 'https:',
      hostname: 'example.com',
      pathname: '/src/index.html',
      reload() {
        refreshed = true;
      },
    },
    onNeedRefresh() {
      refreshNotified = true;
    },
  });

  assert.equal(result.registered, true);
  assert.equal(lastRegisterArgs.swPath, './sw.js');
  assert.equal(lastRegisterArgs.options.scope, '/src/');

  registration.dispatch('updatefound');
  installing.state = 'installed';
  installing.dispatch('statechange');
  assert.equal(refreshNotified, true);

  controllerTarget.dispatch('controllerchange');
  assert.equal(refreshed, false);
});
