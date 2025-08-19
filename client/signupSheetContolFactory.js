/* globals $ */
exports.initialize = function (htmlHelper) {
  'use strict';
  const setClick = htmlHelper.setClick,
    createSignupButtonContainer = function () {
      return htmlHelper.createContainer('signUpButtonContainer');
    },
    createSignupButtonsContainer = function () {
      return htmlHelper.createContainer('signUpButtonsContainer');
    },
    createSignUpToAttendButton = function (event, userHasSignedUpToAttend, clickFunction) {
      const container = createSignupButtonContainer(),
        label = htmlHelper.createSpan('I will attend'),
        button = htmlHelper.createSpan(userHasSignedUpToAttend ? 'X' : '', 'fauxCheckbox');
      container.append([label, button]);
      setClick(button, { event: event }, clickFunction);
      return container;
    },
    createMustWaitToSignInButton = function (waitToSignupDate) {
      const container = createSignupButtonContainer(),
        buttonText = `We have opened early sign up for newcomers and infrequent attendees.  General signup will begin on ${waitToSignupDate}.`,
        button = htmlHelper.createSpan(buttonText, 'directive');
      container.append(button);
      return container;
    },
    createSignUpToPresentButton = function (event, userHasSignedUpToAttend, userHasSignedUpToPresent, eventId, waitlist, clickFunction) {
      const container = createSignupButtonContainer(),
        label = htmlHelper.createSpan('I will present'),
        button = htmlHelper.createSpan(userHasSignedUpToPresent ? 'X' : '', 'fauxCheckbox');
      container.append([label, button]);
      setClick(button, { event: event }, clickFunction);
      return container;
    },
    createAddToWaitlistButton = function (event, userIsOnWaitlist, memberIsAttendee, isPresenterSignupOnly, clickFunction) {
      const container = createSignupButtonContainer(),
        label = htmlHelper.createSpan('Waitlist me to present'),
        button = htmlHelper.createSpan(userIsOnWaitlist ? 'X' : '', 'fauxCheckbox');
      container.append([label, button]);
      if (!memberIsAttendee && !isPresenterSignupOnly) {
        htmlHelper.disableControl(button);
        return container;
      }
      setClick(button, { event: event }, clickFunction);
      return container;
    },
    createNewsContainer = function (news) {
      const newsContainer = htmlHelper.createContainer('eventContainer'),
        newsSpan = htmlHelper.createSpan().html(news);
      newsContainer.append(newsSpan);
      return newsContainer;
    },
    createCritIsPresenterSignupOnlyMessage = function () {
      htmlHelper.createContainer('signupMessageContainer').text('This crit only allows sign-up for people who want to present their work and have not presented in the last four months.');
    },
    createRequestEmailWhenCancellationButton = function (clickFunction) {
      const container = createSignupButtonContainer(),
        message = 'Sorry, this crit is full.',
        prefix = $('<span>').text(message + '. Click '),
        button = $('<span>').addClass('clickableSpan').text(' HERE '),
        suffix = $('<span>').text(' to be sent an email if someone cancels.');
      container.append([prefix, button, suffix]);
      setClick(button, clickFunction);
      return container;
    };
  return {
    createSignupButtonsContainer: createSignupButtonsContainer,
    createMustWaitToSignInButton: createMustWaitToSignInButton,
    createSignupButtonContainer: createSignupButtonContainer,
    createSignUpToAttendButton: createSignUpToAttendButton,
    createSignUpToPresentButton: createSignUpToPresentButton,
    createAddToWaitlistButton: createAddToWaitlistButton,
    createRequestEmailWhenCancellationButton: createRequestEmailWhenCancellationButton,
    createNewsContainer: createNewsContainer,
    createCritIsPresenterSignupOnlyMessage: createCritIsPresenterSignupOnlyMessage
  };
};