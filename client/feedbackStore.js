exports.initialize = function (eventListener, ajaxHelper, sortHelper) {
  'use strict';
  const addFeedback = function (feedback, callback) {
      ajaxHelper.post('/feedback', { feedback: feedback }, function (response) {
        if (!response.success) {
          eventListener.fire('Failure', [response.message]);
          return;
        }
        callback();
      });
    },
    getFeedback = function (callback) {
      ajaxHelper.get('/feedback', function (response) {
        if (!response.success) {
          eventListener.fire('Failure', [response.message]);
          return;
        }
        const feedbackArray = response.payload;
        if (feedbackArray && Array.isArray(feedbackArray)) {
          feedbackArray.sort((a, b) => sortHelper.dateSort(a, b, 'createDate', true));
        }
        callback(feedbackArray);
      });
    };
  return {
    addFeedback: addFeedback,
    getFeedback: getFeedback
  };
};