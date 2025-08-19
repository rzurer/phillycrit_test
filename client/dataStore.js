/* globals $ */
exports.initialize = function (eventListener, ajaxHelper, auditStore, configurationStore, emailStore, eventStore, feedbackStore, memberNewsStore, memberStore) {
  'use strict';
  const uploadFiles = function (url, formData) {
      ajaxHelper.uploadFiles(url, formData, function (response) {
        if (!response.success) {
          eventListener.fire('Failure', [response.message]);
          return;
        }
        eventListener.fire('Success', [response.message]);
      });
    },
    fetchMissionStatement = function (callback) {
      ajaxHelper.get('/missionStatement', function (response) {
        callback(response.payload);
      });
    },
    fetchDetails = function (callback) {
      ajaxHelper.get('/details', function (response) {
        callback(response.payload);
      });
    },
    fetchPolicies = function (callback) {
      ajaxHelper.get('/policies', function (response) {
        callback(response.payload);
      });
    },
    fetchAboutUs = function (htmlFilename, callback) {
      ajaxHelper.get('/aboutUs/' + htmlFilename, function (response) {
        callback(response.payload);
      });
    },
    setAboutUs = function (htmlFilename, callback) {
      fetchAboutUs(htmlFilename, callback);
    },
    setMissionStatement = function (callback) {
      fetchMissionStatement(callback);
    },
    setDetails = function (callback) {
      fetchDetails(callback);
    },
    setPolicies = function (callback) {
      fetchPolicies(callback);
    },
    fetchNews = function (callback) {
      ajaxHelper.get('/news', function (response) {
        callback(response);
      });
    },
    writeTextFile = function (filePath, text) {
      ajaxHelper.post('/writeTextFile', { filePath: filePath, text: text }, function (response) {
        if (!response.success) {
          eventListener.fire('Failure', [response.message]);
          return;
        }
        eventListener.fire('Success', [response.message]);
      });
    },
    getCookie = function (cookieName, callback) {
      ajaxHelper.get('/getCookies/', function (response) {
        if (!response.success) {
          eventListener.fire('Failure', [response.message]);
          return;
        }
        const cookies = response.payload;
        callback(cookies[cookieName]);
      });
    },
    setCookie = function (cookieName, cookieValue, callback) {
      ajaxHelper.put('/setCookie/' + cookieName + '/' + cookieValue, function (response) {
        if (!response.success) {
          eventListener.fire('Failure', [response]);
        }
      });
      if (callback) {
        callback();
      }
    },
    getEnvironment = function (callback) {
      ajaxHelper.get('/getEnvironment', callback);
    },
    addEventListeners = function () {
      eventListener.addListener('SetMissionStatement', setMissionStatement);
      eventListener.addListener('SetDetails', setDetails);
      eventListener.addListener('SetPolicies', setPolicies);
      eventListener.addListener('SetAboutUs', setAboutUs);
    };
  addEventListeners();
  return {
    writeTextFile: writeTextFile,
    uploadFiles: uploadFiles,
    fetchNews: fetchNews,
    getCookie: getCookie,
    setCookie: setCookie,
    getEnvironment: getEnvironment,
    auditStore: auditStore,
    configurationStore: configurationStore,
    emailStore: emailStore,
    eventStore: eventStore,
    feedbackStore: feedbackStore,
    memberNewsStore: memberNewsStore,
    memberStore: memberStore
  };
};