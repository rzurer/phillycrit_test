exports.initialize = function (express, memberNewsPersistor, auditPersistor, controllerHelper) {
  'use strict';
  const router = express.Router();
  router.get('/retrieveAllMemberNews', function (req, res) {
    if (!controllerHelper.getRequestIsAuthorized(req, res)) {
      return;
    }
    const error = function (error) {
        res.send({ success: false, message: error });
      },
      success = async function (eventsCursor) {
        const memberNewsArray = await eventsCursor.toArray();
        res.send({ success: true, message: '', payload: memberNewsArray });
      };
    memberNewsPersistor.retrieveAllMemberNews(error, success);
  });
  router.get('/retrieveActiveMemberNews', function (req, res) {
    if (!controllerHelper.getRequestIsAuthorized(req, res)) {
      return;
    }
    const error = function (error) {
        res.send({ success: false, message: error });
      },
      success = async function (eventsCursor) {
        const memberNewsArray = await eventsCursor.toArray();
        res.send({ success: true, message: '', payload: memberNewsArray });
      };
    memberNewsPersistor.retrieveActiveMemberNews(error, success);
  });
  router.post('/addMemberNews', function (req, res) {
    const memberNews = req.body.memberNews,
      audit = req.body.audit,
      error = function (error) {
        res.send({ success: false, message: 'The member news was not added. Details: ' + error });
      },
      success = function (eventsCursor) {
        auditPersistor.createAuditEntry(audit);
        res.send({ success: true, message: 'The member news was added.' });
      };
    memberNewsPersistor.addMemberNews(memberNews, error, success);
  });
  router.put('/updateMemberNews', function (req, res) {
    const error = function (error) {
        res.send({ success: false, message: 'The member news was not updated. Details: ' + error });
      },
      success = function (eventsCursor) {
        res.send({ success: true, message: 'The member news was updated.' });
      };
    memberNewsPersistor.updateMemberNews(req.body.memberNews, error, success);
  });
  return router;
};