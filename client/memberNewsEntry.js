/* globals $ */
exports.initialize = function (eventListener, dataStore, userSession, dateHelper, htmlHelper) {
  'use strict';
  const userLoginErrorMessage = 'There is no logged in user. Please log in again',
    submitMemberNewsButton = $('#submitMemberNewsButton'),
    cancelSubmitMemberNewsButton = $('#cancelSubmitMemberNewsButton'),
    getTitle = () => {
      return $('#memberNewsExhibitionTitleInput').val();
    },
    getUrl = () => {
      return $('#memberNewsExhibitionUrlInput').val();
    },
    getLocation = () => {
      return $('#memberNewsExhibitionLocationInput').val();
    },
    getVenue = () => {
      return $('#memberNewsExhibitionVenueInput').val();
    },
    getDescription = () => {
      return $('#memberNewsExhibitionDescriptionTextArea').val();
    },
    getOpeningDate = () => {
      const openingDateInput = $('#openingDateInput');
      return openingDateInput.val() ? dateHelper.adjustToLocalTimezone(new Date(openingDateInput.val())).toISOString() : '';
    },
    getClosingDate = () => {
      const closingDateInput = $('#closingDateInput');
      return closingDateInput.val() ? dateHelper.adjustToLocalTimezone(new Date(closingDateInput.val())).toISOString() : '';
    },
    getReceptionDate = () => {
      const receptionDateInput = $('#receptionDateInput');
      return receptionDateInput.val() ? dateHelper.adjustToLocalTimezone(new Date(receptionDateInput.val())).toISOString() : '';
    },
    getReceptionTime = () => {
      return $('#receptionTimeInput').val();
    },
    getClosingReceptionDate = () => {
      const closingReceptionDateInput = $('#closingReceptionDateInput');
      return closingReceptionDateInput.val() ? dateHelper.adjustToLocalTimezone(new Date(closingReceptionDateInput.val())).toISOString() : '';
    },
    getClosingReceptionTime = () => {
      return $('#closingReceptionTimeInput').val();
    },
    constructMemberNews = function (email) {
      return {
        email: email,
        title: getTitle(),
        url: getUrl(),
        location: getLocation(),
        venue: getVenue(),
        description: getDescription(),
        openingDate: getOpeningDate(),
        closingDate: getClosingDate(),
        receptionDate: getReceptionDate(),
        receptionTime: getReceptionTime(),
        closingReceptionDate: getClosingReceptionDate(),
        closingReceptionTime: getClosingReceptionTime(),
        approvalStatus: 'pending'
      };
    },
    clearMemberNewsEntryFields = function () {
      $('.entryField').val('');
      $('.required').css('border', 'none');
    },
    clearError = function (control) {
      control.css('border', 'none');
    },
    indicateError = function (control) {
      control.css('border', '5px dashed red');
    },
    isValid = function (memberNews) {
      let okToSave = true;
      if (!memberNews.title || !memberNews.title.trim().length === 0) {
        indicateError($('#memberNewsExhibitionTitleInput'));
        okToSave = false;
      }
      if (!memberNews.venue || !memberNews.venue.trim().length === 0) {
        indicateError($('#memberNewsExhibitionVenueInput'));
        okToSave = false;
      }
      if (!memberNews.location || !memberNews.location.trim().length === 0) {
        indicateError($('#memberNewsExhibitionLocationInput'));
        okToSave = false;
      }
      if (!memberNews.closingDate) {
        indicateError($('#closingDateInput'));
        okToSave = false;
      }
      return okToSave;
    },
    submitMemberNews = function () {
      userSession.userIsLoggedIn((email) => {
        if (!email) {
          eventListener.fire('Failure', [userLoginErrorMessage]);
          return;
        }
        const memberNews = constructMemberNews(email);
        if (isValid(memberNews)) {
          dataStore.memberNewsStore.addMemberNews(memberNews, (response) => {
            if (response.success) {
              eventListener.fire('Success', [response.message]);
              return;
            }
            eventListener.fire('Failure', [response.message]);
          });
        }
      });
    },
    checkIsValid = function (e) {
      const target = $(e.target);
      if (target.val() && target.val().trim().length > 0) {
        clearError(target);
      } else {
        indicateError(target);
      }
    },
    assignEventHandlers = function () {
      $('#memberNewsExhibitionTitleInput').on('blur', checkIsValid);
      $('#memberNewsExhibitionVenueInput').on('blur', checkIsValid);
      $('#memberNewsExhibitionLocationInput').on('blur', checkIsValid);
      $('#closingDateInput').on('blur', checkIsValid);
      htmlHelper.setClick(submitMemberNewsButton, submitMemberNews);
      htmlHelper.setClick(cancelSubmitMemberNewsButton, clearMemberNewsEntryFields);
    };
  assignEventHandlers();
};