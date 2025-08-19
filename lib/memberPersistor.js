exports.initialize = function (mongoPersistor) {
  'use strict';
  var collectionName, sanitizeDates;
  collectionName = 'members';
  sanitizeDates = function (member) {
    member.joinDate = new Date(member.joinDate);
    return member;
  };
  return {
    addMember: function (member, error, success) {
      mongoPersistor.addUnique(collectionName, sanitizeDates(member), 'email', error, success);
    },
    updateMember: function (member, error, success) {
      mongoPersistor.updateEntry(collectionName, { criteria: { _id: member._id }, update: member }, error, success);
    },
    deleteMember: function (memberId, error, success) {
      mongoPersistor.deleteEntry(collectionName, memberId, error, success);
    },
    retrieveMembers: function (error, success) {
      mongoPersistor.retrieveEntries(collectionName, { criteria: {}, projection: {} }, error, success);
    },
    retrieveMemberById: function (id, error, success) {
      mongoPersistor.retrieveEntry(collectionName, id, error, success);
    },
    changeIsActiveStatus: function (memberId, isActive, error, success) {
      const value = {
        criteria: { _id: memberId },
        update: { isActive: isActive }
      };
      mongoPersistor.updateEntry(collectionName, value, error, success);
    },
    changeIsAdminStatus: function (memberId, isAdmin, error, success) {
      const value = {
        criteria: { _id: memberId },
        update: { isAdmin: isAdmin }
      };
      mongoPersistor.updateEntry(collectionName, value, error, success);
    }
  };
};