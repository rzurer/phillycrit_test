/* globals $ */
exports.initialize = function (dataStore, htmlHelper, dateHelper) {
  'use strict';
  const questionnairesTableContainer = $('.questionnairesTableContainer'),
    createAimsTable = function (aims) {
      const aimsTable = htmlHelper.createTable('aimsTable');
      aims.forEach((aim) => {
        const row = htmlHelper.createRow('aimsTableRow');
        htmlHelper.appendCell(row, aim);
        aimsTable.append(row);
      });
      return aimsTable;
    },
    createQuestionnairesTableHeaderRow = function () {
      const row = htmlHelper.createRow('questionnairesTableHeaderRow');
      htmlHelper.appendCell(row, 'Crit Date', 100);
      htmlHelper.appendCell(row, 'Email', 300);
      htmlHelper.appendCell(row, 'Aims', 300);
      htmlHelper.appendCell(row, 'Comments', 200);
      htmlHelper.appendCell(row, 'Image Store', 100);
      return row;
    },
    createQuestionnairesTableRow = function (attendeeQuestionnaire) {
      const row = htmlHelper.createRow('questionnairesTableRow');
      htmlHelper.appendCell(row, dateHelper.getShortMonthShortDayYear(new Date(attendeeQuestionnaire.startDate)));
      htmlHelper.appendCell(row, attendeeQuestionnaire.email);
      if (attendeeQuestionnaire.questionnaire.aims) {
        row.append(createAimsTable(attendeeQuestionnaire.questionnaire.aims));
      }
      htmlHelper.appendCell(row, attendeeQuestionnaire.questionnaire.additionalComments);
      htmlHelper.appendCell(row, attendeeQuestionnaire.questionnaire.imagesStoreUrl);
      return row;
    },
    createQuestionnairesTable = function (attendeeQuestionnaires) {
      const questionnairesTable = htmlHelper.createTable('questionnairesTable');
      questionnairesTable.append(createQuestionnairesTableHeaderRow());
      attendeeQuestionnaires.forEach(function (attendeeQuestionnaire) {
        questionnairesTable.append(createQuestionnairesTableRow(attendeeQuestionnaire));
      });
      return questionnairesTable;
    },
    displayQuestionnaires = function () {
      dataStore.eventStore.getAttendeeQuestionnaires((attendeeQuestionnaires) => {
        questionnairesTableContainer.empty();
        questionnairesTableContainer.append(createQuestionnairesTable(attendeeQuestionnaires));
      });
    };
  displayQuestionnaires();
};