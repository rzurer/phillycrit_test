exports.initialize = function () {
  'use strict';
  const padNumber = function (num, size) {
      while (num.length < size) {
        num = '0' + num;
      }
      return num;
    },
    trim = function (source) {
      if (!source || !source.length || source.length === 0) {
        return source;
      }
      return source.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    },
    safeTrim = function (value) {
      if (!value || typeof value !== 'string') {
        return value;
      }
      return value.trim();
    },
    stripNonNumeric = function (source) {
      return source.replace(/\D/g, '');
    },
    formatLocalPhoneNumber = function (phoneNumber) {
      let numbers = stripNonNumeric(phoneNumber);
      if (numbers[0] === '1') {
        numbers = numbers.substring(1);
      }
      if (numbers.length !== 10) {
        return phoneNumber;
      }
      return `(${numbers[0]}${numbers[1]}${numbers[2]}) ${numbers[3]}${numbers[4]}${numbers[5]}-${numbers[6]}${numbers[7]}${numbers[8]}${numbers[9]}`;
    };
  return {
    padNumber: padNumber,
    trim: trim,
    safeTrim: safeTrim,
    stripNonNumeric: stripNonNumeric,
    formatLocalPhoneNumber: formatLocalPhoneNumber
  };
};