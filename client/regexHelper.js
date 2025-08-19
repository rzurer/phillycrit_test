exports.initialize = function () {
  'use strict';
  const addhttp = function (url) {
      const regex = /^(?:f|ht)tps?:\/\//;
      if (!regex.test(url)) {
        url = 'http://' + url;
      }
      return url;
    },
    tryCreateUrl = function (url) {
      try {
        return new URL(addhttp(url)).toString();
      } catch (err) {
        return '';
      }
    },
    isValidUrl = function (url) {
      return tryCreateUrl(url).length > 0;
    },
    isValidEmail = function (email) {
      var regex = /^[-a-z0-9~!$%^&*_=+}{'?]+(\.[-a-z0-9~!$%^&*_=+}{'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
      return regex.test(email);
    };
  return {
    isValidEmail: isValidEmail,
    isValidUrl: isValidUrl,
    tryCreateUrl: tryCreateUrl
  };
};