/* globals $ */
exports.initialize = function (fs, configurationPersistor) {
  'use strict';
  const retrieveConfiguration = function (error, success) {
      const next = async function (configurationsCursor) {
        const array = await configurationsCursor.toArray();
        success(array[0]);
      };
      configurationPersistor.retrieveConfiguration(error, next);
    },
    updateConfiguration = function (configuration, error, success) {
      configurationPersistor.updateConfiguration(configuration, error, success);
    },
    retrieveConfigurationSetting = function (configPropertyName, error, success) {
      const next = function (config) {
        const configValue = config[configPropertyName];
        if (!configValue) {
          error(`The setting '${configPropertyName}' does not exist in the configuration`);
          return;
        }
        success(configValue);
      };
      retrieveConfiguration(error, next);
    },
    retrieveFileFromConfigurationSource = function (configPropertyName, error, success) {
      const callback = function (config) {
        if (!config[configPropertyName]) {
          error('The ' + configPropertyName + ' setting is not defined.');
          return;
        }
        fs.readFile(config[configPropertyName], 'utf-8', (err, data) => {
          if (err) {
            error('The ' + configPropertyName + ' was not retrieved. Details: ' + err);
            return '';
          }
          return success(data);
        });
      };
      retrieveConfiguration(error, callback);
    },
    retrieveFile = function (fileName, error, success) {
      fs.readFile(fileName, 'utf-8', (err, file) => {
        if (err) {
          error('The file was not retrieved. Details: ' + err);
          return '';
        }
        return success(file);
      });
    },
    retrieveSystemStatus = function (error, success) {
      retrieveConfigurationSetting('systemStatus', error, success);
    },
    retrieveMissionStatement = function (error, success) {
      retrieveFileFromConfigurationSource('missionStatementSource', error, success);
    },
    retrieveDetails = function (error, success) {
      retrieveFileFromConfigurationSource('detailsSource', error, success);
    },
    retrievePolicies = function (error, success) {
      retrieveFileFromConfigurationSource('policiesSource', error, success);
    },
    retrieveNews = function (error, success) {
      retrieveFileFromConfigurationSource('newsSource', error, success);
    },
    retrieveCookieMaxAge = function (error, success) {
      retrieveConfigurationSetting('cookieMaxAge', error, success);
    };
  return {
    retrieveDetails: retrieveDetails,
    retrievePolicies: retrievePolicies,
    retrieveNews: retrieveNews,
    updateConfiguration: updateConfiguration,
    retrieveConfiguration: retrieveConfiguration,
    retrieveCookieMaxAge: retrieveCookieMaxAge,
    retrieveMissionStatement: retrieveMissionStatement,
    retrieveSystemStatus: retrieveSystemStatus,
    retrieveFile: retrieveFile
  };
};