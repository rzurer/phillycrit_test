/* globals $ */
exports.initialize = function (eventListener, dataStore, userSession, attendeeClerk, attendeesTableFactory, arrayHelper, dateHelper, htmlHelper) {
  'use strict';
  const setClick = htmlHelper.setClick,
    userLoginErrorMessage = 'There is no logged in user. Please log in again',
    currentEventSection = $('#currentEventSection'),
    noEventsScheduledSpan = $('#noEventsScheduledSpan'),
    signupSelect = $('#signupSelect'),
    signupMessageSpan = $('.signupMessageSpan'),
    getSelectedEventId = function () {
      return signupSelect.val();
    },
    getDisplaySignupError = function () {
      return $('#displaySignupError');
    },
    memberIsAttendee = function (event, email) {
      const attendees = arrayHelper.getSafeArray(event.attendees);
      return attendees && attendees.map(a => a.email.toLowerCase()).includes(email.toLowerCase());
    },
    displayMessage = function (error) {
      const displayControl = getDisplaySignupError();
      displayControl.text('');
      displayControl.text(error);
      displayControl.fadeIn(800).delay(2500).fadeOut(800);
    },
    getPresentationSpotsLeft = function (eventId, callback) {
      const configCallback = function (config) {
        dataStore.eventStore.fetchEvent(eventId, (event) => {
          const attendees = arrayHelper.getSafeArray(event.attendees),
            presenters = attendees.filter(a => a.isPresenting === 'Y');
          callback(Number(config.maximumPresentationSpots) - Number(presenters.length));
        });
      };
      dataStore.configurationStore.fetchConfiguration(configCallback);
    },
    getAttendeeSpotsLeft = function (eventId, callback) {
      const configCallback = function (config) {
        dataStore.eventStore.fetchEvent(eventId, (event) => {
          const attendees = arrayHelper.getSafeArray(event.attendees);
          callback(config.maximumAttendeeSpots - attendees.length);
        });
      };
      dataStore.configurationStore.fetchConfiguration(configCallback);
    },
    getNews = function (callback) {
      dataStore.fetchNews(function (response) {
        callback(response.payload);
      });
    },
    createMustWaitToSignInButton = function (waitToSignupDate, shouldDisplayLongMessage) {
      const shortMessage = `General signup will begin on ${waitToSignupDate}.`,
        longMessage = `We have opened early sign up for newcomers and infrequent attendees.  ${shortMessage}`,
        message = shouldDisplayLongMessage ? longMessage : shortMessage,
        container = htmlHelper.createContainer('signUpButtonContainer'),
        button = $('<span>').addClass('directive').text(message);
      container.append(button);
      return container;
    },
    createSignUpToAttendButton = function (event, userHasSignedUpToAttend) {
      const container = htmlHelper.createContainer('signUpButtonContainer'),
        label = $('<span>').text('I will attend'),
        button = $('<span>').attr('id', 'signUpToAttendButton').addClass('fauxCheckbox').text(userHasSignedUpToAttend ? 'X' : ''),
        clickFunction = userHasSignedUpToAttend ? attendeeClerk.cancelSignUpToAttend : attendeeClerk.signUpToAttend;
      container.append([label, button]);
      setClick(button, { event: event }, clickFunction);
      return container;
    },
    createSignUpToPresentButton = function (event, userHasSignedUpToAttend, userHasSignedUpToPresent, eventId, waitlist) {
      const container = htmlHelper.createContainer('signUpButtonContainer'),
        label = $('<span>').text('I will present'),
        button = $('<span>').attr('id', 'signUpToPresentButton').addClass('fauxCheckbox').text(userHasSignedUpToPresent ? 'X' : ''),
        clickFunction = userHasSignedUpToPresent ? attendeeClerk.declineToPresent : attendeeClerk.signUpToPresent;
      container.append([label, button]);
      setClick(button, { event: event }, clickFunction);
      return container;
    },
    createAddToWaitlistButton = function (event, userIsOnWaitlist, memberIsAttendee, isPresenterSignupOnly) {
      const container = htmlHelper.createContainer('signUpButtonContainer'),
        label = $('<span>').text('Waitlist me to present'),
        button = $('<span>').attr('id', 'addToWaitListButton').addClass('fauxCheckbox').text(userIsOnWaitlist ? 'X' : ''),
        getClickFunction = function () {
          if (isPresenterSignupOnly) {
            return userIsOnWaitlist ? attendeeClerk.removeFromPresenterSignupOnlyWaitlist : attendeeClerk.addToPresenterSignupOnlyWaitlist;
          }
          return userIsOnWaitlist ? attendeeClerk.removeFromWaitlist : attendeeClerk.addToWaitlist;
        },
        clickFunction = getClickFunction();
      container.append([label, button]);
      if (!memberIsAttendee && !isPresenterSignupOnly) {
        htmlHelper.disableControl(button);
        return container;
      }
      setClick(button, { event: event }, clickFunction);
      return container;
    },
    askForNotification = function () {
      userSession.userIsLoggedIn(function (email) {
        if (!email) {
          eventListener.fire('Failure', [userLoginErrorMessage]);
          return;
        }
        const feedback = {
          email: email,
          createDate: new Date(),
          entry: 'Email me if an attendee spot becomes available'
        };
        dataStore.feedbackStore.addFeedback(feedback, () => {
          const displayControl = getDisplaySignupError();
          displayControl.text('');
          displayControl.text('Thanks, we will send you an email if someone cancels.');
          displayControl.fadeIn(800).delay(3000).fadeOut(800, () => {
            eventListener.fire('FeedbackSubmitted');
          });
        });
      });
    },
    createRequestEmailWhenCancellationButton = function () {
      const message = 'Sorry, this crit is full.',
        prefix = $('<span>').text(message + '. Click '),
        button = $('<span>').addClass('clickableSpan').text(' HERE '),
        suffix = $('<span>').text(' to be sent an email if someone cancels.'),
        container = htmlHelper.createContainer('signUpButtonContainer');
      container.append([prefix, button, suffix]);
      setClick(button, askForNotification);
      return container;
    },
    shouldDisplayWaitToSignupMessage = function (memberIsAttending, attendeeCount, memberMustWaitToSignUp, waitToSignupDate, newcomerSpotsReserved) {
      const currentDateIsEqualToWaitToSignupDate = dateHelper.compareCurrentDateToChosenDate(waitToSignupDate, 'equal'),
        currentDateIsAfterWaitToSignupDate = dateHelper.compareCurrentDateToChosenDate(waitToSignupDate, 'after'),
        waitToSignupDateHasPassed = currentDateIsEqualToWaitToSignupDate || currentDateIsAfterWaitToSignupDate,
        newcomerSpotsHaveAlreadyBeenFilled = attendeeCount >= newcomerSpotsReserved;
      if (memberIsAttending) {
        return false;
      }
      if (waitToSignupDateHasPassed) {
        return false;
      }
      if (memberMustWaitToSignUp || newcomerSpotsHaveAlreadyBeenFilled) {
        return true;
      }
      return false;
    },
    createSignupButtonsContainer = function (event, loggedInMemberEmail, presentationSpotsLeft,
      attendeeSpotsLeft, memberMustWaitToSignUp, waitToSignupDate, newcomerSpotsReserved, memberMustWaitToPresent) {
      const theCritIsFull = attendeeSpotsLeft <= 0,
        thePresentationSpotsAreFilled = presentationSpotsLeft <= 0,
        isAttendeeSignupOnly = event.isAttendeeSignupOnly === 'Y',
        isPresenterSignupOnly = event.isPresenterSignupOnly === 'Y',
        attendees = arrayHelper.getSafeArray(event.attendees),
        emails = attendees.map(x => x.email),
        presenters = attendees.filter(x => x.isPresenting === 'Y').map(e => e.email),
        userHasSignedUpToAttend = emails && emails.includes(loggedInMemberEmail),
        userIsOnWaitlist = event.waitlist && event.waitlist.includes(loggedInMemberEmail),
        userHasSignedUpToPresent = presenters && presenters.includes(loggedInMemberEmail) && !userIsOnWaitlist,
        signUpButtonsContainer = $('<div>').attr('id', 'signUpButtonsContainer').addClass('signUpButtonsContainer'),
        signUpToAttendButton = createSignUpToAttendButton(event, userHasSignedUpToAttend),
        signUpToPresentButton = createSignUpToPresentButton(event, userHasSignedUpToAttend, userHasSignedUpToPresent, event.eventId, event.waitlist || []),
        addToWaitListButton = createAddToWaitlistButton(event, userIsOnWaitlist, memberIsAttendee(event, loggedInMemberEmail), isPresenterSignupOnly),
        emailWhenAttendeeCancelsButton = createRequestEmailWhenCancellationButton(false),
        critIsPresenterSignupOnlyMessage = htmlHelper.createContainer('signupMessageContainer').text('This crit only allows sign-up for people who want to present their work and have not presented in the last four months.'),
        attendeeCount = event.attendees.length,
        memberIsAttending = event.attendees.map((a) => a.email).includes(loggedInMemberEmail);
      if (isPresenterSignupOnly) {
        signUpButtonsContainer.append(critIsPresenterSignupOnlyMessage);
        if (memberMustWaitToPresent && !userHasSignedUpToPresent) {
          return signUpButtonsContainer;
        }
        if (!thePresentationSpotsAreFilled || userHasSignedUpToPresent) {
          signUpButtonsContainer.append(signUpToPresentButton);
          return signUpButtonsContainer;
        }
        signUpButtonsContainer.append([addToWaitListButton]);
        return signUpButtonsContainer;
      }
      if (shouldDisplayWaitToSignupMessage(memberIsAttending, attendeeCount, memberMustWaitToSignUp, waitToSignupDate, newcomerSpotsReserved)) {
        const shouldDisplayLongMessage = attendeeCount < newcomerSpotsReserved,
          mustWaitToSignInButton = createMustWaitToSignInButton(waitToSignupDate, shouldDisplayLongMessage);
        signUpButtonsContainer.append(mustWaitToSignInButton);
        return signUpButtonsContainer;
      }
      if (theCritIsFull && !userHasSignedUpToAttend) {
        signUpButtonsContainer.append(emailWhenAttendeeCancelsButton);
        return signUpButtonsContainer;
      }
      if (isAttendeeSignupOnly) {
        signUpButtonsContainer.append([signUpToAttendButton]);
        return signUpButtonsContainer;
      }
      if (memberMustWaitToPresent) {
        signUpButtonsContainer.append([signUpToAttendButton]);
        return signUpButtonsContainer;
      }
      if ((thePresentationSpotsAreFilled && !userHasSignedUpToPresent) || userIsOnWaitlist) {
        signUpButtonsContainer.append([signUpToAttendButton, addToWaitListButton]);
        return signUpButtonsContainer;
      }
      signUpButtonsContainer.append([signUpToAttendButton, signUpToPresentButton]);
      return signUpButtonsContainer;
    },
    createEventAttendeesContainer = function (event, attendingMembersArray, loggedInMemberEmail, presentationSpotsLeft,
      attendeeSpotsLeft, loggedInMemberIsAdmin, memberMustWaitToSignUp, waitToSignupDate, newcomerSpotsReserved, memberMustWaitToPresent) {
      const eventAttendeesContainer = $('<div>').attr('id', 'eventAttendeesContainer').addClass('eventContainer'),
        displaySignupError = $('<span>').attr('id', 'displaySignupError'),
        attendees = arrayHelper.getSafeArray(event.attendees);
      if (attendees.length === 0) {
        if (!event.isPresenterSignupOnly === 'Y') {
          eventAttendeesContainer.append($('<span>').text('Nobody has signed up as yet, be the first.'));
        }
        eventAttendeesContainer.append(createSignupButtonsContainer(event, loggedInMemberEmail, presentationSpotsLeft,
          attendeeSpotsLeft, memberMustWaitToSignUp, waitToSignupDate, newcomerSpotsReserved, memberMustWaitToPresent));
        return eventAttendeesContainer;
      }
      eventAttendeesContainer.append(displaySignupError);
      eventAttendeesContainer.append(createSignupButtonsContainer(event, loggedInMemberEmail, presentationSpotsLeft,
        attendeeSpotsLeft, memberMustWaitToSignUp, waitToSignupDate, newcomerSpotsReserved, memberMustWaitToPresent));
      eventAttendeesContainer.append(attendeesTableFactory.createEventAttendeesTable(attendingMembersArray, loggedInMemberEmail, presentationSpotsLeft, event, loggedInMemberIsAdmin));
      return eventAttendeesContainer;
    },
    createNewsContainer = function (news) {
      const newsContainer = $('<div>').attr('id', 'newsContainer').addClass('eventContainer'),
        newsSpan = $('<span>').attr('id', 'news').html(news);
      newsContainer.append(newsSpan);
      return newsContainer;
    },
    createEventInfoContainer = function (event, duration) {
      const eventInfoContainer = $('<div>').attr('id', 'eventInfoContainer').addClass('eventContainer');
      eventInfoContainer.append($('<input>').attr({ id: 'hiddenEventId', type: 'hidden' }).val(event.eventId));
      eventInfoContainer.append($('<div>').addClass('line'));
      eventInfoContainer.append($('<span>').attr('id', 'jump-to-event-detail').text('When:').addClass('fieldLabel'));
      eventInfoContainer.append($('<span>').css('font-weight', 'bold').text(duration));
      eventInfoContainer.append($('<div>').addClass('line'));
      eventInfoContainer.append($('<span>').text('Venue:').addClass('fieldLabel'));
      eventInfoContainer.append($('<span>').text(event.venue));
      if (event.venueWebsite) {
        eventInfoContainer.append($('<a>').addClass('clearBoth')
          .attr({ 'id': 'venueWebsiteAnchor', 'href': event.venueWebsite, 'target': '_blank', 'title': event.venueWebsite })
          .text('Website'));
      }
      if (event.venueInstagram) {
        eventInfoContainer.append($('<a>')
          .attr({ 'id': 'venueInstagramAnchor', 'href': event.venueInstagram, 'target': '_blank', 'title': event.venueInstagram })
          .text('Instagram'));
      }
      eventInfoContainer.append($('<div>').addClass('line'));
      eventInfoContainer.append($('<span>').text('Address:').addClass('fieldLabel'));
      eventInfoContainer.append($('<a>').attr({ 'id': 'googleMapsLink', 'href': event.googleMapsUrl, 'target': '_blank' }).text(event.venueAddress));
      eventInfoContainer.append($('<div>').addClass('line'));
      if (event.notes) {
        eventInfoContainer.append($('<div>').addClass('line'));
        eventInfoContainer.append($('<span>').text('Notes:').addClass('fieldLabel notesLabel'));
        eventInfoContainer.append($('<span>').addClass('notesContent').html(event.notes));
      }
      return eventInfoContainer;
    },
    getAdjustedDuration = function (duration) {
      const indexOfNoon = duration.indexOf('12:00 PM'),
        indexOfTo = duration.indexOf(' to ');
      if (indexOfNoon === -1) {
        return duration;
      }
      return duration.substring(0, indexOfTo) + ' to Noon';
    },
    createEventDisplay = function (event, attendingMembersArray, loggedInMemberEmail, presentationSpotsLeft, attendeeSpotsLeft,
      news, wantReadOnlyAttendees, loggedInMemberIsAdmin, memberMustWaitToSignUp, waitToSignupDate, newcomerSpotsReserved, memberMustWaitToPresent) {
      const container = $('<div>').addClass('eventDisplay');
      if (news) {
        container.append(createNewsContainer(news));
      }
      container.append(createEventInfoContainer(event, getAdjustedDuration(event.duration)));
      container.append(createEventAttendeesContainer(event, attendingMembersArray, loggedInMemberEmail, presentationSpotsLeft,
        attendeeSpotsLeft, loggedInMemberIsAdmin, memberMustWaitToSignUp, waitToSignupDate, newcomerSpotsReserved, memberMustWaitToPresent));
      return container;
    },
    getCanSignupEarlyInformation = function (loggedInMemberEmail, callback) {
      dataStore.configurationStore.fetchConfiguration(config => {
        const administratorEmails = config.administratorEmails.split(',');
        dataStore.eventStore.getMembersThatHaveAttendedRecently(config.ineligibleToSignupEarlyMonths, administratorEmails,
          emails => {
            const memberHasAttendedRecently = emails.includes(loggedInMemberEmail),
              waitToSignupDate = config.waitToSignupDate,
              newcomerSpotsReserved = config.newcomerSpotsReserved;
            callback(memberHasAttendedRecently, waitToSignupDate, newcomerSpotsReserved);
          });
      });
    },
    getCanSignupToPresentInformation = function (loggedInMemberEmail, callback) {
      dataStore.configurationStore.fetchConfiguration(config => {
        dataStore.eventStore.getMembersThatHavePresentedRecently(config.ineligibleToPresentMonths,
          emails => {
            const memberHasPresentedRecently = emails.includes(loggedInMemberEmail);
            callback(memberHasPresentedRecently);
          });
      });
    },
    addEventDetailDisplay = function (event, wantReadOnlyAttendees) {
      userSession.loggedInMemberIsAdmin((loggedInMemberIsAdmin) => {
        let getAttendingMembersArrayCallback, getGetLoggedInMemberEmailCallback, getPresentationSpotsLeftCallback,
          getAttendeeSpotsLeftCallback, getNewsCallback, getCanSignupEarlyInformationCallback, getCanSignupToPresentInformationCallback, eventDisplay;
        getAttendingMembersArrayCallback = function (attendingMembersArray) {
          getGetLoggedInMemberEmailCallback = function (loggedInMemberEmail) {
            if (!loggedInMemberEmail) {
              eventListener.fire('Failure', [userLoginErrorMessage]);
              return;
            }
            getPresentationSpotsLeftCallback = function (presentationSpotsLeft) {
              getAttendeeSpotsLeftCallback = function (attendeeSpotsLeft) {
                getNewsCallback = function (news) {
                  getCanSignupEarlyInformationCallback = function (memberMustWaitToSignUp, waitToSignupDate, newcomerSpotsReserved) {
                    getCanSignupToPresentInformationCallback = function (memberMustWaitToPresent) {
                      eventDisplay = createEventDisplay(event, attendingMembersArray, loggedInMemberEmail, presentationSpotsLeft, attendeeSpotsLeft,
                        news, wantReadOnlyAttendees, loggedInMemberIsAdmin, memberMustWaitToSignUp, waitToSignupDate, newcomerSpotsReserved, memberMustWaitToPresent);
                      currentEventSection.empty();
                      currentEventSection.append(eventDisplay);
                      currentEventSection.show();
                    };
                    getCanSignupToPresentInformation(loggedInMemberEmail, getCanSignupToPresentInformationCallback);
                  };
                  getCanSignupEarlyInformation(loggedInMemberEmail, getCanSignupEarlyInformationCallback);
                };
                getNews(getNewsCallback);
              };
              getAttendeeSpotsLeft(event.eventId, getAttendeeSpotsLeftCallback);
            };
            getPresentationSpotsLeft(event.eventId, getPresentationSpotsLeftCallback);
          };
          userSession.userIsLoggedIn(getGetLoggedInMemberEmailCallback);
        };
        dataStore.memberStore.getAttendingMembersArray(event, getAttendingMembersArrayCallback);
      });
    },
    initializeEventDisplayCallback = function (eventsData) {
      let currentEvent;
      noEventsScheduledSpan.hide();
      if (!eventsData || eventsData.length === 0) {
        noEventsScheduledSpan.show();
        signupMessageSpan.hide();
        signupSelect.hide();
        currentEventSection.empty();
        return;
      }
      if (eventsData.length === 1) {
        signupSelect.hide();
        currentEvent = eventsData[0];
      }
      if (eventsData.length > 1) {
        signupSelect.show();
        currentEvent = eventsData.filter(e => e.eventId === getSelectedEventId())[0];
      }
      if (!currentEvent) {
        currentEventSection.empty();
        return;
      }
      addEventDetailDisplay(currentEvent, false);
    },
    initializeEventDisplay = function () {
      signupSelect.hide();
      dataStore.eventStore.fetchEvents((events) => {
        userSession.loggedInMemberIsAdmin((isAdmin) => {
          const eventsData = isAdmin ? dataStore.eventStore.getAllEventsData(events) : dataStore.eventStore.getCurrentEventsData(events);
          initializeEventDisplayCallback(eventsData);
        });
      });
    },
    displayPersistedEvent = function (eventData) {
      addEventDetailDisplay(eventData, true);
      htmlHelper.scrollToAnchor('jump-to-event-detail', -800);
    },
    initializeSignupSelect = function (events) {
      signupSelect.off('change');
      userSession.loggedInMemberIsAdmin((isAdmin) => {
        const eventsData = isAdmin ? dataStore.eventStore.getAllEventsData(events) : dataStore.eventStore.getCurrentEventsData(events);
        htmlHelper.fillSelectFromKeyValuePairs(signupSelect, '', eventsData, '<select a date>', 'eventId', 'startDate');
        signupSelect.on('change', initializeEventDisplay);
      });
    },
    initializeControls = function () {
      dataStore.eventStore.fetchEvents((events) => {
        if (!events || events.length === 0) {
          return;
        }
        initializeSignupSelect(events);
      });
    },
    initializeEventListener = function () {
      eventListener.addListener('DisplayMessage', displayMessage);
      eventListener.addListener('InitializeEventDisplay', initializeEventDisplay);
      eventListener.addListener('InitializeSignupSelect', initializeControls);
      eventListener.addListener('DisplayPersistedEvent', displayPersistedEvent);
    };
  initializeEventListener();
  initializeControls();
};