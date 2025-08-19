/* globals $ */
exports.initialize = function (eventListener, dataStore, htmlHelper) {
  'use strict';
  const setClick = htmlHelper.setClick,
    modal = $('#modal'),
    presenterQuestionnaire = $('.presenterQuestionnaire'),
    errorSpans = $('.errorSpan'),
    buttonSections = $('.buttonSection'),
    workflowButtons = $('.workflowButton'),
    presenterQuestionnaireSections = $('.presenterQuestionnaireSection'),
    aimsError = 'Please specify one or more aim.',
    agreeError = 'Please agree to the submission terms.',
    linkError = 'Please provide a link to your images.',
    disabledOpacity = 0.8,
    aimsSection = $('.aimsSection'),
    aimsButtonSection = $('.aimsButtonSection'),
    aimsNextButton = $('#aimsNextButton'),
    critAimCheckboxes = $('.critAimCheckbox'),
    wantOtherCheckbox = $('#wantOtherCheckbox'),
    wantOtherTextarea = $('#wantOtherTextarea'),
    aimErrorSpan = $('#aimErrorSpan'),
    challengesSection = $('.challengesSection'),
    challengesButtonSection = $('.challengesButtonSection'),
    challengesNextButton = $('#challengesNextButton'),
    challengesBackButton = $('#challengesBackButton'),
    critChallengesCheckboxes = $('.critChallengesCheckbox'),
    critChallengesSpans = $('.critChallengesSpan'),
    critAimSpans = $('.critAimSpan'),
    imageLinksSpans = $('.imageLinksSpan'),
    submitFormSpan = $('.submitFormSpan'),
    challengesErrorSpan = $('#challengesErrorSpan'),
    imagesSection = $('.imagesSection'),
    imagesButtonSection = $('.imagesButtonSection'),
    imagesBackButton = $('#imagesBackButton'),
    imagesNextButton = $('#imagesNextButton'),
    imageLinkRadioButtons = $('.imageLinkRadio'),
    linkToImagesInput = $('#linkToImagesInput'),
    useMyWebsiteRadio = $('#useMyWebsiteRadio'),
    useMyWebsiteSpan = $('#useMyWebsiteSpan'),
    useThisLinkRadio = $('#useThisLinkRadio'),
    imageLinkErrorSpan = $('#imageLinkErrorSpan'),
    additionalCommentsTextarea = $('#additionalCommentsTextarea'),
    termsAndConditionsSection = $('.termsAndConditionsSection'),
    termsAndConditionsButtonSection = $('.termsAndConditionsButtonSection'),
    termsAndConditionsBackButton = $('#termsAndConditionsBackButton'),
    termsAndConditionsNextButton = $('#termsAndConditionsNextButton'),
    agreeToTermsCheckbox = $('#agreeToTermsCheckbox'),
    agreeToTermsErrorSpan = $('#agreeToTermsErrorSpan'),
    saveOrCancelQuestionaireBackButton = $('#saveOrCancelQuestionaireBackButton'),
    saveOrCancelQuestionaireButtonSection = $('.saveOrCancelQuestionaireButtonSection'),
    closeButton = $('#closeButton'),
    submitQuestionnaireButton = $('#submitQuestionnaireButton'),
    cancelSubmitQuestionnaireButton = $('#cancelSubmitQuestionnaireButton'),
    enableDisableWantOtherTextArea = function () {
      if ($(this).is(':checked')) {
        htmlHelper.enableControl(wantOtherTextarea);
        wantOtherTextarea.focus();
        return;
      }
      wantOtherTextarea.val('');
      htmlHelper.disableControl(wantOtherTextarea, disabledOpacity);
      wantOtherTextarea.blur();
    },
    enableDisableLinkToImages = function () {
      if (useThisLinkRadio.is(':checked')) {
        htmlHelper.enableControl(linkToImagesInput);
        linkToImagesInput.focus();
      } else {
        htmlHelper.disableControl(linkToImagesInput, disabledOpacity);
        linkToImagesInput.val('');
      }
    },
    showPresenterQuestionnaire = function (email, callback) {
      dataStore.getEnvironment((response) => {
        if (response.payload === 'development') {
          callback({
            'additionalComments': 'test',
            'aims': ['test'],
            'imagesStoreUrl': 'test'
          });
          return;
        }
        modal.empty();
        modal.append(presenterQuestionnaire);
        presenterQuestionnaire.show();
        initializeQuestionnaire(email, callback);
        modal.show();
      });
    },
    getChallenges = function () {
      const challenges = [];
      critChallengesCheckboxes.each(function () {
        if ($(this).is(':checked')) {
          challenges.push($(this).next('span').text());
        }
      });
      return challenges;
    },
    getAims = function () {
      const aims = [];
      critAimCheckboxes.each(function () {
        if ($(this).is(':checked')) {
          aims.push($(this).next('span').text());
        }
      });
      if (wantOtherTextarea.val().trim().length > 0) {
        aims.push(wantOtherTextarea.val().trim());
      }
      return aims;
    },
    hasProvidedAims = function () {
      return getAims().length > 0;
    },
    hasAcceptedChallenges = function () {
      return getChallenges().length === 3;
    },
    imageLinkHasBeenProvided = function () {
      return useMyWebsiteRadio.is(':checked') || linkToImagesInput.val().trim().length > 0;
    },
    hasAgreedToTerms = function () {
      return agreeToTermsCheckbox.is(':checked');
    },
    goToAimsSection = function () {
      presenterQuestionnaireSections.hide();
      buttonSections.hide();
      aimsButtonSection.show();
      aimsSection.show();
    },
    goToChallengesSection = function () {
      htmlHelper.enableControl(challengesBackButton, goToAimsSection);
      presenterQuestionnaireSections.hide();
      buttonSections.hide();
      challengesButtonSection.show();
      challengesSection.show();
    },
    goToImageSection = function () {
      htmlHelper.enableControl(imagesBackButton, goToChallengesSection);
      presenterQuestionnaireSections.hide();
      buttonSections.hide();
      imagesButtonSection.show();
      imagesSection.show();
    },
    goToTermsAndConditionsSection = function () {
      htmlHelper.enableControl(termsAndConditionsBackButton, goToImageSection);
      presenterQuestionnaireSections.hide();
      buttonSections.hide();
      termsAndConditionsButtonSection.show();
      termsAndConditionsSection.show();
    },
    goToSaveQuestionnaire = function () {
      htmlHelper.enableControl(saveOrCancelQuestionaireBackButton, goToTermsAndConditionsSection);
      presenterQuestionnaireSections.hide();
      termsAndConditionsSection.show();
      buttonSections.hide();
      saveOrCancelQuestionaireButtonSection.show();
    },
    checkAimsAreValid = function () {
      if (!hasProvidedAims()) {
        htmlHelper.disableControl(aimsNextButton, disabledOpacity);
        aimErrorSpan.css('color', 'red');
      } else {
        aimErrorSpan.css('color', 'transparent');
        htmlHelper.enableControl(aimsNextButton, goToChallengesSection);
      }
    },
    checkChallengesAreValid = function () {
      if (!hasAcceptedChallenges()) {
        htmlHelper.disableControl(challengesNextButton, disabledOpacity);
        challengesErrorSpan.css('color', 'red');
      } else {
        challengesErrorSpan.css('color', 'transparent');
        htmlHelper.enableControl(challengesNextButton, goToImageSection);
      }
    },
    checkImageLinkIsValid = function () {
      if (!imageLinkHasBeenProvided()) {
        imageLinkErrorSpan.css('color', 'red');
        htmlHelper.disableControl(imagesNextButton, disabledOpacity);
      } else {
        imageLinkErrorSpan.css('color', 'transparent');
        htmlHelper.enableControl(imagesNextButton, goToTermsAndConditionsSection);
      }
    },
    checkTermsAndConditionsAreValid = function (callback) {
      if (!hasAgreedToTerms()) {
        agreeToTermsErrorSpan.css('color', 'red');
        htmlHelper.disableControl(termsAndConditionsNextButton, disabledOpacity);
      } else {
        agreeToTermsErrorSpan.css('color', 'transparent');
        htmlHelper.enableControl(termsAndConditionsNextButton, goToSaveQuestionnaire);
        if (callback) {
          htmlHelper.enableControl(submitQuestionnaireButton, () => submitQuestionnaire(callback));
        }
      }
    },
    submitQuestionnaire = function (callback) {
      const hasCompletedQuestionnaire = hasProvidedAims() && hasAgreedToTerms() && imageLinkHasBeenProvided(),
        questionnaire = {
          aims: getAims(),
          additionalComments: additionalCommentsTextarea.val().trim(),
          imagesStoreUrl: linkToImagesInput.val().trim() || 'Use website or IG'
        };
      if (hasCompletedQuestionnaire) {
        modal.empty();
        modal.hide();
        callback(questionnaire);
      }
    },
    cancelSubmitQuestionnaire = function (callback) {
      modal.empty();
      modal.hide();
      callback();
    },
    adjustPresenterQuestionnaireSize = function () {
      const left = ($(document).width() / 2 - presenterQuestionnaire.width() / 2 - 20) + 'px';
      presenterQuestionnaire.css({ left: left });
    },
    checkUserHasEnteredWebsiteOrInstagram = function (email) {
      dataStore.memberStore.getMemberByEmail(email, (member) => {
        if (!member.website && !member.instagram) {
          useMyWebsiteRadio.hide();
          useMyWebsiteSpan.hide();
        }
      });
    },
    togglePreviousCheckboxChecked = function (e) {
      const checkbox = $(e.target).prev();
      if (checkbox.is(':checked')) {
        checkbox.prop('checked', false);
        checkbox.trigger('change');
        return;
      }
      checkbox.prop('checked', true);
      checkbox.trigger('change');
    },
    initializeQuestionnaire = function (email, callback) {
      const assignPresenterQuestionnaireEventHandlers = function () {
        critAimCheckboxes.on('change', checkAimsAreValid);
        critChallengesCheckboxes.on('change', checkChallengesAreValid);
        setClick(imageLinksSpans, togglePreviousCheckboxChecked);
        setClick(critChallengesSpans, togglePreviousCheckboxChecked);
        setClick(submitFormSpan, togglePreviousCheckboxChecked);
        setClick(critAimSpans, togglePreviousCheckboxChecked);
        wantOtherCheckbox.on('change', enableDisableWantOtherTextArea);
        wantOtherCheckbox.on('change', checkAimsAreValid);
        wantOtherTextarea.on('keyup', checkAimsAreValid);
        critAimCheckboxes.on('change', checkAimsAreValid);
        imageLinkRadioButtons.on('change', enableDisableLinkToImages);
        imageLinkRadioButtons.on('change', checkImageLinkIsValid);
        linkToImagesInput.on('keyup', checkImageLinkIsValid);
        agreeToTermsCheckbox.on('change', () => checkTermsAndConditionsAreValid(callback));
        cancelSubmitQuestionnaireButton.on('click', () => cancelSubmitQuestionnaire(callback));
        setClick(closeButton, () => cancelSubmitQuestionnaire(callback));
      };
      critAimCheckboxes.prop('checked', false);
      critChallengesCheckboxes.prop('checked', false);
      wantOtherCheckbox.prop('checked', false);
      imageLinkRadioButtons.prop('checked', false);
      checkUserHasEnteredWebsiteOrInstagram(email);
      agreeToTermsCheckbox.prop('checked', false);
      workflowButtons.each(() => {
        htmlHelper.disableControl($(this), disabledOpacity);
      });
      wantOtherTextarea.val('');
      linkToImagesInput.val('');
      additionalCommentsTextarea.val('');
      errorSpans.css('color', 'red');
      assignPresenterQuestionnaireEventHandlers(callback);
      goToAimsSection();
    },
    initializeControls = function () {
      aimErrorSpan.text(aimsError);
      agreeToTermsErrorSpan.text(agreeError);
      imageLinkErrorSpan.text(linkError);
      presenterQuestionnaireSections.hide();
      buttonSections.hide();
      goToAimsSection();
      if (!$('#mobileNav').is(':visible')) {
        $(window).trigger('resize');
      }
    },
    assignEventHandlers = function () {
      if ($('#mobileNav').is('visible')) {
        return;
      }
      $(window).on('resize', adjustPresenterQuestionnaireSize);
    },
    initializeEventListener = function () {
      eventListener.addListener('ShowModalPresenterQuestionnaire', showPresenterQuestionnaire);
    };
  assignEventHandlers();
  initializeEventListener();
  initializeControls();
};