var db = require('../models/mongodb');
var moment = require('moment');
var async = require('async');

var mongoose = require('mongoose'),
Schema = mongoose.Schema,
autoIncrement = require('mongoose-auto-increment');

var connection = mongoose.createConnection('mongodb://localhost/outFrog');
autoIncrement.initialize(connection);

var ActivitySchema = new mongoose.Schema({
	'activity_seq': Number,
	'activity_name': String,
	'activity_hit': { type:Number, default:0 },
	'activity_origin_startDate': { type:Date, default: Date.now },
	'activity_startDate': { type:String, default: null },
	'activity_origin_endDate': { type:Date, default: Date.now },
	'activity_endDate': { type:String, default: null },
	'activity_actClass': { type:String, default:"전체" },
	'activity_indus': { type:String, default:"전체" },
	'activity_term': { type:String, default:"전체" },
	'activity_region': { type:String, default:"전체" },
	'activity_during': { type:Number, default:0 },
	'activity_strDuring': { type:String, default:"전체" },
	'activity_averageRate': { type:Number, default:0 },
	'activity_totalPostCount': { type:Number, default:0 },
	'activity_totalPostCountStar': { type:Array, default:[0,0,0,0,0] },
	'activity_totalInterCount': { type:Number, default:0 },
	'activity_totalInterLevel': { type:Number, default:0 },
	'activity_companyName': String,
	'activity_companyLogo': { type:String, default:"companyLogo" },
	'activity_guideImage': { type:String, default:"guide_Image" },
	'activity_recruitImage': { type:String, default:"recruit_Image" },
	
});

ActivitySchema.plugin(autoIncrement.plugin, { model: 'Activity', field: 'activity_seq' });
mongoose.model('Activity', ActivitySchema);

require('./activityModel');
var ActivityModel = db.model('Activity');

require('./postscriptModel');
var PostscriptModel = db.model('Postscript');

require('./interviewModel');
var InterviewModel = db.model('Interview');

require('./memberModel');
var MemberModel = db.model('Member');
var userException = require('./userException');

var statusOk = { "status":"OK" }
var statusFail = { "status":"Fail" }
var additionalPoint = 100;

/* --------- 작성 부분 -----------
	1. 대외활동 작성
	2. 활동후기 작성
	3. 면접후기 작성
------------------------------*/

// 1. 대외활동 작성
exports.insertActivity = function(req, guidePath, recruitPath, logoPath, callback){
	var now = moment(new Date(req.body.origin_startDate));
	var activity_startDate = now.format('YYYY-MM-DD');

	var dDay = userException.calculate_date(req.body.origin_endDate);
	var strDuring = userException.calculate_during(req.body.during);

	console.log('dDay = ', dDay);
	var activity = new ActivityModel({
		'activity_name': req.body.name,
		'activity_origin_startDate': new Date(req.body.origin_startDate),
		'activity_startDate': req.body.origin_startDate,
		'activity_origin_endDate': new Date(req.body.origin_endDate),
		'activity_endDate': dDay,
		'activity_actClass': req.body.actClass,
		'activity_indus': req.body.indus,
		'activity_term': req.body.term,
		'activity_region': req.body.region,
		'activity_during': req.body.during,
		'activity_strDuring': strDuring,
		'activity_companyName': req.body.companyName,
		'activity_companyLogo': logoPath,
		'activity_guideImage': guidePath,
		'activity_recruitImage': recruitPath
	}).save(function(err, doc){
		console.log('err = ', err);
		if(err) callback(statusFail);
		else callback(doc);
	});
}





/* --------------- MainPage -------------------
	1. 광고 + 평점이 높은 대외활동 2개
	2. 조회수가 높은 활동후기 1개
	3. 조회수가 높은 면접후기 1개
---------------------------------------------*/
exports.mainPage = function(callback){
	
	ActivityModel.find(function(err, activity){
		if(err) callback(statusFail);
		if(!activity) callback(statusFail);
		else{
			PostscriptModel.find(function(err, postscript){
				if(err) callback(statusFail);
				if(!postscript) callback(statusFail);
				else{
					InterviewModel.find(function(err, interview){
						if(err) callback(statusFail);
						if(!interview) callback(statusFail);
						else{
							var result = {
								"activity": activity,
								"postscript": postscript,
								"interview": interview
							}
							callback(result);
						}	// if(!interview)-else
					});	// InterviewModel
				}	// if(!postscript)-else
			}).sort({'postscript_goodCount':1}).limit(1);	// PostscriptModel
		}	// if(!activity)-else
	}).sort({'activity_averageRate':1}).sort({'activity_origin_endDate':-1}).limit(2);	// ActivityModel
}



/* ----- 대외활동 가져오기(모두배열) -----
	1. 대외활동명 검색(활동시기가 여러개일 수도 있으니깐 배열로 해야됨)
	2. 활동군별
	3. 산업군별
	4. 지역별
	5. 기간별
	6. 별점순
	7. 후기순
	8. 추천 대외활동
-------------------------*/

// 1. 대외활동명 검색
exports.searchActivity = function(search, callback){
	ActivityModel.find({'activity_name':{$regex:search}}, function(err, activity){
		if(err) callback(statusFail);
		if(!activity) callback(statusFail);
		else callback(activity);
	});	// ActivityModel
}

// 2-7. 대외활동 검색
var conditionsActivityValue = 0;
var averageRateActivityValue = 1;
var postscriptCountActivityValue = 2;
var recommandActivityValue = 3;

exports.conditionsSearch = function(req, callback){

	var actClassValue = req.body.actClass;
	var indusValue = req.body.indus;
	var duringValue = req.body.term;
	var regionValue = req.body.local;

	var value = req.body.value * 1;

	if( actClassValue == "null" || actClassValue == "전체" ) actClassValue = '';
	if( indusValue == "null" || indusValue == "전체" ) indusValue = '';
	if( duringValue == "null" || duringValue == "전체" ) duringValue = '';
	if( regionValue == "null" || regionValue == "전체" ) regionValue = '';

	/* ----- 조건별 대외화동 -----
		1. value == 0 조건별 대외활동
		2. value == 1 평균점수가 높은순
		3. value == 2 활동후기가 많은순
		4. value == 3 추천 대외활동
	------------------------*/
	switch(value){
		case conditionsActivityValue:
			ActivityModel.find({$and:[  {'activity_actClass':{$regex:actClassValue}}, {'activity_indus':{$regex:indusValue}}, {'activity_strDuring':{$regex:duringValue}}, {'activity_region':{$regex:regionValue}} ]}, function(err, activity){
				if(err) callback(statusFail);
				if(!activity) callback(statusFail);
				else callback(activity);
			}).sort( {'activity_origin_endDate':1});	
		break;
		case averageRateActivityValue:
			ActivityModel.find({$and:[  {'activity_actClass':{$regex:actClassValue}}, {'activity_indus':{$regex:indusValue}}, {'activity_strDuring':{$regex:duringValue}}, {'activity_region':{$regex:regionValue}} ]}, function(err, activity){
				if(err) callback(statusFail);
				if(!activity) callback(statusFail);
				else callback(activity);
			}).sort({'activity_averageRate':1}).sort( {'activity_origin_endDate':1});	
		break;
		case postscriptCountActivityValue:
			ActivityModel.find({$and:[  {'activity_actClass':{$regex:actClassValue}}, {'activity_indus':{$regex:indusValue}}, {'activity_strDuring':{$regex:duringValue}}, {'activity_region':{$regex:regionValue}} ]}, function(err, activity){
				if(err) callback(statusFail);
				if(!activity) callback(statusFail);
				else callback(activity);
			}).sort({'activity_totalPostCount':1}).sort( {'activity_origin_endDate':1});	
		break;		
	}
}	// conditionsSearch



/* ----- 대외활동 페이지 -----
	0. 대외활동 리스트

	상세보기
	1. 대외활동 상세보기
	2. 모집요강
	3. 추천 대외활동
------------------------*/

// 0. 대외활동 리스트
exports.activityList = function(callback){
	ActivityModel.find(function(err, activity){
		if(err) callback(statusFail);
		if(!activity) callback(statusFail);
		else callback(result);
	}).sort({'activity_origin_endDate':1});	// ActivityModel
}	// activityList

// 1. 대외활동 상세보기
exports.detailActivity = function(seq, callback){
	ActivityModel.findOne({'activity_seq':seq}, function(err, activity){
		if(err) callback(statusFail);
		if(!activity) callback(statusFail);
		else callback(activity);
	});	// ActivityModel
}	// detailActivity

exports.findOneActivity = function(seq, callback){
	ActivityModel.findOne({'activity_seq':seq}, function(err, activity){
		if(err) callback(statusFail);
		if(!activity) callback(statusFail);
		else callback(activity);
	});
}