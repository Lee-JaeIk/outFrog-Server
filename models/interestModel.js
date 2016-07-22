var db = require('../models/mongodb');

var mongoose = require('mongoose'),
Schema = mongoose.Schema,
autoIncrement = require('mongoose-auto-increment');

var connection = mongoose.createConnection('mongodb://localhost/outFrog');
autoIncrement.initialize(connection);

var InterestSchema = new mongoose.Schema({
	'interest_seq': Number,
	'interest_activity_seq': Number,
	'interest_activity_origin_endDate' : { type:Date, default: Date.now },
	'interest_activity_endDate': String,
	'interest_activity_actClass': String,
	'interest_activity_companyName': String,
	'interest_activity_companyLogo': String,
	'interest_activity_recruitImage': String,
	'interest_member_loginEmail': String,
	'interest_check': { type:Number, default:1 }
});

InterestSchema.plugin(autoIncrement.plugin, { model: 'Interest', field: 'interest_seq' });
mongoose.model('Interest', InterestSchema);

var statusOk = { "status":"OK" }
var statusFail = { "status":"Fail" }

require('./interestModel');
var InterestModel = db.model('Interest');

require('./activityModel');
var ActivityModel = db.model('Activity');






/* ----- 찜한 대외활동 -----
	1. 대외활동 찜하기 ( 취소포함 ) / 대외활동 상세페이지
	2. 대외활동 리스트 ( 내가 찜한 대외활동 리스트 ) / 마이페이지
	3. 대외활동 리스트 더보기
-----------------------*/

// 1. 대외활동 찜하기
exports.addInterestActivity = function(req, seq, callback){

	// var member_loginEmail = req.session.loginEmail;
	var member_loginEmail = "jjgorl@hanmail.net";


	InterestModel.findOne({$and: [{'interest_activity_seq':seq}, {'interest_member_loginEmail': member_loginEmail}]}, function(err, interest){
		if(err) callback(statusFail);
		if(!interest){

			/* ----- 찜한 대외활동 추가 -----
				1. 찜 대외활동 리스트에 없으면
				2. 해당 대외활동을 찾고,
				3. 대외활동 정보를 찜한 대외활동에 삽입
				4. 찜한 대외활동 생성
			--------------------------*/
			ActivityModel.findOne({'activity_seq':seq}, function(err, activity){
				if(err) callback(statusFail);
				if(!activity) callback(statusFail);
				else{
					var addInterest = new InterestModel({
						'interest_activity_seq': seq,
						'interest_activity_endDate': activity.activity_endDate,
						'interest_activity_actClass': activity.activity_actClass,
						'interest_activity_companyLogo': activity.activity_companyLogo,
						'interest_activity_companyName': activity.activity_companyLogo,
						'interest_activity_recruitImage': activity.activity_recruitImage,
						'interest_member_loginEmail': member_loginEmail
					}).save(function(err, doc){
						if(err) callback(statusFail);
						else callback(doc);
					});	// save(function(err, doc))
				}
			});	// ActivityModel
		}else{

			/* ----- 찜여부 판단 -----
				1. interest_check == 0 이면 찜X
				2. 찜X <--> 찜O update
			---------------------*/
			if(interest.interest_check == 0 ) interest.interest_check = 1;
			else interest.interest_check = 0;

			interest.update({$set:{'interest_check': interest.interest_check}}, function(err){
				console.log('hello - 3');
				if(err) callback(statusFail);
				else callback(interest);
			});
		}	// if(!interest)-else
	});	// InterestModel
}	// addInterestActivity

// 2. 대외활동 리스트
exports.interestActivityList = function(req, callback){

	// var member_loginEmail = req.session.loginEmail;
	var member_loginEmail = "jjgorl@hanmail.net";

	InterestModel.find({'interest_member_loginEmail': member_loginEmail }, function(err, interests){
		if(err) callback(statusFail);
		if(!interests) callback(statusFail);
		else callback(interests);
	}).limit(3);
}	// interestActivityList

// 3. 대외활동 리스트 더보기
exports.interestMoreList = function(req, callback){

	// var member_loginEmail = req.session.loginEmail;
	var member_loginEmail = "jjgorl@hanmail.net";

	InterestModel.find({'interest_member_loginEmail': member_loginEmail}, function(err, interest){
		if(err) callback(statusFail);
		if(!interest) callback(statusFail);
		else callback(interest);
	});
}	// interestMoreList

/* ----- 찜한 대외활동 -----
	1. member_loginEmail로 interestActivity가져온다.
	2. interestActivity를 eachSeries돌려서 Activity를 가져온다.
-------------------------*/
var interestActivityValue = 1;
var interestActivityMoreValue = 2;
var interestActivityCount = 2;
