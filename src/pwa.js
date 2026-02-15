(function (global) {
  'use strict';

  function isLocalhost(hostname) {
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
  }

  function isSecureForServiceWorker(locationLike) {
    if (!locationLike || !locationLike.protocol) return false;
    return locationLike.protocol === 'https:' || isLocalhost(locationLike.hostname || '');
  }

  function normalizeScopePath(pathname) {
    if (!pathname) return './';
    const idx = pathname.lastIndexOf('/');
    return idx >= 0 ? `${pathname.slice(0, idx + 1)}` : './';
  }

  async function registerServiceWorker(options) {
    const opts = options || {};
    const nav = opts.navigator || global.navigator;
    const loc = opts.location || global.location;
    const onNeedRefresh = opts.onNeedRefresh;
    const swPath = opts.swPath || './sw.js';

    if (!nav || !('serviceWorker' in nav)) return { registered: false, reason: 'unsupported' };
    if (!isSecureForServiceWorker(loc)) return { registered: false, reason: 'insecure-context' };

    const registration = await nav.serviceWorker.register(swPath, {
      scope: normalizeScopePath(loc.pathname)
    });

    registration.addEventListener('updatefound', () => {
      const installing = registration.installing;
      if (!installing) return;

      installing.addEventListener('statechange', () => {
        if (installing.state === 'installed' && nav.serviceWorker.controller) {
          if (typeof onNeedRefresh === 'function') {
            onNeedRefresh(registration);
          }
        }
      });
    });

    if (nav.serviceWorker && typeof nav.serviceWorker.addEventListener === 'function') {
      nav.serviceWorker.addEventListener('controllerchange', () => {
        if (global.location && typeof global.location.reload === 'function') {
          global.location.reload();
        }
      });
    }

    return { registered: true, registration };
  }

  async function init(options) {
    const opts = options || {};
    return registerServiceWorker({
      swPath: opts.swPath || './sw.js',
      onNeedRefresh: opts.onNeedRefresh || function (registration) {
        const waiting = registration && registration.waiting;
        if (waiting) {
          waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      },
      navigator: opts.navigator,
      location: opts.location
    });
  }

  const api = {
    init,
    isLocalhost,
    isSecureForServiceWorker,
    normalizeScopePath,
    registerServiceWorker
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  global.PWA = api;
})(typeof window !== 'undefined' ? window : globalThis);
