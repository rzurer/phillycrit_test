exports.initialize = function (eventListener, ajaxHelper, htmlHelper) {
  'use strict';
  const fetchEmailStyles = function (callback) {
      ajaxHelper.get('email/fetchStyles', function (response) {
        if (!response.success) {
          eventListener.fire('Failure', [response.message]);
          return;
        }
        callback(response.payload);
      });
    },
    fetchEmailContent = function (contentName, callback) {
      ajaxHelper.get('email/fetchContent/' + contentName, function (response) {
        if (!response.success) {
          eventListener.fire('Failure', [response.message]);
          return;
        }
        callback(response.payload);
      });
    },
    canAddToMailChimpList = function (email, callback) {
      ajaxHelper.get('email/isOnMailChimpList/' + email, function (response) {
        callback(response.success);
      });
    },
    sendEmail = function (settings, callback) {
      const audit = {
        email: settings.emailAddress,
        action: 'Email sent - ' + settings.subject,
        critDate: settings.critDate,
        device: htmlHelper.getDeviceType()
      };
      ajaxHelper.post('email/send', { settings: settings, audit: audit }, function (response) {
        callback(response);
      });
    },
    getMailChimpMainAudienceListId = function (callback) {
      ajaxHelper.get('email/mailChimpMainAudienceListId', (listId) => callback(listId));
    },
    createEmailCampaign = function (settings, callback) {
      ajaxHelper.post('email/createCampaign', { settings: settings }, async function (response) {
        callback(response.id);
      });
    },
    setEmailCampaignContent = function (campaignId, campaignContent, critDate, callback) {
      ajaxHelper.post('email/setCampaignContent', { campaignId: campaignId, campaignContent: campaignContent }, function (response) {
        callback(campaignId);
      });
    },
    sendCampaignEmails = function (campaignId, callback) {
      ajaxHelper.post('email/sendCampaign', { campaignId: campaignId }, function (response) {
        callback(response);
      });
    },
    getSendEmailCampaignChecklist = function (campaignId, callback) {
      ajaxHelper.post('email/getSendChecklist', { campaignId: campaignId }, function (response) {
        callback(response);
      });
    },
    subscribeToMailChimp = function (subscriber) {
      const email = subscriber.email;
      canAddToMailChimpList(email, (canAdd) => {
        if (canAdd) {
          const audit = {
            email: email,
            action: 'Was added to the MailChimp audience',
            device: htmlHelper.getDeviceType()
          };
          ajaxHelper.post('/email/subscribeToMailChimp', { subscriber: subscriber, audit: audit }, function (mcResponse) {
            if (mcResponse.status === 400) {
              const message = JSON.parse(mcResponse.response.text).detail;
              eventListener.fire('Failure', [message]);
            }
          });
        }
      });
    },
    getCryptoKey = function (callback) {
      ajaxHelper.get('/email/getCryptoKey', function (response) { // the leading slash makes a difference
        callback(response);
      });
    };
  return {
    fetchEmailStyles: fetchEmailStyles,
    fetchEmailContent: fetchEmailContent,
    canAddToMailChimpList: canAddToMailChimpList,
    sendEmail: sendEmail,
    getMailChimpMainAudienceListId: getMailChimpMainAudienceListId,
    createEmailCampaign: createEmailCampaign,
    setEmailCampaignContent: setEmailCampaignContent,
    sendCampaignEmails: sendCampaignEmails,
    getSendEmailCampaignChecklist: getSendEmailCampaignChecklist,
    subscribeToMailChimp: subscribeToMailChimp,
    getCryptoKey: getCryptoKey
  };
};