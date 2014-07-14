'use strict';


var assert = require("assert"),
  //Services
  mongate = require('../lib/mongate.js'),
  //Models
  User = require('../models/User'),
  Post = require('../models/Post'),
  ImageMeta = require('../models/ImageMeta'),
  Post2Resource = require('../models/PostResource'),
  Conversation = require('../models/Conversation'),
  ApplicationConstants = require('../models/ApplicationConstants'),
  Collections = require('../models/Collections'),
  DBRequest = require('../models/DBRequest'),
  DBQuery = require('../models/DBQuery'),
  PostUpdateRequest = require('../models/PostUpdateRequest'),
  Request = require('../models/Request'),
  Comment = require('../models/Comment'),
  //Utils
  DateFormattingUtil = require('../util/DateFormattingUtil'),
  RegExUtil = require('../util/RegExUtil'),
  fs = require('fs'),
  //Global Variables
  dbClient, 
  dbName = ApplicationConstants.dbName;
  
before(function (done){
  mongate.getDbClient(dbName, function (err, db) {
    assert.equal(err, undefined);
    dbClient = db;
    done();
  });
});

after(function(done) {
  if(dbClient){
    dbClient.close();
  }
  done();
});

describe('mongate', function(){
  
  var new_img_id;
  var imgPath = ApplicationConstants.serverRoot + '/resources/Desert.jpg';
  before(function (done){
    fs.readFile(imgPath, function (err, data) {
      assert(!err, err);
      assert(data, 'there must be a valid image at /test/resources/Desert.jpg');
      var dbRequestToUploadImage = new DBRequest({
        img : data,
        imgMeta : new ImageMeta({
                type : 'xyz',
                caption : 'caption to be here..'
              }) 
      });
      mongate.writeImage(dbRequestToUploadImage, function (err, img_id) {
        assert(!err, err);
        assert(img_id, 'img_id must be valid');
        new_img_id = img_id;
        done();
      });
    });
  });
  
  describe('getLocalDbConnector()', function (){
    it('should get local db connector', function (){
      var dbConnector = mongate.getLocalDbConnector(dbName);
      assert.notEqual(dbConnector, undefined);
    });
  });

  describe('getDbClient()', function (){
    it('should open a connection and return a dbClient', function (done) {
      mongate.getDbClient(dbName, function (err, dbClient) {
        assert.equal(err, undefined);
        assert.notEqual(dbClient, undefined);
        done();
      });
    });
  });

  describe('readDocumentById()', function () {
    var dbRequestToReadUser;
    var documentToCreate
    before(function (done) {

      documentToCreate = new User({
        "firstName" : "reema",
        "email" : "reema@gyansource.com"
      });
      var dbRequestToCreateDocument = new DBRequest({
        'collectionName' : Collections.users,
        'document'  : documentToCreate
      });


      mongate.createDocument(dbRequestToCreateDocument, function (err, actualCreatedDocument) {
        assert(!err,err);
        assert(actualCreatedDocument, "created document should not be undefined");
        assert.equal(documentToCreate.firstName, actualCreatedDocument.firstName);
        
        dbRequestToReadUser = new DBRequest({
          'collectionName' : Collections.users,
          '_id' : actualCreatedDocument._id
        });
        done()
      });
    });

    it('should read a document from db with a valid document _id', function (done) {
      mongate.readDocumentById(dbRequestToReadUser, function (err, actualDocument) {
        assert.equal(err, undefined);
        assert.notEqual(actualDocument, undefined);
        assert.equal(documentToCreate._id.toString(), actualDocument._id.toString());
        assert.equal(documentToCreate.firstName, actualDocument.firstName);
        done();
      })
    })

    it('should not read a document from db with an invalid document _id', function (done) {
      dbRequestToReadUser = new DBRequest({
          'collectionName' : Collections.users,
          '_id' : 'invalid_id'
      });
      mongate.readDocumentById(dbRequestToReadUser, function (err, actualDocument) {
        assert(!err, err);
        assert.equal(actualDocument, undefined);
        done();
      })
    })
  })

  describe('readDocumentsByPage()', function (){

    it('should not read document if page_number  is missing', function (done) {
      var invalidDbRequestToReadPage = new DBRequest({
        'page'  : undefined,
        'numberOfRecordsPerPage' : ApplicationConstants.numberOfRecordsPerPage,
        'collectionName' : Collections.users
      });
      mongate.readDocumentsByPage(invalidDbRequestToReadPage, function (err, documentList) {
        assert(err, 'there must be an error as the page_number is undefined');
        done()
      })
    })

    it('should not read document if number_of_records is missing', function (done) {
      var invalidDbRequestToReadPage = new DBRequest({
        'page'  : 1,
        'numberOfRecordsPerPage' : undefined,
        'collectionName' : Collections.users
      });
      mongate.readDocumentsByPage(invalidDbRequestToReadPage, function (err, documentList) {
        assert(err, 'there must be an error as the numberOfRecordsPerPage is undefined' );
        done();
      })
    })
    it('should not read document if collectionName is missing', function (done) {
      var invalidDbRequestToReadPage = new DBRequest({
        'page'  : 1,
        'numberOfRecordsPerPage' : ApplicationConstants.numberOfRecordsPerPage,
        'collectionName' : undefined
      });
      mongate.readDocumentsByPage(invalidDbRequestToReadPage, function (err, documentList) {
        assert(err, 'there must be an error as the collectionName is undefined');
        done();
      })
    })
    it('should not read documents by page if page_number is not a number', function (done) {
      var invalidDbRequestToReadPage = new DBRequest({
        'page'  : 'one',
        'numberOfRecordsPerPage' : ApplicationConstants.numberOfRecordsPerPage,
        'collectionName' : Collections.users
      });
      mongate.readDocumentsByPage(invalidDbRequestToReadPage, function (err, documentList) {
        assert(err, 'there must be an error as the page_number is not an number');
        done();
      })  
    })
    it('should not read documents by page if numberOfRecordsPerPage is not a number', function (done) {
      var invalidDbRequestToReadPage = new DBRequest({
        'page'  : 1,
        'numberOfRecordsPerPage' : 'invalid page size',
        'collectionName' : Collections.posts
      });
      mongate.readDocumentsByPage(invalidDbRequestToReadPage, function (err, documentList) {
        assert(err, 'there must be an error as the numberOfRecordsPerPage is is not a number');
        done();
      })  
    })
    it('should read documents by page provided page_number and number_of_records', function (done) {
      var dbRequestToReadPage = new DBRequest({
        'page'  : 1,
        'numberOfRecordsPerPage' : ApplicationConstants.numberOfRecordsPerPage,
        'collectionName' : Collections.users
      });
      mongate.readDocumentsByPage(dbRequestToReadPage, function (err, documentList) {
        assert.equal(err, undefined);
        assert(documentList, undefined);
        assert(Array.isArray(documentList), 'document list is not an acutal array');
        assert(ApplicationConstants.numberOfRecordsPerPage >= documentList.length, 'document list length is more then the page size.');
        done();
      })
    })
    it('should read documents by page and apply the given query', function (done){
      var dbQuery = new DBQuery({
        'attributeName' : 'firstName',
        'attributeValue' : "reema"
      });
      var dbRequestToReadPageWithQuery = new DBRequest({
        'page'  : 1,
        'numberOfRecordsPerPage' : ApplicationConstants.numberOfRecordsPerPage,
        'collectionName' : Collections.users,
        'dbQuery' : dbQuery
      });
      mongate.readDocumentsByPage(dbRequestToReadPageWithQuery, function (err, users) {
        assert(!err, err);
        assert(users, "there should be some posts with state as NEW");
        done();
      })
      
    })
  })

  describe('createDocument()', function () {
    var dbRequest;
    var expectedDocument;
    beforeEach(function(){
      expectedDocument = new User({
        "firstName" : "reema",
        "email" : "reema@gyansource.com"
      });
      dbRequest = new DBRequest({
        'collectionName' : Collections.users,
        'document'  : expectedDocument
      });
      // done();
    })

    it('should create a document in mongo db', function (done) {
      mongate.createDocument(dbRequest, function (err, actualDocument) {
        if (err) throw err;
        assert.notEqual(actualDocument._id, undefined);
        assert.equal(expectedDocument.firstName, actualDocument.firstName);
        done();
      });
    })

    it('should throw an error if dbRequest.collectionName is undefined', function (done) {
      var someDbRequest = new DBRequest({
        'collectionName' : undefined,
        'document' : expectedDocument
      });
      mongate.createDocument(someDbRequest, function (err, actualDocument) {
        assert.notEqual(err, undefined);
        done();
      })
    })

    it('should throw err if dbRequest.document is undefined', function (done) {
      var someDbRequest = new DBRequest({
        'collectionName' : Collections.users,
        'document' : undefined
      });
      mongate.createDocument(someDbRequest, function (err, actualDocument) {
        assert.notEqual(err, undefined);
        assert.notEqual(err, null);
        done();
      })
    })
  });

  describe('executeQuery()', function () {
    var dbQuery;
    before(function (done) {
      var textToSearch = 'hello';
      var regExForTextSearch = RegExUtil.getRegExForTextSearch(textToSearch);
      dbQuery = new DBQuery({
        'attributeName' : 'preViewAbleContent',
        'attributeValue' : regExForTextSearch
      });

      var documentToCreate = new Post({
        "heading" : "its a test post from unit test",
        "preViewAbleContent" : "hello every one how are you doing",
        "postDescriptionContent" : "nothing much to say"
      });
      var dbRequestToCreateDocument = new DBRequest({
        'collectionName' : Collections.posts,
        'document'  : documentToCreate
      });
      mongate.createDocument(dbRequestToCreateDocument, function (err, actualCreatedDocument) {
        assert.notEqual(actualCreatedDocument, undefined);
        assert.notEqual(actualCreatedDocument._id, undefined);
        assert.equal(documentToCreate.firstName, actualCreatedDocument.firstName);
        done();
      });     

    })

    it('should execute a query', function (done) {
      var dbRequestToQuery = new DBRequest({
        'collectionName' : Collections.posts,
        'dbQuery' : dbQuery
      })
      mongate.executeQuery(dbRequestToQuery, function (err, items) {
        assert(!err, err);
        assert(Array.isArray(items), 'execute query result must be an array');
        assert(items.length > 0, 'there are no records for text search "hello"');
        done();
      })
    })

    it('should not execute a query if collectionName is miising', function (done) {
      var dbRequestToQuery = new DBRequest({
        'collectionName' : undefined,
        'dbQuery' : dbQuery
      })
      mongate.executeQuery(dbRequestToQuery, function (err, items) {
        assert(err, err);
        done();
      })  
    })
    it('should not execute a query if dbQuery is miising', function (done) {
      var dbRequestToQuery = new DBRequest({
        'collectionName' : Collections.posts,
        'dbQuery' : undefined
      })
      mongate.executeQuery(dbRequestToQuery, function (err, items) {
        assert(err, err);
        done();
      })
    })
  })

  describe('updateDocumentById()', function () {
    var _id;
    var updateValue = {"postDescriptionContent" : "i have some thing to say"};
    before(function (done) {
      var documentToCreate = new Post({
        "heading" : "its a test post from unit test",
        "preViewAbleContent" : "hello every one how are you doing",
        "postDescriptionContent" : "nothing much to say"
      });
      var dbRequestToCreateDocument = new DBRequest({
        'collectionName' : Collections.posts,
        'document'  : documentToCreate
      });
      mongate.createDocument(dbRequestToCreateDocument, function (err, actualCreatedDocument) {
        assert.notEqual(actualCreatedDocument, undefined);
        assert.notEqual(actualCreatedDocument._id, undefined);
        assert.equal(documentToCreate.heading, actualCreatedDocument.heading);
        _id = actualCreatedDocument._id;
        done();
      });     
    })
    it('should update a document provided a valid _id', function (done) {
      var dbRequestToUpdate = new DBRequest({
        'collectionName' : Collections.posts,
        '_id' : _id,
        'updateValue' : updateValue
      })
      mongate.updateDocumentById(dbRequestToUpdate, function (err, updateStatus) {
        assert(!err, err);
        assert(updateStatus, 'Error in update document, there is no document found with _id - ' + dbRequestToUpdate._id);
        done();
      })
    })
    it('should not update a document if provided _id is not valid or not exist', function (done){
      var dbRequestToUpdate = new DBRequest({
        'collectionName' : Collections.posts,
        '_id' : undefined,
        'updateValue' : updateValue
      })
      mongate.updateDocumentById(dbRequestToUpdate, function (err, updateStatus){
        assert(err);
        assert(!updateStatus, 'update status must be false as _id is undefined or not valid');
        done();
      })
    })
    it('should not update if collectionName is undefined', function (done) {
      var dbRequestToUpdate = new DBRequest({
        'collectionName' : undefined,
        '_id' : _id,
        'updateValue' : updateValue
      })
      mongate.updateDocumentById(dbRequestToUpdate, function (err, updateStatus){
        assert(err);
        assert(!updateStatus, 'update status must be false as _id is undefined or not valid');
        done();
      })  
    })
    it('should not update if updateValue is undefined', function (done) {
      var dbRequestToUpdate = new DBRequest({
        'collectionName' : Collections.posts,
        '_id' : _id,
        'updateValue' : undefined
      })
      mongate.updateDocumentById(dbRequestToUpdate, function (err, updateStatus){
        assert(err);
        assert(!updateStatus, 'update status must be false as _id is undefined or not valid');
        done();
      })  
    })
  })
  
  describe('updateArrayEntryOfDocumentById()', function () {
    var _id;
    var conversation = new Conversation({
      'type' : ApplicationConstants.private,
      'messages' : [],
      'sender_id' : "something"
    })
    var updateValue = {"conversation" : conversation};
    before(function (done) {
      var documentToCreate = new Post({
        "heading" : "its a test post from unit test",
        "preViewAbleContent" : "hello every one how are you doing",
        "postDescriptionContent" : "nothing much to say",
        "conversations" : []
      });
      var dbRequestToCreateDocument = new DBRequest({
        'collectionName' : Collections.posts,
        'document'  : documentToCreate
      });
      mongate.createDocument(dbRequestToCreateDocument, function (err, actualCreatedDocument) {
        assert.notEqual(actualCreatedDocument, undefined);
        assert.notEqual(actualCreatedDocument._id, undefined);
        assert.equal(documentToCreate.heading, actualCreatedDocument.heading);
        _id = actualCreatedDocument._id;
        done();
      });     
    })
    it('should update an entry of an Array of document with a valid _id and updateValue', function (done) {
      var validDbRequestToUpdateArrayEntry = new DBRequest({
        'collectionName' : Collections.posts,
        '_id' : _id,
        'updateValue' : updateValue
      })
      mongate.updateArrayEntryOfDocumentById(validDbRequestToUpdateArrayEntry, function (err, status) {
        assert(!err, 'there should not be any error - ' + err);
        assert(status, 'status should be true for a valid request');
        done();
      });
    })
    it('should not update an entry of an Array of document with undefined _id', function (done) {
      var invalidDbRequestToUpdateArrayEntry = new DBRequest({
        'collectionName' : Collections.posts,
        '_id' : undefined,
        'updateValue' : updateValue
      })
      mongate.updateArrayEntryOfDocumentById(invalidDbRequestToUpdateArrayEntry, function (err, status) {
        assert(err, 'there should be an error');
        assert(!status, 'status should be false for undefined _id');
        done();
      });
    })
    it('should not update an entry of an Array of document with undefined updateValue', function (done) {
      var invalidDbRequestToUpdateArrayEntry = new DBRequest({
        'collectionName' : Collections.posts,
        '_id' : _id,
        'updateValue' : undefined
      })
      mongate.updateArrayEntryOfDocumentById(invalidDbRequestToUpdateArrayEntry, function (err, status) {
        assert(err, 'there should be an error');
        assert(!status, 'status should be false for undefined updateValue');
        done();
      });
    })
    it('should not update an entry of an Array of document with undefined collectionName', function (done) {
      var invalidDbRequestToUpdateArrayEntry = new DBRequest({
        'collectionName' : undefined,
        '_id' : _id,
        'updateValue' : updateValue
      })
      mongate.updateArrayEntryOfDocumentById(invalidDbRequestToUpdateArrayEntry, function (err, status) {
        assert(err, 'there should be an error');
        assert(!status, 'status should be false for undefined collectionName');
        done();
      });
    })

  })

  describe('removeArrayEntryOfDocumentById', function () {
    var post_id;
    before(function (done) {
      var documentToCreate = new Post({
        "heading" : "its a test post from unit test",
        "preViewAbleContent" : "hello every one how are you doing",
        "postDescriptionContent" : "nothing much to say"
      });
      var dbRequestToCreateDocument = new DBRequest({
        'collectionName' : Collections.posts,
        'document'  : documentToCreate
      });
      mongate.createDocument(dbRequestToCreateDocument, function (err, actualCreatedDocument) {
        assert(!err, err);
        assert(actualCreatedDocument, 'created document must not be undefined');
        post_id = actualCreatedDocument._id;
        var updateValue = {"approvals" : 'abcuserid'};
        var dbRequestToUpdateApprovalList = new DBRequest({
              'collectionName' : Collections.posts,
              '_id' : actualCreatedDocument._id,
              'updateValue' : updateValue
        });
        mongate.updateArrayEntryOfDocumentById(dbRequestToUpdateApprovalList, function (err, result) {
          assert(!err, err);
          assert(result, 'result must be defined');
          done();
        });
      });
    });
    it('should remove an entry from documents array field', function (done) {
      var updateValue = {
        'approvals' : 'abcuserid'
      }
      var dbRequestToRemoveArrayEntry = new DBRequest({
        'collectionName' : Collections.posts,
        '_id' : post_id,
        'updateValue' : updateValue
      });
      mongate.removeArrayEntryOfDocumentById(dbRequestToRemoveArrayEntry, function(err, result) {
        assert(!err, err);
        assert(result, 'result must be defined');
        var dbRequestToReadPost = new DBRequest({
          'collectionName' : Collections.posts,
          '_id' : post_id
        })
        mongate.readDocumentById(dbRequestToReadPost, function(err, post) {
          assert(!err, err);
          assert(post, 'post must be defined.');
          assert(post.approvals, 'post must have approval list');
          assert(post.approvals.length === 0 , 'posts approval list must be empty');
          done();
        })
      })
    })
  })

  describe('removeDocumentById()', function () {
    var _id
    before(function (done) {
      var documentToCreate = new Post({
        "heading" : "its a test post from unit test",
        "preViewAbleContent" : "hello every one how are you doing",
        "postDescriptionContent" : "nothing much to say"
      });
      var dbRequestToCreateDocument = new DBRequest({
        'collectionName' : Collections.posts,
        'document'  : documentToCreate
      });
      mongate.createDocument(dbRequestToCreateDocument, function (err, actualCreatedDocument) {
        assert.notEqual(actualCreatedDocument, undefined);
        assert.notEqual(actualCreatedDocument._id, undefined);
        assert.equal(documentToCreate.heading, actualCreatedDocument.heading);
        _id = actualCreatedDocument._id;
        done();
      });     
    })
    it('should not remove a document if provided _id is undefined', function (done) {
      var dbRequestToRemove = new DBRequest({
        'collectionName' : Collections.posts,
        '_id' : undefined
      })

      mongate.removeDocumentById(dbRequestToRemove, function (err, status) {
        assert(err, 'this must throw a db error as the _id is undefined');
        assert(!status, 'status must not be true as _id is undefined');
        done();
      })
    })    
    it('should not remove a document if provided with collectionName as undefined', function (done) {
      var dbRequestToRemove = new DBRequest({
        'collectionName' : undefined,
        '_id' : _id
      })
      mongate.removeDocumentById(dbRequestToRemove, function (err, status) {
        assert(err, 'this must throw a db error as the collectionName is undefined');
        assert(!status, 'status must not be true as collectionName is undefined');
        done();
      })
    })
    it('should remove a document provided with a valid _id', function (done) {
      var dbRequestToRemove = new DBRequest({
        'collectionName' : Collections.posts,
        '_id' : _id
      })
      mongate.removeDocumentById(dbRequestToRemove, function (err, status) {
        assert(!err, err);
        assert(status);
        done();
      })
    })
  })

  describe('removeDocumentsByQuery()', function () {
    var query;
    var _id;
    before(function (done) {
      query = new DBQuery({
        'attributeName' : 'heading',
        'attributeValue' : 'removeDocumentsByQuery'
      })
      var documentToCreate = new Post({
        "heading" : "removeDocumentsByQuery",
        "preViewAbleContent" : "hello every one how are you doing",
        "postDescriptionContent" : "nothing much to say"
      });
      var dbRequestToCreateDocument = new DBRequest({
        'collectionName' : Collections.posts,
        'document'  : documentToCreate
      });
      mongate.createDocument(dbRequestToCreateDocument, function (err, actualCreatedDocument) {
        assert.notEqual(actualCreatedDocument, undefined);
        assert.notEqual(actualCreatedDocument._id, undefined);
        assert.equal(documentToCreate.heading, actualCreatedDocument.heading);
        _id = actualCreatedDocument._id;
        done();
      });     
    })
    it('should remove 0 or more document by provide a valid query for collection', function (done) {
      var dbRequestToRemoveByQuery = new DBRequest({
        'collectionName' : Collections.posts,
        'dbQuery' : query
      })
      mongate.removeDocumentsByQuery(dbRequestToRemoveByQuery, function (err, status) {
        assert(!err, err);
        assert(status, 'status must be true');
        done();
      })
    })
    it('should not remove document if dbQuery is undefined', function (done) {
      var jsonRequestToRemoveByQuery = {
        'collectionName' : Collections.posts,
        'dbQuery' : undefined
      };
      mongate.removeDocumentsByQuery(jsonRequestToRemoveByQuery, function (err, status) {
        assert(err, 'there must be an error');
        assert(!status, 'status must be undefined');
        done();
      })  
    })
    it('should not remove document if collectionName is undefined', function (done) {
      var jsonRequestToRemoveByQuery = {
        'collectionName' : undefined,
        'dbQuery' : query
      }
      mongate.removeDocumentsByQuery(jsonRequestToRemoveByQuery, function (err, status) {
        assert(err, 'there must be an error');
        assert(!status, 'status must be undefined');
        done();
      })  
    })
    it('should not remove document if dbQuery is invalid', function (done) {
      var query = new DBQuery({
        'attributeName' : 'heading',
        'attributeValue' : undefined
      });
      var jsonRequestToRemoveByQuery = {
        'collectionName' : Collections.posts,
        'dbQuery' : query
      }
      mongate.removeDocumentsByQuery(jsonRequestToRemoveByQuery, function (err, status) {
        assert(err, 'there must be an error');
        assert(!status, 'status must be undefined');
        done();
      })  
    })
  })

  describe('incrementFieldValue()', function () {
    var dbRequestToIncrementCredibilityIndex;
    var documentToCreate
    before(function (done) {

      documentToCreate = new User({
        "firstName" : "reema",
        "email" : "reema@gyansource.com"
      });
      var dbRequestToCreateDocument = new DBRequest({
        'collectionName' : Collections.users,
        'document'  : documentToCreate
      });


      mongate.createDocument(dbRequestToCreateDocument, function (err, actualCreatedDocument) {
        assert(!err,err);
        assert(actualCreatedDocument, "created document should not be undefined");
        assert.equal(documentToCreate.firstName, actualCreatedDocument.firstName);
        dbRequestToIncrementCredibilityIndex = new DBRequest({
          'collectionName' : Collections.users,
          '_id' : actualCreatedDocument._id,
          'incrementValue' : {'credibility_index' : 1}
        });
        done()
      });
    });

    it('should increment a field value in a collections document', function (done) {
      mongate.incrementFieldValue(dbRequestToIncrementCredibilityIndex, function (err, status) {
        assert(!err, err);
        assert(status);
        done();
      })
    })

    it('should increment a field value in a collections document multiple time if called multiple times', function (done) {
      mongate.incrementFieldValue(dbRequestToIncrementCredibilityIndex, function (err, status) {
        assert(!err, err);
        assert(status);
        mongate.incrementFieldValue(dbRequestToIncrementCredibilityIndex, function (err, status) {
          assert(!err, err);
          assert(status);
          done();
        });
      })
    })

  })
  

  
  describe('writeImage()', function () {
    var imgData;
    var dbRequestToUploadImage;
    var invalidDbRequestToUploadImage;
    var imgPath = ApplicationConstants.serverRoot + '/resources/Desert.jpg';
    before(function (done) {
      fs.readFile(imgPath, function (err, data) {
        assert(!err, err);
        assert(data, 'there must be a valid image at /test/resources/Desert.jpg');
        imgData = data;
        done();
      }) 
    });
    
    it('should write an image in database', function (done) {
      dbRequestToUploadImage = new DBRequest({
        img : imgData,
        imgMeta : new ImageMeta({
                type : 'xyz',
                caption : 'caption to be here..'
              }) 
      });
      mongate.writeImage(dbRequestToUploadImage, function (err, img_id) {
        assert(!err, err);
        assert(img_id, 'img_id must be valid');
        done();
      })
    })
    
    it('should not write an image in database, as the img is undefined', function (done) {
      invalidDbRequestToUploadImage = new DBRequest({
        img : undefined,
        imgMeta : new ImageMeta({
                type : 'xyz',
                caption : 'caption to be here..'
              }) 
      });
      mongate.writeImage(invalidDbRequestToUploadImage, function (err, img_id) {
        assert(err, 'there must be an error');
        assert(!img_id, 'img_id must be invalid');
        done();
      })
    })
    
    it('should not write an image in database, as the imgMeta is undefined', function (done) {
      invalidDbRequestToUploadImage = new DBRequest({
        img : imgData,
        imgMeta : undefined 
      });
      mongate.writeImage(invalidDbRequestToUploadImage, function (err, img_id) {
        assert(err, 'there must be an error');
        assert(!img_id, 'img_id must be invalid');
        done();
      })
    })
    
    it('should not write an image in database, as the imgMeta.type is undefined', function (done) {
      invalidDbRequestToUploadImage = new DBRequest({
        img : imgData,
        imgMeta : new ImageMeta({
              type : undefined,
              caption : 'caption to be here..'
            })  
      });
      mongate.writeImage(invalidDbRequestToUploadImage, function (err, img_id) {
        assert(err, 'there must be an error');
        assert(!img_id, 'img_id must be invalid');
        done();
      })
    })
  })
  
  describe('readImage()', function (){
    it('should read an image from database, provided a valid image Id', function (done) {
      var dbRequestToReadImage = new DBRequest({
        img_id : new_img_id
      });
      mongate.readImage(dbRequestToReadImage, function (err, img_data) {
        assert(!err, err);
        assert(img_data, 'image data must be defined');
        done();
      })
    })
    
    it('should not read an image from database, if the image_id is undefined', function (done) {
      var undefinedDbRequestToReadImage = new DBRequest({
        img_id : undefined
      });
      mongate.readImage(undefinedDbRequestToReadImage, function (err, img_data) {
        assert(err, 'this must be an error');
        assert(!img_data, 'image data must not be defined');
        done();
      })
    })
    
    it('should not read an image from database, if the image_id is not a valid mongodb _id', function (done) {
      var invalidDbRequestToReadImage = new DBRequest({
        img_id : 'sdfsdfwer'
      });
      mongate.readImage(invalidDbRequestToReadImage, function (err, img_data) {
        assert(err, 'this must be an error');
        assert(!img_data, 'image data must not be defined');
        done();
      })
    })
  })
  
  describe('removeImageById()', function(){
    var imgData;
    var dbRequestToUploadImage;
    var imgPath = ApplicationConstants.serverRoot + '/resources/Desert.jpg';
    before(function (done) {
      fs.readFile(imgPath, function (err, data) {
        assert(!err, err);
        assert(data, 'there must be a valid image at /test/resources/Desert.jpg');
        imgData = data;
        done();
      }) 
    });

    it('should remove image provided a valid _id', function (done) {
      dbRequestToUploadImage = new DBRequest({
        img : imgData,
        imgMeta : new ImageMeta({
                type : 'preview',
                caption : 'caption to be here..'
              }) 
      });
      mongate.writeImage(dbRequestToUploadImage, function (err, img_id) {
        assert(!err, err);
        assert(img_id, 'img_id must be defined');
        var dbRequestToRmoveImage = new DBRequest({
          img_id : img_id
        });
        mongate.removeImageById(dbRequestToRmoveImage, function (err, status) {
          assert(!err, err);
          assert(status, 'status must be true');
          var dbRequestToReadImage = new DBRequest({
            img_id : img_id
          });
          mongate.readImage(dbRequestToReadImage, function (err, img_data) {
            assert(err, "there should be an error,");
            assert(!img_data, 'image data must be undefined');
            done();
          })
        })
      })
    })
  })

  describe('getDistinctSortedValues()', function () {
    it('should get distinct values for a field in ascending order', function (done) {
      var dbRequestToGetDistinctValues = new DBRequest({
        'collectionName' : 'users',
        'field' : 'credibility_index'   
      })
      mongate.getDistinctSortedValues(dbRequestToGetDistinctValues, function (err, values) {
        assert(!err, err);
        assert(values, 'values must be defined');
        assert(Array.isArray(values), 'values should be an array');
        assert(values[1] > values[0], 'result must be in descending order');
        done();
      })
    })
    it('should get distinct values for a field in descending order', function (done) {
      var dbRequestToGetDistinctValues = new DBRequest({
        'collectionName' : 'users',
        'field' : 'credibility_index',
        'sort' : 'desc'
      })
      mongate.getDistinctSortedValues(dbRequestToGetDistinctValues, function (err, values) {
        assert(!err, err);
        assert(values, 'values must be defined');
        assert(Array.isArray(values), 'values should be an array');
        assert(values[1] < values[0], 'result must be in descending order');
        done();
      })
    })
  })

  describe('doTransaction()', function () {
    var test_post_A;
    var test_post_B;
    before(function (done) {
      var post_A = new Post({
        "heading" : "txn test post A",
        "preViewAbleContent" : "hello every one how are you doing",
        "postDescriptionContent" : "nothing much to say"
      });
      var dbRequest_A = new DBRequest({
        'collectionName' : Collections.posts,
        'document'  : post_A
      });
      mongate.createDocument(dbRequest_A, function (err, actualCreatedDocument) {
        test_post_A = actualCreatedDocument;
        assert.notEqual(actualCreatedDocument, undefined);
        assert.notEqual(actualCreatedDocument._id, undefined);
        assert.equal(post_A.firstName, actualCreatedDocument.firstName);
        var post_B = new Post({
          "heading" : "txn test post B",
          "preViewAbleContent" : "hello every one how are you doing",
          "postDescriptionContent" : "nothing much to say"
        });
        var dbRequest_B = new DBRequest({
          'collectionName' : Collections.posts,
          'document'  : post_B
        });
        mongate.createDocument(dbRequest_B, function (err, actualCreatedDocument) {
          test_post_B = actualCreatedDocument;
          assert.notEqual(actualCreatedDocument, undefined);
          assert.notEqual(actualCreatedDocument._id, undefined);
          assert.equal(post_B.firstName, actualCreatedDocument.firstName);
          done();
        });
      });     
    })

    it('should initiate and complete a transaction provided a transaction', function (done) {
      var jobs = [{'todo' : 'update', 
                          'resource_id' : test_post_A._id, 
                          'update_value' : {'preViewAbleContent' : 'updated...in transaction'}, 
                          'collection' : Collections.posts},
                  {'todo' : 'update', 
                          'resource_id' : test_post_B._id, 
                          'update_value' : {'preViewAbleContent' : 'updated...in transaction'}, 
                          'collection' : 'Users'}
                  ];
      var transaction = {
        'name' : 'Accepting Order',
        'jobs' : jobs
      };
      mongate.doTransaction(transaction, function (err, status) {
        console.log(status);
        assert(!err, err);
        assert(status, 'status must be true');
        done();
      })
    })
  })

})

