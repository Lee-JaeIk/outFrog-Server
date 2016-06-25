// sessionCheck
exports.sessionCheck = function(req, callback){
	if(req.session.loginEmail) callback(true);
	else callback(false);
}