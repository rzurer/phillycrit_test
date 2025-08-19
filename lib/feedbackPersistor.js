exports.initialize = function (mongoPersistor) {
  'use strict';
  const collectionName = 'feedback',
    sanitizeDates = function (feedback) {
      feedback.createDate = new Date(feedback.createDate);
      return feedback;
    };
  return {
    addFeedback: function (feedback, error, success) {
      mongoPersistor.createEntry(collectionName, sanitizeDates(feedback), error, success);
    },
    retrieveFeedback: function (error, success) {
      mongoPersistor.retrieveAllEntries(collectionName, error, success);
    }
  };
};