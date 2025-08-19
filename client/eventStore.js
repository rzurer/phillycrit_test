exports.initialize = function (eventListener, ajaxHelper, dateHelper, htmlHelper, sortHelper, arrayHelper) {
  'use strict';
  const eventSorter = {
      sortByEventDateAscending: function (a, b) {
        return sortHelper.dateSort(a, b, 'startDate');
      },
      sortByEventDateDescending: function (a, b) {
        return sortHelper.dateSort(a, b, 'startDate', true);
      },
      sortByEmailAscending: function (a, b) {
        return sortHelper.stringSort(a, b, 'email');
      }
    },
    fetchPublishedEvents = function (callback) {
      fetchEvents((events) => {
        const publishedEvents = [];
        events.forEach((event) => {
          if (event.isPublished === 'Y') {
            publishedEvents.push(event);
          }
        });
        callback(publishedEvents);
      });
    },
    fetchEvents = function (callback) {
      ajaxHelper.get('/events', function (response) {
        const events = response.payload || [];
        if (events && Array.isArray(events)) {
          events.sort(eventSorter.sortByEventDateDescending);
        }
        callback(events);
      });
    },
    getAttendanceDatesForMember = function (memberEmail, callback) {
      fetchEvents((events) => {
        const startDates = [];
        events.forEach((e) => {
          if (e.attendees.map((a) => a.email).includes(memberEmail)) {
            startDates.push(e.startDate);
          }
        });
        callback(startDates);
      });
    },
    fetchEvent = function (eventId, callback) {
      ajaxHelper.get('/events/' + eventId, function (response) {
        callback(response.payload);
      });
    },
    getEventsAfter = function (startDateString, callback) {
      getEventsBeforeOrAfter(startDateString, 'after', callback);
    },
    getEventsBeforeOrAfter = function (startDateString, beforeOrAfter, callback) {
      ajaxHelper.get('/events/' + startDateString + '/' + beforeOrAfter, function (response) {
        callback(response.payload);
      });
    },
    getMembersThatHavePresentedRecently = function (ineligibleToPresentMonths, callback) {
      fetchEvents((events) => {
        const startDate = events.map(e => e.startDate).sort((a, b) => b - a)[ineligibleToPresentMonths];
        getEventsAfter(startDate, events => {
          const presenters = events.map((e) => e.attendees).flat().filter((a) => {
              return a.isPresenting === 'Y';
            }),
            uniquePresenters = arrayHelper.createUniqueArray(presenters.map(p => p.email));
          // uniquePresenters.push('052779bs@secret.com'); // Testing Only. Comment in production
          callback(uniquePresenters.sort());
        });
      });
    },
    getMembersThatHaveAttendedRecently = function (ineligibleToSignupEarlyMonths, administratorEmails, callback) {
      fetchEvents((events) => {
        const startDate = events.map(e => e.startDate).sort((a, b) => b - a)[ineligibleToSignupEarlyMonths];
        getEventsAfter(startDate, events => {
          const attendees = events.map((e) => e.attendees).flat().map(a => a.email),
            uniqueAttendees = arrayHelper.createUniqueArray(attendees),
            membersThatHaveAttendedRecently = uniqueAttendees.filter(e => {
              return !administratorEmails.includes(e);
            });
          // membersThatHaveAttendedRecently.push('052779bs@secret.com'); // Testing Only. Comment in production
          callback(membersThatHaveAttendedRecently.sort());
        });
      });
    },
    getAttendees = function (eventId, callback) {
      fetchEvent(eventId, (event) => {
        callback(event.attendees);
      });
    },
    getEventStartDate = function (eventId, callback) {
      fetchEvent(eventId, (event) => {
        callback(dateHelper.getFormattedDate(event.startDate));
      });
    },
    getEventClosestToNow = function (callback) {
      const fetchEventsCallback = function (events) {
        const now = new Date().getTime(),
          currentEvents = events.filter((e) => new Date(e.startDate).getTime() >= now).sort(eventSorter.sortByEventDateAscending) || [];
        callback(currentEvents[0]);
      };
      fetchPublishedEvents(fetchEventsCallback);
    },
    createEventFromEventData = function (eventData) {
      return {
        _id: eventData.eventId,
        startDate: eventData.startDateAsDate,
        endDate: eventData.endDateAsDate,
        venue: eventData.venue,
        venueAddress: eventData.venueAddress,
        venueWebsite: eventData.venueWebsite,
        venueInstagram: eventData.venueInstagram,
        venueFacebook: eventData.venueFacebook,
        facebookEventLink: eventData.facebookEventLink,
        isPublished: eventData.isPublished,
        isPresenterSignupOnly: eventData.isPresenterSignupOnly,
        isAttendeeSignupOnly: eventData.isAttendeeSignupOnly,
        googleMapsUrl: eventData.googleMapsUrl,
        attendees: eventData.attendees,
        waitlist: eventData.waitlist,
        noShows: eventData.noShows,
        notes: eventData.notes
      };
    },
    createEventData = function (item) {
      const startDate = new Date(item.startDate),
        endDate = new Date(item.endDate);
      return {
        eventId: item._id,
        startDateAsDate: startDate,
        endDateAsDate: endDate,
        startDate: dateHelper.getFormattedDate(startDate),
        duration: dateHelper.getFormattedDateRange(startDate, endDate),
        venue: item.venue,
        venueAddress: item.venueAddress,
        venueWebsite: item.venueWebsite,
        venueInstagram: item.venueInstagram,
        venueFacebook: item.venueFacebook,
        facebookEventLink: item.facebookEventLink,
        isPublished: item.isPublished,
        isPresenterSignupOnly: item.isPresenterSignupOnly,
        isAttendeeSignupOnly: item.isAttendeeSignupOnly,
        googleMapsUrl: item.googleMapsUrl,
        attendees: item.attendees,
        waitlist: item.waitlist,
        noShows: item.noShows,
        notes: item.notes
      };
    },
    getAllEventsData = function (events) {
      const eventTableData = [];
      if (!events) {
        return [];
      }
      events.forEach(function (event) {
        if (!event) {
          return {};
        }
        eventTableData.push(createEventData(event));
      });
      return eventTableData;
    },
    getCurrentEventsData = function (events) {
      const now = new Date().getTime();
      return getAllEventsData(events).filter((e) => e.isPublished === 'Y' && e.startDateAsDate.getTime() >= now).sort(eventSorter.sortByEventDateAscending);
    },
    getPastEventsData = function (events) {
      const now = new Date().getTime();
      return getAllEventsData(events).filter((e) => e.startDateAsDate.getTime() < now).sort(eventSorter.sortByEventDateAscending);
    },
    checkStartDateExists = function (startDate, callback) {
      if (!startDate) {
        return;
      }
      ajaxHelper.get('/events/startDateToCheck/' + startDate, function (response) {
        if (!response.success) {
          eventListener.fire('Failure', [response.message]);
          return;
        }
        callback(response.payload);
      });
    },
    modifyBaseEvent = function (event, callback) {
      const dateExistsCallback = function (response) {
        if (response.payload) {
          eventListener.fire('Failure', [response.message]);
          return;
        }
        ajaxHelper.put('/events/base', { event: event }, callback);
      };
      checkStartDateExists(event.startDate, dateExistsCallback);
    },
    modifyEvent = function (event, callback) {
      ajaxHelper.put('/events', { event: event }, callback);
    },
    modifyUserEvent = function (event, email, action, critDate, callback) {
      const audit = {
        email: email,
        action: action,
        critDate: critDate,
        device: htmlHelper.getDeviceType()
      };
      ajaxHelper.put('/events', { event: event, audit: audit }, callback);
    },
    addEvent = function (event, callback) {
      const dateExistsCallback = function (response) {
        if (response.payload) {
          eventListener.fire('Failure', [response.message]);
          return;
        }
        ajaxHelper.post('/events', { event: event }, callback);
      };
      checkStartDateExists(event.startDate, dateExistsCallback);
    },
    addAttendee = function (eventId, attendee) {
      fetchEvent(eventId, (event) => {
        event.attendees.push(attendee);
        modifyEvent(event, (response) => {
          // console.log(attendee, response.success);
        });
      });
    },
    removeAttendee = function (eventId, email) {
      fetchEvent(eventId, (event) => {
        const index = event.attendees.findIndex(a => a.email === email);
        event.attendees.splice(index, 1);
        modifyEvent(event, (response) => {
          // console.log(email, response.success);
        });
      });
    },
    getAttendeeQuestionnaires = function (callback) {
      ajaxHelper.get('events/attendees/only/attendees', function (response) {
        if (!response.success) {
          eventListener.fire('Failure', [response.message]);
          return;
        }
        const emailQuestionnaireArray = [];
        response.payload.forEach(aq => {
          aq.attendees.filter(at => {
            return at.isPresenting === 'Y' && at.questionnaire !== undefined;
          }).forEach(a => {
            emailQuestionnaireArray.push({ startDate: aq.startDate, email: a.email, questionnaire: a.questionnaire });
          });
        });
        emailQuestionnaireArray.sort(eventSorter.sortByEventDateDescending);
        callback(emailQuestionnaireArray);
      });
    };
  return {
    getEventStartDate: getEventStartDate,
    getEventClosestToNow: getEventClosestToNow,
    createEventFromEventData: createEventFromEventData,
    getAllEventsData: getAllEventsData,
    modifyBaseEvent: modifyBaseEvent,
    modifyUserEvent: modifyUserEvent,
    addEvent: addEvent,
    getAttendeeQuestionnaires: getAttendeeQuestionnaires,
    getCurrentEventsData: getCurrentEventsData,
    getPastEventsData: getPastEventsData,
    getAttendees: getAttendees,
    fetchEvents: fetchEvents,
    fetchPublishedEvents: fetchPublishedEvents,
    fetchEvent: fetchEvent,
    getMembersThatHaveAttendedRecently: getMembersThatHaveAttendedRecently,
    getMembersThatHavePresentedRecently: getMembersThatHavePresentedRecently,
    getAttendanceDatesForMember: getAttendanceDatesForMember,
    addAttendee: addAttendee,
    removeAttendee: removeAttendee
  };
};