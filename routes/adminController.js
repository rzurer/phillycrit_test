exports.initialize = function (express, eventPersistor, auditPersistor, controllerHelper) {
  'use strict';
  const router = express.Router();
  router.get('/', function (req, res) {
    res.render('admin');
  });
  router.get('/audits', function (req, res) {
    if (!controllerHelper.getRequestIsAuthorized(req, res)) {
      return;
    }
    const error = function (error) {
        res.send({ success: false, message: error });
      },
      success = async function (auditsCursor) {
        const audits = await auditsCursor.toArray();
        res.send({ success: true, message: 'audits retrieved', payload: audits });
      };
    auditPersistor.retrieveRecentAudits(error, success);
  });
  router.get('/recentAudits', function (req, res) {
    if (!controllerHelper.getRequestIsAuthorized(req, res)) {
      return;
    }
    const error = function (error) {
        res.send({ success: false, message: error });
      },
      success = async function (auditsCursor) {
        const audits = await auditsCursor.toArray();
        res.send({ success: true, message: 'audits retrieved', payload: audits });
      };
    auditPersistor.retrieveRecentAudits(error, success);
  });
  router.put('/audit', function (req, res) {
    const error = function (error) {
        res.send({ success: false, message: error });
      },
      success = function (result) {
        res.send({ success: true, message: 'audit updated', payload: result });
      };
    auditPersistor.updateAuditEntry(req.body.audit, error, success);
  });
  router.post('/audit', function (req, res) {
    const error = function (error) {
        res.send({ success: false, message: error });
      },
      success = function (result) {
        res.send({ success: true, message: 'audit persisted', payload: result });
      },
      audit = {
        email: req.body.email,
        action: req.body.action,
        critDate: req.body.critDate,
        device: req.body.device
      };
    auditPersistor.createAuditEntry(audit, error, success);
  });
  router.post('/sendGridEvent', function (req, res) {
    const events = req.body,
      error = function (error) {
        res.send({ success: false, message: error });
      },
      success = function (result) {
        res.send({ success: true, message: 'audit persisted', payload: result });
      };
    if (events.length !== 1) {
      throw new Error('Webhook events array should always have a length of 1');
    }
    events.forEach(function (event) {
      const audit = {
        email: event.email,
        action: 'SendGrid ' + event.event + ' [' + event.contentName + ']',
        critDate: event.critDate
      };
      auditPersistor.createAuditEntry(audit, error, success);
    });
  });
  return router;
};
// const audits = [];
// fileHelper.processAuditLog((line) => {
//   audits.push(JSON.parse(line));
// }, () => {
//   res.send({ success: true, 'audits retrieved': audits });
// });