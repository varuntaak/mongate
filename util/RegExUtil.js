var RegExUtil = (function () {

	var getRegExForTextSearch = function (textToSearch) {
		var regEx = "^.*?";
		var keys = textToSearch.split(' ');
		keys.forEach(function (key) {
			regEx += key + ".*?";
		});
		regEx += "$";
		return new RegExp(regEx, "m");
	}

	return {
		'getRegExForTextSearch' : getRegExForTextSearch
	}
})();

module.exports = RegExUtil;