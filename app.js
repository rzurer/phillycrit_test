(function () {
  'use strict';
  require('dotenv').config({ quiet: true });
  let server;
  const express = require('express'),
    expressEnforcesSsl = require('express-enforces-ssl'),
    multer = require('multer'),
    storage = multer.diskStorage({
      destination: function (req, file, callback) {
        callback(null, './public/uploads');
      },
      filename: function (req, file, callback) {
        callback(null, file.originalname);
      }
    }),
    upload = multer({
      storage: storage
    }),
    app = express(),
    env = app.get('env'),
    fs = require('fs'),
    lineReader = require('line-reader'),
    path = require('path'),
    favicon = require('serve-favicon'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    mongo = require('mongodb'),
    browserify = require('browserify'),
    glob = require('glob'),
    browserifyHelper = require('./lib/browserifyHelper').initialize(fs, path, glob, browserify()),
    winston = require('winston'),
    MongoClient = mongo.MongoClient,
    ObjectId = mongo.ObjectId,
    mongoPersistor = require('./lib/mongoPersistor').initialize(MongoClient, ObjectId),
    auditPersistor = require('./lib/auditPersistor').initialize(mongoPersistor, ObjectId, winston, env),
    memberPersistor = require('./lib/memberPersistor').initialize(mongoPersistor),
    feedbackPersistor = require('./lib/feedbackPersistor').initialize(mongoPersistor),
    eventPersistor = require('./lib/eventPersistor').initialize(mongoPersistor),
    memberNewsPersistor = require('./lib/memberNewsPersistor').initialize(mongoPersistor),
    configurationPersistor = require('./lib/configurationPersistor').initialize(mongoPersistor),
    sendGrid = require('@sendgrid/mail'),
    mailChimp = require('@mailchimp/mailchimp_marketing'),
    cmsHelper = require('./lib/cmsHelper').initialize(fs, configurationPersistor),
    fileHelper = require('./lib/fileHelper').initialize(fs, lineReader),
    controllerHelper = require('./routes/controllerHelper').initialize(),
    adminController = require('./routes/adminController').initialize(express, eventPersistor, auditPersistor, controllerHelper),
    emailController = require('./routes/emailController').initialize(express, path, cmsHelper, mailChimp, sendGrid, auditPersistor, controllerHelper),
    eventController = require('./routes/eventController').initialize(express, eventPersistor, auditPersistor, controllerHelper),
    feedbackController = require('./routes/feedbackController').initialize(express, feedbackPersistor, controllerHelper),
    homeController = require('./routes/homeController').initialize(express, upload, env, cmsHelper, fileHelper, controllerHelper),
    memberController = require('./routes/memberController').initialize(express, memberPersistor, auditPersistor, controllerHelper),
    memberNewsController = require('./routes/memberNewsController').initialize(express, memberNewsPersistor, auditPersistor, controllerHelper);
  if (env !== 'development') {
    app.enable('trust proxy');
    app.use(expressEnforcesSsl());
  };
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'pug');
  app.use(favicon(path.join(__dirname, process.env.FAVICON_SOURCE)));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use('/', homeController);
  app.use('/members', memberController);
  app.use('/events', eventController);
  app.use('/memberNews', memberNewsController);
  app.use('/feedback', feedbackController);
  app.use('/admin', adminController);
  app.use('/email', emailController);
  app.use('/*splat', function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });
  if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err
      });
    });
  };
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {}
    });
  });
  app.set('port', process.env.PORT || process.env.DEVELOPMENT_PORT);
  server = app.listen(app.get('port'), function () {
    browserifyHelper.bundleSourceFiles();
    console.info('Express server listening on port ' + server.address().port);
  });
}());