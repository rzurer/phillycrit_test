exports.initialize = function (mongoPersistor) {
  'use strict';
  const collectionName = 'memberNews',
    sanitizeDates = function (memberNews) {
      if (memberNews.openingDate) {
        memberNews.openingDate = new Date(memberNews.openingDate);
      }
      if (memberNews.closingDate) {
        memberNews.closingDate = new Date(memberNews.closingDate);
      }
      if (memberNews.receptionDate) {
        memberNews.receptionDate = new Date(memberNews.receptionDate);
      }
      if (memberNews.closingReceptionDate) {
        memberNews.closingReceptionDate = new Date(memberNews.closingReceptionDate);
      }
      return memberNews;
    };
  return {
    retrieveAllMemberNews: function (error, success) {
      mongoPersistor.retrieveEntries(collectionName, { criteria: {}, projection: {} }, error, success);
    },
    retrieveActiveMemberNews: function (error, success) {
      let yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      mongoPersistor.retrieveEntries(collectionName, { criteria: { closingDate: { $gte: yesterday }, approvalStatus: 'approved' }, projection: {} }, error, success);
    },
    addMemberNews: function (memberNews, error, success) {
      mongoPersistor.createEntry(collectionName, sanitizeDates(memberNews), error, success);
    },
    updateMemberNews: function (memberNews, error, success) {
      mongoPersistor.updateEntry(collectionName, { criteria: { _id: memberNews._id }, update: sanitizeDates(memberNews) }, error, success);
    }
  };
};