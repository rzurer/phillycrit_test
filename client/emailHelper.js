/* globals $ */
exports.initialize = function (eventListener, dataStore, userSession, dateHelper, cryptoHelper, htmlHelper) {
  'use strict';
  const saveTestEmail = false,
    fromName = 'Philly Crit',
    firstNameMergeTag = '*|FNAME|*',
    includeUnsubscribeLinkArray = ['test', 'earlySignUpForPresenters'],
    userLoginErrorMessage = 'There is no logged in user. Please log in again',
    createSubjectDictionary = function (critDate) { // move this
      return {
        signUpStrategyChange: '[Corrected] Announcing Early Signup for Newcomers and Infrequent Attendees',
        atCapacityReminder: 'The next Philly Crit is now at capacity. Have your plans changed?',
        earlySignUpForPresenters: 'Announcing early sign-up for presenters at Philly Crit on ' + critDate,
        requestToPresent: 'Present Your Work at Philly Crit on ' + critDate,
        crit_2025_09_14: 'Announcing Philly Crit Meeting #26 on ' + critDate,
        mainCritAnnouncement: 'Philly Crit on ' + critDate,
        roomChangeNotification: 'Room Change for Philly Crit on ' + critDate,
        presenterAddedFromWaitlist: 'Philly Crit Presenter Slot Now Open!',
        presenterConfirmation: 'Philly Crit Presenter Confirmation',
        presenterReminder: 'Your Upcoming Philly Crit',
        registrationConfirmation: 'Welcome to Philly Crit!',
        test: 'Test'
      };
    },
    getComposed = function (styles, content, contentName, firstName, callback) {
      userSession.userIsLoggedIn((email) => {
        if (!email) {
          eventListener.fire('Failure', [userLoginErrorMessage]);
          return;
        }
        const appendUnsubscribeLink = function (parentContainer, encryptedEmail) {
          const unsubscribeLinkContainer = htmlHelper.createContainer('unsubscribeLinkContainer');
          unsubscribeLinkContainer.append(htmlHelper.createSpan('If you no longer wish to receive our emails, click '));
          unsubscribeLinkContainer.append($('<a>').attr({ href: 'https://www.phillycrit.com/unsubscribe/?id=' + encryptedEmail, target: '_blank' }).addClass('unsubscribeLink').text('unsubscribe'));
          unsubscribeLinkContainer.append(htmlHelper.createSpan(' to be removed from our mailing list.'));
          if (includeUnsubscribeLinkArray.includes(contentName)) {
            parentContainer.append(unsubscribeLinkContainer);
          };
        };
        userSession.userIsLoggedIn((email) => {
          if (!email) {
            eventListener.fire('Failure', [userLoginErrorMessage]);
            return;
          }
          cryptoHelper.encrypt(email, (encryptedEmail) => { // this fails
            const docType = '<!DOCTYPE html>',
              html = $('<html>'),
              head = $('<head>'),
              style = $('<style>'),
              body = $('<body>'),
              emailContainer = htmlHelper.createContainer('email'),
              banner = $('<img>').attr({ id: 'bannerImage', src: 'https://www.phillycrit.com/uploads/banner.jpg' }),
              contentContainer = htmlHelper.createContainer('content'),
              greetingName = firstName || firstNameMergeTag,
              greeting = $('<div>').addClass('greetingContainer').text('Hello ' + greetingName + ','),
              signature = $('<div>').addClass('signature').text('All the best,').append($('<div>').text('Philly Crit')),
              footer = htmlHelper.createContainer('footer');
            html.append(head);
            head.append(style);
            style.append(styles);
            html.append(body);
            body.append(emailContainer);
            emailContainer.append(banner);
            emailContainer.append(contentContainer);
            contentContainer.append(greeting);
            contentContainer.append(content);
            contentContainer.append(signature);
            appendUnsubscribeLink(contentContainer, encryptedEmail);
            emailContainer.append(footer);
            footer.append($('<a>').attr({ href: 'mailto:admin@phillycrit.com', target: '_blank' }).text('admin@phillycrit.com'));
            footer.append($('<span>').text('|'));
            footer.append($('<a>').attr({ href: 'https://www.phillycrit.com', target: '_blank' }).text('phillycrit.com'));
            footer.append($('<span>').text('|'));
            footer.append($('<a>').attr({ href: 'https://www.instagram.com/phillygroupcrit', target: '_blank' }).text('@phillygroupcrit'));
            let emailHtml = docType + html[0].outerHTML;
            if (saveTestEmail) {
              dataStore.writeTextFile('./docs/testEmails/' + contentName + 'Test.html', emailHtml);
            }
            callback(emailHtml);
          });
        });
      });
    },
    sendEmail = function (email, contentName, critDate, numberWaiting) {
      dataStore.memberStore.getEmailInfoFromEmail(email, (emailInfo) => {
        send(contentName, emailInfo, critDate, numberWaiting);
      });
    },
    sendOutRegistrationConfirmation = function (email) {
      sendEmail(email, 'registrationConfirmation');
    },
    sendOutPresenterConfirmation = function (email, critDate) {
      sendEmail(email, 'presenterConfirmation', critDate);
    },
    sendOutPresenterAddedFromWaitlist = function (email, critDate) {
      sendEmail(email, 'presenterAddedFromWaitlist', critDate);
    },
    replaceMergeTags = function (content, critDate, numberWaiting, callback) {
      if (!critDate) {
        callback(content);
        return;
      }
      const critDateTag = '||EVENT_DATE||',
        imageDeadlineTag = '||IMAGE_DEADLINE||',
        numberWaitingTag = '||NUMBER_WAITING||',
        displayDate = dateHelper.getLongDayOfWeekLongMonthShortDayYear(critDate),
        imageDeadlineDaysBefore = 5,
        deadlineDate = new Date(critDate),
        imageDeadlineDate = deadlineDate.setDate(deadlineDate.getDate(critDate) - imageDeadlineDaysBefore),
        imageDeadline = dateHelper.getLongDayOfWeekLongMonthShortDayYear(imageDeadlineDate),
        mergedContent = content.replaceAll(critDateTag, displayDate)
          .replaceAll(imageDeadlineTag, imageDeadline)
          .replaceAll(numberWaitingTag, numberWaiting);
      callback(mergedContent);
    },
    create = function (contentName, firstName, critDate, numberWaiting, callback) {
      dataStore.emailStore.fetchEmailStyles((styles) => {
        if (styles) {
          dataStore.emailStore.fetchEmailContent(contentName, (content) => {
            if (content) {
              replaceMergeTags(content, critDate, numberWaiting, (mergedContent) => {
                getComposed(styles, mergedContent, contentName, firstName, callback);
              });
            }
          });
        }
      });
    },
    createBaseSettings = function (contentName, isCampaign, critDate) {
      return {
        subject: createSubjectDictionary(critDate)[contentName],
        fromName: fromName,
        replyTo: isCampaign ? 'info@phillycrit.com' : 'admin@phillycrit.com'
      };
    },
    createCampaign = function (contentName, critDate, callback) {
      const baseSettings = createBaseSettings(contentName, true, critDate),
        campaignCreatedCallback = function (campaignId) {
          setCampaignContent(contentName, campaignId, critDate, callback);
        },
        getListIdCallback = function (listId) {
          const campaignSettings = {
            type: 'regular',
            settings: {
              subject_line: baseSettings.subject,
              from_name: baseSettings.fromName,
              reply_to: baseSettings.replyTo
            },
            recipients: {
              list_id: listId
            }
          };
          dataStore.emailStore.createEmailCampaign(campaignSettings, campaignCreatedCallback);
        };
      dataStore.emailStore.getMailChimpMainAudienceListId(getListIdCallback);
    },
    setCampaignContent = function (contentName, campaignId, critDate, callback) {
      create(contentName, '', critDate, '', (campaignContent) => {
        dataStore.emailStore.setEmailCampaignContent(campaignId, campaignContent, critDate, callback);
      });
    },
    sendCampaign = function (contentName, critDate) {
      createCampaign(contentName, critDate, (campaignId) => {
        setCampaignContent(contentName, campaignId, critDate, () => {
          const sendCampaignCallback = function (response) {
            if (response.success) {
              eventListener.fire('Success', [response.message + ' [' + contentName + ']']);
              return;
            }
            eventListener.fire('Failure', [response.message]);
            dataStore.emailStore.getSendEmailCampaignChecklist(campaignId, (response) => {
              console.error(response);
            });
          };
          dataStore.emailStore.sendCampaignEmails(campaignId, sendCampaignCallback);
        });
      });
    },
    send = function (contentName, emailInfo, critDate, numberWaiting) {
      const settings = createBaseSettings(contentName, false, critDate),
        callback = function (response) {
          if (response.success) {
            // eventListener.fire('Success', [response.message + ' [' + contentName + '] ']);
            return;
          }
          eventListener.fire('Failure', [response.message]);
        };
      create(contentName, emailInfo.firstName, critDate, numberWaiting, (email) => {
        settings.contentName = contentName;
        settings.critDate = critDate ? dateHelper.getFormattedDate(critDate, false, true) : '----------';
        settings.emailAddress = emailInfo.email;
        settings.email = email;
        dataStore.emailStore.sendEmail(settings, (response) => {
          callback(response);
        });
      });
    },
    initializeEventListener = function () {
      eventListener.addListener('SendOutRegistrationConfirmationEmail', sendOutRegistrationConfirmation);
      eventListener.addListener('SendOutPresenterConfirmationEmail', sendOutPresenterConfirmation);
      eventListener.addListener('SendOutPresenterAddedFromWaitlistEmail', sendOutPresenterAddedFromWaitlist);
    };
  initializeEventListener();
  return {
    createCampaign: createCampaign,
    sendCampaign: sendCampaign,
    send: send
  };
};