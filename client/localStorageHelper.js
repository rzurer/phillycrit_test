/* globals localStorage */
exports.initialize = function () {
  'use strict';
  const set = function (key, item) {
      if (typeof item === 'string') {
        localStorage.setItem(key, item);
        return;
      }
      localStorage.setItem(key, JSON.stringify(item));
    },
    get = function (key, defaultValue) {
      try {
        return JSON.parse(localStorage.getItem(key));
      } catch (e) {
        return defaultValue || localStorage.getItem(key);
      }
    },
    remove = function (key) {
      localStorage.removeItem(key);
    };
  return {
    get: get,
    set: set,
    remove: remove
  };
};