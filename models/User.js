var User = function (user){
	this.firstName = user.firstName;
	this.lastName = user.lastName;
	this.email = user.email;
	this.password = user.password;
	this.mobile = user.mobile;
	this.credibility_index = 0;
};

module.exports = User;
