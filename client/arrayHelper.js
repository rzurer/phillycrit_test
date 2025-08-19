exports.initialize = function () {
  'use strict';
  const createUniqueArray = function (sourceArray) {
      return Array.from(new Set(sourceArray));
    },
    removeDuplicatesByProperty = (sourceArray, propertyName) => {
      const set = new Set();
      return sourceArray.filter(e => {
        const propertyValue = e[propertyName];
        if (!set.has(propertyValue)) {
          set.add(propertyValue);
          return true;
        }
        return false;
      });
    },
    sortArrayByProperty = function (array, property, wantDesending) {
      const compare = function (a, b) {
        if (a[property] < b[property]) {
          return wantDesending ? 1 : -1;
        }
        if (a[property] > b[property]) {
          return wantDesending ? -1 : 1;
        }
        return 0;
      };
      array.sort(compare);
      return array;
    },
    getSafeArray = function (array) {
      return Array.isArray(array) ? array : [];
    },
    caseInsensitiveIncludes = function (stringArray, stringValue) {
      return stringArray.map(s => s.toLowerCase()).includes(stringValue.toLowerCase());
    },
    getNumberArray = function (startIndex, length) {
      const array = [];
      let i;
      for (i = startIndex; i <= length; i++) {
        array.push(i);
      }
      return array;
    },
    createCsvFileFromObjectArray = function (objectArray, propertyNamesArray, headerArray) {
      const stringArray = [];
      let element = '';
      if (!propertyNamesArray || propertyNamesArray.length === 0) {
        return [];
      }
      if (!objectArray || objectArray.length === 0) {
        return [];
      }
      if (headerArray && headerArray.length >= propertyNamesArray.length) {
        headerArray = headerArray.slice(0, propertyNamesArray.length);
        stringArray.push(headerArray.join());
      }
      objectArray.forEach((o) => {
        element = '';
        propertyNamesArray.forEach((s) => {
          const propertyValue = o[s];
          if (propertyValue) {
            element += propertyValue.replace(',', ' ') + ',';
          }
        });
        element = element.substring(0, element.length - 1);
        stringArray.push(element);
      });
      return stringArray.join('\r\n');
    };
  return {
    sortArrayByProperty: sortArrayByProperty,
    getSafeArray: getSafeArray,
    caseInsensitiveIncludes: caseInsensitiveIncludes,
    getNumberArray: getNumberArray,
    createCsvFileFromObjectArray: createCsvFileFromObjectArray,
    createUniqueArray: createUniqueArray,
    removeDuplicatesByProperty: removeDuplicatesByProperty
  };
};