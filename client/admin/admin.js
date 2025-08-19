/* globals $ */
exports.initialize = function (eventListener) {
  'use strict';
  const adminContent = $('.adminContent'),
    phillyCritAdminHeader = $('#phillyCritAdminHeader'),
    adminCreateOrUpdateEventSection = $('.adminCreateOrUpdateEventSection'),
    adminEventsListSection = $('.adminEventsListSection'),
    adminMembersSection = $('.adminMembersSection'),
    adminModifySettingsSection = $('.adminModifySettingsSection'),
    adminFeedbackSection = $('.adminFeedbackSection'),
    adminQuestionnairesSection = $('.adminQuestionnairesSection'),
    adminAuditSection = $('.adminAuditSection'),
    adminTestSection = $('.adminTestSection'),
    adminMemberNewsSection = $('.adminMemberNewsSection'),
    adminSections = $('.adminSection'),
    adminEventsListButton = $('#adminEventsListButton'),
    adminMembersButton = $('#adminMembersButton'),
    adminModifySettingsButton = $('#adminModifySettingsButton'),
    adminFeedbackButton = $('#adminFeedbackButton'),
    adminQuestionnaireButton = $('#adminQuestionnaireButton'),
    adminAuditButton = $('#adminAuditButton'),
    adminTestButton = $('#adminTestButton'),
    adminMemberNewsButton = $('#adminMemberNewsButton'),
    showCreateEventEntry = function () {
      adminSections.hide();
      adminCreateOrUpdateEventSection.show();
    },
    showEventsList = function () {
      adminSections.hide();
      adminEventsListSection.show();
    },
    showMembers = function () {
      eventListener.fire('DisplayMemberTable');
      adminSections.hide();
      adminMembersSection.show();
    },
    showTest = function () {
      adminSections.hide();
      adminTestSection.show();
    },
    showMemberNews = function () {
      adminSections.hide();
      adminMemberNewsSection.show();
    },
    showFeedback = function () {
      adminSections.hide();
      adminFeedbackSection.show();
    },
    showQuestionnaires = function () {
      adminSections.hide();
      adminQuestionnairesSection.show();
    },
    showAudits = function () {
      adminSections.hide();
      adminAuditSection.show();
    },
    modifySettings = function () {
      adminSections.hide();
      adminModifySettingsSection.show();
    },
    goToNotAuthorizedView = function () {
      window.location.href = '/notAuthorized';
    },
    initializeControls = function () {
      $('body').css('background-color', 'white');
      const callback = (isLoggedInAsAdmin) => {
        if (isLoggedInAsAdmin) {
          phillyCritAdminHeader.show();
          adminContent.show();
          adminSections.hide();
          adminMembersSection.show();
          return;
        }
        goToNotAuthorizedView();
      };
      eventListener.fire('CheckUserIsLoggedInAsAdmin', [callback]);
    },
    initializeEventListeners = function () {
      eventListener.addListener('ShowCreateEventEntry', showCreateEventEntry);
      eventListener.addListener('ShowListEventsSection', showEventsList);
      eventListener.addListener('HideUpdateMemberInfo', showMembers);
    },
    assignEventHandlers = function () {
      phillyCritAdminHeader.on('click', () => {
        window.location.href = '/';
      });
      adminEventsListButton.on('click', showEventsList);
      adminModifySettingsButton.on('click', modifySettings);
      adminQuestionnaireButton.on('click', showQuestionnaires);
      adminAuditButton.on('click', showAudits);
      adminMembersButton.on('click', showMembers);
      adminFeedbackButton.on('click', showFeedback);
      adminMemberNewsButton.on('click', showMemberNews);
      adminTestButton.on('click', showTest);
    };
  assignEventHandlers();
  initializeEventListeners();
  initializeControls();
};