/* globals FormData, $ */
exports.initialize = async function (eventListener, dataStore, htmlHelper) {
  'use strict';
  const uploadMissionStatementButton = $('#uploadMissionStatementButton'),
    uploadMissionStatementFileInput = $('#uploadMissionStatementFileInput'),
    uploadMissionStatementLabel = $('#uploadMissionStatementLabel'),
    uploadDetailsButton = $('#uploadDetailsButton'),
    uploadDetailsFileInput = $('#uploadDetailsFileInput'),
    uploadDetailsLabel = $('#uploadDetailsLabel'),
    uploadPoliciesButton = $('#uploadPoliciesButton'),
    uploadPoliciesFileInput = $('#uploadPoliciesFileInput'),
    uploadPoliciesLabel = $('#uploadPoliciesLabel'),
    uploadNewsButton = $('#uploadNewsButton'),
    uploadNewsFileInput = $('#uploadNewsFileInput'),
    uploadNewsLabel = $('#uploadNewsLabel'),
    configurationsContainer = $('.configurationsContainer'),
    updateConfigurationButton = $('#updateConfigurationButton'),
    uploadFile = function (uploadButton, uploadFileInput, fileName, url) {
      var formData, file;
      htmlHelper.disableControl(uploadButton);
      file = uploadFileInput.get(0).files[0];
      if (!file) {
        eventListener.fire('Failure', ['No file was chosen to upload']);
        return;
      }
      if (file.name !== fileName) {
        eventListener.fire('Failure', ['The file chosen must be named ' + fileName]);
        return;
      }
      formData = new FormData();
      formData.append(fileName, file);
      dataStore.uploadFiles(url, formData);
    },
    uploadMissionStatement = function () {
      uploadFile(uploadMissionStatementButton, uploadMissionStatementFileInput, 'missionStatement.html', '/uploadMissionStatement');
    },
    uploadDetails = function () {
      uploadFile(uploadDetailsButton, uploadDetailsFileInput, 'details.html', '/uploadDetails');
    },
    uploadPolicies = function () {
      uploadFile(uploadPoliciesButton, uploadPoliciesFileInput, 'policies.html', '/uploadPolicies');
    },
    uploadNews = function () {
      uploadFile(uploadNewsButton, uploadNewsFileInput, 'news.html', '/uploadNews');
    },
    displayMissionStatementUploadFile = function (e) {
      var fileName = e.target.value.split('\\').pop();
      if (fileName) {
        uploadMissionStatementLabel.text(fileName);
        htmlHelper.enableControl(uploadMissionStatementButton, uploadMissionStatement);
      }
    },
    displayDetailsUploadFile = function (e) {
      var fileName = e.target.value.split('\\').pop();
      if (fileName) {
        uploadDetailsLabel.text(fileName);
        htmlHelper.enableControl(uploadDetailsButton, uploadDetails);
      }
    },
    displayPoliciesUploadFile = function (e) {
      var fileName = e.target.value.split('\\').pop();
      if (fileName) {
        uploadPoliciesLabel.text(fileName);
        htmlHelper.enableControl(uploadPoliciesButton, uploadPolicies);
      }
    },
    displayNewsUploadFile = function (e) {
      var fileName = e.target.value.split('\\').pop();
      if (fileName) {
        uploadNewsLabel.text(fileName);
        htmlHelper.enableControl(uploadNewsButton, uploadNews);
      }
    },
    createConfigurationContainer = function (labelText, inputId, inputText, inputMaxLength, wantNumeric) {
      const container = htmlHelper.createContainer('line'),
        label = $('<span>').addClass('configSpan').text(labelText),
        input = wantNumeric ? htmlHelper.createNumericInput('', inputText, inputMaxLength, 'configNumericInput', '', inputId)
          : htmlHelper.createTextInput('', inputText, inputMaxLength, '', '', inputId);
      container.append([label, input]);
      return container;
    },
    populateConfigurationContainer = function (config) {
      const containerArray = [
        createConfigurationContainer('Administrator Emails', 'administratorEmailsInput', config.administratorEmails),
        createConfigurationContainer('Ineligible To Sign Up Early Months', 'ineligibleToSignupEarlyMonthsInput', config.ineligibleToSignupEarlyMonths, 2, true),
        createConfigurationContainer('Wait To Signup Date', 'waitToSignupDateInput', config.waitToSignupDate, 10),
        createConfigurationContainer('Newcomer Spots Reserved', 'newcomerSpotsReservedInput', config.newcomerSpotsReserved, 2, true),
        createConfigurationContainer('Maximum Cookie Age (minutes)', 'maxCookieAgeInput', config.cookieMaxAge, 4, true),
        createConfigurationContainer('Maximum Attendees', 'maxAttendeesInput', config.maximumAttendeeSpots, 2, true),
        createConfigurationContainer('Maximum Presenters', 'maxPresentersInput', config.maximumPresentationSpots, 2, true),
        createConfigurationContainer('Ineligible To Present Months', 'ineligibleToPresentMonthsInput', config.ineligibleToPresentMonths, 2, true),
        createConfigurationContainer('Mission Statement Source', 'missionStatementSourceInput', config.missionStatementSource),
        createConfigurationContainer('Details Source', 'detailsSourceInput', config.detailsSource),
        createConfigurationContainer('Policies Source', 'policiesSourceInput', config.policiesSource),
        createConfigurationContainer('News Source', 'newsSourceInput', config.newsSource),
        createConfigurationContainer('MailTo On RowClick', 'mailToOnRowClickInput', config.mailToOnRowClick),
        createConfigurationContainer('System Status', 'systemStatusInput', config.systemStatus)
      ];
      configurationsContainer.append(containerArray);
    },
    updateConfiguration = function () {
      const getUpdatedConfiguration = function (config) {
        config.administratorEmails = $('#administratorEmailsInput').val();
        config.ineligibleToSignupEarlyMonths = $('#ineligibleToSignupEarlyMonthsInput').val();
        config.waitToSignupDate = $('#waitToSignupDateInput').val();
        config.newcomerSpotsReserved = $('#newcomerSpotsReservedInput').val();
        config.cookieMaxAge = $('#maxCookieAgeInput').val();
        config.maximumAttendeeSpots = $('#maxAttendeesInput').val();
        config.maximumPresentationSpots = $('#maxPresentersInput').val();
        config.ineligibleToPresentMonths = $('#ineligibleToPresentMonthsInput').val();
        config.missionStatementSource = $('#missionStatementSourceInput').val();
        config.detailsSource = $('#detailsSourceInput').val();
        config.policiesSource = $('#policiesSourceInput').val();
        config.newsSource = $('#newsSourceInput').val();
        config.mailToOnRowClick = $('#mailToOnRowClickInput').val();
        config.systemStatus = $('#systemStatusInput').val();
        dataStore.configurationStore.updateConfiguration(config);
      };
      dataStore.configurationStore.fetchConfiguration(getUpdatedConfiguration);
    },
    initializeControls = function () {
      dataStore.configurationStore.fetchConfiguration(populateConfigurationContainer);
      htmlHelper.disableControl(uploadMissionStatementButton);
      htmlHelper.disableControl(uploadDetailsButton);
      htmlHelper.disableControl(uploadPoliciesButton);
      htmlHelper.disableControl(uploadNewsButton);
    },
    assignEventHandlers = function () {
      uploadMissionStatementFileInput.on('change', displayMissionStatementUploadFile);
      uploadDetailsFileInput.on('change', displayDetailsUploadFile);
      uploadPoliciesFileInput.on('change', displayPoliciesUploadFile);
      uploadNewsFileInput.on('change', displayNewsUploadFile);
      updateConfigurationButton.on('click', updateConfiguration);
    };
  initializeControls();
  assignEventHandlers();
};