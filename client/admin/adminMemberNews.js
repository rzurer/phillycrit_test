/* globals $ */
exports.initialize = function (dataStore, arrayHelper, dateHelper, htmlHelper, regexHelper) {
  'use strict';
  const adminMemberNewsTableContainer = $('.adminMemberNewsTableContainer'),
    adminMemberNewsAddOrUpdateContainer = $('.adminMemberNewsAddOrUpdateContainer'),
    entryFields = $('.entryField'),
    hiddenMemberNewsId = $('#hiddenMemberNewsId'),
    memberEmailInput = $('#memberEmailInput'),
    memberNewsApprovalStatusSpan = $('#memberNewsApprovalStatusSpan'),
    memberNewsExhibitionTitleInput = $('#memberNewsExhibitionTitleInput'),
    memberNewsExhibitionUrlInput = $('#memberNewsExhibitionUrlInput'),
    memberNewsExhibitionVenueInput = $('#memberNewsExhibitionVenueInput'),
    memberNewsExhibitionLocationInput = $('#memberNewsExhibitionLocationInput'),
    memberNewsExhibitionDescriptionTextArea = $('#memberNewsExhibitionDescriptionTextArea'),
    openingDateInput = $('#openingDateInput'),
    closingDateInput = $('#closingDateInput'),
    receptionDateInput = $('#receptionDateInput'),
    receptionTimeInput = $('#receptionTimeInput'),
    closingReceptionDateInput = $('#closingReceptionDateInput'),
    closingReceptionTimeInput = $('#closingReceptionTimeInput'),
    createNewMemberNewsButton = $('#createNewMemberNewsButton'),
    updateMemberNewsButton = $('#updateMemberNewsButton'),
    publishMemberNewsButton = $('#publishMemberNewsButton'),
    addMemberNewsButton = $('#addMemberNewsButton'),
    showListButton = $('#showListButton'),
    memberNewsFullNameInput = $('#memberNewsFullNameInput'),
    memberNewsWebsiteInput = $('#memberNewsWebsiteInput'),
    memberNewsInstagramInput = $('#memberNewsInstagramInput'),
    getId = () => {
      return hiddenMemberNewsId.val();
    },
    getEmail = () => {
      return memberEmailInput.val();
    },
    getTitle = () => {
      return $('#memberNewsExhibitionTitleInput').val();
    },
    getUrl = () => {
      return $('#memberNewsExhibitionUrlInput').val();
    },
    getLocation = () => {
      return $('#memberNewsExhibitionLocationInput').val();
    },
    getVenue = () => {
      return $('#memberNewsExhibitionVenueInput').val();
    },
    getDescription = () => {
      return $('#memberNewsExhibitionDescriptionTextArea').val();
    },
    getOpeningDate = () => {
      const openingDateInput = $('#openingDateInput');
      return openingDateInput.val() ? dateHelper.adjustToLocalTimezone(new Date(openingDateInput.val())).toISOString() : '';
    },
    getClosingDate = () => {
      const closingDateInput = $('#closingDateInput');
      return closingDateInput.val() ? dateHelper.adjustToLocalTimezone(new Date(closingDateInput.val())).toISOString() : '';
    },
    getReceptionDate = () => {
      const receptionDateInput = $('#receptionDateInput');
      return receptionDateInput.val() ? dateHelper.adjustToLocalTimezone(new Date(receptionDateInput.val())).toISOString() : '';
    },
    getReceptionTime = () => {
      return $('#receptionTimeInput').val();
    },
    getClosingReceptionDate = () => {
      const closingReceptionDateInput = $('#closingReceptionDateInput');
      return closingReceptionDateInput.val() ? dateHelper.adjustToLocalTimezone(new Date(closingReceptionDateInput.val())).toISOString() : '';
    },
    getClosingReceptionTime = () => {
      return $('#closingReceptionTimeInput').val();
    },
    constructMemberNews = function () {
      return {
        _id: getId(),
        email: getEmail(),
        title: getTitle(),
        url: getUrl(),
        location: getLocation(),
        venue: getVenue(),
        description: getDescription(),
        openingDate: getOpeningDate(),
        closingDate: getClosingDate(),
        receptionDate: getReceptionDate(),
        receptionTime: getReceptionTime(),
        closingReceptionDate: getClosingReceptionDate(),
        closingReceptionTime: getClosingReceptionTime(),
        approvalStatus: 'approved'
      };
    },
    isValid = function (memberNews) {
      return regexHelper.isValidEmail(memberNews.email) &&
        memberNews.title && memberNews.title.trim().length > 0 &&
        memberNews.closingDate &&
        memberNews.location && memberNews.location.trim().length > 0 &&
        memberNews.venue && memberNews.venue.trim().length;
    },
    fillMemberFields = function (email) {
      dataStore.memberStore.getMemberByEmail(email, populateMemberFields);
    },
    populateMemberNewsTable = function () {
      adminMemberNewsTableContainer.empty();
      dataStore.memberNewsStore.retrieveAllMemberNews((response) => {
        const memberNews = arrayHelper.sortArrayByProperty(response.payload, 'closingDate'),
          memberNewsTable = createMemberNewsTable(memberNews);
        adminMemberNewsTableContainer.append(memberNewsTable);
      });
      enterListMode();
    },
    addMemberNews = function () {
      const memberNews = constructMemberNews();
      memberNews.approvalStatus = 'approved';
      if (isValid(memberNews)) {
        dataStore.memberNewsStore.addMemberNews(memberNews, (response) => {
        });
      } else {
        console.error('invalid');
      }
    },
    publishMemberNews = function () {
      const memberNews = constructMemberNews();
      memberNews.approvalStatus = 'approved';
      if (isValid(memberNews)) {
        dataStore.memberNewsStore.updateMemberNews(memberNews, (response) => {
        });
      } else {
        console.error('invalid');
      }
    },
    updateMemberNews = function () {
      const memberNews = constructMemberNews();
      if (isValid(memberNews)) {
        dataStore.memberNewsStore.updateMemberNews(memberNews, (response) => {
        });
      } else {
        console.error('invalid');
      }
    },
    clearEntryFields = function () {
      entryFields.val('');
    },
    enterListMode = function () {
      adminMemberNewsAddOrUpdateContainer.hide();
      adminMemberNewsTableContainer.show();
      createNewMemberNewsButton.show();
    },
    enterDetailMode = function () {
      adminMemberNewsTableContainer.hide();
      adminMemberNewsAddOrUpdateContainer.show();
    },
    enterAddMode = function () {
      clearEntryFields();
      updateMemberNewsButton.hide();
      publishMemberNewsButton.hide();
      addMemberNewsButton.show();
      enterDetailMode();
    },
    enterUpdateMode = function () {
      clearEntryFields();
      updateMemberNewsButton.show();
      publishMemberNewsButton.show();
      addMemberNewsButton.hide();
      enterDetailMode();
    },
    populateEntryFields = function (row) {
      const email = row.find('.emailCell').text(),
        approvalStatus = row.find('.approvalStatusCell').text();
      fillMemberFields(email);
      hiddenMemberNewsId.val(row.attr('id'));
      memberNewsApprovalStatusSpan.text(approvalStatus);
      memberNewsApprovalStatusSpan.css('color', approvalStatus === 'pending' ? 'red' : 'black');
      memberEmailInput.val(email);
      memberNewsExhibitionTitleInput.val(row.find('.titleCell').text());
      memberNewsExhibitionUrlInput.val(row.find('.urlCell').text());
      memberNewsExhibitionVenueInput.val(row.find('.venueCell').text());
      memberNewsExhibitionLocationInput.val(row.find('.locationCell').text());
      memberNewsExhibitionDescriptionTextArea.val(row.find('.descriptionCell').text());
      openingDateInput.val(row.find('.openingDateCell').text());
      closingDateInput.val(row.find('.closingDateCell').text());
      receptionDateInput.val(row.find('.receptionDateCell').text());
      receptionTimeInput.val(row.find('.receptionTimeCell').text());
      closingReceptionDateInput.val(row.find('.closingReceptionDateCell').text());
      closingReceptionTimeInput.val(row.find('.closingReceptionTimeCell').text());
    },
    modifyNewsItem = function () {
      const row = $(this);
      enterUpdateMode();
      populateEntryFields(row);
    },
    createMemberNewsTableHeaderRow = function () {
      const headerRow = htmlHelper.createRow('memberNewsTableHeaderRow');
      htmlHelper.appendCell(headerRow, 'Email');
      htmlHelper.appendCell(headerRow, 'Venue');
      htmlHelper.appendCell(headerRow, 'Title');
      htmlHelper.appendCell(headerRow, 'Opening');
      htmlHelper.appendCell(headerRow, 'Closing');
      htmlHelper.appendCell(headerRow, 'Reception');
      htmlHelper.appendCell(headerRow, 'Time');
      htmlHelper.appendCell(headerRow, 'Status');
      htmlHelper.appendCell(headerRow);
      htmlHelper.appendCell(headerRow);
      htmlHelper.appendCell(headerRow);
      htmlHelper.appendCell(headerRow);
      htmlHelper.appendCell(headerRow);
      return headerRow;
    },
    createMemberNewsTableRow = function (memberNewsItem) {
      const row = htmlHelper.createRow('memberNewsTableRow');
      let openingDate, receptionDate, closingReceptionDate;
      if (dateHelper.isPast(new Date(memberNewsItem.closingDate))) {
        row.css('color', 'gray');
      }
      if (memberNewsItem.openingDate) {
        openingDate = dateHelper.getYearShortMonthShortDay(memberNewsItem.openingDate);
      }
      if (memberNewsItem.receptionDate) {
        receptionDate = dateHelper.getYearShortMonthShortDay(memberNewsItem.receptionDate);
      }
      if (memberNewsItem.closingReceptionDate) {
        closingReceptionDate = dateHelper.getYearShortMonthShortDay(memberNewsItem.closingReceptionDate);
      }
      row.attr('id', memberNewsItem._id);
      row.on('click', modifyNewsItem);
      htmlHelper.appendCell(row, memberNewsItem.email, 250, false, 'emailCell');
      htmlHelper.appendCell(row, memberNewsItem.venue, 250, false, 'venueCell');
      htmlHelper.appendCell(row, memberNewsItem.title, 650, false, 'titleCell');
      htmlHelper.appendCell(row, openingDate, 100, false, 'openingDateCell');
      htmlHelper.appendCell(row, dateHelper.getYearShortMonthShortDay(memberNewsItem.closingDate), 100, false, 'closingDateCell');
      htmlHelper.appendCell(row, receptionDate, 100, false, 'receptionDateCell');
      htmlHelper.appendCell(row, memberNewsItem.receptionTime, 100, false, 'receptionTimeCell');
      htmlHelper.appendCell(row, memberNewsItem.approvalStatus, 50, false, 'approvalStatusCell');
      htmlHelper.appendCell(row, closingReceptionDate, 0, false, 'closingReceptionDateCell');
      htmlHelper.appendCell(row, memberNewsItem.closingReceptionTime, 0, false, 'closingReceptionTimeCell');
      htmlHelper.appendCell(row, memberNewsItem.url, 0, false, 'urlCell');
      htmlHelper.appendCell(row, memberNewsItem.location, 0, false, 'locationCell');
      htmlHelper.appendCell(row, memberNewsItem.description, 0, false, 'descriptionCell');
      return row;
    },
    createMemberNewsTable = function (memberNews) {
      const memberNewsTable = htmlHelper.createTable('memberNewsTable');
      memberNewsTable.append(createMemberNewsTableHeaderRow());
      if (memberNews && memberNews.length > 0) {
        memberNews.forEach((memberNewsItem) => {
          memberNewsTable.append(createMemberNewsTableRow(memberNewsItem));
        });
      }
      return memberNewsTable;
    },
    populateMemberFields = function (member) {
      memberNewsFullNameInput.val((member.firstName || '') + ' ' + (member.lastName || ''));
      memberNewsWebsiteInput.val(member.website);
      memberNewsInstagramInput.val(member.instagram);
    },
    assignEventHandlers = function () {
      memberEmailInput.on('blur', () => fillMemberFields(memberEmailInput.val()));
      showListButton.on('click', populateMemberNewsTable);
      createNewMemberNewsButton.on('click', enterAddMode);
      addMemberNewsButton.on('click', addMemberNews);
      publishMemberNewsButton.on('click', publishMemberNews);
      updateMemberNewsButton.on('click', updateMemberNews);
    };
  assignEventHandlers();
  populateMemberNewsTable();
  return {
    constructMemberNews: constructMemberNews
  };
};