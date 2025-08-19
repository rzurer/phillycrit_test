exports.initialize = function (eventListener, ajaxHelper, arrayHelper, htmlHelper, sortHelper) {
  'use strict';
  const getEmailInfoFromEmail = function (email, callback) {
      getMemberByEmail(email, (member) => {
        callback({ firstName: member.firstName, name: member.firstName + ' ' + member.lastName, email: email });
      });
    },
    getNameAndPhoneNumberFromEmail = function (email, callback) {
      getMemberByEmail(email, (member) => {
        callback({ name: member.firstName + ' ' + member.lastName, phone: member.phone });
      });
    },
    addMember = function (newMember, callback) {
      const audit = {
        email: newMember.email,
        action: 'Was added',
        device: htmlHelper.getDeviceType()
      };
      ajaxHelper.post('/members', { member: newMember, audit: audit }, function (response) {
        if (!response.success) {
          eventListener.fire('Failure', [response.message]);
          return;
        }
        if (callback) {
          callback();
        }
      });
    },
    updateMember = function (member, callback) {
      const audit = {
        email: member.email,
        action: 'Was updated',
        device: htmlHelper.getDeviceType()
      };
      ajaxHelper.put('/members', { member: member, audit: audit }, function (response) {
        if (!response.success) {
          // eventListener.fire('Failure', [response.message]);
          return;
        }
        eventListener.fire('Success', [response.message]);
        if (callback) {
          callback();
        }
      });
    },
    deleteMember = function (memberId, callback) {
      ajaxHelper.remove('/members/' + memberId, function (response) {
        if (!response.success) {
          eventListener.fire('Failure', [response.message]);
          return;
        }
        eventListener.fire('Success', [response.message]);
        callback();
      });
    },
    fetchRegisteredMembers = function (callback, sortField, sortDirection) {
      const getSortMethod = function (sortField, sortDirection) {
        switch (sortDirection) {
          case 'ASC':
            switch (sortField) {
              case 'lastName':
                return (a, b) => sortHelper.stringSort(a, b, 'lastName');
              case 'email':
                return (a, b) => sortHelper.stringSort(a, b, 'email');
              case 'joinDate':
                return (a, b) => sortHelper.dateSort(a, b, 'joinDate');
              default:
                return null;
            }
          case 'DESC':
            switch (sortField) {
              case 'lastName':
                return (a, b) => sortHelper.stringSort(a, b, 'lastName', true);
              case 'email':
                return (a, b) => sortHelper.stringSort(a, b, 'email', true);
              case 'joinDate':
                return (a, b) => sortHelper.dateSort(a, b, 'joinDate', true);
              default:
                return null;
            }
        }
      };
      ajaxHelper.get('/members', function (response) {
        const members = arrayHelper.getSafeArray(response.payload),
          compareMethod = getSortMethod(sortField, sortDirection);
        if (compareMethod) {
          members.sort(compareMethod);
        }
        callback(members);
      });
    },
    getEmailNameDictionary = function (callback) {
      const emailNameDictionary = {};
      fetchRegisteredMembers(function (members) {
        members.forEach((m) => {
          emailNameDictionary[m.email] = m.firstName + ' ' + m.lastName;
        });
        callback(emailNameDictionary);
      });
    },
    getBlacklistedMemberEmails = function (callback) {
      return fetchRegisteredMembers(function (members) {
        callback(members.filter(m => m.isActive === 'N').map(m => m.email));
      });
    },
    getActiveMemberEmails = function (callback) {
      return fetchRegisteredMembers(function (members) {
        callback(members.filter(m => m.isActive === 'Y').map(m => m.email));
      });
    },
    getMemberByEmail = function (email, callback) {
      if (!email) {
        callback([]);
        return;
      }
      fetchRegisteredMembers(function (members) {
        const result = members.find(m => m.email.toLowerCase() === email.toLowerCase()); // array helper here
        callback(result || []);
      });
    },
    getAttendingMembersArray = function (event, callback) {
      const attendees = arrayHelper.getSafeArray(event.attendees),
        waitlist = arrayHelper.getSafeArray(event.waitlist);
      if (attendees.length === 0) {
        callback([]);
        return;
      }
      fetchRegisteredMembers(function (members) {
        const presenterEmails = attendees.filter(a => a.isPresenting === 'Y').map(a => a.email.toLowerCase()),
          waitlistEmails = waitlist.map(e => e.toLowerCase()),
          observingEmails = attendees.filter(e => !presenterEmails.concat(waitlistEmails).includes(e.email)).map(a => a.email.toLowerCase()),
          presentingMembers = members.filter(m => presenterEmails.includes(m.email.toLowerCase())).map(m => {
            return { firstName: m.firstName, member: m, isPresenting: 'Y' };
          }).sort((a, b) => sortHelper.stringSort(a, b, 'firstName')),
          waitlistedMembers = members.filter(m => waitlistEmails.includes(m.email.toLowerCase())).map(m => {
            return { firstName: m.firstName, member: m, isPresenting: 'N', waitlistNumber: waitlistEmails.indexOf(m.email.toLowerCase()) + 1 };
          }).sort((a, b) => sortHelper.numberSort(a, b, 'waitlistNumber')),
          observingMembers = members.filter(m => observingEmails.includes(m.email.toLowerCase())).map(m => {
            return { firstName: m.firstName, member: m, isPresenting: 'N' };
          }).sort((a, b) => sortHelper.stringSort(a, b, 'firstName'));
        callback(presentingMembers.concat(waitlistedMembers).concat(observingMembers));
      });
    },
    persistIsActive = function (memberId, isActive, callback) {
      ajaxHelper.put('/members/changeIsActiveStatus', { memberId: memberId, isActive: isActive }, callback);
    },
    persistAdmin = function (memberId, isAdmin, callback) {
      ajaxHelper.put('/members/changeIsAdminStatus', { memberId: memberId, isAdmin: isAdmin }, callback);
    },
    fetchRegisteredMember = function (memberId, callback) {
      ajaxHelper.get('/members/id/' + memberId, function (response) {
        if (!response.success) {
          eventListener.fire('Failure', [response.message]);
          return;
        }
        const member = response.payload;
        callback(member);
      });
    };
  return {
    getEmailInfoFromEmail: getEmailInfoFromEmail,
    getNameAndPhoneNumberFromEmail: getNameAndPhoneNumberFromEmail,
    addMember: addMember,
    updateMember: updateMember,
    deleteMember: deleteMember,
    getEmailNameDictionary: getEmailNameDictionary,
    getBlacklistedMemberEmails: getBlacklistedMemberEmails,
    getActiveMemberEmails: getActiveMemberEmails,
    getAttendingMembersArray: getAttendingMembersArray,
    persistIsActive: persistIsActive,
    persistAdmin: persistAdmin,
    fetchRegisteredMember: fetchRegisteredMember,
    getMemberByEmail: getMemberByEmail,
    fetchRegisteredMembers: fetchRegisteredMembers
  };
};