var ApplicationConstants = require('../models/ApplicationConstants');

var PostResource = (function () {

	var createPostResourceFromPost = function (post, callback) {
		var postResource = {};
		for (attribute in post) {
			if (post.hasOwnProperty(attribute) && typeof(post[attribute]) !== 'function')
				postResource[attribute] = post[attribute]
		}
		setURI(postResource);
		setOwnerName(postResource, function (err, postResourceWithOwnerName) {
			if (err){
				callback(err);
			}
			else {
				populatePostResourceWithComments(postResourceWithOwnerName, function (err, postResourceWithOwnerNameAndComments) {
					if (err)
						callback(err);
					else
						callback(undefined, postResourceWithOwnerNameAndComments);
				})
			}
		});
	}

	var setOwnerName = function (postResource, callback) {
		UserService.getUserNameById(postResource.owner_id, function (err, ownerName) {
			if (err) {
				callback(err);
			}
			else {
				postResource['ownerName'] = (ownerName ? ownerName : 'Anonymous');
				callback(undefined, postResource);
			}
		});
	}

	var setURI = function (postResource) {
		postResource['uri'] = ApplicationConstants.uriPrefixOfPost + postResource._id;
	}

	var populatePostResourceWithComments = function (postResource, callback) {
		CommentService.readCommentsByPostId(postResource._id, function (err, comments) {
			if (err) {
				callback(err);
			}
			else {
				postResource['comments'] = comments;
				callback(undefined, postResource);
			}
		})	
	}

	return {
		'createPostResourceFromPost' : createPostResourceFromPost,
		'populatePostResourceWithComments' : populatePostResourceWithComments
	}
})();

module.exports = PostResource;