exports.initialize = function () {
  'use strict';
  var subject = 'Philly Crit',
    signature = 'Robert Zurer',
    createSalutation = function (firstName) {
      return encodeURIComponent('Hi ' + firstName + ',\r\n\r\n');
    },
    mailTo = function (email, body) {
      document.location.href = document.location.href = 'mailto:' + email + '?subject=' + subject + '&body=' + body;
    },
    createPresenterReminderEmail = function (email, firstName, event) {
      var salutation, body, salutationMessage, message, closing;
      salutation = createSalutation(firstName);
      salutationMessage = 'We\'re looking forward to seeing your work at our next crit this coming ' + event.startDate + ' at ' + event.venue + ', ' + event.venueAddress + '.\r\n';
      message = 'Please reply to this email as soon as you can to confirm that you will still be presenting so that, if your plans have changed, we can make your presentation time available to someone else.' + '\r\n';
      closing = 'Thanks much,\r\n\r\n';
      body = salutation + encodeURIComponent(salutationMessage + message + closing + signature);
      mailTo(email, body);
    };
    // createEmailMailtoBody = function (email, firstName) {
    //   var salutation, salutationMessage, closing, message, body;
    //   salutation = createSalutation(firstName);
    //   salutationMessage = encodeURIComponent('Thank your for presenting at our first group crit.\r\n\r\n');
    //   message = encodeURIComponent('I really enjoyed your work. Your cogent input on the work of others was very much appreciated. It helped keep the level high.\r\n\r\n');
    //   closing = encodeURIComponent('It was our first attempt at this. If you have questions or feedback, positive or negative, it would really help us.\r\n' +
    //     'We plan to hold our second meeting soon and will keep you updated as to place and time,\r\n\r\n');
    //   body = salutation + salutationMessage + message + closing + signature;
    //   mailTo(email, body);
    // },
    // createEmailMailtoBody1 = function (firstName) {
    //   var salutation, salutationMessage, closing, message;
    //   salutation = createSalutation(firstName);
    //   salutationMessage = encodeURIComponent('Thank your for attending our first group crit.\r\n\r\n');
    //   message = encodeURIComponent('Your cogent input on the work of others was very much appreciated. It helped keep the level high.\r\n\r\n');
    //   closing = encodeURIComponent('It was our first attempt at this. If you have questions or feedback, positive or negative, it would really help us.\r\n' +
    //     'We plan to hold our second meeting soon and will keep you updated as to place and time,\r\n\r\n');
    //   return salutation + salutationMessage + message + closing + signature;
    // };
  return {
    createPresenterReminderEmail: createPresenterReminderEmail
  };
};