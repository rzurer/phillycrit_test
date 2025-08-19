exports.initialize = function (mongoPersistor) {
  'use strict';
  const collectionName = 'events',
    sanitizeDates = function (event) {
      event.startDate = new Date(event.startDate);
      event.endDate = new Date(event.endDate);
      return event;
    },
    replaceEmptyArrays = function (event) {
      event.attendees = event.attendees || [];
      event.waitlist = event.waitlist || [];
      event.noShows = event.noShows || [];
      return event;
    },
    addEvent = function (event, error, success) {
      const sanitizedEvent = sanitizeDates(event),
        finalEvent = replaceEmptyArrays(sanitizedEvent);
      mongoPersistor.addUnique(collectionName, finalEvent, 'startDate', error, success);
    },
    updateBaseEvent = function (event, error, success) {
      const sanitizedEvent = sanitizeDates(event),
        value = {
          criteria: { _id: event._id },
          update: {
            startDate: sanitizedEvent.startDate,
            endDate: sanitizedEvent.endDate,
            venue: sanitizedEvent.venue,
            venueAddress: sanitizedEvent.venueAddress,
            venueWebsite: sanitizedEvent.venueWebsite,
            venueInstagram: sanitizedEvent.venueInstagram,
            isPublished: sanitizedEvent.isPublished,
            isPresenterSignupOnly: sanitizedEvent.isPresenterSignupOnly,
            isAttendeeSignupOnly: sanitizedEvent.isAttendeeSignupOnly,
            googleMapsUrl: sanitizedEvent.googleMapsUrl,
            notes: sanitizedEvent.notes
          }
        };
      mongoPersistor.updateEntry(collectionName, value, error, success);
    },
    updateEvent = function (event, error, success) {
      const sanitizedEvent = sanitizeDates(event),
        updatedEvent = replaceEmptyArrays(sanitizedEvent),
        value = {
          criteria: { _id: event._id },
          update: updatedEvent
        };
      mongoPersistor.updateEntry(collectionName, value, error, success);
    },
    deleteEvent = function (eventId, error, success) {
      mongoPersistor.deleteEntry(collectionName, eventId, error, success);
    },
    retrieveAttendees = function (error, success) {
      const value = {
        criteria: {},
        projection: { _id: 0, attendees: 1, startDate: 1 }
      };
      mongoPersistor.retrieveEntries(collectionName, value, error, success);
    },
    retrieveEventsBefore = function (startDateString, error, success) {
      const startDate = new Date(startDateString),
        value = {
          criteria: { startDate: { $lte: startDate } }
        };
      mongoPersistor.retrieveEntries(collectionName, value, error, success);
    },
    retrieveEventsAfter = function (startDateString, error, success) {
      const startDate = new Date(startDateString),
        value = {
          criteria: { startDate: { $gte: startDate } }
        };
      mongoPersistor.retrieveEntries(collectionName, value, error, success);
    },
    retrieveAllEvents = function (error, success) {
      mongoPersistor.retrieveAllEntries(collectionName, error, success);
    },
    checkStartDateExists = function (startDate, error, success) {
      const value = {
        criteria: new Date(startDate),
        projection: {}
      };
      mongoPersistor.retrieveEntries(collectionName, value, error, success);
    },
    getEvent = function (objectId, error, success) {
      mongoPersistor.retrieveEntry(collectionName, objectId, error, success);
    };
  return {
    getEvent: getEvent,
    addEvent: addEvent,
    updateEvent: updateEvent,
    updateBaseEvent: updateBaseEvent,
    deleteEvent: deleteEvent,
    retrieveAllEvents: retrieveAllEvents,
    checkStartDateExists: checkStartDateExists,
    retrieveAttendees: retrieveAttendees,
    retrieveEventsBefore: retrieveEventsBefore,
    retrieveEventsAfter: retrieveEventsAfter
  };
};