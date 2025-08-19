/* globals $ */
exports.initialize = function (eventListener, dataStore, dateHelper, htmlHelper, sortHelper) {
  'use strict';
  const membersListTableContainer = $('.membersListTableContainer'),
    critDatesSelect = $('#critDatesSelect'),
    createEventAttendeesHeaderRow = function () {
      const row = htmlHelper.createRow('eventAttendeesHeaderRow');
      htmlHelper.appendCell(row, 'Name', '', '', 'attendeeName');
      htmlHelper.appendCell(row, 'Web');
      htmlHelper.appendCell(row, 'IG', '', '', 'imageHeaderCell');
      htmlHelper.appendCell(row, 'FB', '', '', 'imageHeaderCell');
      htmlHelper.appendCell(row, 'Presenting');
      return row;
    },
    createReadOnlyEventAttendeesRow = function (item) {
      let cell, link;
      const row = htmlHelper.createRow('eventAttendeesRow'),
        nameSpan = htmlHelper.createSpan(item.fullName, 'nameSpan');
      cell = htmlHelper.appendCell(row, '', 250);
      cell.append(nameSpan);
      cell = htmlHelper.appendCell(row, '', 80);
      if (item.website) {
        link = htmlHelper.createImageLink(item.website, 'images/globe.png');
        cell.append(link);
      }
      cell = htmlHelper.appendCell(row, '', 80);
      if (item.instagram) {
        link = htmlHelper.createImageLink(item.instagram, 'images/instagram.png');
        cell.append(link);
      }
      cell = htmlHelper.appendCell(row, '', 80);
      if (item.facebook) {
        link = htmlHelper.createImageLink(item.facebook, 'images/facebook.png');
        cell.append(link);
      }
      cell = htmlHelper.appendCell(row, '', 80);
      if (item.isPresenting === 'Y') {
        cell.text('Presenting');
      }
      return row;
    },
    createReadOnlyEventAttendeesTable = function (presentingArray, attendingArray) {
      let row;
      const table = htmlHelper.createTable().attr('id', 'eventAttendeesTable'),
        dataExists = presentingArray.length + attendingArray.length > 0;
      if (!dataExists) {
        row = htmlHelper.createRow();
        htmlHelper.appendCell(row, 'No Data');
        table.append(row);
        return table;
      }
      table.append(createEventAttendeesHeaderRow());
      presentingArray.sort((a, b) => sortHelper.stringSort(a, b, 'fullName'));
      attendingArray.sort((a, b) => sortHelper.stringSort(a, b, 'fullName'));
      presentingArray.forEach(function (item) {
        row = createReadOnlyEventAttendeesRow(item);
        table.append(row);
      });
      attendingArray.forEach(function (item) {
        row = createReadOnlyEventAttendeesRow(item);
        table.append(row);
      });
      return table;
    },
    createMemberIsPresentingArray = function (attendees, callback) {
      const presentingArray = [],
        attendingArray = [];
      attendees.forEach((attendee) => {
        dataStore.memberStore.getMemberByEmail(attendee.email, (member) => {
          const item = {
            fullName: member.firstName + ' ' + member.lastName,
            website: member.website,
            instagram: member.instagram,
            isPresenting: attendee.isPresenting
          };
          if (!item.fullName.includes('undefined')) {
            if (attendee.isPresenting === 'Y') {
              presentingArray.push(item);
            } else {
              attendingArray.push(item);
            }
          }
        });
      });
      callback(presentingArray, attendingArray);
    },
    displayMemberTable = function (e) {
      const eventDate = $(e.target).val(),
        array = e.data.dateAttendeesArray,
        attendees = array.find((e) => e.startDate === eventDate).attendees;
      htmlHelper.showWaitingCursor();
      membersListTableContainer.hide();
      membersListTableContainer.empty();
      setTimeout(() => {
        createMemberIsPresentingArray(attendees, (presentingArray, attendingArray) => {
          const table = createReadOnlyEventAttendeesTable(presentingArray, attendingArray);
          membersListTableContainer.append(table);
          membersListTableContainer.show();
          htmlHelper.hideWaitingCursor();
        });
      }, 500);
    },
    displayEventDatesSelect = function (callback) {
      dataStore.eventStore.fetchEvents((events) => {
        const dateAttendeesArray = events.map((e) => {
            return { startDate: dateHelper.getShortMonthShortDayYear(e.startDate), attendees: e.attendees };
          }),
          startDates = dateAttendeesArray.map((da) => {
            return da.startDate;
          });
        htmlHelper.fillSelectFromList(critDatesSelect, '', startDates, '<select a date>');
        critDatesSelect.on('change', { dateAttendeesArray: dateAttendeesArray }, displayMemberTable);
      });
    },
    initializeControls = function () {
      displayEventDatesSelect();
    };
  initializeControls();
};