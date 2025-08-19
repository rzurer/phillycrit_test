exports.initialize = function (mongoPersistor) {
  'use strict';
  const collectionName = 'configuration';
  return {
    retrieveConfiguration: function (error, success) {
      mongoPersistor.retrieveAllEntries(collectionName, error, success);
    },
    updateConfiguration: function (configuration, error, success) {
      const value = {
        criteria: { _id: configuration._id },
        update: configuration
      };
      mongoPersistor.updateEntry(collectionName, value, error, success);
    }
  };
};