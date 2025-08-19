exports.initialize = function (MongoClient, ObjectId) {
  'use strict';
  let currentDatabase;
  const connectionString = process.env.CONNECTION_STRING,
    initializeDatabase = async function () {
      if (!MongoClient) {
        throw new Error('The mongo client is required.');
      }
      if (!ObjectId) {
        throw new Error('The object id generator is required.');
      }
      const client = new MongoClient(connectionString);
      await client.connect();
      currentDatabase = client.db();
      console.info('Connected to: ' + connectionString);
    },
    returnOrCreateObjectID = function (objectId) {
      try {
        if (typeof objectId === typeof ObjectId) {
          return objectId;
        }
        if (objectId) {
          return new ObjectId(objectId);
        }
        return new ObjectId();
      } catch (err) {
        console.error(err);
      }
    },
    next = function (validate, error, success, result) {
      const errorMessage = validate ? validate(result) : null;
      if (errorMessage) {
        error(errorMessage);
        return;
      }
      success(result);
    },
    handlePromise = async function (object, method, argumentArray, validate, error, success) {
      try {
        let result = await method.apply(object, argumentArray);
        next(validate, error, success, result);
      } catch (err) {
        error(err.message);
      }
    },
    performCollectionAction = function (collectionName, action, value, error, success) {
      action(currentDatabase.collection(collectionName), value, error, success);
    },
    collectionInsertOne = function (collection, entry, error, success) {
      let validate = function (result) {
        return result.acknowledged ? null : 'insert failed';
      };
      entry._id = returnOrCreateObjectID(entry._id);
      handlePromise(collection, collection.insertOne, [entry], validate, error, success);
    },
    collectionFindAll = async function (collection, error, success) {
      const validate = function (result) {
        return result ? null : 'read failed';
      };
      handlePromise(collection, collection.find, [{}, {}], validate, error, success);
    },
    collectionFindMany = async function (collection, value, error, success) {
      if (value.criteria._id) {
        value.criteria._id = returnOrCreateObjectID(value.criteria._id);
      };
      const validate = function (result) {
        return result ? null : 'read failed';
      };
      handlePromise(collection, collection.find, [value.criteria, { projection: value.projection }], validate, error, success);
    },
    collectionUpdateOne = async function (collection, value, error, success) {
      const validate = function (result) {
          return result.modifiedCount === 1 ? null : 'update failed';
        },
        criteria = value.criteria,
        update = value.update;
      if (criteria._id) {
        criteria._id = returnOrCreateObjectID(criteria._id);
      }
      delete update._id;
      handlePromise(collection, collection.updateOne, [criteria, { $set: update } ], validate, error, success);
    },
    collectionRemoveNestedEntry = function (collection, value, error, success) {
      const validate = function (result) {
          return result.modifiedCount === 1 ? null : 'update failed';
        },
        criteria = { _id: returnOrCreateObjectID(value.criteria._id) },
        options = { $pull: value.update };
      handlePromise(collection, collection.updateOne, [criteria, options], validate, error, success);
    },
    collectionInsertNestedEntry = function (collection, value, error, success) {
      const validate = function (result) {
          return result.modifiedCount === 1 ? null : 'update failed';
        },
        criteria = { _id: returnOrCreateObjectID(value.criteria._id) },
        options = { $push: value.update };
      handlePromise(collection, collection.updateOne, [criteria, options], validate, error, success);
    },
    collectionUpdateNestedEntry = function (collection, value, error, success) {
      const validate = function (result) {
        return result.modifiedCount === 1 ? null : 'update failed';
      };
      value.criteria._id = returnOrCreateObjectID(value.criteria._id);
      handlePromise(collection, collection.updateOne, [value.criteria, { $set: value.update }], validate, error, success);
    },
    collectionFindOne = async function (collection, value, error, success) {
      const validate = function (result) {
          return result ? null : 'find one failed';
        },
        criteria = { _id: returnOrCreateObjectID(value) },
        options = { w: 1 };
      handlePromise(collection, collection.findOne, [criteria, options], validate, error, success);
    },
    collectionDeleteOne = async function (collection, value, error, success) {
      const validate = function (result) {
          return result.deletedCount === 1 ? null : 'delete failed';
        },
        criteria = { _id: returnOrCreateObjectID(value) },
        options = { w: 1 };
      handlePromise(collection, collection.deleteOne, [criteria, options], validate, error, success);
    };
  initializeDatabase();
  return {
    createEntry: function (collectionName, entry, error, success) {
      performCollectionAction(collectionName, collectionInsertOne, entry, error, success);
    },
    deleteEntry: function (collectionName, objectId, error, success) {
      performCollectionAction(collectionName, collectionDeleteOne, objectId, error, success);
    },
    retrieveAllEntries: async function (collectionName, error, success) {
      performCollectionAction(collectionName, collectionFindAll, error, success);
    },
    retrieveEntries: function (collectionName, value, error, success) {
      performCollectionAction(collectionName, collectionFindMany, value, error, success);
    },
    retrieveEntry: function (collectionName, objectId, error, success) {
      performCollectionAction(collectionName, collectionFindOne, objectId, error, success);
    },
    updateEntry: function (collectionName, value, error, success) {
      performCollectionAction(collectionName, collectionUpdateOne, value, error, success);
    },
    removeNestedEntry: function (collectionName, value, error, success) {
      performCollectionAction(collectionName, collectionRemoveNestedEntry, value, error, success);
    },
    insertNestedEntry: function (collectionName, value, error, success) {
      performCollectionAction(collectionName, collectionInsertNestedEntry, value, error, success);
    },
    updateNestedEntry: function (collectionName, value, error, success) {
      performCollectionAction(collectionName, collectionUpdateNestedEntry, value, error, success);
    },
    addUnique: function (collectionName, entry, propertyName, error, success) {
      const checkUniqueCallback = function (exists) {
          if (!exists) {
            performCollectionAction(collectionName, collectionInsertOne, entry, error, success);
          } else {
            error('The ' + propertyName + ' "' + entry[propertyName] + '"" already exists.');
          }
        },
        cursorToArrayCallback = function (array) {
          array.forEach(function (item) {
            if (item[propertyName] === entry[propertyName]) {
              return true;
            }
            return false;
          });
        },
        findAllCallback = async function (cursor) {
          const array = await cursor.toArray();
          checkUniqueCallback(cursorToArrayCallback(array));
        };
      performCollectionAction(collectionName, collectionFindAll, error, findAllCallback);
    }
  };
};