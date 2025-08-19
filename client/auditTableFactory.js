/* globals $ */
exports.initialize = function (htmlHelper, dateHelper, arrayHelper) {
  'use strict';
  const formatTimestamp = (timestamp) => {
      const localizedDate = dateHelper.adjustToLocalTimezone(new Date(timestamp), true).toISOString().replace('T', ' ').replace('Z', '');
      return localizedDate.substring(0, localizedDate.lastIndexOf('.'));
    },
    createAuditCsv = function (audits) {
      const propertyNamesArray = ['createDate', 'email', 'action', 'environment'],
        headerArray = ['Timestamp', 'Email', 'Action', 'Environment'];
      return arrayHelper.createCsvFileFromObjectArray(audits, propertyNamesArray, headerArray);
    },
    appendMobileCreateDateCell = function (row, createDate) {
      createDate = formatTimestamp(createDate);
      createDate = createDate.substring(createDate.indexOf('-') + 1);
      return htmlHelper.appendCell(row, createDate);
    },
    appendMobileFullNameCell = function (row, email, emailFullNameDictionary) {
      const fullName = emailFullNameDictionary[email];
      return htmlHelper.appendCell(row, fullName);
    },
    appendMobileActionCell = function (row, email, action) {
      action = action.replace(email + ' ', '');
      return htmlHelper.appendCell(row, action).css({ 'word-wrap': 'break-word' });
    },
    appendMobileCritDateCell = function (row, critDate) {
      return htmlHelper.appendCell(row, critDate);
    },
    appendMobileDeviceCell = function (row, device) {
      return htmlHelper.appendCell(row, device);
    },
    appendMobileTimestampCell = function (row, timestamp) {
      return htmlHelper.appendCell(row, timestamp, 0, false, 'timestamp');
    },
    createAuditTableHeaderRow = function () {
      const row = htmlHelper.createRow('auditTableHeaderRow');
      htmlHelper.appendCell(row, 'Timestamp');
      htmlHelper.appendCell(row, 'Email');
      htmlHelper.appendCell(row, 'Name');
      htmlHelper.appendCell(row, 'Action');
      htmlHelper.appendCell(row, 'Crit Date');
      htmlHelper.appendCell(row, 'Environment');
      htmlHelper.appendCell(row, 'Device');
      htmlHelper.appendCell(row, 'IsoDate', 0);
      return row;
    },
    createAuditTableRow = function (audit, emailFullNameDictionary) {
      const row = htmlHelper.createRow('auditTableRow');
      row.attr('id', audit._id);
      htmlHelper.appendCell(row, formatTimestamp(audit.createDate), 200);
      htmlHelper.appendCell(row, audit.email, 280, false, 'email');
      htmlHelper.appendCell(row, emailFullNameDictionary[audit.email], 250);
      htmlHelper.appendCell(row, audit.action, 700).css({ 'word-wrap': 'break-word' });
      htmlHelper.appendCell(row, audit.critDate, 120);
      htmlHelper.appendCell(row, audit.environment, 120);
      htmlHelper.appendCell(row, audit.device, 80);
      htmlHelper.appendCell(row, audit.createDate, 0, false, 'timestamp');
      return row;
    },
    createAuditTable = function (audits, emailNameDictionary) {
      const auditTable = htmlHelper.createTable('auditTable');
      auditTable.append(createAuditTableHeaderRow());
      audits.forEach(function (audit) {
        auditTable.append(createAuditTableRow(audit, emailNameDictionary));
      });
      return auditTable;
    },
    getCompareDateString = function (daysBefore) {
      const date = new Date();
      date.setDate(date.getDate() - daysBefore);
      return date.toISOString();
    },
    filterAuditsTableByDate = (table, dateOffset) => {
      const rows = table.find('tr');
      if (!dateOffset) {
        rows.show();
        return;
      }
      rows.hide();
      rows.each((i, r) => {
        const row = $(r),
          timestamp = row.find('td.timestamp').text(),
          compareDateString = getCompareDateString(dateOffset),
          comparisonResult = dateHelper.compareAscending(timestamp, compareDateString);
        if (comparisonResult >= 0) {
          row.show();
        }
      });
    },
    filterAuditsTableByEmail = (table, emailFilter) => {
      const rows = table.find('tr');
      rows.hide();
      rows.each((i, r) => {
        const row = $(r),
          email = row.find('td.email').text();
        if (emailFilter === email) {
          row.show();
        }
      });
    },
    createMobileAuditTableRow = function (audit, emailFullNameDictionary) {
      const row = htmlHelper.createRow('mobileAuditTableRow');
      appendMobileCreateDateCell(row, audit.createDate);
      appendMobileFullNameCell(row, audit.email, emailFullNameDictionary);
      appendMobileActionCell(row, audit.email, audit.action);
      appendMobileCritDateCell(row, audit.critDate);
      appendMobileDeviceCell(row, audit.device);
      appendMobileTimestampCell(row, audit.createDate);
      return row;
    },
    creatMobileAuditTable = (audits, emailNameDictionary) => {
      const canAddRow = function (audit) {
          return !audit.action.includes('SendGrid');
        },
        mobileAuditTable = htmlHelper.createTable('mobileAuditTable');
      audits.forEach(function (audit) {
        if (canAddRow(audit)) {
          mobileAuditTable.append(createMobileAuditTableRow(audit, emailNameDictionary));
        }
      });
      return mobileAuditTable;
    };
  return {
    createAuditTable: createAuditTable,
    creatMobileAuditTable: creatMobileAuditTable,
    createAuditCsv: createAuditCsv,
    filterAuditsTableByEmail: filterAuditsTableByEmail,
    filterAuditsTableByDate: filterAuditsTableByDate
  };
};