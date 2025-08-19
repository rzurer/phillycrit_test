/* globals $ */
exports.initialize = function (eventListener, dataStore, encryptedEmail, cryptoHelper) {
  'use strict';
  cryptoHelper.decrypt(encryptedEmail, (decrypted) => {
    const feedback = {
      email: decrypted,
      createDate: new Date(),
      entry: 'Please unsubscribe me from your email list'
    };
    dataStore.feedbackStore.addFeedback(feedback, () => {
    });
  });
};