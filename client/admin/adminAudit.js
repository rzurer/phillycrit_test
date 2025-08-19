/* globals $ */
exports.initialize = function (dataStore, auditTableFactory, dateHelper, htmlHelper) {
  'use strict';
  let auditTable;
  const auditTableContainer = $('.auditTableContainer'),
    downloadAuditCsvButton = $('#downloadAuditCsvButton'),
    displayAllAuditsButton = $('#displayAllAuditsButton'),
    displayCurrentAuditsButton = $('#displayCurrentAuditsButton'),
    auditEmailSelect = $('#auditEmailSelect'),
    displayAuditsByEmail = function () {
      const email = auditEmailSelect.val();
      auditTableContainer.empty();
      auditTableFactory.filterAuditsTableByEmail(auditTable, email);
      auditTableContainer.append(auditTable);
    },
    getAuditEmails = function (callback) {
      dataStore.auditStore.getAllAudits((audits) => {
        const emails = audits.map((a) => {
          return a.email;
        });
        emails.sort();
        callback(new Set(emails));
      });
    },
    displayAuditsTable = function (daysBack) {
      auditTableContainer.empty();
      auditTableFactory.filterAuditsTableByDate(auditTable, daysBack);
      auditTableContainer.append(auditTable);
    },
    displayAllAudits = function () {
      displayAuditsTable();
      htmlHelper.disableControl(displayAllAuditsButton);
      htmlHelper.enableControl(displayCurrentAuditsButton, displayCurrentAudits);
    },
    displayCurrentAudits = function () {
      const daysBack = 3;
      displayAuditsTable(daysBack);
      htmlHelper.disableControl(displayCurrentAuditsButton);
      htmlHelper.enableControl(displayAllAuditsButton, displayAllAudits);
    },
    assignEventHandlers = function () {
      // downloadAuditCsvButton.on('click', { fromDateString: dateHelper.today() }, auditTableFactory.createAuditCsv);
      displayAllAuditsButton.on('click', displayAllAudits);
      auditEmailSelect.on('change', displayAuditsByEmail);
    },
    initializeAuditsTable = function (dateOffset) {
      dataStore.memberStore.getEmailNameDictionary((emailNameDictionary) => {
        dataStore.auditStore.getAllAudits((audits) => {
          auditTable = auditTableFactory.createAuditTable(audits, emailNameDictionary);
        });
      });
    },
    initializeControls = function () {
      getAuditEmails((emails) => {
        htmlHelper.fillSelectFromList(auditEmailSelect, '', emails);
      });
      htmlHelper.disableControl(displayCurrentAuditsButton);
      displayCurrentAudits();
    };
  assignEventHandlers();
  initializeAuditsTable();
  initializeControls();
};