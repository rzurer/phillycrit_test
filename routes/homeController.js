exports.initialize = function (express, upload, env, cmsHelper, fileHelper, controllerHelper) {
  'use strict';
  const router = express.Router(),
    profilesFilePath = './public/uploads/';
  router.get('/', function (req, res) {
    const error = (error) => {
        res.render('error', {
          message: error,
          error: { status: '' }
        });
      },
      success = (systemStatus) => {
        switch (systemStatus) {
          case 'up':
            res.render('home');
            break;
          case 'down':
            res.render('siteDown');
            break;
          default:
            res.render('error', {
              message: `The value "${systemStatus}" is not valid for system status`,
              error: { status: '' }
            });
        };
      };
    if (env === 'production') {
      cmsHelper.retrieveSystemStatus(error, success);
      return;
    };
    res.render('home');
  });
  router.get('/notAuthorized', function (req, res) {
    res.render('notAuthorized');
  });
  router.get('/siteDown', function (req, res) {
    res.render('siteDown');
  });
  router.get('/communityGuidelines', function (req, res) {
    res.render('home', { trigger: 'communityGuidlines' });
  });
  router.get('/register', function (req, res) {
    res.render('registerFromEmail');
  });
  router.get('/unsubscribe', function (req, res) {
    const { id } = req.query;
    res.render('unsubscribe', { encryptedEmail: id });
  });
  router.get('/getEnvironment', function (req, res) {
    if (!controllerHelper.getRequestIsAuthorized(req, res)) {
      return;
    }
    res.send({ success: true, message: 'audits retrieved', payload: env });
  });
  router.get('/getCookies', function (req, res) {
    if (!controllerHelper.getRequestIsAuthorized(req, res)) {
      return;
    }
    res.send({ success: true, message: 'cookies retrieved', payload: req.cookies });
  });
  router.get('/configuration', function (req, res) {
    if (!controllerHelper.getRequestIsAuthorized(req, res)) {
      return;
    }
    const error = function (error) {
        res.send({ success: false, message: 'The configuration was not retrieved. Details: ' + error });
      },
      success = async function (configuration) {
        res.send({ success: true, message: 'The configuration was retrieved.', payload: configuration });
      };
    cmsHelper.retrieveConfiguration(error, success);
  });
  router.get('/missionStatement', function (req, res) {
    if (!controllerHelper.getRequestIsAuthorized(req, res)) {
      return;
    }
    const error = function (error) {
        res.send({ success: false, message: 'The mission statement document was not retrieved. Details: ' + error });
      },
      success = async function (missionStatement) {
        res.send({ success: true, message: 'The mission statement document was retrieved.', payload: missionStatement });
      };
    cmsHelper.retrieveMissionStatement(error, success);
  });
  router.get('/details', function (req, res) {
    if (!controllerHelper.getRequestIsAuthorized(req, res)) {
      return;
    }
    const error = function (error) {
        res.send({ success: false, message: 'The details document was not retrieved. Details: ' + error });
      },
      success = async function (details) {
        res.send({ success: true, message: 'The details document was retrieved.', payload: details });
      };
    cmsHelper.retrieveDetails(error, success);
  });
  router.get('/policies', function (req, res) {
    if (!controllerHelper.getRequestIsAuthorized(req, res)) {
      return;
    }
    const error = function (error) {
        res.send({ success: false, message: 'The policies document was not retrieved. Details: ' + error });
      },
      success = async function (policies) {
        res.send({ success: true, message: 'The policies document was retrieved.', payload: policies });
      };
    cmsHelper.retrievePolicies(error, success);
  });
  router.get('/aboutUs/:htmlFilename', function (req, res) {
    if (!controllerHelper.getRequestIsAuthorized(req, res)) {
      return;
    }
    const htmlFilename = profilesFilePath + req.params.htmlFilename,
      error = function (error) {
        res.send({ success: false, message: 'The about us profile was not retrieved. Details: ' + error });
      },
      success = async function (aboutUs) {
        res.send({ success: true, message: 'The about us profile was retrieved.', payload: aboutUs });
      };
    cmsHelper.retrieveFile(htmlFilename, error, success);
  });
  router.get('/news', function (req, res) {
    if (!controllerHelper.getRequestIsAuthorized(req, res)) {
      return;
    }
    const error = function (error) {
        res.send({ success: false, message: 'The news document was not retrieved. Details: ' + error });
      },
      success = async function (news) {
        res.send({ success: true, message: 'The news document was retrieved.', payload: news });
      };
    cmsHelper.retrieveNews(error, success);
  });
  router.post('/uploadMissionStatement', function (req, res) {
    upload.single('missionStatement')(req, res, function (error) {
      if (error) {
        res.send({ success: false, message: 'The mission statement was not uploaded. Details: ' + error });
        return;
      }
      res.send({ success: true, message: 'The mission statement was uploaded.' });
    });
  });
  router.post('/writeTextFile', function (req, res) {
    fileHelper.writeTextFile(req.body.filePath, req.body.text, function (response) {
      res.send(response);
    });
  });
  router.post('/uploadPolicies', function (req, res) {
    upload.single('policies')(req, res, function (error) {
      if (error) {
        res.send({ success: false, message: 'The policies document was not uploaded. Details: ' + error });
        return;
      }
      res.send({ success: true, message: 'The policies document was uploaded.' });
    });
  });
  router.post('/uploadNews', function (req, res) {
    upload.single('news')(req, res, function (error) {
      if (error) {
        res.send({ success: false, message: 'The news was not uploaded. Details: ' + error });
      }
      res.send({ success: true, message: 'The news was uploaded.' });
    });
  });
  router.put('/setCookie/:cookieName/:cookieValue', function (req, res) {
    const cookieName = req.params.cookieName,
      cookieValue = req.params.cookieValue,
      cookieOptions = {
        secure: true,
        httpOnly: true,
        sameSite: 'lax'
      },
      error = function (error) {
        res.send({ success: false, message: 'The cookie max age was not retrieved. Details: ' + error });
      },
      success = function (cookieMaxAge) {
        cookieOptions.maxAge = Number(cookieMaxAge) * 60000;
        res.cookie(cookieName, cookieValue, cookieOptions);
        res.send({ success: true, message: 'The cookie max age was retrieved', payload: cookieMaxAge });
      };
    cmsHelper.retrieveCookieMaxAge(error, success);
  });
  router.put('/configuration', function (req, res) {
    const error = function (error) {
        res.send({ success: false, message: 'The configuration was not updated. Details: ' + error });
      },
      success = async function (payload) {
        res.send({ success: true, message: 'The configuration was updated.' });
      };
    cmsHelper.updateConfiguration(req.body.configuration, error, success);
  });
  return router;
};