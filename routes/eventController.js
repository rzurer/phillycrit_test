exports.initialize = function (express, eventPersistor, auditPersistor, controllerHelper) {
  'use strict';
  const router = express.Router();
  router.get('/', function (req, res) {
    if (!controllerHelper.getRequestIsAuthorized(req, res)) {
      return;
    }
    const error = function (error) {
        res.send({ success: false, message: 'The events were retrieved. Details ' + error });
      },
      success = async function (eventsCursor) {
        const events = await eventsCursor.toArray();
        res.send({ success: true, message: 'The events were retrieved', payload: events });
      };
    eventPersistor.retrieveAllEvents(error, success);
  });
  router.get('/:eventId', function (req, res) {
    if (!controllerHelper.getRequestIsAuthorized(req, res)) {
      return;
    }
    const additionalErrorMessage = 'The event was not found. Details: ',
      error = function (error) {
        res.send({ success: false, message: additionalErrorMessage + error });
      },
      success = async function (event) {
        res.send({ success: true, message: 'The event was retrieved', payload: event });
      };
    eventPersistor.getEvent(req.params.eventId, error, success);
  });
  router.get('/:startDateString/:beforeOrAfter/', function (req, res) {
    if (!controllerHelper.getRequestIsAuthorized(req, res)) {
      return;
    }
    const additionalErrorMessage = 'The events were not retrieved. Details:',
      startDateString = req.params.startDateString,
      beforeOrAfter = req.params.beforeOrAfter,
      error = function (error) {
        res.send({ success: false, message: additionalErrorMessage + error });
      },
      success = async function (eventsCursor) {
        const events = await eventsCursor.sort({ startDate: -1 }).toArray();
        res.send({ success: true, message: '', payload: events });
      };
    if (beforeOrAfter === 'before') {
      eventPersistor.retrieveEventsBefore(startDateString, error, success);
      return;
    }
    eventPersistor.retrieveEventsAfter(startDateString, error, success);
  });
  router.get('/attendees/only/attendees', function (req, res) {
    if (!controllerHelper.getRequestIsAuthorized(req, res)) {
      return;
    }
    const additionalErrorMessage = 'The attendees were not found. Details:',
      error = function (error) {
        res.send({ success: false, message: additionalErrorMessage + error });
      },
      success = async function (attendeesCursor) {
        const attendees = await attendeesCursor.toArray();
        res.send({ success: true, message: '', payload: attendees });
      };
    eventPersistor.retrieveAttendees(error, success);
  });
  router.get('/attendees/:eventId', function (req, res) {
    if (!controllerHelper.getRequestIsAuthorized(req, res)) {
      return;
    }
    const additionalErrorMessage = 'The attendees were not found. Details:',
      error = function (error) {
        res.send({ success: false, message: additionalErrorMessage + error });
      },
      success = async function (attendeesCursor) {
        const attendees = await attendeesCursor.toArray();
        res.send({ success: true, message: '', payload: attendees });
      };
    eventPersistor.retrieveAttendees(req.params.eventId, error, success);
  });
  router.get('/startDateToCheck/:startDate', function (req, res) {
    if (!controllerHelper.getRequestIsAuthorized(req, res)) {
      return;
    }
    const error = function (error) {
        res.send({ success: false, message: error });
      },
      success = function (event) {
        res.send({ success: true, message: 'The start date already exists.', payload: event });
      };
    eventPersistor.checkStartDateExists(req.params.startDate, error, success);
  });
  router.post('/', function (req, res) {
    const additionalErrorMessage = 'The event was not added. Details: ',
      error = function (error) {
        res.send({ success: false, message: additionalErrorMessage + error });
      },
      success = function (result) {
        res.send({ success: true, message: 'The event was added.', payload: result });
      };
    eventPersistor.addEvent(req.body.event, error, success);
  });
  router.put('/base', function (req, res) {
    const event = req.body.event,
      additionalErrorMessage = 'The event was updated. Details: ',
      error = function (error) {
        res.send({ success: false, message: additionalErrorMessage + error });
      },
      success = function (result) {
        res.send({ success: true, message: 'The event was updated.', payload: result });
      };
    eventPersistor.updateBaseEvent(event, error, success);
  });
  router.put('/', function (req, res) {
    const event = req.body.event,
      audit = req.body.audit,
      additionalErrorMessage = 'The event was not updated. Details: ',
      error = function (error) {
        res.send({ success: false, message: additionalErrorMessage + error });
      },
      success = function (result) {
        if (audit) {
          auditPersistor.createAuditEntry(audit);
        }
        res.send({ success: true, message: 'The event was updated.', payload: result });
      };
    eventPersistor.updateEvent(event, error, success);
  });
  return router;
};