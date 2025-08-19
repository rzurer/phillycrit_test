exports.initialize = function () {
  'use strict';
  const getRequestIsAuthorized = function (req, res) {
    if (req.headers['x-custom-header'] !== 'requestOriginatedOnServer') {
      res.render('notAuthorized');
      return false;
    }
    return true;
  };
  return {
    getRequestIsAuthorized: getRequestIsAuthorized
  };
};