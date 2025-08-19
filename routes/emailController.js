exports.initialize = function (express, path, cmsHelper, mailChimp, sendGrid, auditPersistor, controllerHelper) {
  'use strict';
  const router = express.Router(),
    emailDirectory = './public/emails/',
    stylesFilePath = './public/stylesheets/email.css',
    init = function () {
      sendGrid.setApiKey(process.env.SENDGRID_API_KEY);
      mailChimp.setConfig({
        apiKey: process.env.MAILCHIMP_API_KEY,
        server: process.env.MAILCHIMP_REGION
      });
    },
    getEmailContentFilePath = function (contentName) {
      return path.join(emailDirectory, contentName + '.html');
    };
  router.get('/mailChimpSignup', function (req, res) {
    res.render('mailChimpSignup');
  });
  router.get('/mailChimpMainAudienceListId', function (req, res) {
    if (!controllerHelper.getRequestIsAuthorized(req, res)) {
      return;
    }
    res.send(process.env.MAILCHIMP_MAIN_AUDIENCE_LIST_ID);
  });
  router.get('/getCryptoKey', function (req, res) {
    if (!controllerHelper.getRequestIsAuthorized(req, res)) {
      return;
    }
    res.send(process.env.CRYPTO_KEY);
  });
  router.get('/fetchStyles', function (req, res) {
    if (!controllerHelper.getRequestIsAuthorized(req, res)) {
      return;
    }
    const additionalErrorMessage = 'The styles were not retrieved. Details: ',
      error = function (error) {
        res.send({ success: false, message: additionalErrorMessage + error });
      },
      success = function (file) {
        res.send({ success: true, message: 'The styles were retrieved', payload: file });
      };
    cmsHelper.retrieveFile(stylesFilePath, error, success);
  });
  router.get('/fetchContent/:contentName', function (req, res) {
    if (!controllerHelper.getRequestIsAuthorized(req, res)) {
      return;
    }
    const additionalErrorMessage = 'The content was not retrieved. Details: ',
      error = function (error) {
        res.send({ success: false, message: additionalErrorMessage + error });
      },
      success = function (file) {
        res.send({ success: true, message: 'The content was not retrieved', payload: file });
      };
    cmsHelper.retrieveFile(getEmailContentFilePath(req.params.contentName), error, success);
  });
  router.get('/isOnMailChimpList/:emailAddress', async function (req, res) {
    if (!controllerHelper.getRequestIsAuthorized(req, res)) {
      return;
    }
    const email = req.params.emailAddress;
    try {
      const response = await mailChimp.lists.getListMember(process.env.MAILCHIMP_MAIN_AUDIENCE_LIST_ID, email);
      if (response.status === 'archived') {
        res.send({ success: true, message: email + ' was found on the list but was archived' });
        return;
      }
      res.send({ success: false, message: response.email_address + ' is already on the list' });
    } catch (err) {
      res.send({ success: true, message: email + ' was not found on the list' });
    }
  });
  router.post('/subscribeToMailChimp', function (req, res) {
    const subscriber = req.body.subscriber,
      audit = req.body.audit,
      body = {
        email_address: subscriber.email,
        status: 'subscribed',
        merge_fields: {
          FNAME: subscriber.firstName,
          LNAME: subscriber.lastName
        }
      },
      addMemberToMailChimpList = async function () {
        try {
          const response = await mailChimp.lists.addListMember(process.env.MAILCHIMP_MAIN_AUDIENCE_LIST_ID, body);
          auditPersistor.createAuditEntry(audit);
          res.send({ success: true, message: 'Subscribe to MailChimp success ', payload: response });
        } catch (error) {
          res.send({ success: false, message: 'Subscribe to MailChimp failure' + error });
        }
      };
    addMemberToMailChimpList();
  });
  router.post('/createCampaign', async function (req, res) {
    const settings = req.body.settings,
      run = async () => {
        res.send(await mailChimp.campaigns.create(settings));
      };
    run();
  });
  router.post('/setCampaignContent', function (req, res) {
    const campaignId = req.body.campaignId,
      campaignContent = req.body.campaignContent,
      run = async () => {
        res.send(await mailChimp.campaigns.setContent(campaignId, { html: campaignContent }));
      };
    run();
  });
  router.post('/getSendChecklist', function (req, res) {
    const campaignId = req.body.campaignId,
      run = async () => {
        try {
          res.send(await mailChimp.campaigns.getSendChecklist(campaignId));
        } catch (err) {
          res.send(err);
        }
      };
    run();
  });
  router.post('/sendCampaign', function (req, res) {
    const campaignId = req.body.campaignId,
      run = async () => {
        try {
          const responseObject = await mailChimp.campaigns.send(campaignId);
          res.send({ success: true, message: 'Campaign was sent ', payload: responseObject });
        } catch (error) {
          res.send({ success: false, message: 'Campaign was not sent ' + error });
        }
      };
    run();
  });
  router.post('/send', function (req, res) {
    const audit = req.body.audit,
      settings = req.body.settings,
      message = {
        custom_args: {
          contentName: settings.contentName,
          critDate: settings.critDate
        },
        to: settings.emailAddress,
        from: {
          name: settings.fromName,
          email: settings.replyTo
        },
        subject: settings.subject,
        html: settings.email
      };
    sendGrid.send(message).then(() => {
      auditPersistor.createAuditEntry(audit);
      res.send({ success: true, message: 'Email was sent' });
    }).catch((error) => {
      const errorMessage = 'Email was not sent' + error;
      audit.action = audit.action + ' -- ' + errorMessage;
      auditPersistor.createAuditEntry(audit);
      res.send({ success: false, message: errorMessage });
    });
  });
  init();
  return router;
};