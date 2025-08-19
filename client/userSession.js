/* globals $ */
exports.initialize = function (eventListener, dataStore) {
  'use strict';
  const adminEmail = '052779bs@secret.com',
    getCookie = function (cookieName, callback) {
      dataStore.getCookie(cookieName, callback);
    },
    setCookie = function (cookieName, cookieValue, callback) {
      dataStore.setCookie(cookieName, cookieValue, callback);
    },
    privateUserIsLoggedIn = function (callback) {
      getGetLoggedInMemberEmail((email) => {
        if (!emailIsValid(email)) {
          callback(false);
          return;
        }
        callback(true);
      });
    },
    setMemberCookies = function (member) {
      privateUserIsLoggedIn((isLoggedIn) => {
        if (isLoggedIn) {
          return;
        }
        setCookie('memberEmail', member.email);
        if (member.email !== adminEmail) {
          dataStore.auditStore.createAudit(member.email, 'Login');
        }
      });
    },
    clearMemberCookies = function () {
      setCookie('memberEmail', 'invalidated');
    },
    getGetLoggedInMemberEmail = function (callback) {
      getCookie('memberEmail', callback);
    },
    emailIsValid = function (email) {
      return email && email.trim().length > 0 && email.trim() !== 'invalidated';
    },
    checkUserIsLoggedInAsAdmin = function (callback) {
      getGetLoggedInMemberEmail(function (email) {
        dataStore.memberStore.getMemberByEmail(email, function (loggedInMember) {
          callback(loggedInMember.isAdmin === 'Y');
        });
      });
    },
    loggedInMemberIsAdmin = function (callback) {
      getGetLoggedInMemberEmail(function (email) {
        dataStore.memberStore.getMemberByEmail(email, function (loggedInMember) {
          callback(loggedInMember.isAdmin === 'Y');
        });
      });
    },
    loggedInMemberIsSuperAdmin = function (callback) {
      getGetLoggedInMemberEmail(function (email) {
        dataStore.memberStore.getMemberByEmail(email, function (loggedInMember) {
          callback(loggedInMember.isSuperAdmin === 'Y');
        });
      });
    },
    showAdmin = function (canShowAdmin) {
      if (!canShowAdmin) {
        return;
      }
      loggedInMemberIsSuperAdmin((isSuperAdmin) => {
        if (isSuperAdmin) {
          window.location.href = '/admin';
        }
      });
    },
    userIsLoggedIn = function (callback) {
      getGetLoggedInMemberEmail(function (email) {
        if (!emailIsValid(email)) {
          clearMemberCookies();
          eventListener.fire('ClearLogin');
          eventListener.fire('DisplayLogin');
          callback('');
          return;
        }
        callback(email);
      });
    },
    initializeEventListener = function () {
      eventListener.addListener('ShowAdmin', showAdmin);
      eventListener.addListener('CheckUserIsLoggedInAsAdmin', checkUserIsLoggedInAsAdmin);
      eventListener.addListener('SetMemberCookies', setMemberCookies);
      eventListener.addListener('SetNewMemberCookies', setMemberCookies);
      eventListener.addListener('ClearMemberCookies', clearMemberCookies);
      eventListener.addListener('IsUserLoggedIn', userIsLoggedIn);
    };
  initializeEventListener();
  return {
    loggedInMemberIsAdmin: loggedInMemberIsAdmin,
    userIsLoggedIn: userIsLoggedIn
  };
};