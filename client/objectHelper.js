exports.initialize = function () {
  'use strict';
  const getObjectInfo = function (obj) {
      var prop, array = [];
      if (!obj) {
        return array;
      }
      for (prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          array.push({ name: prop, value: obj[prop] });
        }
      }
      return array;
    },
    getPropertyCount = function (obj) {
      return getObjectInfo(obj).length;
    },
    propertiesExist = function (obj) {
      return getPropertyCount(obj) > 0;
    },
    scrutinize = function (obj, silent) {
      var property, text;
      text = '';
      for (property in obj) {
        if (obj.hasOwnProperty(property)) {
          text += property + '=' + obj[property] + '\r\n';
        }
      }
      if (!silent) {
        console.info(text);
      }
      return text;
    };
  return {
    getObjectInfo: getObjectInfo,
    getPropertyCount: getPropertyCount,
    propertiesExist: propertiesExist,
    scrutinize: scrutinize
  };
};