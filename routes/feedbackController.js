exports.initialize = function (express, feedbackPersistor, controllerHelper) {
  'use strict';
  const router = express.Router();
  router.get('/', function (req, res) {
    if (!controllerHelper.getRequestIsAuthorized(req, res)) {
      return;
    }
    const error = function (error) {
        res.send({ success: false, message: error });
      },
      success = async function (feedbackCursor) {
        const feedback = await feedbackCursor.toArray();
        res.send({ success: true, message: '', payload: feedback });
      };
    feedbackPersistor.retrieveFeedback(error, success);
  });
  router.post('/', function (req, res) {
    const additionalErrorMessage = 'The feedback was not added. Details: ',
      error = function (error) {
        res.send({ success: false, message: additionalErrorMessage + error });
      },
      success = async function (result) {
        res.send({ success: true, message: 'The feedback was added.', payload: result });
      };
    feedbackPersistor.addFeedback(req.body.feedback, error, success);
  });
  return router;
};