var DBConstants = (function () {

	var testDb = 'testDB';
	var prodDb = 'socialDB';
	var prodDbNew = 'gyanDb';
	
	return {
		dbName : testDb,
		'prodDb' : prodDb,
		'prodDbNew' : prodDbNew 
	}

})();

module.exports = DBConstants;