/*
 * mongate
 * gyansource.com
 *
 * Copyright (c) 2013 Varun Tak
 * Licensed under the MIT license.
 */

'use strict';

var	mongodb = require('mongodb'),
	Db = require('mongodb').Db, 
	Server = require('mongodb').Server,
	GridStore = require('mongodb').GridStore,
	ObjectID = require('mongodb').ObjectID,
	DBConstants = require('../models/DBConstants'),
	ApplicationConstants = require('../models/ApplicationConstants'),
	dbConnector,
	dbClient,
	dbName = DBConstants.dbName,
	DBRequest =require('../models/DBRequest');

var mongate = (function() {

	var getLocalDbConnector = function(dbname) {
		if (dbConnector)
			return dbConnector;
		else
			return new Db(dbname, new Server("127.0.0.1", 27017, {
						  auto_reconnect : false,
						  poolSize : 4
					}), {
						  safe : false,
						  native_parser : false
					});
	}

	var getDBClientByUri = function (uri, callback){
		if (uri) {
			mongodb.connect( uri, {}, function (err, db) {
				if (err) throw err;
			 	dbClient = db;
			 	callback(undefined, db);
			});
		}
	}

	var getDbClient = function(dbname, callback) {
		if (dbClient){	
			callback(undefined, dbClient);
			return;
		} else {
			if (dbname === undefined){
				throw new Error('dnname is not defined');
			}
			this.getLocalDbConnector(dbname).open(function(err, db) {
			  if (err) throw err;
			  dbClient = db;
			  callback(undefined, db);
			})		}
	}

	var getDbCollection = function (dbClient, collectionName) {
		return dbClient.collection(collectionName);
	}

	var createDocument = function(dbRequest, callback){
		if (dbRequest.collectionName === undefined ||
			dbRequest.document === undefined){
				callback(new Error('dbRequest is not complete'));
		} else {
			this.getDbClient(dbName, function (err, dbClient) {
					var collection = dbClient.collection(dbRequest.collectionName);
					collection.insert(dbRequest.document, 
								{safe : true}, 
								function(err, records) 
								{
									if (err != undefined){
										callback(err);
										return;
									}
								callback(undefined, records[0]);
								}
					);
			});
		}
	}

	var readDocumentById = function(dbRequest, callback){
		if (dbRequest.collectionName === undefined ||
			dbRequest._id === undefined){
			callback(new Error('dbRequest is not complete, make sure collectionName and _id is defined. dbRequest :' + dbRequest.collectionName + ', '+ dbRequest._id));
		} else {
			var that = this;
			this.getDbClient(dbName, function (err, dbClient) {
					var collection = that.getDbCollection(dbClient, dbRequest.collectionName);
					var cursor = collection.find({_id: dbRequest._id});
					var items = [];
					cursor.each(function (err, item) {
						if (err) throw err;
						if (item != null && item){
							items.push(item);
						} else {
							cursor.toArray(function(err, data) {
								// now callback with items.
									callback(undefined, items[0]);
								return;
							});
						}
						
					});
				});
		}
	}

	var readDocumentsByPage = function(dbRequest, callback) {
		try{
			if (dbRequest.numberOfRecordsPerPage === undefined ||
				dbRequest.page === undefined ||
				dbRequest.collectionName === undefined ){
				callback(new Error('dbRequest is not complete, make sure numberOfRecordsPerPage and page and collectionName is defined.'));
			} else if (typeof(dbRequest.page) != 'number' ||
						typeof(dbRequest.numberOfRecordsPerPage) != 'number') {
						callback(new Error('dbRequest is not valid, make sure numberOfRecordsPerPage and page are must be valid numbers.'));
			} else {
				var skip = dbRequest.numberOfRecordsPerPage*(dbRequest.page -1);
				var that = this;
				this.getDbClient(dbName, function (err, dbClient) {
						var collection = that.getDbCollection(dbClient, dbRequest.collectionName);
						var cursor = collection.find(dbRequest.dbQuery).sort({$natural: -1}).skip(skip).limit(dbRequest.numberOfRecordsPerPage);
						var items = [];
						cursor.each(function (err, item) {
							if (err) throw err;
							if (item != null && item){
								items.push(item);
							} else {
								cursor.toArray(function(err, data) {
									// now callback with items.
									callback(undefined, items);
									return;
								});
							}
							
						});
				});
			}
		}
		catch (err) {
			throw err;
		}
	}

	var executeQuery = function(dbRequest, callback) {
		if (dbRequest.collectionName === undefined ||
			dbRequest.dbQuery === undefined){
			callback(new Error('dbRequest is incomplete, make sure collectionName and dbQuery is defined.'));
			return;
		} else {
			var that = this;
			this.getDbClient(dbName, function (err, dbClient) {
				var collection = that.getDbCollection(dbClient, dbRequest.collectionName);
				collection.find(dbRequest.dbQuery, function(err, cursor) {
		       		cursor.toArray(function(err, items) {
			        	if(err)
			        		callback(err);
			        	else
			          		callback(undefined, items)
			          	return;
			        });
				});
			})
		}
	}

	var updateDocumentById = function(dbRequest, callback) {
		if (dbRequest.collectionName === undefined ||
			dbRequest._id === undefined ||
			dbRequest.updateValue === undefined){
			callback(new Error('dbRequest is incomplete, make sure collectionName, _id and updateValue is defined.'));
			return;
		} else {
			var that = this;
			this.getDbClient(dbName, function (err, dbClient) {
				var collection = that.getDbCollection(dbClient, dbRequest.collectionName);
				collection.update({_id: dbRequest._id}, 
						  {$set: dbRequest.updateValue},
						  {w:1, safe : true},
						  function (err, result){
							if (err)
							  callback(err);
							else 								  
							  callback(undefined,result);
						  return;
				});		
			});
		}
	}

	var incrementFieldValue = function (dbRequest, callback) {
		if (dbRequest.collectionName === undefined ||
			dbRequest._id === undefined ||
			dbRequest.incrementValue === undefined){
			callback(new Error('dbRequest is incomplete, make sure collectionName, _id and incrementValue is defined.'));
			return;
		} else {
			var that = this;
			this.getDbClient(dbName, function (err, dbClient) {
				var collection = that.getDbCollection(dbClient, dbRequest.collectionName);
				collection.update({_id: dbRequest._id}, 
						  {$inc: dbRequest.incrementValue},
						  {w:1, safe : true},
						  function (err, result){
							if (err)
							  callback(err);
							else 								  
							  callback(undefined,result);
						  return;
				});		
			});
		}
	}

	var updateArrayEntryOfDocumentById = function (dbRequest, callback) {
		if (dbRequest === undefined ||
			dbRequest.collectionName === undefined ||
			dbRequest._id === undefined ||
			dbRequest.updateValue === undefined){
			callback(new Error('dbRequest is incomplete, make sure collectionName, _id and updateValue is defined.'));
			return;
		} else {
			var that = this;
			this.getDbClient(dbName, function (err, dbClient) {
				var collection = that.getDbCollection(dbClient, dbRequest.collectionName);
				collection.update({_id: dbRequest._id}, 
						  {$push: dbRequest.updateValue},
						  {w:1, safe: true, upsert: true},
						  function (err, result){
							if (err)
							  callback(err);
							else 								  
							  callback(undefined,result);
						  return;
				});		
			});
		}
	}

	var removeArrayEntryOfDocumentById = function (dbRequest, callback) {
		if (dbRequest === undefined ||
			dbRequest.collectionName === undefined ||
			dbRequest._id === undefined ||
			dbRequest.updateValue === undefined){
			callback(new Error('dbRequest is incomplete, make sure collectionName, _id and updateValue is defined.'));
			return;
		} else {
			var that = this;
			this.getDbClient(dbName, function (err, dbClient) {
				var collection = that.getDbCollection(dbClient, dbRequest.collectionName);
				collection.update({_id: dbRequest._id}, 
						  {$pull: dbRequest.updateValue},
						  {w:1, safe: true, upsert: true},
						  function (err, result){
							if (err)
							  callback(err);
							else 								  
							  callback(undefined,result);
						  return;
				});		
			});
		}
	}

	var removeDocumentById = function (dbRequest, callback) {
		if (dbRequest.collectionName === undefined ||
			dbRequest._id === undefined) {
			callback(new Error('dbRequest is incomplete, make sure collectionName and _id are defined.'));
			return;
		} else {
			var that = this;
			this.getDbClient(dbName, function (err, dbClient) {
				if (err) throw err;
				var collection = that.getDbCollection(dbClient, dbRequest.collectionName);
				collection.remove({_id: dbRequest._id}, 
		 						  	{safe: true},
								  	function (err, result){
										if (err)
										  callback(err);
										else 								  
										  callback(undefined,result);
									return;
				});
			})
		}
	}

	var removeDocumentsByQuery = function (jsonRequest, callback) {
		var dbRequest;
		try {
			dbRequest = new DBRequest(jsonRequest);
		}
		catch (err) {
			callback(err);
			return;
		}
		if (dbRequest.collectionName === undefined ||
			dbRequest.dbQuery === undefined){
			callback(new Error('dbRequest is incomplete, make sure collectionName and dbQuery is defined.'));
			return;
		} else {
			var that = this;
			this.getDbClient(dbName, function (err, dbClient) {
				if (err) throw err;
				var collection = that.getDbCollection(dbClient, dbRequest.collectionName);
				collection.remove(dbRequest.dbQuery, 
			 						  	{safe: true},
									  	function (err, result){
											if (err)
											  callback(err);
											else 								  
											  callback(undefined,result);
										return;
				});
			})
		}
	}
	
	var writeImage = function (dbRequest, callback) {
		if (dbRequest.imgMeta === undefined ||
				dbRequest.imgMeta.type === undefined ||
				dbRequest.img === undefined) {
				callback(new Error('dbRequest is incomplete, make sure img and metadata are defined, also the metadata must have the imageType.'));
				return;
			} else {
				var that = this;
				this.getDbClient(dbName, function (err, dbClient) {
					if (err) throw err;
					var createdImgId;
					var grid_store = new GridStore(dbClient, new ObjectID()+'_'+dbRequest.imgMeta.type, "w", {
						"metadata" : dbRequest.imgMeta,
						"chunk_size" : 1024 * 4
					});
					grid_store.open(function(err, gs) {
						if (err) {
							callback(err);
							return;
						}
						gs.write(dbRequest.img, function(err, gs) {
							if (err != null) {
								callback(err);
								return;
							}
							createdImgId = gs.fileId;
							gs.close(function() {
								callback(undefined, createdImgId);
								return;
							});
							return;
						});
					});
				})
			}
	}
	
	var readImage = function (dbRequest, callback) {
		if (dbRequest.img_id === undefined ){
			callback(new Error('dbRequest is incomplete, make sure img_id is defined.'));
			return;
		} else {
			var that = this;
			this.getDbClient(dbName, function (err, dbClient) {
				var imgObjectId;
				try{
					imgObjectId = ApplicationConstants.getObjectId(dbRequest.img_id.toString());
				}
				catch (e){
					callback(e);
					return;
				}
				var gs = new GridStore(dbClient, imgObjectId, "r");
				gs.open(function(err, gs) {
					if (err != null) {
						callback(err, null);
						return;
					}
					gs.seek(0, function(err, gs) {
						gs.read(function(err, data) {
							if (err != null) {
								callback(err, data);
								return;
							}
							gs.close(function() {
								return;
							});
							callback(null, data);
						});
					});
				});
			})
		}
	}

	return {
		'readDocumentById' : readDocumentById,
		'createDocument' : createDocument,
		'getDbCollection' : getDbCollection,
		'getDbClient' : getDbClient,
		'getLocalDbConnector' : getLocalDbConnector,
		'readDocumentsByPage' : readDocumentsByPage,
		'executeQuery' : executeQuery,
		'updateDocumentById' : updateDocumentById,
		'removeDocumentById' : removeDocumentById,
		'updateArrayEntryOfDocumentById' : updateArrayEntryOfDocumentById,
		'removeArrayEntryOfDocumentById' : removeArrayEntryOfDocumentById,
		'removeDocumentsByQuery' :removeDocumentsByQuery,
		'writeImage' : writeImage,
		'readImage' : readImage,
		'incrementFieldValue' : incrementFieldValue,
		'getDBClientByUri' : getDBClientByUri
	}

})();

module.exports = mongate;
