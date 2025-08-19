exports.initialize = function () {
  'use strict';
  const dateSort = function (a, b, propertyName, isDescending) {
      if (!a[propertyName] || !b[propertyName]) {
        return 0;
      }
      const timeA = new Date(a[propertyName]).getTime(),
        timeB = new Date(b[propertyName]).getTime();
      if (timeA < timeB) {
        return isDescending ? 1 : -1;
      }
      if (timeA > timeB) {
        return isDescending ? -1 : 1;
      }
      return 0;
    },
    stringSort = function (a, b, propertyName, isDescending) {
      if (!a[propertyName] || !b[propertyName]) {
        return 0;
      }
      if (a[propertyName].toLowerCase() < b[propertyName].toLowerCase()) {
        return isDescending ? 1 : -1;
      }
      if (a[propertyName].toLowerCase() > b[propertyName].toLowerCase()) {
        return isDescending ? -1 : 1;
      }
      return 0;
    },
    numberSort = function (a, b, propertyName, isDescending) {
      if (a[propertyName] < b[propertyName]) {
        return isDescending ? 1 : -1;
      }
      if (a[propertyName] > b[propertyName]) {
        return isDescending ? -1 : 1;
      }
      return 0;
    };
  return {
    dateSort: dateSort,
    numberSort: numberSort,
    stringSort: stringSort
  };
};