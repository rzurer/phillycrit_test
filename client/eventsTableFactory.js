/* globals $ */
exports.initialize = function (eventListener, htmlHelper, dateHelper) {
  'use strict';
  const createEventsTableHeaderRow = function () {
      const row = htmlHelper.createRow('eventsTableHeaderRow');
      htmlHelper.appendCell(row, 'Venue', 500);
      htmlHelper.appendCell(row, 'Date', 200);
      htmlHelper.appendCell(row, 'Total', 200);
      htmlHelper.appendCell(row, 'Attendees', 200);
      htmlHelper.appendCell(row, 'Presenters', 200);
      htmlHelper.appendCell(row, 'Waitlist', 200);
      htmlHelper.appendCell(row, 'No Shows', 200);
      return row;
    },
    displayPersistedEvent = function (e) {
      eventListener.fire('DisplayPersistedEvent', [e.data.eventData, e.data.wantReadOnlyAttendees]);
    },
    createEventsTableRow = function (eventData, wantReadOnlyAttendees) {
      const presentersCount = eventData.attendees ? eventData.attendees.filter(a => a.isPresenting === 'Y').length : 0,
        noShowsCounut = eventData.noShows ? eventData.noShows.length : 0,
        waitlistCount = eventData.waitlist ? eventData.waitlist.length : 0,
        attendeesCount = eventData.attendees ? eventData.attendees.length : 0,
        observersCount = attendeesCount - presentersCount - waitlistCount,
        row = htmlHelper.createRow('eventsTableRow').attr('id', eventData.eventId);
      htmlHelper.appendCell(row, eventData.venue);
      htmlHelper.appendCell(row, dateHelper.getFormattedDate(eventData.startDate));
      htmlHelper.appendCell(row, attendeesCount);
      htmlHelper.appendCell(row, observersCount);
      htmlHelper.appendCell(row, presentersCount);
      htmlHelper.appendCell(row, waitlistCount);
      htmlHelper.appendCell(row, noShowsCounut);
      row.on('click', { eventData: eventData, wantReadOnlyAttendees: wantReadOnlyAttendees }, displayPersistedEvent);
      return row;
    },
    createEventsTable = function (eventsData, wantReadOnlyAttendees) {
      const table = htmlHelper.createTable('eventsTable');
      table.append(createEventsTableHeaderRow());
      if (eventsData && eventsData.length > 0) {
        eventsData.forEach(function (eventData) {
          table.append(createEventsTableRow(eventData));
        });
      }
      return table;
    };
  return {
    createEventsTable: createEventsTable
  };
};