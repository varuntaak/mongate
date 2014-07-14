var Job = require('./Job');

var Transaction = function (txn) {
	this.name = txn.name;
	if (txn.jobs) {
		var jobs = [];
		for (var i=0; i< txn.jobs.length; i++) {
			jobs.push(new Job(txn.jobs[i]));
		}
		this.jobs = jobs;
	}
	this.state = 'NEW';
	this.date = new Date();
}

module.exports = Transaction;