var Comment = function (comment) {
	this.author_id = comment.author_id;
	this.post_id = comment.post_id;
	this.text = comment.text;
	this.date = comment.date;
	
	this.validate = function () {
		if (this.author_id && this.post_id)
			return true;
		else 
			return false;
	}
}

module.exports = Comment;