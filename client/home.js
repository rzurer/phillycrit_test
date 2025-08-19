/* globals $ */
exports.initialize = function (eventListener, htmlHelper, dataStore, trigger, membersExhibitionFactory /*, auditTableFactory */) {
  'use strict';
  const modal = $('#modal'),
    feedbackInput = $('#feedbackInput'),
    memberNewsContainer = $('#memberNewsContainer'),
    memberNews = $('#memberNews'),
    memberNewsCloseButton = $('#memberNewsCloseButton'),
    membersListHeaderContainer = $('#membersListHeaderContainer'),
    // mobileAuditsTableContainer = $('#mobileAuditsTableContainer'),
    bannerImage = $('#bannerImage'),
    navButtons = $('.navButton'),
    mobileMenuItems = $('.mobileMenuItem'),
    loggedInOnly = $('.loggedInOnly'),
    mainSections = $('.mainSection'),
    mainContentSection = $('#mainContentSection'),
    updateMemberInfoSection = $('.updateMemberInfoSection'),
    signUpForCritSection = $('.signUpForCritSection'),
    aboutSection = $('.aboutSection'),
    detailsSection = $('.detailsSection'),
    policiesSection = $('.policiesSection'),
    loginSection = $('.loginSection'),
    membersListSection = $('.membersListSection'),
    // mobileAuditsSection = $('.mobileAuditsSection'),
    registerSection = $('.registerSection'),
    feedbackSection = $('.feedbackSection'),
    memberNewsEntrySection = $('.memberNewsEntrySection'),
    aboutUsSection = $('.aboutUsSection'),
    aboutUsContentSection = $('.aboutUsContentSection'),
    mailchimpSignupSection = $('.mailchimpSignupSection'),
    navigationMenu = $('#navigationMenu'),
    navLogoutMenu = $('#navLogoutMenu'),
    navUpdateMemberProfileMenu = $('#navUpdateMemberProfileMenu'),
    navMissionMenu = $('#navMissionMenu'),
    navDetailsMenu = $('#navDetailsMenu'),
    navPoliciesMenu = $('#navPoliciesMenu'),
    navSignupForCritMenu = $('#navSignupForCritMenu'),
    navRobertZurerMenu = $('#navRobertZurerMenu'),
    navKateMcCammonMenu = $('#navKateMcCammonMenu'),
    navAlanLankinMenu = $('#navAlanLankinMenu'),
    navAlbertFungMenu = $('#navAlbertFungMenu'),
    navMissionButton = $('#navMissionButton'),
    navDetailsButton = $('#navDetailsButton'),
    navPoliciesButton = $('#navPoliciesButton'),
    navFeedbackMenu = $('#navFeedbackMenu'),
    navFeedbackButton = $('#navFeedbackButton'),
    navMemberNewsMenu = $('#navMemberNewsMenu'),
    navMemberNewsButton = $('#navMemberNewsButton'),
    navMembersListMenu = $('#navMembersListMenu'),
    // navAuditsButton = $('#navAuditsButton'),
    navMembersListButton = $('#navMembersListButton'),
    navDisplayMemberNewsButton = $('#navDisplayMemberNewsButton'),
    navSignupForCritButton = $('#navSignupForCritButton'),
    navLogoutButton = $('#navLogoutButton'),
    navUpdateMemberProfileButton = $('#navUpdateMemberProfileButton'),
    navAboutUsButton = $('#navAboutUsButton'),
    navRobertZurerButton = $('#navRobertZurerButton'),
    navKateMcCammonButton = $('#navKateMcCammonButton'),
    navAlanLankinButton = $('#navAlanLankinButton'),
    navAlbertFungButton = $('#navAlbertFungButton'),
    mailchimpSignupCloseButton = $('#mailchimpSignupCloseButton'),
    mcEmbeddedSubscribeForm = $('#mc-embedded-subscribe-form'),
    mceEmailInput = $('#mce-EMAIL'),
    signUpLink = $('#signUpLink'),
    mceResponse = $('.response'),
    hideMailChimpSignup = function () {
      mcEmbeddedSubscribeForm[0].reset();
      mceEmailInput.removeClass('mce_inline_error');
      $('.mce_inline_error').text('');
      $('.mce_inline_error').hide();
      mceResponse.text('');
      mceResponse.hide();
      hideControls();
      showAbout();
    },
    getSignUpLink = () => {
      return $('#signUpLink');
    },
    highlightSelectedNavButton = function () {
      navButtons.css('color', 'white');
      $(this).css('color', 'black');
    },
    highlightNavButton = function (button) {
      navButtons.css('color', 'white');
      button.css('color', 'black');
    },
    highlightSelectedMobileMenuItem = function () {
      mobileMenuItems.css('color', 'white');
      $(this).css('color', 'black');
    },
    highlightMobileMenuItem = function (menuItem) {
      mobileMenuItems.css('color', 'white');
      menuItem.css('color', 'black');
    },
    hideControls = function () {
      mainSections.hide();
      membersListHeaderContainer.hide();
    },
    displayLogin = function () {
      hideControls();
      loginSection.show();
      eventListener.fire('ClearLogin');
    },
    signUp = function () {
      hideControls();
      highlightNavButton(signUpLink);
      highlightNavButton(navSignupForCritButton);
      highlightMobileMenuItem(navSignupForCritMenu);
      const trySignUp = function (isLoggedIn) {
        if (isLoggedIn) {
          loggedInOnly.show();
          return;
        }
        displayLogin();
      };
      eventListener.fire('TryLogin', [trySignUp]);
    },
    showFeedback = function (message) {
      hideControls();
      feedbackSection.fadeIn('slow');
      feedbackInput.val('');
      feedbackInput.focus();
    },
    showMemberNewsEntry = function () {
      const clearMemberNewsEntryFields = function () {
          $('.entryField').val('');
        },
        clearErrors = function () {
          $('.required').css('border', 'none');
        };
      hideControls();
      clearMemberNewsEntryFields();
      clearErrors();
      memberNewsEntrySection.fadeIn('slow');
    },
    getRandomAboutUsProfile = function () {
      const profileHtmlArray = ['RobertZurer', 'KateMcCammon', 'AlanLankin', 'AlbertFung'],
        random = Math.floor(Math.random() * profileHtmlArray.length);
      return profileHtmlArray[random];
    },
    getAboutUsNavControlFromProfile = function (profile, wantMenu) {
      const prefix = '#nav',
        suffix = wantMenu ? 'Menu' : 'Button';
      return $(prefix.concat(profile, suffix));
    },
    getHtmlFileNameFromProfile = function (profile) {
      const firstLetter = profile[0].toLowerCase(),
        remainder = profile.substr(1, profile.length);
      return firstLetter.concat(remainder, '.html');
    },
    displayAboutUsProfile = function (profile) {
      const callback = function (html) {
          aboutUsContentSection.empty();
          aboutUsContentSection.html(html);
          highlightNavButton(getAboutUsNavControlFromProfile(profile));
          highlightMobileMenuItem(getAboutUsNavControlFromProfile(profile, true));
        },
        htmlFileName = getHtmlFileNameFromProfile(profile);
      eventListener.fire('SetAboutUs', [htmlFileName, callback]);
    },
    showAboutUsProfile = function (e) {
      const profile = e.data.profile;
      displayAboutUsProfile(profile);
    },
    showAboutUs = function () {
      hideControls();
      displayAboutUsProfile(getRandomAboutUsProfile());
      aboutUsSection.fadeIn('slow');
    },
    showSignUpSheet = function (fetchEventsCallback) {
      hideControls();
      signUpForCritSection.show();
      hideLogin();
    },
    // showMobileAudits = function () {
    //   const parentContainer = $('.mobileAuditsTableContainer');
    //   parentContainer.empty();
    //   hideControls();
    //   mobileAuditsSection.show();
    //   mobileAuditsTableContainer.show();
    //   parentContainer.append(auditTableFactory.creatMobileAuditTable());
    // },
    showMembersList = function () {
      hideControls();
      membersListSection.show();
      membersListHeaderContainer.show();
    },
    displayRegistrationForm = function (email) {
      hideControls();
      registerSection.show();
      eventListener.fire('InitializeRegistrationControls', [email]);
    },
    performLogout = function () {
      hideControls();
      showAbout();
      loggedInOnly.hide();
      eventListener.fire('ClearMemberCookies');
      eventListener.fire('InitializeSignupSelect');
    },
    hideLogin = function () {
      loginSection.hide();
      eventListener.fire('ClearLogin');
    },
    hideUpdateMemberInfo = function () {
      updateMemberInfoSection.hide();
      signUpForCritSection.show();
      showAbout();
    },
    hideRegistrationControls = function () {
      hideControls();
      showAbout();
    },
    showMailchimpSignup = function (e) {
      const canShowMailchimpSignup = e && e.ctrlKey && e.shiftKey;
      if (canShowMailchimpSignup) {
        hideControls();
        mailchimpSignupSection.show();
      }
    },
    showAdmin = function (e) {
      const canShowAdmin = e && e.ctrlKey && e.altKey;
      eventListener.fire('ShowAdmin', [canShowAdmin]);
    },
    showAbout = function (e) {
      hideControls();
      aboutSection.show();
      highlightNavButton(navMissionButton);
      highlightMobileMenuItem(navMissionMenu);
    },
    showDetails = function () {
      hideControls();
      detailsSection.show();
    },
    showPolicies = function () {
      hideControls();
      policiesSection.show();
      highlightNavButton(navPoliciesButton);
      highlightMobileMenuItem(navPoliciesMenu);
    },
    coordinateMainContentTopMargin = function () {
      mainContentSection.css('margin-top', (navigationMenu.height()) + 15 + 'px');
    },
    positionMemberNewsContainer = function () {
      memberNews.css('maxHeight', modal.height() - 300);
      memberNewsContainer.css('top', modal.height() / 2 - memberNewsContainer.height() / 2);
      memberNewsContainer.css('left', modal.width() / 2 - memberNewsContainer.width() / 2);
    },
    populateMemberNews = function () {
      modal.empty();
      modal.append(memberNewsContainer);
      memberNews.empty();
      htmlHelper.disableControl(navDisplayMemberNewsButton);
      membersExhibitionFactory.updateMembersExhibitions(memberNews, (memberNewsExists) => {
        if (memberNewsExists) {
          htmlHelper.enableControl(navDisplayMemberNewsButton, displayMemberNews);
          memberNewsContainer.show();
          modal.show();
          positionMemberNewsContainer();
        }
      });
    },
    resizeScreenHandler = function () {
      coordinateMainContentTopMargin();
      positionMemberNewsContainer();
    },
    populateMissionStatement = function (html) {
      aboutSection.html(html);
      getSignUpLink().on('click', signUp);
    },
    populateDetails = function (html) {
      detailsSection.html(html);
    },
    populatePolicies = function (html) {
      policiesSection.html(html);
    },
    closeModal = function (e) {
      const id = $(e.target).attr('id');
      if (id === 'modal') {
        modal.empty();
        modal.hide();
      }
    },
    closeMemberNews = function (e) {
      modal.empty();
      modal.hide();
    },
    displayUpdateMemberInfo = function () {
      hideControls();
      updateMemberInfoSection.show();
    },
    updateMemberProfile = function () {
      const showUpdateMemberInfoControls = function (email) {
        if (!email) {
          return;
        }
        eventListener.fire('UpdateMemberInfoControls', [email]);
        displayUpdateMemberInfo();
      };
      eventListener.fire('IsUserLoggedIn', [showUpdateMemberInfoControls]);
    },
    showLoggedInContols = function () {
      loggedInOnly.show();
    },
    initialAdjustControlVisibilty = function (isLoggedIn) {
      hideControls();
      if (isLoggedIn) {
        loggedInOnly.show();
        showAbout();
      } else {
        loggedInOnly.hide();
        showAbout();
      }
    },
    displayMemberNews = function (event) {
      if (event) {
        event.preventDefault();
      }
      memberNewsCloseButton.on('click', closeMemberNews);
      memberNewsContainer.on('click', closeMemberNews);
      populateMemberNews();
    },
    // showSortedMembersList = function () {
    //   eventListener.fire('ShowSortedMembersList');
    // },
    assignEventHandlers = function () {
      modal.on('click', closeModal);
      navButtons.on('click', highlightSelectedNavButton);
      mobileMenuItems.on('click', highlightSelectedMobileMenuItem);
      bannerImage.on('click', showAdmin);
      bannerImage.on('click', showAbout);
      bannerImage.on('click', showMailchimpSignup);
      mailchimpSignupCloseButton.on('click', hideMailChimpSignup);
      navMissionButton.on('click', showAbout);
      navMissionMenu.on('click', showAbout);
      navDetailsButton.on('click', showDetails);
      navDetailsMenu.on('click', showDetails);
      navPoliciesButton.on('click', showPolicies);
      navPoliciesMenu.on('click', showPolicies);
      navSignupForCritButton.on('click', signUp);
      navSignupForCritMenu.on('click', signUp);
      navLogoutButton.on('click', performLogout);
      navLogoutMenu.on('click', performLogout);
      navUpdateMemberProfileButton.on('click', updateMemberProfile);
      navUpdateMemberProfileMenu.on('click', updateMemberProfile);
      navFeedbackButton.on('click', showFeedback);
      navFeedbackMenu.on('click', showFeedback);
      navMemberNewsButton.on('click', showMemberNewsEntry);
      navMemberNewsMenu.on('click', showMemberNewsEntry);
      // navAuditsButton.on('click', showMobileAudits);
      navMembersListButton.on('click', showMembersList);
      navMembersListMenu.on('click', showMembersList);
      navDisplayMemberNewsButton.on('click', displayMemberNews);
      navAboutUsButton.on('click', showAboutUs);
      navRobertZurerButton.on('click', { profile: 'RobertZurer' }, showAboutUsProfile);
      navRobertZurerMenu.on('click', { profile: 'RobertZurer' }, showAboutUsProfile);
      navKateMcCammonButton.on('click', { profile: 'KateMcCammon' }, showAboutUsProfile);
      navKateMcCammonMenu.on('click', { profile: 'KateMcCammon' }, showAboutUsProfile);
      navAlanLankinButton.on('click', { profile: 'AlanLankin' }, showAboutUsProfile);
      navAlanLankinMenu.on('click', { profile: 'AlanLankin' }, showAboutUsProfile);
      navAlbertFungButton.on('click', { profile: 'AlbertFung' }, showAboutUsProfile);
      navAlbertFungMenu.on('click', { profile: 'AlbertFung' }, showAboutUsProfile);
      $(window).on('resize', resizeScreenHandler);
    },
    addEventListeners = function () {
      eventListener.addListener('DisplaySignupSheet', showSignUpSheet);
      eventListener.addListener('DisplayRegistrationForm', displayRegistrationForm);
      eventListener.addListener('HideUpdateMemberInfo', hideUpdateMemberInfo);
      eventListener.addListener('HideRegistrationControls', hideRegistrationControls);
      eventListener.addListener('DisplayUpdateMemberInfo', displayUpdateMemberInfo);
      eventListener.addListener('HideLogin', hideLogin);
      eventListener.addListener('FeedbackSubmitted', showAbout);
      eventListener.addListener('ShowLoggedInContols', showLoggedInContols);
    },
    initializeControls = function () {
      eventListener.fire('SetMissionStatement', [populateMissionStatement]);
      eventListener.fire('SetDetails', [populateDetails]);
      eventListener.fire('SetPolicies', [populatePolicies]);
      if (!trigger) {
        displayMemberNews();
      }
      setTimeout(coordinateMainContentTopMargin, 500);
      eventListener.fire('TryLogin', [initialAdjustControlVisibilty, true]);
      htmlHelper.scrollToAnchor('jump-to-about-section');
      showAbout();
      if (trigger === 'communityGuidlines') {
        showPolicies();
      }
    };
  assignEventHandlers();
  addEventListeners();
  initializeControls();
};