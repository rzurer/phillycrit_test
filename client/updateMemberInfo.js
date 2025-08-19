/* globals $ */
exports.initialize = function (eventListener, dataStore, htmlHelper, regexHelper, stringHelper) {
  'use strict';
  let canSave;
  const emailSpan = $('#emailSpan'),
    memberIdSpan = $('#memberIdSpan'),
    firstNameInput = $('#updateFirstNameInput'),
    firstNameErrorSpan = $('#updateFirstNameErrorSpan'),
    websiteUrlErrorSpan = $('#updateWebsiteUrlErrorSpan'),
    instagramUrlErrorSpan = $('#updateInstagramUrlErrorSpan'),
    facebookUrlErrorSpan = $('#updateFacebookUrlErrorSpan'),
    lastNameInput = $('#updateLastNameInput'),
    lastNameErrorSpan = $('#updateLastNameErrorSpan'),
    websiteInput = $('#updateWebsiteInput'),
    instagramInput = $('#updateInstagramInput'),
    facebookInput = $('#updateFacebookInput'),
    phoneInput = $('#updatePhoneInput'),
    pgpInput = $('#updatePgpInput'),
    saveUpdateMemberInfoButton = $('#saveUpdateMemberInfoButton'),
    cancelSaveUpdateMemberInfoButton = $('#cancelSaveUpdateMemberInfoButton'),
    getMemberId = function () {
      return memberIdSpan.text();
    },
    getEmail = function () {
      return emailSpan.text();
    },
    getFirstName = function () {
      return firstNameInput.val();
    },
    getLastName = function () {
      return lastNameInput.val();
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
      return phoneInput.val();
    },
    getPgp = function () {
      return pgpInput.val();
    },
    createMemberUpdate = function () {
      return {
        _id: getMemberId(),
        email: getEmail(),
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
      htmlHelper.setErrorCondition(firstNameInput, firstNameErrorSpan, '');
      htmlHelper.setErrorCondition(lastNameInput, lastNameErrorSpan, '');
      htmlHelper.setErrorCondition(websiteInput, websiteUrlErrorSpan, '');
      htmlHelper.setErrorCondition(instagramInput, instagramUrlErrorSpan, '');
      htmlHelper.setErrorCondition(facebookInput, facebookUrlErrorSpan, '');
    },
    updateMember = function () {
      const callback = function (email) {
        if (email) {
          const member = createMemberUpdate();
          if (!canSave) {
            return;
          };
          canSave = false;
          dataStore.memberStore.updateMember(member, () => {
            htmlHelper.disableControl(saveUpdateMemberInfoButton);
            eventListener.fire('HideUpdateMemberInfo');
          });
        }
      };
      eventListener.fire('IsUserLoggedIn', [callback]);
    },
    validate = function () {
      var fieldIsEmpty, firstNameIsNotEmpty, lastNameIsNotEmpty;
      clearValidations();
      fieldIsEmpty = function (fieldValue) {
        return !fieldValue || fieldValue.trim().length === 0;
      };
      firstNameIsNotEmpty = true;
      if (fieldIsEmpty(getFirstName())) {
        htmlHelper.setErrorCondition(firstNameInput, firstNameErrorSpan, 'First name can not be empty');
        firstNameIsNotEmpty = false;
      }
      lastNameIsNotEmpty = true;
      if (fieldIsEmpty(getLastName())) {
        htmlHelper.setErrorCondition(lastNameInput, lastNameErrorSpan, 'Last name can not be empty');
        lastNameIsNotEmpty = false;
      }
      canSave = firstNameIsNotEmpty && lastNameIsNotEmpty;
      if (canSave) {
        htmlHelper.enableControl(saveUpdateMemberInfoButton, updateMember);
      } else {
        htmlHelper.disableControl(saveUpdateMemberInfoButton);
      }
    },
    setUpdateMemberInfoControls = function (email) {
      dataStore.memberStore.getMemberByEmail(email, function (member) {
        htmlHelper.disableControl(saveUpdateMemberInfoButton);
        memberIdSpan.text(member._id);
        emailSpan.text(member.email);
        firstNameInput.val(member.firstName);
        lastNameInput.val(member.lastName);
        websiteInput.val(member.website);
        instagramInput.val(member.instagram);
        facebookInput.val(member.facebook);
        phoneInput.val(member.phone);
        pgpInput.val(member.pgp);
      });
    },
    initializeControls = function () {
      htmlHelper.disableControl(saveUpdateMemberInfoButton);
    },
    hideUpdateMemberInfo = function () {
      eventListener.fire('HideUpdateMemberInfo');
    },
    initializeEventListener = function () {
      eventListener.addListener('UpdateMemberInfoControls', setUpdateMemberInfoControls);
    },
    assignEventHandlers = function () {
      $('.updateMemberControl').on('keyup', validate);
      cancelSaveUpdateMemberInfoButton.on('click', hideUpdateMemberInfo);
    };
  initializeEventListener();
  assignEventHandlers();
  initializeControls();
  return {
    createMemberUpdate: createMemberUpdate
  };
};