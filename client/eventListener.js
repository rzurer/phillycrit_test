exports.initialize = function () {
  'use strict';
  const listeners = {};
  return {
    fire: function (name, args) {
      let callbacks, i;
      if (listeners[name] instanceof Array) {
        callbacks = listeners[name];
        for (i = 0; i < callbacks.length; i += 1) {
          callbacks[i].apply(this, args);
        }
      }
    },
    addListener: function (type, listener) {
      if (typeof listeners[type] === 'undefined') {
        listeners[type] = [];
      }
      listeners[type].push(listener);
    },
    removeListener: function (type, listener) {
      let callbacks, i;
      if (listeners[type] instanceof Array) {
        callbacks = listeners[type];
        for (i = 0; i < callbacks.length; i += 1) {
          if (callbacks[i] === listener) {
            callbacks.splice(i, 1);
            break;
          }
        }
      }
    }
  };
};