var DBQuery = function (dbQuery) {
	var attributeName = dbQuery.attributeName;
	var attributeValue = dbQuery.attributeValue;
	var query = {};
	query[attributeName] = attributeValue;

	query.validate = function () {
		for (attribute in query) {
			if (query.hasOwnProperty(attribute)
				  && query[attribute])
				{}
			else {
				return false;
			}
		}
		return true;
	}

	return query;
};

module.exports = DBQuery;