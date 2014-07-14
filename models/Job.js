var Job = function (job) {
	this.todo = job.todo;
	this.resource_id = job.resource_id;
	this.update_value = job.update_value;
	this.collection = job.collection;
	this.pending_transactions = [];
}

module.exports = Job;