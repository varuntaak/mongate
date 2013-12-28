var ApplicationConstants = require('../models/ApplicationConstants');

var Post = function (post) {
	this._id = post._id;
	this.heading = post.heading;
	this.preViewAbleContent = post.preViewAbleContent;
	this.postDescriptionContent = post.postDescriptionContent;
	if (post.createdDate)
		this.createdDate = post.createdDate;
	else
		this.createdDate = new Date();
	this.comments = post.comments;
	this.owner_id = post.owner_id;

	this.validate = function () {
		if (this.heading)
			return true;
		else 
			return false;
	}
}

module.exports = Post;