/* globals $ */
exports.initialize = function (dataStore, arrayHelper, dateHelper, htmlHelper) {
  'use strict';
  const updateMembersExhibitions = function (parentContainer, callback) {
    const renderHtml = function (member, arrayOfMemberNews) {
      const memberNewsContainer = htmlHelper.createContainer('memberNews'),
        memberLinks = htmlHelper.createContainer('memberLinks'),
        exhibitionInfoContainer = htmlHelper.createContainer(),
        memberNewsExists = arrayOfMemberNews.length > 0;
      callback(memberNewsExists);
      memberLinks.append(htmlHelper.createSpan(member.firstName + ' ' + member.lastName, 'memberName'));
      memberLinks.append(htmlHelper.createImageLink(member.website, 'https://www.phillycrit.com/images/globe.png', 'website', true));
      memberLinks.append(htmlHelper.createImageLink(member.instagram, 'https://www.phillycrit.com/images/instagram.png', 'instagram', true));
      memberNewsContainer.append(memberLinks);
      arrayOfMemberNews.forEach((memberNews, index) => {
        exhibitionInfoContainer.append(htmlHelper.createLink(memberNews.url, '', memberNews.title, true));
        exhibitionInfoContainer.append($('<div>').addClass('line'));
        exhibitionInfoContainer.append(htmlHelper.createContainer().text('Venue: ' + memberNews.venue));
        exhibitionInfoContainer.append(htmlHelper.createContainer().text('Location: ' + memberNews.location));
        if (memberNews.description) {
          exhibitionInfoContainer.append($('<div>').addClass('line'));
          exhibitionInfoContainer.append(htmlHelper.createContainer().addClass('description').text(memberNews.description));
          exhibitionInfoContainer.append($('<div>').addClass('line'));
        }
        if (memberNews.openingDate) {
          exhibitionInfoContainer.append(htmlHelper.createContainer().text('On view from ' + dateHelper.getShortMonthShortDayYear(memberNews.openingDate) + ' through ' + dateHelper.getShortMonthShortDayYear(memberNews.closingDate)));
        } else {
          exhibitionInfoContainer.append(htmlHelper.createContainer().text('On view through ' + dateHelper.getShortMonthShortDayYear(memberNews.closingDate)));
        }
        if (memberNews.receptionDate) {
          exhibitionInfoContainer.append(htmlHelper.createContainer().text('Opening Reception: ' + dateHelper.getShortMonthShortDayYear(memberNews.receptionDate) + ' ' + memberNews.receptionTime));
        }
        if (memberNews.closingReceptionDate) {
          exhibitionInfoContainer.append(htmlHelper.createContainer().text('Closing Reception: ' + dateHelper.getShortMonthShortDayYear(memberNews.closingReceptionDate) + ' ' + memberNews.closingReceptionTime));
        }
        if (arrayOfMemberNews.length > 1 && index < arrayOfMemberNews.length - 1) {
          exhibitionInfoContainer.append($('<div>').addClass('line'));
          exhibitionInfoContainer.append($('<div>').addClass('dashedLine'));
          exhibitionInfoContainer.append($('<div>').addClass('line'));
        }
        memberNewsContainer.append(exhibitionInfoContainer);
        parentContainer.append(memberNewsContainer);
      });
    };
    dataStore.memberNewsStore.retrieveActiveMemberNews((response) => {
      const allMemberNews = response.payload,
        uniqueMemberEails = arrayHelper.createUniqueArray(allMemberNews.map((m) => m.email));
      uniqueMemberEails.forEach((email) => {
        const uniqueMemberNews = allMemberNews.filter((news) => {
            return news.email === email;
          }),
          arrayOfMemberNews = arrayHelper.sortArrayByProperty(uniqueMemberNews, 'closingDate');
        dataStore.memberStore.getMemberByEmail(email, (member) => renderHtml(member, arrayOfMemberNews, parentContainer));
      });
    });
  };
  return {
    updateMembersExhibitions: updateMembersExhibitions
  };
};