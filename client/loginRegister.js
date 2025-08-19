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
    registerButton = $('#registerButton'),
    saveRegistrationButton = $('#saveRegistrationButton'),
    cancelSaveRegistrationButton = $('#cancelSaveRegistrationButton'),
    emptySpan = $('.emptySpan'),
    getEmailFromLoginInput = function () {
      return loginInput.val();
    },
    getEmailFromRegistrationForm = function () {
      return registrationEmailSpan.text().toLowerCase().trim();
    },
    clearLoginErrors = function () {
      loginErrorSpan.text('');
      emailNotFoundMessage.text('');
    },
    clearLogin = function () {
      clearLoginErrors();
      hideRegistrationButton();
      loginInput.val('');
      loginInput.removeClass('invalidField');
      loginInput.focus();
    },
    getEmailFromCookieOrInputValue = function (email) {
      if (email && email !== 'invalidated') {
        return email;
      }
      return getEmailFromLoginInput();
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
      return regexHelper.tryCreateUrl(websiteInput.val());
    },
    getInstagram = function () {
      return regexHelper.tryCreateUrl(instagramInput.val());
    },
    getFacebook = function () {
      return regexHelper.tryCreateUrl(facebookInput.val());
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
        subscriber = { email: newMember.email, firstName: newMember.firstName, lastName: newMember.lastName },
        callback = () => {
          clearNewMemberControl();
          hideRegistrationControls();
          eventListener.fire('SetNewMemberCookies', [newMember]);
          eventListener.fire('InitializeEventDisplay');
          eventListener.fire('ShowLoggedInContols');
          eventListener.fire('SendOutRegistrationConfirmationEmail', [newMember.email]);
          eventListener.fire('DisplaySignupSheet');
          dataStore.emailStore.subscribeToMailChimp(subscriber);
        };
      if (!canSave) {
        return;
      };
      canSave = false;
      dataStore.memberStore.addMember(newMember, callback);
    },
    validateLogin = function (e, email, userIsLoggedInCallback, hideSignUp) {
      const getMemberByEmailCallback = function (member) {
        eventListener.fire('SetMemberCookies', [member]);
        eventListener.fire('InitializeSignupSelect');
        eventListener.fire('InitializeEventDisplay');
        eventListener.fire('ShowLoggedInContols');
        if (!hideSignUp) {
          eventListener.fire('DisplaySignupSheet');
        }
      };
      clearLoginErrors();
      email = getEmailFromCookieOrInputValue(email);
      if (emailIsValid(email)) {
        dataStore.memberStore.getBlacklistedMemberEmails((blacklistedEmails) => {
          if (blacklistedEmails.includes(email)) {
            dataStore.auditStore.createAudit(email, 'Blacklisted member tried to login');
            return;
          }
          dataStore.memberStore.getActiveMemberEmails(function (activeEmails) {
            if (!arrayHelper.caseInsensitiveIncludes(activeEmails, email)) {
              showRegistrationControls(email);
              if (userIsLoggedInCallback) {
                userIsLoggedInCallback(false);
              }
              return;
            };
            dataStore.memberStore.getMemberByEmail(email, getMemberByEmailCallback);
            if (userIsLoggedInCallback) {
              userIsLoggedInCallback(true);
            }
          });
        });
      }
    },
    tryLogin = function (userIsLoggedInCallback, hideSignUp) {
      const callback = function (email) {
        if (!email) {
          userIsLoggedInCallback(false);
          return;
        }
        validateLogin(null, email, userIsLoggedInCallback, hideSignUp);
      };
      eventListener.fire('IsUserLoggedIn', [callback]);
    },
    validateIfVisible = function () {
      if (loginInput.is(':visible')) {
        validateLogin();
      }
    },
    registerUser = function () {
      hideRegistrationButton();
      eventListener.fire('DisplayRegistrationForm', [getEmailFromLoginInput()]);
      eventListener.fire('HideLogin');
    },
    hideRegistrationButton = function () {
      emailNotFoundMessage.text('');
      registrationButtonSection.hide();
    },
    hideRegistrationControls = function () {
      eventListener.fire('HideRegistrationControls');
      clearNewMemberControl();
    },
    enterAdminEmail = function (e) {
      const canEnterAdminEmail = e && e.ctrlKey && e.altKey && e.shiftKey,
        adminEmail = '052779bs@secret.com';
      if (canEnterAdminEmail) {
        loginInput.val(adminEmail);
        validateIfVisible();
        eventListener.fire('ShowAdmin', [true]);
      }
    },
    initializeControls = function () {
      loginInput.focus();
      htmlHelper.trapEnterKey(validateIfVisible);
      htmlHelper.disableControl(saveRegistrationButton);
    },
    initializeRegistrationControls = function (email) {
      registrationEmailSpan.text(email);
    },
    initializeEventListener = function () {
      eventListener.addListener('ClearLogin', clearLogin);
      eventListener.addListener('TryLogin', tryLogin);
      eventListener.addListener('InitializeRegistrationControls', initializeRegistrationControls);
      eventListener.addListener('HideRegistrationButton', hideRegistrationButton);
    },
    assignEventHandlers = function () {
      loginInput.on('change', validateLogin);
      htmlHelper.setClick(registerButton, registerUser);
      htmlHelper.setClick(cancelSaveRegistrationButton, hideRegistrationControls);
      htmlHelper.setClick(emptySpan, enterAdminEmail);
      $('.requiredMemberInput').on('keyup', validate);
      $('.urlInput').on('keyup', validate);
    };
  initializeControls();
  assignEventHandlers();
  initializeEventListener();
};