/* globals $ */
exports.initialize = function (eventListener, dataStore, htmlHelper) {
  'use strict';
  const submitFeedbackButton = $('#submitFeedbackButton'),
    cancelSubmitFeedbackButton = $('#cancelSubmitFeedbackButton'),
    feedbackInput = $('#feedbackInput'),
    feedbackTypeHidden = $('#feedbackTypeHidden'),
    getFeedbackEntry = function () {
      return feedbackInput.val();
    },
    getFeedbackType = function () {
      return feedbackTypeHidden.val();
    },
    createFeedback = function (email) {
      const feedback = getFeedbackEntry(),
        feedbackType = getFeedbackType();
      if (!feedback) {
        return;
      }
      return {
        email: email,
        createDate: new Date(),
        entry: feedback,
        type: feedbackType
      };
    },
    cancelSubmitFeedback = function () {
      eventListener.fire('FeedbackSubmitted');
    },
    submitFeedback = function () {
      const isLoggedInCallback = function (email) {
        if (email) {
          const feedback = createFeedback(email);
          if (!feedback) {
            eventListener.fire('Failure', ['Please enter some feedback']);
            feedbackInput.focus();
            return;
          }
          dataStore.feedbackStore.addFeedback(feedback, () => {
            eventListener.fire('FeedbackSubmitted');
            eventListener.fire('RefreshFeedbackTable');
            eventListener.fire('Success', ['Thanks for your input.']);
          });
        }
      };
      eventListener.fire('IsUserLoggedIn', [isLoggedInCallback]);
    },
    assignEventHandlers = function () {
      submitFeedbackButton.on('click', submitFeedback);
      cancelSubmitFeedbackButton.on('click', cancelSubmitFeedback);
    };
  assignEventHandlers();
};