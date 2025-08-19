/* globals $ */
exports.initialize = function (htmlHelper, attendeeClerk) {
  'use strict';
  const setClick = htmlHelper.setClick,
    getPresentationSpotsLeftDisplay = function (presentationSpotsLeft) {
      if (!presentationSpotsLeft) {
        return '';
      }
      switch (presentationSpotsLeft) {
        case 0:
          return '(None left)';
        case 1:
          return '(1 spot left)';
        default:
          return '(' + presentationSpotsLeft + ' spots left)';
      }
    },
    createEventAttendeesHeaderRow = function (presentationSpotsLeft, loggedInMemberIsAdmin, event) {
      let cell;
      const row = htmlHelper.createRow('eventAttendeesHeaderRow'),
        displayPresentationSpotsLeftSpan = $('<span>').attr('id', 'displayPresentationSpotsLeftSpan').addClass('.displayPresentationInfo').text(getPresentationSpotsLeftDisplay(presentationSpotsLeft)),
        presentingLabel = $('<span>').attr('id', 'presentingLabel').addClass('displayPresentationInfo').text('Presenting?');
      htmlHelper.appendCell(row, 'Name', '', '', 'attendeeName');
      htmlHelper.appendCell(row, 'Web');
      htmlHelper.appendCell(row, 'IG', '', '', 'imageHeaderCell');
      htmlHelper.appendCell(row, 'FB', '', '', 'imageHeaderCell');
      if (event.isAttendeeSignupOnly !== 'Y') {
        cell = htmlHelper.appendCell(row);
        cell.append(presentingLabel);
        cell.append(displayPresentationSpotsLeftSpan);
      }
      if (loggedInMemberIsAdmin) {
        htmlHelper.appendCell(row, 'No Show', '', false, 'noShowCell');
      }
      return row;
    },
    getClickFunction = function (e) {
      if (e.data.waitlistNumber) {
        attendeeClerk.removeFromWaitlist(e);
        return;
      }
      attendeeClerk.signUpOrDeclineToPresent(e);
    },
    createEventAttendeesRow = function (attendingMember, loggedInMemberEmail, presentationSpotsLeft, event, loggedInMemberIsAdmin) {
      let cell, link;
      const createIsPresentingFauxCheckbox = function (memberEmail, loggedInMemberEmail, isPresenting, waitlistNumber, presentationSpotsLeft, event) {
          let isPresentingFauxCheckbox;
          const memberIsLoggedIn = (memberEmail === loggedInMemberEmail);
          if (waitlistNumber) {
            isPresentingFauxCheckbox = $('<span>').addClass('fauxCheckbox whitebold').text(waitlistNumber);
          } else {
            isPresentingFauxCheckbox = $('<span>').addClass('fauxCheckbox').text(isPresenting === 'Y' ? 'X' : '');
          }
          htmlHelper.disableControl(isPresentingFauxCheckbox);
          if (memberIsLoggedIn && presentationSpotsLeft > 0) {
            isPresentingFauxCheckbox.css('opacity', '1.0');
            setClick(isPresentingFauxCheckbox, { event: event }, getClickFunction);
          }
          return isPresentingFauxCheckbox;
        },
        createNoShowFauxCheckbox = function (email, event) {
          const isNoShow = event.noShows && event.noShows.includes(email),
            noShowFauxCheckbox = $('<span>').addClass('fauxCheckbox noShowFauxCheckbox').text(isNoShow ? 'X' : '');
          setClick(noShowFauxCheckbox, { event: event, email: email }, attendeeClerk.addOrRemoveNoShow);
          return noShowFauxCheckbox;
        },
        member = attendingMember.member,
        isPresenting = attendingMember.isPresenting,
        waitlistNumber = attendingMember.waitlistNumber,
        row = htmlHelper.createRow('eventAttendeesRow'),
        isPresentingFauxCheckbox = createIsPresentingFauxCheckbox(member.email, loggedInMemberEmail, isPresenting, waitlistNumber, presentationSpotsLeft, event),
        isNoShowFauxCheckbox = createNoShowFauxCheckbox(attendingMember.member.email, event),
        pgp = member.pgp ? ' (' + member.pgp + ')' : '',
        pgpSpan = $('<span>').addClass('pgpSpan').text(pgp),
        nameSpan = $('<span>').addClass('nameSpan').text(member.firstName + ' ' + member.lastName);
      cell = htmlHelper.appendCell(row);
      cell.append(nameSpan);
      cell.append(pgpSpan);
      cell = htmlHelper.appendCell(row, '', 80);
      link = htmlHelper.createImageLink(member.website, 'images/globe.png', 'website', true);
      cell.append(link);
      cell = htmlHelper.appendCell(row, '', 80);
      link = htmlHelper.createImageLink(member.instagram, 'images/instagram.png', 'instagram', true);
      cell.append(link);
      cell = htmlHelper.appendCell(row, '', 80);
      link = htmlHelper.createImageLink(member.facebook, 'images/facebook.png', 'facebook', true);
      cell.append(link);
      if (event.isAttendeeSignupOnly !== 'Y') {
        cell = htmlHelper.appendCell(row, '', 80);
        cell.append(isPresentingFauxCheckbox);
      }
      if (loggedInMemberIsAdmin) {
        cell = htmlHelper.appendCell(row, '', 80, false, 'noShowCell');
        cell.append(isNoShowFauxCheckbox);
      }
      if (member && loggedInMemberEmail) {
        if (member.email.toLowerCase() === loggedInMemberEmail.toLowerCase()) {
          row.css('font-weight', 'bold');
        }
      }
      return row;
    },
    createEventAttendeesTable = function (attendingMembersArray, loggedInMemberEmail, presentationSpotsLeft, event, loggedInMemberIsAdmin) {
      let row;
      const table = htmlHelper.createTable().attr('id', 'eventAttendeesTable');
      if (attendingMembersArray.length > 0) {
        table.append(createEventAttendeesHeaderRow(presentationSpotsLeft, loggedInMemberIsAdmin, event));
        attendingMembersArray.forEach(function (attendingMember) {
          row = createEventAttendeesRow(attendingMember, loggedInMemberEmail, presentationSpotsLeft, event, loggedInMemberIsAdmin);
          table.append(row);
        });
      }
      return table;
    };
  return {
    createEventAttendeesTable: createEventAttendeesTable
  };
};