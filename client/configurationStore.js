exports.initialize = function (eventListener, ajaxHelper) {
  'use strict';
  const fetchConfiguration = function (callback) {
      ajaxHelper.get('/configuration', function (response) {
        const config = response.payload;
        callback(config);
      });
    },
    updateConfiguration = function (configuration) {
      ajaxHelper.put('/configuration', { configuration: configuration }, function (response) {
        if (!response.success) {
          eventListener.fire('Failure', [response.message]);
          return;
        }
        eventListener.fire('Success', [response.message]);
      });
    };
  return {
    fetchConfiguration: fetchConfiguration,
    updateConfiguration: updateConfiguration
  };
};