/* global initializeLayout:writable, $ */
const eventListener = require('./eventListener').initialize(),
  arrayHelper = require('./arrayHelper').initialize(),
  dateFunctions = require('date-fns'),
  dateHelper = require('./dateHelper').initialize(dateFunctions),
  stringHelper = require('./stringHelper').initialize(),
  regexHelper = require('./regexHelper').initialize(),
  htmlHelper = require('./htmlHelper').initialize(regexHelper),
  ajaxHelper = require('./ajaxHelper').initialize(eventListener),
  sortHelper = require('./sortHelper').initialize(),
  auditStore = require('./auditStore').initialize(eventListener, ajaxHelper, htmlHelper, sortHelper),
  configurationStore = require('./configurationStore').initialize(eventListener, ajaxHelper),
  emailStore = require('./emailStore').initialize(eventListener, ajaxHelper, htmlHelper),
  eventStore = require('./eventStore').initialize(eventListener, ajaxHelper, dateHelper, htmlHelper, sortHelper, arrayHelper),
  feedbackStore = require('./feedbackStore').initialize(eventListener, ajaxHelper, sortHelper),
  memberNewsStore = require('./memberNewsStore').initialize(ajaxHelper, htmlHelper),
  memberStore = require('./memberStore').initialize(eventListener, ajaxHelper, arrayHelper, htmlHelper, sortHelper),
  dataStore = require('./dataStore').initialize(eventListener, ajaxHelper, auditStore, configurationStore, emailStore, eventStore, feedbackStore, memberNewsStore, memberStore),
  crypto = require('crypto'),
  cryptoHelper = require('./cryptoHelper').initialize(crypto, dataStore),
  userSession = require('./userSession').initialize(eventListener, dataStore),
  eventsTableFactory = require('./eventsTableFactory').initialize(eventListener, htmlHelper, dateHelper, dataStore),
  memberExhibitionsFactory = require('./memberExhibitionsFactory').initialize(dataStore, arrayHelper, dateHelper, htmlHelper);
initializeLayout = function (viewName, trigger, encryptedEmail) {
  'use strict';
  const displayControl = $('#display'),
    errorClassname = 'error',
    successClassname = 'success',
    displayXHRFailure = function (jqXHR, textStatus, errorThrown) {
      htmlHelper.display(displayControl, errorThrown, true, errorClassname, successClassname);
      displayControl.fadeIn(800).delay(3000).fadeOut(800);
    },
    displayFailedResponse = function (errorMessage) {
      htmlHelper.display(displayControl, errorMessage, true, errorClassname, successClassname);
      displayControl.fadeIn(800).delay(3000).fadeOut(800);
    },
    displaySuccessResponse = function (message) {
      htmlHelper.display(displayControl, message, false, errorClassname, successClassname);
      displayControl.fadeIn(800).delay(3000).fadeOut(800);
    },
    emailHelper = require('./emailHelper').initialize(eventListener, dataStore, userSession, dateHelper, cryptoHelper, htmlHelper);
  eventListener.removeListener('XHRFailure');
  eventListener.removeListener('Failure');
  eventListener.removeListener('Success');
  eventListener.addListener('XHRFailure', displayXHRFailure);
  eventListener.addListener('Failure', displayFailedResponse);
  eventListener.addListener('Success', displaySuccessResponse);
  if (viewName === 'notAuthorized') {
    $('.warningContainer').on('click', () => {
      window.location.href = '/';
    });
  }
  require('./updateMemberInfo').initialize(eventListener, dataStore, htmlHelper, regexHelper, stringHelper);
  if (viewName === 'unsubscribe') {
    require('./unsubscribe').initialize(eventListener, dataStore, encryptedEmail, cryptoHelper);
  }
  if (viewName === 'home') {
    require('./loginRegister').initialize(eventListener, dataStore, arrayHelper, htmlHelper, regexHelper, stringHelper);
    require('./presentationQuestionnaire').initialize(eventListener, dataStore, htmlHelper);
    require('./membersListFactory').initialize(eventListener, dataStore, dateHelper, htmlHelper, sortHelper);
    require('./memberNewsEntry').initialize(eventListener, dataStore, userSession, dateHelper, htmlHelper);
    const attendeeClerk = require('./attendeeClerk').initialize(eventListener, dataStore, userSession, arrayHelper, dateHelper, htmlHelper),
      attendeesTableFactory = require('./attendeesTableFactory').initialize(htmlHelper, attendeeClerk);
    require('./home').initialize(eventListener, htmlHelper, dataStore, trigger, memberExhibitionsFactory /*, auditTableFactory */);
    require('./signupSheet').initialize(eventListener, dataStore, userSession, attendeeClerk, attendeesTableFactory, arrayHelper, dateHelper, htmlHelper);
    require('./feedback').initialize(eventListener, dataStore, htmlHelper);
  }
  if (viewName === 'admin') {
    const auditTableFactory = require('./auditTableFactory').initialize(htmlHelper, dateHelper, arrayHelper),
      emailInfoCreator = require('./admin/adminEmailInfoCreator').initialize(dataStore);
    require('./admin/adminAudit').initialize(dataStore, auditTableFactory, dateHelper, htmlHelper);
    require('./admin/admin').initialize(eventListener);
    require('./admin/adminMemberNews').initialize(dataStore, arrayHelper, dateHelper, htmlHelper, regexHelper);
    require('./admin/adminTest').initialize(dataStore, dateHelper, emailInfoCreator, emailHelper, htmlHelper);
    require('./admin/adminFeedback').initialize(eventListener, dataStore, dateHelper, htmlHelper);
    require('./admin/adminQuestionnaires').initialize(dataStore, htmlHelper, dateHelper);
    require('./admin/adminCreateEvent').initialize(eventListener, dataStore, userSession, arrayHelper, dateHelper, htmlHelper);
    require('./admin/adminListEvents').initialize(eventListener, dataStore, eventsTableFactory);
    require('./admin/adminSettings.js').initialize(eventListener, dataStore, htmlHelper);
    require('./admin/adminMember.js').initialize(eventListener, dataStore, dateHelper, htmlHelper);
  }
  if (viewName === 'registerFromEmail') {
    require('./registerFromEmail').initialize(eventListener, dataStore, arrayHelper, htmlHelper, regexHelper, stringHelper);
  }
};