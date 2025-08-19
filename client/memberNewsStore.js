exports.initialize = function (ajaxHelper, htmlHelper) {
  'use strict';
  const retrieveActiveMemberNews = function (callback) {
      ajaxHelper.get('memberNews/retrieveActiveMemberNews', callback);
    },
    retrieveAllMemberNews = function (callback) {
      ajaxHelper.get('memberNews/retrieveAllMemberNews', callback);
    },
    addMemberNews = function (memberNews, callback) {
      const audit = {
        email: memberNews.email,
        action: 'Member news added',
        device: htmlHelper.getDeviceType()
      };
      ajaxHelper.post('memberNews/addMemberNews', { memberNews: memberNews, audit: audit }, (response) => {
        callback(response);
      });
    },
    updateMemberNews = function (memberNews, callback) {
      ajaxHelper.put('memberNews/updateMemberNews', { memberNews: memberNews }, callback);
    };
  return {
    retrieveActiveMemberNews: retrieveActiveMemberNews,
    retrieveAllMemberNews: retrieveAllMemberNews,
    addMemberNews: addMemberNews,
    updateMemberNews: updateMemberNews
  };
};