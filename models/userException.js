// sessionCheck
exports.sessionCheck = function(req, callback){
	if(req.session.loginEmail) callback(true);
	else callback(false);
}

exports.calculate_date = function(endDate){
	
	var today = new Date();	
	var tmpEndDate = new Date(endDate);
	var days = (today - tmpEndDate) / 1000 / 60 / 60 / 24;
	var result = Math.floor(days);

	if(result > 0 ) result = "D+"+result;
	else if(result == 0 ) result = "D-Day";
	else result = "D"+result;

	return result;
}

exports.calculate_during = function(during){
	var num = parseInt(during);
	var result;
	
	if(num < 30) result = "1개월";
	else if( num < 90 ) result = "1~3개월";
	else if( num < 150 ) result = "3~5개월";
	else result = "6개월~";
	return result;
}