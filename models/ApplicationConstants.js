var ObjectID = require('mongodb').ObjectID;

var ApplicationConstants = (function () {

	var testDb = 'testDB';
	var prodDb = 'socialDB';
	var prodDbNew = 'gyanDb';
	var serverRoot = process.cwd();
	var testApplicationRoot = 'localhost:5000';
	
	var getObjectId = function (id) {
		return new ObjectID.createFromHexString(id);
	} 
	
	var setResponseDefaultHeader = function (res) {
		res.header('Content-type', "application/json");
		res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, pre-check=0, post-check=0");
		return;
	}

	return {
		dbName : testDb,
		numberOfRecordsPerPage : 15,
		private : 'private',
		public : 'public',
		uriPrefixOfPost : '/post/',
		uriPrefixOfUser : '/user/',
		testApplicationRoot : testApplicationRoot,
		getObjectId : getObjectId,
		setResponseDefaultHeader : setResponseDefaultHeader,
		serverRoot : serverRoot
	}

})();

module.exports = ApplicationConstants;