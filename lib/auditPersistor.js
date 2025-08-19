exports.initialize = function (mongoPersistor, ObjectId, winston, env) {
  'use strict';
  const collectionName = 'audit',
    logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      transports: [new winston.transports.File({ filename: 'audit.log' })]
    }),
    createAuditEntry = function (audit, error, success) {
      const entry = {
        _id: new ObjectId(),
        createDate: new Date(),
        email: audit.email,
        action: audit.action,
        critDate: audit.critDate || '----------',
        device: audit.device || '----------',
        environment: env
      };
      // logger.info(entry);
      if (!error) {
        error = (err) => {
          console.error(err);
        };
      }
      if (!success) {
        success = (result) => {
        };
      }
      mongoPersistor.createEntry(collectionName, entry, error, success);
    },
    updateAuditEntry = function (audit, error, success) {
      const value = {
        criteria: {
          _id: audit._id
        },
        update: audit
      };
      mongoPersistor.updateEntry(collectionName, value, error, success);
    },
    retrieveAllAudits = function (error, success) {
      mongoPersistor.retrieveAllEntries(collectionName, error, success);
    },
    retrieveRecentAudits = function (error, success) {
      const getCompareDateString = function (daysBefore) {
          const date = new Date();
          date.setDate(date.getDate() - daysBefore);
          return date.toISOString();
        },
        value = {
          criteria: { createDate: { $gt: new Date(getCompareDateString(10)) } }
        };
      mongoPersistor.retrieveEntries(collectionName, value, error, success);
    };
  return {
    createAuditEntry: createAuditEntry,
    retrieveAllAudits: retrieveAllAudits,
    retrieveRecentAudits: retrieveRecentAudits,
    updateAuditEntry: updateAuditEntry
  };
};