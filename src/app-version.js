(function (global) {
  'use strict';

  const APP_VERSION = '14';

  function getAppVersion() {
    return APP_VERSION;
  }

  const api = {
    APP_VERSION,
    getAppVersion,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  global.APP_VERSION = APP_VERSION;
})(typeof window !== 'undefined' ? window : globalThis);
