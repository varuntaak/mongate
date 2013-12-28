var Conversation = function (conversation) {
	this.createdDate = new Date();
	if (conversation.type)
		this.type = conversation.type
	if (conversation.sender_id)
		this.sender_id = conversation.sender_id
	if (conversation.messages)
		this.messages = conversation.messages
}

module.exports = Conversation;