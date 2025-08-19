/* globals $ */
exports.initialize = function (eventListener, dataStore, dateHelper, htmlHelper) {
  'use strict';
  const memberTableContainer = $('.memberTableContainer'),
    adminUpdateMemberInfoSection = $('.adminUpdateMemberInfoSection'),
    hiddenSortDirection = $('#hiddenSortDirection'),
    hiddenSortField = $('#hiddenSortField'),
    updateMemberEmailContainer = $('#updateMemberEmailContainer'),
    updateEmailInput = $('#updateEmailInput'),
    updateMemberEmailButton = $('#updateMemberEmailButton'),
    getSortField = function () {
      return hiddenSortField.val();
    },
    setSortField = function (sortField) {
      hiddenSortField.val(sortField);
    },
    getSortDirection = function () {
      return hiddenSortDirection.val();
    },
    setSortDirection = function (sortDirection) {
      hiddenSortDirection.val(sortDirection);
    },
    toggleSortDirection = function (hidden, sortDirection) {
      if (getSortDirection() === 'ASC') {
        setSortDirection('DESC');
        return;
      }
      setSortDirection('ASC');
    },
    displaySortedMemberTable = function (e, sortField) {
      const field = e ? e.data.sortField : sortField;
      setSortField(field);
      displayMemberTable();
      toggleSortDirection();
    },
    persistIsActive = function (memberId, isActive) {
      dataStore.memberStore.persistIsActive(memberId, isActive, (response) => {
        if (!response.success) {
          eventListener.fire('Failure', [response.message]);
        }
        dataStore.memberStore.fetchRegisteredMember(memberId, (member) => {
          const action = isActive === 'N' ? 'Member has been blacklisted' : 'Member has been removed from the blacklist';
          dataStore.auditStore.createAudit(member.email, action);
        });
      });
    },
    createIsActiveFauxCheckbox = function (member, isActive) {
      const isActiveSpan = $('<span>').addClass('fauxCheckbox').text(isActive === 'Y' ? 'X' : '');
      isActiveSpan.on('click', function (e) {
        if (isActiveSpan.text() === 'X') {
          isActiveSpan.text('');
          isActive = 'N';
        } else {
          isActiveSpan.text('X');
          isActive = 'Y';
        }
        e.stopPropagation();
        eventListener.fire('IsUserLoggedIn', [email => {
          dataStore.memberStore.getMemberByEmail(email, function (loggedInMember) {
            if (loggedInMember.isAdmin === 'Y') {
              persistIsActive(member._id, isActive);
            }
          });
        }]);
      });
      return isActiveSpan;
    },
    persistIsAdmin = function (memberId, isAdmin) {
      eventListener.fire('IsUserLoggedIn', [email => dataStore.memberStore.getMemberByEmail(email, function (loggedInMember) {
        if (loggedInMember.isSuperAdmin === 'Y') {
          dataStore.memberStore.persistAdmin(memberId, isAdmin, (response) => {
            if (!response.success) {
              eventListener.fire('Failure', [response.message]);
            }
          });
        }
      })]);
    },
    createIsAdminFauxCheckbox = function (member, isAdmin) {
      const isAdminSpan = $('<span>').addClass('fauxCheckbox').text(isAdmin === 'Y' ? 'X' : '');
      isAdminSpan.on('click', function (e) {
        if (isAdminSpan.text() === 'X') {
          isAdminSpan.text('');
          isAdmin = 'N';
        } else {
          isAdminSpan.text('X');
          isAdmin = 'Y';
        }
        e.stopPropagation();
        eventListener.fire('IsUserLoggedIn', [email => {
          dataStore.memberStore.getMemberByEmail(email, function (loggedInMember) {
            if (loggedInMember.isAdmin === 'Y') {
              persistIsAdmin(member._id, isAdmin);
            }
          });
        }]);
      });
      return isAdminSpan;
    },
    updateMemberEmail = function (e) {
      const member = e.data.member,
        updatedEmail = updateEmailInput.val().trim();
      if (updatedEmail) {
        member.email = updatedEmail;
        dataStore.memberStore.updateMember(member, () => {
          eventListener.fire('UpdateMemberInfoControls', [updatedEmail]);
          eventListener.fire('DisplayUpdateMemberInfo');
        });
      }
    },
    showUpdateEmailControls = function (member) {
      updateMemberEmailButton.off('click');
      updateMemberEmailContainer.show();
      updateMemberEmailButton.on('click', { member: member }, updateMemberEmail);
    },
    showUpdateMemberProfileOrSendEmail = function (e) {
      const canSendEmail = e && e.ctrlKey && e.shiftKey,
        member = e.data.member;
      if (canSendEmail) {
        window.open('mailto:' + e.data.member.email + '_blank');
        return;
      }
      memberTableContainer.hide();
      adminUpdateMemberInfoSection.show();
      eventListener.fire('UpdateMemberInfoControls', [member.email]);
      eventListener.fire('DisplayUpdateMemberInfo');
      showUpdateEmailControls(member);
    },
    hideUpdateMemberProfile = function () {
      adminUpdateMemberInfoSection.hide();
      memberTableContainer.show();
    },
    createMemberTableHeaderRow = function () {
      const headerRow = htmlHelper.createRow('memberTableHeaderRow');
      htmlHelper.appendCell(headerRow, 'Name', 160).on('click', { sortField: 'lastName' }, displaySortedMemberTable);
      htmlHelper.appendCell(headerRow, 'Email', 250).on('click', { sortField: 'email' }, displaySortedMemberTable);
      htmlHelper.appendCell(headerRow, 'Phone', 100);
      htmlHelper.appendCell(headerRow, 'Instagram', 100);
      htmlHelper.appendCell(headerRow, 'Join Date', 100).on('click', { sortField: 'joinDate' }, displaySortedMemberTable);
      htmlHelper.appendCell(headerRow, 'Is Active?', 60);
      htmlHelper.appendCell(headerRow, 'Is Admin?', 60);
      htmlHelper.appendCell(headerRow, '', 60);
      return headerRow;
    },
    deleteMember = function (e) {
      toggleSortDirection();
      dataStore.memberStore.deleteMember(e.data.memberId, displayMemberTable);
      e.stopPropagation();
    },
    createMembersTableRow = function (member) {
      let cell;
      const row = htmlHelper.createRow('memberTableRow'),
        trashImage = htmlHelper.createImage('images/trash.png', null, 20, 'deleteMemberImage'),
        link = htmlHelper.createImageLink(member.instagram, 'images/instagram.png', 'instagram', true, 'instaLink');
      trashImage.on('click', { memberId: member._id }, deleteMember);
      row.on('click', { member: member }, showUpdateMemberProfileOrSendEmail);
      htmlHelper.appendCell(row, member.firstName + ' ' + member.lastName);
      htmlHelper.appendCell(row, member.email);
      htmlHelper.appendCell(row, member.phone);
      cell = htmlHelper.appendCell(row, '', 80);
      cell.append(link);
      htmlHelper.appendCell(row, dateHelper.getFormattedDate(member.joinDate));
      cell = htmlHelper.appendCell(row);
      cell.append(createIsActiveFauxCheckbox(member, member.isActive));
      cell = htmlHelper.appendCell(row);
      cell.append(createIsAdminFauxCheckbox(member, member.isAdmin));
      cell = htmlHelper.appendCell(row);
      cell.append(trashImage);
      return row;
    },
    createMembersTable = function () {
      const table = htmlHelper.createTable('membersTable');
      table.append(createMemberTableHeaderRow());
      return table;
    },
    createMemberInformation = function (members) {
      const memberInformation = [];
      members.forEach(function (member) {
        memberInformation.push({
          email: member.email,
          firstName: member.firstName,
          lastName: member.lastName
        });
      });
      return memberInformation;
    },
    copyMemberEmailCsvToClipboard = function (e) {
      const callback = function (members) {
        const memberInformation = createMemberInformation(members),
          memberStringArray = memberInformation.map(m => m.email + ',' + m.firstName + ',' + m.lastName);
        memberStringArray.unshift('Email, First, Last');
        htmlHelper.copyToClipboard(memberStringArray.join('\r\n'));
      };
      dataStore.memberStore.fetchRegisteredMembers(callback, getSortField(), getSortDirection());
    },
    displayMemberTable = function () {
      const membersTable = createMembersTable(),
        callback = function (members) {
          const memberCountSpan = $('<span>').addClass('memberCountSpan').text('Member count: ' + members.length),
            saveMemberCsvButton = $('<span>').addClass('saveMemberCsvButton saveCancelButtonLeft').text('Copy Members Csv To Clipboard'),
            line = $('<div>').addClass('line');
          saveMemberCsvButton.on('click', copyMemberEmailCsvToClipboard);
          line.append([memberCountSpan, saveMemberCsvButton]);
          memberTableContainer.empty();
          members.forEach(function (member) {
            membersTable.append(createMembersTableRow(member));
          });
          memberTableContainer.append(line);
          memberTableContainer.append(membersTable);
          $('.instaLink').on('click', (e) => {
            e.stopPropagation();
          });
          memberTableContainer.show();
        };
      dataStore.memberStore.fetchRegisteredMembers(callback, getSortField(), getSortDirection());
    },
    initializeControls = function () {
      displaySortedMemberTable('', 'joinDate');
    },
    initializeEventListener = function () {
      eventListener.addListener('DisplayMemberTable', displayMemberTable);
      eventListener.addListener('HideUpdateMemberInfo', hideUpdateMemberProfile);
    };
  initializeEventListener();
  initializeControls();
};