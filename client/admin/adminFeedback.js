/* globals $ */
exports.initialize = function (eventListener, dataStore, dateHelper, htmlHelper) {
  'use strict';
  const feedbackTableContainer = $('.feedbackTableContainer'),
    createFeedbackTableHeaderRow = function () {
      const row = htmlHelper.createRow('feedbackTablHeaderRow');
      htmlHelper.appendCell(row, 'Date', 150, true);
      htmlHelper.appendCell(row, 'Email', 250, true);
      htmlHelper.appendCell(row, 'Type', 150, true);
      htmlHelper.appendCell(row, 'Feedback', '', true);
      return row;
    },
    createFeedbackTableRow = function (feedback) {
      const row = htmlHelper.createRow('feedbackTableRow');
      htmlHelper.appendCell(row, dateHelper.getFormattedDate(feedback.createDate, true));
      htmlHelper.appendCell(row, feedback.email);
      htmlHelper.appendCell(row, feedback.type);
      htmlHelper.appendCell(row, feedback.entry);
      return row;
    },
    displayFeedbackTable = function () {
      const feedbackTable = htmlHelper.createTable('feedbackTable');
      feedbackTableContainer.empty();
      feedbackTable.append(createFeedbackTableHeaderRow());
      dataStore.feedbackStore.getFeedback((feedbackArray) => {
        feedbackArray.forEach(function (feedback) {
          feedbackTable.append(createFeedbackTableRow(feedback));
        });
      });
      feedbackTableContainer.append(feedbackTable);
    },
    initializeControls = function () {
      displayFeedbackTable();
    },
    initializeEventListener = function () {
      eventListener.addListener('RefreshFeedbackTable', displayFeedbackTable);
    };
  initializeEventListener();
  initializeControls();
};