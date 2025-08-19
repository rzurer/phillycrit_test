/* globals $ */
exports.initialize = function (eventListener, dataStore, userSession, arrayHelper, dateHelper, htmlHelper) {
  'use strict';
  const userLoginErrorMessage = 'There is no logged in user. Please log in again',
    currentYear = new Date().getFullYear(),
    oneToTwelveArray = arrayHelper.getNumberArray(1, 12),
    monthSelect = $('#monthSelect'),
    daySelect = $('#daySelect'),
    yearSelect = $('#yearSelect'),
    displayDateSpan = $('#displayDateSpan'),
    eventDateContainer = $('.eventDateContainer'),
    notesInput = $('#notesInput'),
    adminErrorSpan = $('#adminErrorSpan'),
    addEventButton = $('#addEventButton'),
    updateEventButton = $('#updateEventButton'),
    cancelAddEventButton = $('#cancelAddEventButton'),
    cancelUpdateEventButton = $('#cancelUpdateEventButton'),
    eventIdHidden = $('#eventIdHidden'),
    amPmArray = ['AM', 'PM'],
    quarterHours = dateHelper.getQuarterHours(),
    startHourSelect = $('#startHourSelect'),
    startMinuteSelect = $('#startMinuteSelect'),
    startAmPmSelect = $('#startAmPmSelect'),
    endHourSelect = $('#endHourSelect'),
    endMinuteSelect = $('#endMinuteSelect'),
    endAmPmSelect = $('#endAmPmSelect'),
    venueInput = $('#venueInput'),
    venueAddressInput = $('#venueAddressInput'),
    venueWebsiteInput = $('#venueWebsiteInput'),
    venueInstagramInput = $('#venueInstagramInput'),
    isPublishedInput = $('#isPublishedInput'),
    isPresenterSignupOnlyInput = $('#isPresenterSignupOnlyInput'),
    isAttendeeSignupOnlyInput = $('#isAttendeeSignupOnlyInput'),
    googleMapsUrlInput = $('#googleMapsUrlInput'),
    tbdSpan = $('#tbdSpan'),
    datePartSelects = $('.datePartSelect'),
    eventInputs = $('.eventInput'),
    getEventId = function () {
      return eventIdHidden.val();
    },
    getMonth = function () {
      const month = monthSelect.val();
      return month ? Number(month - 1) : NaN;
    },
    getDay = function () {
      const day = daySelect.val();
      return day ? Number(day) : NaN;
    },
    getYear = function () {
      const year = yearSelect.val();
      return year ? Number(yearSelect.val()) : NaN;
    },
    getStartDate = function () {
      return new Date(getYear(), getMonth(), getDay(), getStartHour(), getStartMinute());
    },
    getEndDate = function () {
      var startHour, endHour, day;
      startHour = getStartHour();
      endHour = getEndHour();
      day = getDay();
      if (startHour > endHour) {
        day += 1;
      }
      return new Date(getYear(), getMonth(), day, endHour, getEndMinute());
    },
    getNotes = function () {
      return notesInput.val();
    },
    getStartHour = function () {
      var hour, amPm;
      amPm = getStartAmPm();
      hour = startHourSelect.val();
      return dateHelper.getMiltaryHour(hour, amPm);
    },
    getEndHour = function () {
      var hour, amPm;
      amPm = getEndAmPm();
      hour = endHourSelect.val();
      return dateHelper.getMiltaryHour(hour, amPm);
    },
    getStartMinute = function () {
      var minute = startMinuteSelect.val();
      return minute ? Number(minute) : NaN;
    },
    getEndMinute = function () {
      var minute = endMinuteSelect.val();
      return minute ? Number(minute) : NaN;
    },
    getStartAmPm = function () {
      return startAmPmSelect.val();
    },
    getEndAmPm = function () {
      return endAmPmSelect.val();
    },
    getVenue = function () {
      return venueInput.val();
    },
    getVenueAddress = function () {
      return venueAddressInput.val();
    },
    getVenueWebsite = function () {
      return venueWebsiteInput.val();
    },
    getVenueInstagram = function () {
      return venueInstagramInput.val();
    },
    getIsPublished = function () {
      return isPublishedInput.val();
    },
    getIsPresenterSignupOnly = function () {
      return isPresenterSignupOnlyInput.val();
    },
    getIsAttendeeSignupOnly = function () {
      return isAttendeeSignupOnlyInput.val();
    },
    getGoogleMapsUrl = function () {
      return googleMapsUrlInput.val();
    },
    createEvent = function () {
      return {
        _id: getEventId(),
        startDate: getStartDate(),
        endDate: getEndDate(),
        venue: getVenue(),
        venueAddress: getVenueAddress(),
        venueWebsite: getVenueWebsite(),
        venueInstagram: getVenueInstagram(),
        isPublished: getIsPublished(),
        isPresenterSignupOnly: getIsPresenterSignupOnly(),
        isAttendeeSignupOnly: getIsAttendeeSignupOnly(),
        googleMapsUrl: getGoogleMapsUrl(),
        notes: getNotes()
      };
    },
    displayPersistedEvent = function (event) {
      let startHour, startMinutes, startAmPm, endHour, endMinutes, endAmPm;
      const startDate = new Date(event.startDate),
        endDate = new Date(event.endDate);
      eventIdHidden.val(event._id);
      daySelect.val(startDate.getDate());
      monthSelect.val(startDate.getMonth() + 1);
      yearSelect.val(startDate.getFullYear());
      startHour = startDate.getHours();
      startAmPm = startHour > 12 ? 'PM' : 'AM';
      startHour = startHour > 12 ? startHour - 12 : startHour;
      startMinutes = startDate.getMinutes();
      startMinutes = startMinutes === 0 ? '00' : startMinutes;
      startHourSelect.val(startHour);
      startMinuteSelect.val(startMinutes);
      startAmPmSelect.val(startAmPm);
      endHour = endDate.getHours();
      endAmPm = endHour >= 12 ? 'PM' : 'AM';
      endHour = endHour > 12 ? endHour - 12 : endHour;
      endMinutes = endDate.getMinutes();
      endMinutes = endMinutes === 0 ? '00' : endMinutes;
      endHourSelect.val(endHour);
      endMinuteSelect.val(endMinutes);
      endAmPmSelect.val(endAmPm);
      venueInput.val(event.venue);
      venueAddressInput.val(event.venueAddress);
      venueWebsiteInput.val(event.venueWebsite);
      venueInstagramInput.val(event.venueInstagram);
      isPublishedInput.val(event.isPublished);
      isPresenterSignupOnlyInput.val(event.isPresenterSignupOnly);
      isAttendeeSignupOnlyInput.val(event.isAttendeeSignupOnly);
      googleMapsUrlInput.val(event.googleMapsUrl);
      notesInput.val(event.notes);
      eventDateContainer.show();
      displayDateSpan.text(dateHelper.getFormattedDateRange(startDate, endDate));
      changeShowingEventButton(true);
      eventListener.fire('ShowCreateEventEntry');
    },
    changeShowingEventButton = function (wantEdit) {
      if (wantEdit) {
        addEventButton.hide();
        cancelAddEventButton.hide();
        updateEventButton.show();
        cancelUpdateEventButton.show();
        return;
      }
      addEventButton.show();
      cancelAddEventButton.show();
      updateEventButton.hide();
      cancelUpdateEventButton.hide();
    },
    modifyEvent = function (event) {
      const callback = function (response) {
        if (!response.success) {
          eventListener.fire('Failure', [response.message]);
          return;
        }
        eventListener.fire('Success', [response.message]);
        initializeEventEntryControls();
        eventListener.fire('RefreshEventsTable');
      };
      dataStore.eventStore.modifyBaseEvent(event, callback);
    },
    cancelAddEvent = function () {
      initializeEventEntryControls();
      eventListener.fire('ShowListEventsSection');
    },
    addEvent = function (event) {
      const callback = function (response) {
        if (!response.success) {
          eventListener.fire('Failure', [response.message]);
          return;
        }
        eventListener.fire('Success', [response.message]);
        initializeEventEntryControls();
        eventListener.fire('RefreshEventsTable');
        eventListener.fire('ShowListEventsSection');
      };
      dataStore.eventStore.addEvent(event, callback);
    },
    getDays = function () {
      return dateHelper.getDays(monthSelect.val(), getYear());
    },
    getYears = function () {
      return dateHelper.getYears(currentYear - 10);
    },
    updateDaySelect = function () {
      htmlHelper.fillSelectFromList(daySelect, '', getDays(), ' ');
    },
    adjustDaySelectForLeapYear = function () {
      if (dateHelper.isLeapYear(getYear())) {
        htmlHelper.fillSelectFromList(daySelect, '', getDays(), ' ');
      }
    },
    initializePafaSpecificFields = function (e) {
      const target = $(e.target),
        venueTest = target.val().toLowerCase(),
        opacity = '0.8';
      if (venueTest.startsWith('pafa')) {
        startHourSelect.val('10');
        startMinuteSelect.val('00');
        startAmPmSelect.val('AM');
        endHourSelect.val('12');
        endMinuteSelect.val('00');
        endAmPmSelect.val('PM');
        venueInput.val('PAFA - Pennsylvania Academy of the Fine Art');
        venueAddressInput.val('128 N. Broad Street, Philly');
        googleMapsUrlInput.val('https://maps.app.goo.gl/AL8SnCRQFQjhMgkf7');
        venueWebsiteInput.val('https://www.pafa.org');
        venueInstagramInput.val('https://www.instagram.com/pafacademy');
        htmlHelper.disableControl(startHourSelect, opacity);
        htmlHelper.disableControl(startMinuteSelect, opacity);
        htmlHelper.disableControl(startAmPmSelect, opacity);
        htmlHelper.disableControl(endHourSelect, opacity);
        htmlHelper.disableControl(endMinuteSelect, opacity);
        htmlHelper.disableControl(endAmPmSelect, opacity);
        htmlHelper.disableControl(venueInput, opacity);
        htmlHelper.disableControl(venueAddressInput, opacity);
        htmlHelper.disableControl(googleMapsUrlInput, opacity);
        htmlHelper.disableControl(venueWebsiteInput, opacity);
        htmlHelper.disableControl(venueInstagramInput, opacity);
      }
    },
    initializeEventEntryControls = function () {
      eventDateContainer.hide();
      htmlHelper.disableControl(addEventButton);
      eventIdHidden.val('');
      daySelect.val('');
      monthSelect.val('');
      yearSelect.val(currentYear);
      startHourSelect.val('');
      startMinuteSelect.val('');
      startAmPmSelect.val('');
      endHourSelect.val('');
      endMinuteSelect.val('');
      startAmPmSelect.val('');
      endAmPmSelect.val('');
      venueInput.val('');
      venueAddressInput.val('');
      venueWebsiteInput.val('');
      venueInstagramInput.val('');
      isPublishedInput.val('');
      isPresenterSignupOnlyInput.val('');
      isAttendeeSignupOnlyInput.val('');
      googleMapsUrlInput.val('');
      notesInput.val('');
      adminErrorSpan.text('');
      htmlHelper.setErrorCondition($('.startDatePart'), adminErrorSpan, '');
      htmlHelper.setErrorCondition($('.endDatePart'), adminErrorSpan, '');
      htmlHelper.setErrorCondition(venueInput, adminErrorSpan, '');
      htmlHelper.setErrorCondition(venueAddressInput, adminErrorSpan, '');
      changeShowingEventButton(false);
      eventListener.fire('ShowCreateEventEntry');
    },
    eventIsValid = function (eventStartDate, eventEndDate, venue, venueAddress) {
      const currentDateTime = new Date(),
        startDateIsValid = dateHelper.isValidDate(eventStartDate),
        endDateIsValid = dateHelper.isValidDate(eventEndDate),
        venueHasBeenEntered = venue && venue.trim().length > 0,
        venueAddressHasBeenEntered = venueAddress && venueAddress.trim().length > 0,
        eventId = getEventId();
      htmlHelper.setErrorCondition($('.startDatePart'), adminErrorSpan, '');
      htmlHelper.setErrorCondition($('.endDatePart'), adminErrorSpan, '');
      htmlHelper.setErrorCondition(venueInput, adminErrorSpan, '');
      htmlHelper.setErrorCondition(venueAddressInput, adminErrorSpan, '');
      if (!startDateIsValid) {
        htmlHelper.setErrorCondition($('.startDatePart'), adminErrorSpan, 'The start date and time are not valid');
        return false;
      }
      if (!endDateIsValid) {
        htmlHelper.setErrorCondition($('.endDatePart'), adminErrorSpan, 'The end date and time are not valid');
        return false;
      }
      if (eventEndDate <= eventStartDate) {
        htmlHelper.setErrorCondition($('.endDatePart'), adminErrorSpan, 'The end date cannot be earlier than the start date');
        return false;
      }
      if (!eventId && eventStartDate < currentDateTime) {
        htmlHelper.setErrorCondition($('.startDatePart'), adminErrorSpan, 'The start date cannot be earlier than the current date');
        return false;
      }
      if (!venueHasBeenEntered) {
        htmlHelper.setErrorCondition(venueInput, adminErrorSpan, 'The venue is required');
        return false;
      }
      if (!venueAddressHasBeenEntered) {
        htmlHelper.setErrorCondition(venueAddressInput, adminErrorSpan, 'The venue address is required');
        return false;
      }
      return true;
    },
    validateAndUpdateEvent = function () {
      userSession.userIsLoggedIn(function (email) {
        if (!email) {
          eventListener.fire('Failure', [userLoginErrorMessage]);
          return;
        }
        const event = createEvent();
        if (eventIsValid(getStartDate(), getEndDate(), getVenue(), getVenueAddress())) {
          modifyEvent(event);
          displayPersistedEvent(event);
        }
      });
    },
    validateAndAddEvent = function () {
      userSession.userIsLoggedIn(function (email) {
        if (!email) {
          eventListener.fire('Failure', [userLoginErrorMessage]);
          return;
        }
        const event = createEvent();
        if (eventIsValid(getStartDate(), getEndDate(), getVenue(), getVenueAddress())) {
          addEvent(event);
        }
      });
    },
    validate = function () {
      const eventStartDate = getStartDate(),
        eventEndDate = getEndDate();
      htmlHelper.disableControl(addEventButton);
      displayDateSpan.text('');
      eventDateContainer.hide();
      tbdSpan.show();
      if (eventIsValid(eventStartDate, eventEndDate, getVenue(), getVenueAddress())) {
        displayDateSpan.text(dateHelper.getFormattedDateRange(eventStartDate, eventEndDate));
        eventDateContainer.show();
        tbdSpan.hide();
        htmlHelper.enableControl(addEventButton, () => validateAndAddEvent());
      }
    },
    initializeControls = function () {
      eventDateContainer.hide();
      displayDateSpan.text('');
      htmlHelper.fillSelectFromList(daySelect, '', getDays(), ' ');
      htmlHelper.fillSelectFromList(monthSelect, '', oneToTwelveArray, ' ');
      htmlHelper.fillSelectFromList(yearSelect, '', getYears(), ' ');
      yearSelect.val(currentYear);
      htmlHelper.fillSelectFromList(startHourSelect, '', oneToTwelveArray, ' ');
      htmlHelper.fillSelectFromList(startMinuteSelect, '', quarterHours, ' ');
      htmlHelper.fillSelectFromList(startAmPmSelect, '', amPmArray, ' ');
      htmlHelper.fillSelectFromList(endHourSelect, '', oneToTwelveArray, ' ');
      htmlHelper.fillSelectFromList(endMinuteSelect, '', quarterHours, ' ');
      htmlHelper.fillSelectFromList(endAmPmSelect, '', amPmArray, ' ');
      changeShowingEventButton(false);
    },
    revertToPersistedEvent = function () {
      const eventId = getEventId(),
        callback = function (event) {
          displayPersistedEvent(event);
        };
      if (eventId) {
        dataStore.eventStore.fetchEvent(eventId, callback);
      }
    },
    assignEventHandlers = function () {
      monthSelect.on('change', updateDaySelect);
      yearSelect.on('change', adjustDaySelectForLeapYear);
      updateEventButton.on('click', () => validateAndUpdateEvent());
      cancelAddEventButton.on('click', cancelAddEvent);
      cancelUpdateEventButton.on('click', revertToPersistedEvent);
      datePartSelects.on('change', validate);
      eventInputs.on('change', validate);
      venueInput.on('blur', initializePafaSpecificFields);
    },
    initializeEventListener = function () {
      eventListener.addListener('InitializeEventEntryControls', initializeEventEntryControls);
      eventListener.addListener('DisplayPersistedEvent', displayPersistedEvent);
    };
  initializeEventListener();
  initializeControls();
  assignEventHandlers();
};