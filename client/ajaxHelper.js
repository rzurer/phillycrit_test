/* globals $ */
exports.initialize = function (eventListener) {
  'use strict';
  var that, ajax;
  ajax = function (url, data, options, callback) {
    var prop, ajaxOptions;
    ajaxOptions = data ? { url: url, data: data, async: false } : { url: url, async: false };
    if (options) {
      for (prop in options) {
        if (options.hasOwnProperty(prop)) {
          ajaxOptions[prop] = options[prop];
        }
      }
    }
    $.ajax(ajaxOptions)
      .done(function (response) {
        if (callback && typeof callback === 'function') {
          callback(response);
        }
      })
      .fail(function (jqXHR, textStatus, errorThrown) {
        eventListener.fire('XHRFailure', [jqXHR, textStatus, errorThrown]);
      });
  };
  that = {
    get: function (url, callback) {
      ajax(url, null, { headers: {
        'x-custom-header': 'requestOriginatedOnServer'
      } }, callback);
    },
    post: function (url, data, callback) {
      var options = { type: 'POST' };
      ajax(url, data, options, callback);
    },
    put: function (url, data, callback) {
      var options = { type: 'PUT' };
      ajax(url, data, options, callback);
    },
    uploadFiles: function (url, formData, callback) {
      var options = {
        type: 'POST',
        contentType: false,
        processData: false,
        cache: false
      };
      ajax(url, formData, options, callback);
    },
    remove: function (url, callback) {
      var options = { type: 'DELETE' };
      ajax(url, null, options, callback);
    }
  };
  return that;
};