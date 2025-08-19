exports.initialize = function (dataStore) {
  'use strict';
  const getTestEmailInfos = function (callback) {
      const emailInfos = [{ firstName: 'Robert', name: 'Robert Zurer', email: 'bzurer@gmail.com' }];
      callback(emailInfos);
    },
    getKateEmailInfos = function (callback) {
      const emailInfos = [
        { firstName: 'Robert', name: 'Robert Zurer', email: 'bzurer@gmail.com' },
        { firstName: 'Kate', name: 'Kate McCammon', email: 'ksmccammon@gmail.com' }
      ];
      callback(emailInfos);
    },
    getFormerPresenterEmails = function (callback) {
      callback([
        'alankin@gmail.com',
        'ksmccammon@gmail.com',
        'laurentsipori@gmail.com',
        'annaguarneri@gmail.com',
        'em@emilyroyer.net',
        'sahitibonam@gmail.com',
        'daisyjuarez.art@gmail.com',
        'acoppola22@gmail.com',
        'alysecb@gmail.com',
        'studio@shawnrowe.com',
        'jeanplough@gmail.com',
        'jenn@harttstudio.com',
        'za.pomona@gmail.com',
        'writeme@mpezalla.com',
        'carol.tashjian@gmail.com',
        'stuart.lehrman@gmail.com',
        'jodee_joan@yahoo.com',
        'lydiahamiltonbrown@mac.com',
        'hawlistic@gmail.com'
      ]);
    },
    getSendEarlySignUpForPresentersEmails = function (callback) {
      let memberEmailInfos, formerPresenterEmails;
      const earlySignupEmailRecipients = [],
        moderatorEmails = getModeratorEmailInfos().map(e => e.email);
      getMemberEmailInfos((infos) => {
        memberEmailInfos = infos;
      });
      getFormerPresenterEmails((emails) => {
        formerPresenterEmails = emails.filter((e) => !moderatorEmails.includes(e));
      });
      memberEmailInfos.forEach((e) => {
        if (!formerPresenterEmails.includes(e.email) && !moderatorEmails.includes(e.email)) {
          earlySignupEmailRecipients.push(e);
        }
      });
      callback(earlySignupEmailRecipients);
    },
    getAttendeeEmailInfos = function (eventId, callback, filterPredicate) {
      if (!eventId) {
        callback([]);
        return;
      }
      const emailInfos = [];
      dataStore.eventStore.fetchEvent(eventId, (event) => {
        let emails;
        if (filterPredicate) {
          emails = event.attendees.filter((a) => {
            return filterPredicate(a);
          }).map((a) => a.email);
        } else {
          emails = event.attendees.map((a) => a.email);
        }
        emails.forEach((e) => dataStore.memberStore.getEmailInfoFromEmail(e, (info) => {
          emailInfos.push(info);
        }));
        callback(emailInfos);
      });
    },
    getModeratorEmailInfos = function () {
      return [{ firstName: 'Robert', name: 'Robert Zurer', email: 'robert@zurer.com' },
        { firstName: 'Albert', name: 'Albert Fung', email: 'af@alfung.com' },
        { firstName: 'Alan', name: 'Alan Lankin', email: 'alankin@gmail.com' },
        { firstName: 'Kate', name: 'Kate McCammon', email: 'ksmccammon@gmail.com' },
        { firstName: 'Admin', name: 'Admin Login', email: '052779bs@secret.com' }
      ];
    },
    getNonPresenterEmailInfos = function (eventId, callback) {
      const moderatorEmails = getModeratorEmailInfos().map((i) => {
          return i.email;
        }),
        isNotPresenterOrModerator = function (obj) {
          return obj.isPresenting === 'N' && !moderatorEmails.includes(obj.email);
        };
      getAttendeeEmailInfos(eventId, isNotPresenterOrModerator, callback);
    },
    getMemberEmailInfos = function (callback) {
      const emailInfos = [];
      dataStore.memberStore.fetchRegisteredMembers((members) => {
        members.forEach((m) => {
          emailInfos.push({ firstName: m.firstName, name: m.firstName + ' ' + m.lastName, email: m.email });
        });
        callback(emailInfos);
      });
    };
  return {
    getTestEmailInfos: getTestEmailInfos,
    getKateEmailInfos: getKateEmailInfos,
    getAttendeeEmailInfos: getAttendeeEmailInfos,
    getNonPresenterEmailInfos: getNonPresenterEmailInfos,
    getMemberEmailInfos: getMemberEmailInfos,
    getFormerPresenterEmails: getFormerPresenterEmails,
    getModeratorEmailInfos: getModeratorEmailInfos,
    getSendEarlySignUpForPresentersEmails: getSendEarlySignUpForPresentersEmails
  };
};