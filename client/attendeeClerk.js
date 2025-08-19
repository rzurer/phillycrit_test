/* globals $ */
exports.initialize = function (eventListener, dataStore, userSession, arrayHelper, dateHelper, htmlHelper) {
  'use strict';
  const setClick = htmlHelper.setClick,
    userLoginErrorMessage = 'There is no logged in user. Please log in again',
    memberIsAttendee = function (event, email) {
      const attendees = arrayHelper.getSafeArray(event.attendees);
      return attendees && attendees.map(a => a.email.toLowerCase()).includes(email.toLowerCase());
    },
    toggleText = function (control) {
      if (control.text() === 'X') {
        control.text('');
      } else {
        control.text('X');
      }
    },
    modifyUserEvent = function (target, callingFunction, event, email, action, callback) {
      const critDate = dateHelper.getFormattedDate(event.startDate, false, true);
      dataStore.eventStore.modifyUserEvent(event, email, action, critDate, (response) => {
        if (!response.success) {
          eventListener.fire('DisplayMessage', [response.message]);
          eventListener.fire('InitializeEventDisplay');
          if (callback) {
            callback(response);
          }
          if (target && callingFunction) {
            setClick(target, callingFunction);
          }
          return;
        }
        eventListener.fire('InitializeEventDisplay');
        if (callback) {
          callback(response);
        }
        if (target && callingFunction) {
          setClick(target, callingFunction);
        }
      });
    },
    addToWaitlist = function (e) {
      const _id = e.data.event.eventId,
        target = $(e.target),
        callingFunction = addToWaitlist;
      userSession.userIsLoggedIn(function (email) {
        if (!email) {
          eventListener.fire('Failure', [userLoginErrorMessage]);
          return;
        }
        dataStore.eventStore.fetchEvent(_id, (event) => {
          event.waitlist = event.waitlist || [];
          event.attendees = event.attendees || [];
          if (event.waitlist.includes(email) || !memberIsAttendee(event, email)) {
            return;
          }
          const attendee = event.attendees.filter(x => x.email === email)[0];
          event.waitlist.push(email);
          attendee.isPresenting = 'N';
          if (attendee.questionnaire) {
            modifyUserEvent(target, callingFunction, event, email, 'Added to waitlist');
            return;
          }
          eventListener.fire('ShowModalPresenterQuestionnaire', [email, (questionnaire) => {
            if (questionnaire) {
              attendee.questionnaire = questionnaire;
              modifyUserEvent(target, callingFunction, event, email, 'Added to waitlist');
              return;
            }
            if (event.isPresenterSignupOnly === 'Y') {
              removeFromPresenterSignupOnlyWaitlist(e);
            }
          }]);
        });
      });
    },
    addToPresenterSignupOnlyWaitlist = function (e) {
      signUpToAttend(e, () => {
        addToWaitlist(e);
      });
    },
    removeFromPresenterSignupOnlyWaitlist = function (e) {
      cancelSignUpToAttend(e, () => {
        removeFromWaitlist(e);
      });
    },
    removeFromWaitlist = function (e) {
      const _id = e.data.event.eventId,
        target = $(e.target),
        callingFunction = removeFromWaitlist;
      userSession.userIsLoggedIn(function (email) {
        if (!email) {
          eventListener.fire('Failure', [userLoginErrorMessage]);
          return;
        }
        dataStore.eventStore.fetchEvent(_id, (event) => {
          event.waitlist = event.waitlist || [];
          event.attendees = event.attendees || [];
          if (!event.waitlist.includes(email) || !memberIsAttendee(event, email)) {
            return;
          }
          const attendee = event.attendees.filter(x => x.email === email)[0];
          event.waitlist.splice(event.waitlist.indexOf(email), 1);
          attendee.isPresenting = 'N';
          delete attendee.questionnaire;
          modifyUserEvent(target, callingFunction, event, email, 'Removed from waitlist');
        });
      });
    },
    addOrRemoveNoShow = function (e) {
      toggleText($(e.target));
      const target = $(e.target),
        callingFunction = addOrRemoveNoShow,
        isNoShow = target.text() === 'X',
        email = e.data.email,
        event = dataStore.eventStore.createEventFromEventData(e.data.event);
      event.noShows = event.noShows || [];
      if (isNoShow) {
        event.noShows.push(email);
      } else {
        event.noShows.splice(event.noShows.indexOf(email), 1);
      }
      modifyUserEvent(target, callingFunction, event, email, isNoShow ? 'Added to no shows' : 'Removed from no shows');
    },
    signUpOrDeclineToPresent = function (e) {
      toggleText($(e.target));
      const isPresenting = $(e.target).text() === 'X';
      if (isPresenting) {
        signUpToPresent(e);
        return;
      }
      declineToPresent(e);
    },
    signUpToPresent = function (e) {
      const _id = e.data.event.eventId,
        target = $(e.target),
        callingFunction = signUpToPresent;
      userSession.userIsLoggedIn(function (email) {
        if (!email) {
          eventListener.fire('Failure', [userLoginErrorMessage]);
          return;
        }
        dataStore.eventStore.fetchEvent(_id, (event) => {
          event.waitlist = event.waitlist || [];
          event.attendees = event.attendees || [];
          let attendee = event.attendees.filter(x => x.email === email)[0],
            critDate = event.startDate;
          if (!attendee) {
            attendee = { email: email };
            event.attendees.push(attendee);
          }
          attendee.isPresenting = 'Y';
          if (attendee.questionnaire) {
            modifyUserEvent(target, callingFunction, event, email, 'Will present');
            eventListener.fire(target, 'SendOutPresenterConfirmationEmail', [email, critDate]);
            return;
          }
          eventListener.fire('ShowModalPresenterQuestionnaire', [email, (questionnaire) => {
            if (questionnaire) {
              attendee.questionnaire = questionnaire;
              modifyUserEvent(target, callingFunction, event, email, 'Will present');
              eventListener.fire('SendOutPresenterConfirmationEmail', [email, critDate]);
            }
          }]);
        });
      });
    },
    declineToPresent = function (e) {
      const _id = e.data.event.eventId,
        target = $(e.target),
        callingFunction = declineToPresent;
      userSession.userIsLoggedIn(function (email) {
        if (!email) {
          eventListener.fire('Failure', [userLoginErrorMessage]);
          return;
        }
        dataStore.eventStore.fetchEvent(_id, (event) => {
          event.waitlist = event.waitlist || [];
          event.attendees = event.attendees || [];
          const attendee = event.attendees.filter(x => x.email === email)[0];
          attendee.isPresenting = 'N';
          delete attendee.questionnaire;
          if (event.isPresenterSignupOnly === 'Y') {
            event.attendees.splice(event.attendees.indexOf(attendee), 1);
          }
          modifyUserEvent(target, callingFunction, event, email, 'Will not present', () => {
            const waitlist = event.waitlist;
            if (waitlist && waitlist.length > 0) {
              fillPresentingSpotFromWaitlist(event);
            }
          });
        });
      });
    },
    fillPresentingSpotFromWaitlist = function (event) {
      event.waitlist = event.waitlist || [];
      event.attendees = event.attendees || [];
      const email = event.waitlist[0],
        attendee = event.attendees.filter(x => x.email === email)[0];
      event.waitlist.splice(event.waitlist.indexOf(email), 1);
      attendee.isPresenting = 'Y';
      if (attendee.questionnaire) {
        modifyUserEvent('', '', event, email, 'Will present', () => {
          eventListener.fire('SendOutPresenterAddedFromWaitlistEmail', [email, event.startDate]);
        });
        return;
      }
      eventListener.fire('ShowModalPresenterQuestionnaire', [email, (questionnaire) => {
        if (questionnaire) {
          attendee.questionnaire = questionnaire;
          modifyUserEvent('', '', event, email, 'Will present', () => {
            eventListener.fire('SendOutPresenterAddedFromWaitlistEmail', [email, event.startDate]);
          });
        }
      }]);
    },
    signUpToAttend = function (e, callback) {
      const _id = e.data.event.eventId,
        target = $(e.target),
        callingFunction = signUpToAttend;
      userSession.userIsLoggedIn(function (email) {
        if (!email) {
          eventListener.fire('Failure', [userLoginErrorMessage]);
          return;
        }
        dataStore.eventStore.fetchEvent(_id, (event) => {
          event.waitlist = event.waitlist || [];
          event.attendees = event.attendees || [];
          const attendee = { email: email, isPresenting: 'N' };
          if (event.attendees && event.attendees.map(a => a.email.toLowerCase()).includes(email.toLowerCase())) {
            eventListener.fire('DisplayMessage', ['You have already signed up for this event']);
            return;
          };
          event.attendees.push(attendee);
          modifyUserEvent(target, callingFunction, event, email, 'Will attend', callback);
        });
      });
    },
    cancelSignUpToAttend = function (e) {
      const _id = e.data.event.eventId,
        target = $(e.target),
        callingFunction = cancelSignUpToAttend;
      userSession.userIsLoggedIn(function (email) {
        if (!email) {
          eventListener.fire('Failure', [userLoginErrorMessage]);
          return;
        }
        dataStore.eventStore.fetchEvent(_id, (event) => {
          event.waitlist = event.waitlist || [];
          event.attendees = event.attendees || [];
          const attendee = event.attendees.filter(x => x.email === email)[0],
            attendeeIsOnWaitlist = event.waitlist.indexOf(email) >= 0,
            attendeeIsPresenting = attendee.isPresenting === 'Y';
          if (attendeeIsOnWaitlist) {
            event.waitlist.splice(event.waitlist.indexOf(email), 1);
          }
          event.attendees.splice(event.attendees.indexOf(attendee), 1);
          modifyUserEvent(target, callingFunction, event, email, 'Will not attend', () => {
            if (attendeeIsPresenting && event.waitlist && event.waitlist.length > 0) {
              fillPresentingSpotFromWaitlist(event);
            }
          });
        });
      });
    };
  return {
    addOrRemoveNoShow: addOrRemoveNoShow,
    signUpOrDeclineToPresent: signUpOrDeclineToPresent,
    removeFromWaitlist: removeFromWaitlist,
    removeFromPresenterSignupOnlyWaitlist: removeFromPresenterSignupOnlyWaitlist,
    signUpToAttend: signUpToAttend,
    signUpToPresent: signUpToPresent,
    declineToPresent: declineToPresent,
    addToWaitlist: addToWaitlist,
    addToPresenterSignupOnlyWaitlist: addToPresenterSignupOnlyWaitlist,
    cancelSignUpToAttend: cancelSignUpToAttend
  };
};