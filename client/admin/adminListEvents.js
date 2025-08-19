/* globals $ */
exports.initialize = function (eventListener, dataStore, eventsTableFactory) {
  'use strict';
  const eventsTableContainer = $('.eventsTableContainer'),
    createNewEventButton = $('#createNewEventButton'),
    displayEventsTable = function (events) {
      eventsTableContainer.empty();
      eventsTableContainer.append(eventsTableFactory.createEventsTable(events));
    },
    initializeControls = function () {
      dataStore.eventStore.fetchEvents(displayEventsTable);
    },
    assignEventHandlers = function () {
      createNewEventButton.on('click', () => {
        eventListener.fire('InitializeEventEntryControls');
      });
    },
    initializeEventListener = function () {
      eventListener.addListener('RefreshEventsTable', initializeControls);
    };
  assignEventHandlers();
  initializeEventListener();
  initializeControls();
};