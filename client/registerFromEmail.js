/* globals $ */
exports.initialize = function (eventListener, dataStore, arrayHelper, htmlHelper, regexHelper, stringHelper) {
  'use strict';
  let canSave = false;
  const registrationEmailSpan = $('#registrationEmailSpan'),
    confirmEmailInput = $('#confirmEmailInput'),
    confirmEmailErrorSpan = $('#confirmEmailErrorSpan'),
    websiteUrlErrorSpan = $('#websiteUrlErrorSpan'),
    instagramUrlErrorSpan = $('#instagramUrlErrorSpan'),
    facebookUrlErrorSpan = $('#facebookUrlErrorSpan'),
    firstNameInput = $('#firstNameInput'),
    firstNameErrorSpan = $('#firstNameErrorSpan'),
    lastNameInput = $('#lastNameInput'),
    lastNameErrorSpan = $('#lastNameErrorSpan'),
    websiteInput = $('#websiteInput'),
    instagramInput = $('#instagramInput'),
    facebookInput = $('#facebookInput'),
    phoneInput = $('#phoneInput'),
    pgpInput = $('#pgpInput'),
    loginInput = $('#loginInput'),
    loginErrorSpan = $('#loginErrorSpan'),
    emailNotFoundMessage = $('#emailNotFoundMessage'),
    registrationButtonSection = $('.registrationButtonSection'),
    successMessageSection = $('.successMessageSection'),
    loginSection = $('.loginSection'),
    enterEmailSpan = $('.enterEmailSpan'),
    registerSection = $('.registerSection'),
    registerButton = $('#registerButton'),
    saveRegistrationButton = $('#saveRegistrationButton'),
    cancelSaveRegistrationButton = $('#cancelSaveRegistrationButton'),
    getEmailFromRegistrationForm = function () {
      return registrationEmailSpan.text().toLowerCase().trim();
    },
    clearLoginErrors = function () {
      loginErrorSpan.text('');
      emailNotFoundMessage.text('');
    },
    clearLogin = function () {
      clearLoginErrors();
      loginInput.val('');
      loginInput.removeClass('invalidField');
      loginInput.blur();
      loginInput.focus();
    },
    emailIsValid = function (email) {
      htmlHelper.setErrorCondition(loginInput, loginErrorSpan, '');
      if (!email || email.trim().length === 0) {
        htmlHelper.setErrorCondition(loginInput, loginErrorSpan, 'Email can not be empty');
        hideRegistrationButton();
        return false;
      }
      if (!regexHelper.isValidEmail(email)) {
        htmlHelper.setErrorCondition(loginInput, loginErrorSpan, 'Invalid Email Format');
        hideRegistrationButton();
        return false;
      }
      return true;
    },
    showRegistrationControls = function (email) {
      emailNotFoundMessage.text('The email "' + email + '" was not found. Please register.');
      registrationButtonSection.show();
    },
    getConfirmEmail = function () {
      return confirmEmailInput.val().toLowerCase().trim();
    },
    getFirstName = function () {
      return firstNameInput.val().trim();
    },
    getLastName = function () {
      return lastNameInput.val().trim();
    },
    getWebsite = function () {
      return regexHelper.isValidUrl(websiteInput.val()) ? websiteInput.val() : '';
    },
    getInstagram = function () {
      return regexHelper.isValidUrl(instagramInput.val()) ? instagramInput.val() : '';
    },
    getFacebook = function () {
      return regexHelper.isValidUrl(facebookInput.val()) ? facebookInput.val() : '';
    },
    getPhone = function () {
      return phoneInput.val().trim();
    },
    getPgp = function () {
      return pgpInput.val();
    },
    createNewMember = function () {
      return {
        isActive: 'Y',
        isAdmin: 'N',
        joinDate: new Date(),
        email: getEmailFromRegistrationForm(),
        firstName: getFirstName(),
        lastName: getLastName(),
        website: getWebsite(),
        instagram: getInstagram(),
        facebook: getFacebook(),
        phone: stringHelper.formatLocalPhoneNumber(getPhone()),
        pgp: getPgp()
      };
    },
    clearValidations = function () {
      htmlHelper.setErrorCondition(confirmEmailInput, confirmEmailErrorSpan, '');
      htmlHelper.setErrorCondition(firstNameInput, firstNameErrorSpan, '');
      htmlHelper.setErrorCondition(lastNameInput, lastNameErrorSpan, '');
      htmlHelper.setErrorCondition(websiteInput, websiteUrlErrorSpan, '');
      htmlHelper.setErrorCondition(instagramInput, instagramUrlErrorSpan, '');
      htmlHelper.setErrorCondition(facebookInput, facebookUrlErrorSpan, '');
    },
    clearErrors = function () {
      $('.fieldError').text('');
      $('.requiredMemberInput').removeClass('invalidField');
    },
    validate = function () {
      let emailsMatch, firstNameIsNotEmpty, lastNameIsNotEmpty;
      const email = getEmailFromRegistrationForm(),
        confirmEmail = getConfirmEmail(),
        fieldIsEmpty = function (fieldValue) {
          return !fieldValue || fieldValue.trim().length === 0;
        };
      clearValidations();
      emailsMatch = true;
      if (email !== confirmEmail) {
        htmlHelper.setErrorCondition(confirmEmailInput, confirmEmailErrorSpan, 'Email entries do not match');
        emailsMatch = false;
      }
      firstNameIsNotEmpty = true;
      if (fieldIsEmpty(getFirstName())) {
        htmlHelper.setErrorCondition(firstNameInput, firstNameErrorSpan, 'First Name cannot be empty');
        firstNameIsNotEmpty = false;
      }
      lastNameIsNotEmpty = true;
      if (fieldIsEmpty(getLastName())) {
        htmlHelper.setErrorCondition(lastNameInput, lastNameErrorSpan, 'Last Name cannot be empty');
        lastNameIsNotEmpty = false;
      }
      canSave = emailsMatch && firstNameIsNotEmpty && lastNameIsNotEmpty;
      if (canSave) {
        htmlHelper.enableControl(saveRegistrationButton, saveRegistration);
      } else {
        htmlHelper.disableControl(saveRegistrationButton);
      }
    },
    clearNewMemberControl = function () {
      registrationEmailSpan.text('');
      confirmEmailInput.val('');
      firstNameInput.val('');
      lastNameInput.val('');
      websiteInput.val('');
      instagramInput.val('');
      facebookInput.val('');
      phoneInput.val('');
      pgpInput.val('');
      htmlHelper.disableControl(saveRegistrationButton);
      clearErrors();
    },
    saveRegistration = function () {
      const newMember = createNewMember(),
        callback = () => {
          const subscriber = { email: newMember.email, firstName: newMember.firstName, lastName: newMember.lastName };
          eventListener.fire('SendOutRegistrationConfirmationEmail', [newMember.email]);
          dataStore.emailStore.subscribeToMailChimp(subscriber);
          showSuccessMessage('Welcome. You have successfully registered with Philly Crit.');
        };
      if (!canSave) {
        return;
      };
      canSave = false;
      dataStore.memberStore.addMember(newMember, callback);
    },
    validateLogin = async function () {
      const email = loginInput.val();
      clearLoginErrors();
      if (emailIsValid(email)) {
        dataStore.memberStore.getBlacklistedMemberEmails((blacklistedEmails) => {
          if (blacklistedEmails.includes(email)) {
            dataStore.auditStore.createAudit(email, 'Blacklisted member tried to login');
            return;
          }
          dataStore.memberStore.getActiveMemberEmails(function (activeEmails) {
            if (arrayHelper.caseInsensitiveIncludes(activeEmails, email)) {
              showSuccessMessage('The email' + ' "' + email + '" is already registered.');
              emailNotFoundMessage.text('');
              return;
            };
            showRegistrationControls(email);
          });
        });
      }
    },
    registerUser = function () {
      const email = loginInput.val();
      registrationEmailSpan.text('');
      hideRegistrationButton();
      loginSection.hide();
      registrationEmailSpan.text(email);
      registerSection.show();
    },
    hideRegistrationButton = function () {
      emailNotFoundMessage.text('');
      registrationButtonSection.hide();
    },
    hideRegistrationControls = function () {
      clearLogin();
      clearNewMemberControl();
      registerSection.hide();
      loginSection.show();
    },
    composeSucessMessage = function (message) {
      const beginning = 'Please log into our ',
        ending = ' to sign up to attend a crit.',
        url = 'https://www.phillycrit.com',
        messageDiv = htmlHelper.createContainer('messageDiv').text(message),
        beginningSpan = htmlHelper.createSpan('sucessMessageSpan').text(beginning),
        link = htmlHelper.createLink(url, url, 'site'),
        endingSpan = htmlHelper.createSpan('sucessMessageSpan').text(ending);
      successMessageSection.append([messageDiv, beginningSpan, link, endingSpan]);
    },
    showSuccessMessage = function (message) {
      composeSucessMessage(message);
      registerSection.hide();
      loginSection.hide();
      successMessageSection.show();
    },
    initializeControls = function () {
      loginInput.focus();
      enterEmailSpan.text('Please enter your email to register.');
      registerSection.hide();
      successMessageSection.hide();
    },
    assignEventHandlers = function () {
      loginInput.on('change', validateLogin);
      registerButton.on('click', registerUser);
      cancelSaveRegistrationButton.on('click', hideRegistrationControls);
      $('.requiredMemberInput').on('keyup', validate);
    };
  initializeControls();
  assignEventHandlers();
};