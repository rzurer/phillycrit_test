/* globals $ */
exports.initialize = function (dataStore, dateHelper, emailInfoCreator, emailHelper, htmlHelper) {
  'use strict';
  const critDateInput = $('#critDateInput'),
    eventIdHidden = $('#eventIdHidden'),
    critDateHidden = $('#critDateHidden'),
    testButton = $('#testButton'),
    initializeCritDate = function () {
      dataStore.eventStore.getEventClosestToNow((event) => {
        if (!event) {
          return;
        }
        eventIdHidden.val(event._id);
        critDateHidden.val(event.startDate);
        critDateInput.val(dateHelper.getYearShortMonthShortDay(event.startDate));
      });
    },
    // getCritDate = function () {
    //   // return critDateHidden.val();
    //   return dateHelper.adjustToLocalTimezone(new Date('2025-09-14'), false).toISOString();
    // },
    // getEventId = function () {
    //   return eventIdHidden.val();
    // },
    test = function () {
      console.log('test');
    },
    // copyAttendanceListToClipboard = function () {
    //   const eventId = getEventId(),
    //     stringArray = [];
    //   if (eventId) {
    //     dataStore.eventStore.fetchEvent(eventId, (event) => {
    //       const presenterEmails = event.attendees.filter((a) => a.isPresenting === 'Y').map((a) => a.email),
    //         attendeeEmails = event.attendees.filter((a) => a.isPresenting === 'N').map((a) => a.email);
    //       presenterEmails.forEach((e) => dataStore.memberStore.getNameAndPhoneNumberFromEmail(e, (info) => {
    //         // stringArray.push(e + ' ' + info.name + ' ' + info.phone);
    //         stringArray.push(info.name + ' ' + info.phone);
    //       }));
    //       attendeeEmails.forEach((e) => dataStore.memberStore.getNameAndPhoneNumberFromEmail(e, (info) => {
    //         // stringArray.push(e + ' ' + info.name);
    //         stringArray.push(info.name);
    //       }));
    //     });
    //   }
    //   stringArray.sort();
    //   htmlHelper.copyToClipboard(stringArray.join('\r\n'));
    //   console.info('copied', stringArray.length);
    // },
    assignEventHandlers = function () {
      testButton.on('click', test);
    };
  initializeCritDate();
  assignEventHandlers();
};
// addAttendee = function (eventId, email, isPresenting) {
//   const attendee = {
//     email: email,
//     isPresenting: isPresenting ? 'Y' : 'N'
//   };
//   dataStore.eventStore.addAttendee(eventId, attendee);
//   console.log(`${email} has been added to the attendance list.`);
// },
// sendEmail = function (emailInfos, fileName, critDate) {
//   let i = 0;
//   emailInfos.forEach((info) => {
//     emailHelper.send(fileName, info, critDate);
//     i += 1;
//   });
//   console.info(`Sent ${fileName} to ${i} recipients`);
// },
// createMailChimpCampaign = function (htmlFilename) {
//   const displayDate = dateHelper.getLongDayOfWeekLongMonthShortDayYear(getCritDate());
//   emailHelper.createCampaign(htmlFilename, displayDate, (response) => {
//     console.info('Campaign Created', response);
//   });
// },
// getPresentersBefore = function () {
//   const startDateString = new Date('2025-04-28').toISOString(),
//     presenters = [],
//     callback = function (events) {
//       events.forEach((e) => e.attendees.forEach((a) => {
//         if (a.isPresenting === 'Y') {
//           presenters.push({ email: a.email, startDate: e.startDate });
//         }
//       }));
//       console.log(presenters);
//     },
//     getEventsBeforeCallback = function (events) {
//       callback(events);
//     };
//   dataStore.eventStore.getEventsBefore(startDateString, getEventsBeforeCallback);
// },
// canMemberSignup = function () {
//   dataStore.configurationStore.fetchConfiguration(config => {
//     dataStore.eventStore.getEventAttendeesThatMustWaitToSignup(config.ineligibleToSignupEarlyMonths, emails => console.log(emails));
//   });
// },
// copyAllAttendeeEmailInfosToClipboard = function () {
//   const result = [],
//     emailInfos = [],
//     stringArray = [];
//   dataStore.eventStore.fetchEvents((events) => {
//     events.map((e) => {
//       return e.attendees.forEach((a) => {
//         if (!result.some(x => x.email === a.email)) {
//           result.push({ email: a.email });
//         }
//       });
//     });
//     result.map(x => dataStore.memberStore.getEmailInfoFromEmail(x.email, (emailInfo) => {
//       emailInfos.push(emailInfo);
//     }));
//     stringArray.push('[');
//     emailInfos.forEach((emailInfo) => {
//       if (emailInfo.firstName && emailInfo.firstName) {
//         stringArray.push('{firstName: \'' + emailInfo.firstName + '\', name: \'' + emailInfo.name.replace(/'/g, '') + '\', email:\'' + emailInfo.email + '\'},');
//       }
//     });
//     stringArray.push(']');
//     htmlHelper.copyToClipboard(stringArray.join('\r\n'));
//     console.log('done');
//   });
// },
// sendRoomChangeNotificationEmail = function (emailInfos) {
//   let i = 0;
//   const displayDate = dateHelper.getLongDayOfWeekLongMonthShortDayYear(getCritDate());
//   emailInfos.forEach((info) => {
//     emailHelper.send('roomChangeNotification', info, displayDate);
//     i += 1;
//   });
//   console.info('Done', i);
// },
// sendMainCritAnnouncement = function (emailInfos) {
//   let i = 0;
//   const displayDate = dateHelper.getLongDayOfWeekLongMonthShortDayYear(getCritDate());
//   emailInfos.forEach((info) => {
//     emailHelper.send('mainCritAnnouncement', info, displayDate, '');
//     i += 1;
//   });
//   console.info('Done', i);
// },
// sendMainCritAnnouncement = function (emailInfos) {
//   let i = 0;
//   const displayDate = dateHelper.getLongDayOfWeekLongMonthShortDayYear(getCritDate());
//   emailInfos.forEach((info) => {
//     emailHelper.send('mainCritAnnouncement', info, displayDate, '');
//     i += 1;
//   });
//   console.info('Done', i);
// },
// sendEarlySignUpForPresentersEmail = function (emailInfos, critDate) {
//   let i = 0;
//   const displayDate = dateHelper.getLongDayOfWeekLongMonthShortDayYear(critDate);
//   emailInfos.forEach((info) => {
//     emailHelper.send('earlySignUpForPresenters', info, displayDate);
//     i += 1;
//   });
//   console.info('Done', i);
// },
// createMailChimpCampaign = function (htmlFilename) {
//   const displayDate = dateHelper.getLongDayOfWeekLongMonthShortDayYear(getCritDate());
//   emailHelper.createCampaign(htmlFilename, displayDate, (response) => {
//     console.info('Campaign Created', response);
//   });
// },
// sendEarlySignUpForPresentersEmail = function (emailInfos, critDate) {
//   let i = 0;
//   emailInfos.forEach((info) => {
//     emailHelper.send('earlySignUpForPresenters', info, critDate);
//     i += 1;
//   });
//   console.info('Done', i);
// },
// removeAttendee = function () {
//   const eventId = '67c626fcc125d75a52658d4e';
//   dataStore.eventStore.removeAttendee(eventId, 'olivemhayes@gmail.com');
// },
// addAttendee = function () {
//   const eventId = '67c626fcc125d75a52658d4e',
//     attendee = {
//       email: 'jordanartim@gmail.com',
//       isPresenting: 'N'
//     };
//   dataStore.eventStore.addAttendee(eventId, attendee);
// },
// createMailChimpCampaign = function (htmlFilename) {
//   const displayDate = dateHelper.getLongDayOfWeekLongMonthShortDayYear(getCritDate());
//   emailHelper.createCampaign(htmlFilename, displayDate, (response) => {
//     console.info('Campaign Created', response);
//   });
// },
// sendPresenterConfirmation = function (emailInfo) {
//   emailHelper.send('presenterConfirmation', emailInfo, getCritDate());
// },
// doSendEarlySignUpForPresentersEmail = function (argument) {
//   let memberEmailInfos, formerPresenterEmails;
//   const earlySignupEmailRecipients = [],
//     moderatorEmails = emailInfoCreator.getModeratorEmailInfos().map(e => e.email);
//   emailInfoCreator.getMemberEmailInfos((infos) => {
//     memberEmailInfos = infos;
//   });
//   emailInfoCreator.getFormerPresenterEmails((emails) => {
//     formerPresenterEmails = emails.filter((e) => !moderatorEmails.includes(e));
//   });
//   memberEmailInfos.forEach((e) => {
//     if (!formerPresenterEmails.includes(e.email) && !moderatorEmails.includes(e.email)) {
//       earlySignupEmailRecipients.push(e);
//     }
//   });
//   sendEarlySignUpForPresentersEmail(earlySignupEmailRecipients);
// },
// sendEarlySignUpForPresentersEmail = function (emailInfos) {
//   let i = 0;
//   emailInfos.forEach((info) => {
//     emailHelper.send('earlySignUpForPresenters', info);
//     i += 1;
//   });
//   console.info('Done', i);
// },
// sendRequestToPresentEmail = function (emailInfos) {
//   let i = 0;
//   const displayDate = dateHelper.getLongDayOfWeekLongMonthShortDayYear(getCritDate());
//   emailInfos.forEach((info) => {
//     emailHelper.send('requestToPresent', info, displayDate);
//     i += 1;
//   });
//   console.info('Done', i);
// },
// copyAttendanceListToClipboard = function () {
//   const eventId = getEventId(),
//     stringArray = [];
//   if (eventId) {
//     dataStore.eventStore.fetchEvent(eventId, (event) => {
//       const presenterEmails = event.attendees.filter((a) => a.isPresenting === 'Y').map((a) => a.email),
//         attendeeEmails = event.attendees.filter((a) => a.isPresenting === 'N').map((a) => a.email);
//       presenterEmails.forEach((e) => dataStore.memberStore.getNameAndPhoneNumberFromEmail(e, (info) => {
//         stringArray.push(info.name + ' ' + info.phone);
//       }));
//       attendeeEmails.forEach((e) => dataStore.memberStore.getNameAndPhoneNumberFromEmail(e, (info) => {
//         stringArray.push(info.name);
//       }));
//     });
//   }
//   stringArray.sort();
//   htmlHelper.copyToClipboard(stringArray.join('\r\n'));
//   console.info('copied');
// },
// sendAtCapacityReminder = function (numberWaiting, emailInfos) {
//   const displayDate = dateHelper.getLongDayOfWeekLongMonthShortDayYear(getCritDate());
//   let i = 0;
//   emailInfos.forEach((info) => {
//     emailHelper.send('atCapacityReminder', info, displayDate, numberWaiting);
//     i += 1;
//   });
//   console.info('Done', i);
// },
// sendTest = function (emailInfos) {
//   const displayDate = dateHelper.getLongDayOfWeekLongMonthShortDayYear(getCritDate());
//   let i = 0;
//   emailInfos.forEach((info) => {
//     emailHelper.send('test', info, displayDate);
//     i += 1;
//   });
//   console.info('Done', i);
// },
// sendNewWebsiteFeatures = function (emailInfos) {
//   let i = 0;
//   emailInfos.forEach((info) => {
//     emailHelper.send('newWebsiteFeatures', info);
//     console.log(info.email);
//     i += 1;
//   });
//   console.log(`Sent ${i}`);
// },
// createBouncedMembersEmailInfos = function (callback) {
//   const getBouncedEmails = function () {
//       return ['artist@denisephilipbar.com',
//         'tuk93769@temple.edu',
//         'kamcl@karen-hunter-mclaughlin.com',
//         'robert@zurer.com',
//         'eugenekayser@msn.com',
//         'caitlinpeck@live.com'
//       ];
//     },
//     emailInfos = [],
//     bouncedEmails = getBouncedEmails();
//   dataStore.memberStore.fetchRegisteredMembers((members) => {
//     const bouncedMembers = members.filter((m) => {
//       return bouncedEmails.includes(m.email);
//     });
//     bouncedMembers.forEach((m) => {
//       emailInfos.push({ firstName: m.firstName, name: m.firstName + ' ' + m.lastName, email: m.email });
//     });
//     callback(emailInfos);
//   });
// },
// formatMemberPhoneNumbers = function () {
//   let i = 0;
//   dataStore.memberStore.fetchRegisteredMembers((members) => {
//     const membersWithPhones = members.filter((m) => m.phone);
//     membersWithPhones.forEach(m => {
//       const phone = stringHelper.formatLocalPhoneNumber(m.phone);
//       m.phone = phone;
//       dataStore.memberStore.updateMember(m);
//       i += 1;
//     });
//     console.log(`Done ${i}`);
//   });
// },
// modifyAudits = function () {
//   dataStore.auditStore.getAllAudits((audits) => {
//     // let index = 0;
//     const actions = [];
//     audits.forEach((a) => {
//       // const indexOf = a.action.indexOf(''),
//       //   action = '';
//       // if (indexOf !== -1) {
//       actions.push(a.action);
//       // a.action = action;
//       // auditStore.updateAudit(a);
//       // index += 1;
//       // }
//     });
//     console.info(new Set(actions));
//   });
// },
// sendArtEventsHaveBeenListed = function (emailInfos) {
//   emailInfos.forEach((info) => {
//     emailHelper.send('artEventsHaveBeenListed', info);
//   });
// },
// sendPresenterReminder = function (emailInfos) {
//   const displayDate = dateHelper.getLongDayOfWeekLongMonthShortDayYear(getCritDate());
//   emailInfos.forEach((info) => {
//     emailHelper.send('presenterReminder', info, displayDate);
//   });
// },
// sendWaitToPresentRequest = function (emailInfos) {
//   const displayDate = dateHelper.getLongDayOfWeekLongMonthShortDayYear(getCritDate());
//   emailInfos.forEach((info) => {
//     emailHelper.send('waitToPresentRequest', info, displayDate);
//   });
// },
// getDateStringInCurrentTimeZone = function (dateString) {
//   const date = new Date(dateString),
//     timeZoneOffsetInHours = date.getTimezoneOffset() / 60,
//     dateStringWithTimeZone = dateString + 'T00:00:00.000-0' + timeZoneOffsetInHours + ':00',
//     dateWithTimeZone = new Date(dateStringWithTimeZone);
//   return dateWithTimeZone.toLocaleString();
// },
// sendMailChimpCampaign = function () {
//   emailHelper.sendCampaign('crit_2024_06_16', getCritDate(), (response) => {
//     console.info('Campaign Sent', response);
//   });
// },
// subscribeToMailChimp = function () {
//   const subscriber = { email: 'bzurer@gmail.com', firstName: 'Robert', lastName: 'Zurer' };
//   dataStore.emailStore.subscribeToMailChimp(subscriber);
// },
// sendLastMinuteReminder = function () {
// },
// sendPresenterAddedFromWaitlist = function (emailInfo) {
//   emailHelper.send('presenterAddedFromWaitlist', emailInfo, getCritDate());
// },
// sendRegistrationConfirmation = function (emailInfo) {
//   emailHelper.send('registrationConfirmation', emailInfo);
// },
// canAddToMailChimpList = function () {
//   const email = ''; // emailToCheckInput.val();
//   dataStore.emailStore.canAddToMailChimpList(email, (canAdd) => {
//     console.error(canAdd ? email + ' is not on the list' : email + ' is already on the list');
//   });
// },
// getCritDate = function () {
//   return dateHelper.getFormattedDate(getDateStringInCurrentTimeZone(critDateInput.val()));
// }
// getEventClosestToNow = function (monthsBack, callback) {
//   dataStore.eventStore.fetchEvent(getEventId(), (event) => {
//     const endDate = new Date(event.startDate),
//       fromDate = dateHelper.getFromDate(endDate, monthsBack),
//       startMilliseconds = fromDate.getTime(),
//       endMilliseconds = endDate.getTime();
//     dataStore.eventStore.fetchEvents((events) => {
//       const presenters = [],
//         currentEvents = events.filter((e) => {
//           const eventDate = new Date(e.startDate),
//             eventMilliseconds = eventDate.getTime();
//           return eventMilliseconds >= startMilliseconds && eventMilliseconds <= endMilliseconds;
//         });
//       currentEvents.forEach((e) => {
//         console.log(e.startDate);
//         e.attendees.forEach((a) => {
//           if (a.isPresenting === 'Y' && !presenters.includes(a.email)) {
//             presenters.push(a.email);
//           }
//         });
//       });
//       callback(presenters);
//     });
//   });
// },