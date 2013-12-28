
var DateFormattingUtil = (function () {

	var formatDateAsHourAndMinute = function (dateToFormat) {
		var frmt = new DateFmt();
		return frmt.format(dateToFormat, "%H:%M");
	}

	var formatDateAsDayAndMonth = function (dateToFormat) {
		var frmt = new DateFmt();
		return frmt.format(dateToFormat, "%d-%n");
	}

	var formatDateToDisplay = function (dateToFormat) {
		
		var frmt = new DateFmt();
		var yesterdayDate = new Date();
		yesterdayDate.setDate(yesterdayDate.getDate() - 1);
		if(dateToFormat > yesterdayDate)
			return this.formatDateAsHourAndMinute(dateToFormat);
		else 
			return this.formatDateAsDayAndMonth(dateToFormat);
	}

	var DateFmt = function () {
	  this.dateMarkers = { 
	     d:['getDate',function(v) { return ("0"+v).substr(-2,2)}], 
	         m:['getMonth',function(v) { return ("0"+(v+1)).substr(-2,2)}],
	         n:['getMonth',function(v) {
	             var mthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
	             return mthNames[v];
	             }],
	         w:['getDay',function(v) {
	             var dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
	             return dayNames[v];
	             }],
	         y:['getFullYear'],
	         H:['getHours',function(v) { return ("0"+v).substr(-2,2)}],
	         M:['getMinutes',function(v) { return ("0"+v).substr(-2,2)}],
	         S:['getSeconds',function(v) { return ("0"+v).substr(-2,2)}],
	         i:['toISOString',null]
	  };

	  this.format = function(date, fmt) {
	    var dateMarkers = this.dateMarkers
	    var dateTxt = fmt.replace(/%(.)/g, function(m, p){
	    var rv = date[(dateMarkers[p])[0]]()

	    if ( dateMarkers[p][1] != null ) rv = dateMarkers[p][1](rv)

	    return rv;
	  });

	  return dateTxt;
	  }
	}

	return {
		'formatDateAsHourAndMinute' : formatDateAsHourAndMinute,
		'formatDateAsDayAndMonth' : formatDateAsDayAndMonth,
		'formatDateToDisplay' : formatDateToDisplay

	}

})();

module.exports = DateFormattingUtil