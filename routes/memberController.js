exports.initialize = function (express, memberPersistor, auditPersistor, controllerHelper) {
  'use strict';
  const router = express.Router();
  router.get('/', function (req, res) {
    if (!controllerHelper.getRequestIsAuthorized(req, res)) {
      return;
    }
    const error = function (err) {
        res.send({ success: false, message: 'retrieve members failure' + err });
      },
      success = async function (membersCursor) {
        const members = await membersCursor.toArray();
        res.send({ success: true, message: 'retrieve members success', payload: members });
      };
    memberPersistor.retrieveMembers(error, success);
  });
  router.get('/id/:id', function (req, res) {
    if (!controllerHelper.getRequestIsAuthorized(req, res)) {
      return;
    }
    const error = function (error) {
        res.send({ success: false, message: error });
      },
      success = function (member) {
        res.send({ success: true, message: 'member retrieved', payload: member });
      };
    memberPersistor.retrieveMemberById(req.params.id, error, success);
  });
  router.put('/changeIsActiveStatus', function (req, res) {
    const memberId = req.body.memberId,
      isActive = req.body.isActive,
      error = function (error) {
        res.send({ success: false, message: error });
      },
      success = function (result) {
        res.send({ success: true, message: 'isActive status updated', payload: result });
      };
    memberPersistor.changeIsActiveStatus(memberId, isActive, error, success);
  });
  router.put('/changeIsAdminStatus', function (req, res) {
    const memberId = req.body.memberId,
      isAdmin = req.body.isAdmin,
      error = function (error) {
        res.send({ success: false, message: error });
      },
      success = function (result) {
        res.send({ success: true, message: 'isAdmin status updated', payload: result });
      };
    memberPersistor.changeIsAdminStatus(memberId, isAdmin, error, success);
  });
  router.put('/', function (req, res) {
    const member = req.body.member,
      audit = req.body.audit,
      error = function (error) {
        res.send({ success: false, message: 'The member was not updated. Details: ' + error });
      },
      success = function (result) {
        auditPersistor.createAuditEntry(audit);
        res.send({ success: true, message: 'The member was updated.', payload: result });
      };
    memberPersistor.updateMember(member, error, success);
  });
  router.post('/', function (req, res) {
    const member = req.body.member,
      audit = req.body.audit,
      error = function (error) {
        res.send({ success: false, message: 'The member was not added. Details: ' + error });
      },
      success = function (result) {
        auditPersistor.createAuditEntry(audit);
        res.send({ success: true, message: 'The member was added.', payload: result });
      };
    memberPersistor.addMember(member, error, success);
  });
  router['delete']('/:memberId', function (req, res) {
    const memberId = req.params.memberId,
      error = function (error) {
        res.send({ success: false, message: 'The member was not deleted. Details: ' + error });
      },
      success = function (result) {
        res.send({ success: true, message: 'The member was deleted.', payload: result });
      };
    memberPersistor.deleteMember(memberId, error, success);
  });
  return router;
};