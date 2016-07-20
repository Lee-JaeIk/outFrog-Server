var db = require('../models/mongodb');
var moment = require('moment');

var mongoose = require('mongoose'),
Schema = mongoose.Schema,
autoIncrement = require('mongoose-auto-increment');

var connection = mongoose.createConnection('mongodb://localhost/outFrog');
autoIncrement.initialize(connection);

var PostscriptSchema = new mongoose.Schema({
	'postscript_seq': Number,
	'postscript_writer': String,
	'postscript_origin_writeDate': { type:Date, default:Date.now },
	'postscript_writeDate': { type:String, default: null },
	'postscript_rate': { type:Number, default:0 },
	'postscript_term': String,
	'postscript_comment': String,
	'postscript_goodComment': String,
	'postscript_badComment': String,
	'postscript_goodCount': { type:Number, default:0 },
	'postscript_activity_seq': Number,
	'postscript_activity_companyName': String,
	'postscript_activity_companyLogo': String,
	'postscript_activity_actClass' : { type:String, default:"전체" }	
});

PostscriptSchema.plugin(autoIncrement.plugin, { model: 'Postscript', field: 'postscript_seq' });
mongoose.model('Postscript', PostscriptSchema);


require('./activityModel');
var ActivityModel = db.model('Activity');

require('./memberModel');
var MemberModel = db.model('Member');

require('./postscriptModel');
var PostscriptModel = db.model('Postscript');
var userException = require('./userException');

var statusOk = { "status":"OK" }
var statusFail = { "status":"Fail" }
var additionalPoint = 100;



/* ----------- 활동후기 ----------
	1. seq값을 지운 이유는 _id값이 생성되기 때문에
	2. postscript를 생성하고
		1. activity.postscript에 push
		2. push한 activity값을 save
	3. activity_averageRate
	4. activity_totalPostCount
	5. activity_totalPostCountStar
-----------------------------*/

// 2. 활동후기 작성
exports.insertPostscript = function(req, callback){
	// var activity_seq = req.body.activity_seq;
	var activity_seq = 0;	// 임시값
	// var postscript_writer = req.session.loginEmail;
	var postscript_writer = 'jjgorl@hanmail.net';	// 임시값

	var rate = (req.body.rate * 1).toExponential(1);
	var now = moment(new Date());
	var writeDate = now.format('YYYY-MM-DD');

	ActivityModel.findOne({'activity_seq':activity_seq}, function(err, activity){
		if(err) callback(statusFail);
		if(!activity) callback(statusFail);
		else{
			var postscript = new PostscriptModel({
				'postscript_writer': postscript_writer,
				'postscript_origin_writeDate': now,
				'postscript_writeDate': writeDate,
				'postscript_rate': rate,
				'postscript_term': req.body.term,
				'postscript_comment': req.body.comment,
				'postscript_goodComment': req.body.goodComment,
				'postscript_badComment': req.body.badComment,
				'postscript_goodCount': 0,
				'postscript_activity_seq': activity_seq,
				'postscript_activity_companyName': activity.activity_companyName,
				'postscript_activity_companyLogo': activity.activity_companyLogo,
				'postscript_activity_actClass': activity.activity_actClass
			}).save(function(err, doc){
				console.log('postscript.save err = ', err);
				if(err) callback(statusFail);

				/* ----- 대외활동 데이터 수정 -----
					1. 현재까지 평균값으로 총점을 구하고
					2. 총점에 작성된 값을 더해서 평균을 낸다.
					3. 별의 총 갯수를 추가해주고
					4. ++activity.activity_totalPostCount로 postscript수를 늘려준다.
					5. save하고, member의 point값을 증가시킨다.
				---------------------------*/

				var score = 0;					
				score = score + activity.activity_totalPostCountStar[0] * 1;
				score = score + activity.activity_totalPostCountStar[1] * 2;
				score = score + activity.activity_totalPostCountStar[2] * 3;
				score = score + activity.activity_totalPostCountStar[3] * 4;
				score = score + activity.activity_totalPostCountStar[4] * 5;


				activity.activity_averageRate = (( score + rate ) / ++activity.activity_totalPostCount);
				var range = activity.activity_averageRate * 1;

				if( range < 0.7 ) activity.activity_averageRate = 0.5;
				else if( range < 1.2 ) activity.activity_averageRate = 1.0;
				else if( range < 1.7 ) activity.activity_averageRate = 1.5;
				else if( range < 2.2 ) activity.activity_averageRate = 2.0;
				else if( range < 2.7 ) activity.activity_averageRate = 2.5;
				else if( range < 3.2 ) activity.activity_averageRate = 3.0;
				else if( range < 3.7 ) activity.activity_averageRate = 3.5;
				else if( range < 4.2 ) activity.activity_averageRate = 4.0;
				else if( range < 4.7 ) activity.activity_averageRate = 4.5;
				else activity.activity_averageRate = 5.0;

				activity.activity_totalPostCountStar[rate-1]++;

				activity.save(function(err){
					if(err) callback(statusFail);
					else{
						activity.update({$set:{'activity_totalPostCountStar': activity.activity_totalPostCountStar}}, function(err){
							/* ----- point 증가 -----
								1. postscript_writer의 point
								2. 100증가 ( 기획자 의도 )
							----------------------*/
							MemberModel.findOne({'member_loginEmail':postscript_writer}, function(err, member){
								if(err) callback(statusFail);
								if(!member) callback(statusFail);
								else{
									member.member_point += additionalPoint;
									member.update({$set:{'member_point': member.member_point}}, function(err){
										if(err) callback(statusFail);
										else callback(postscript);	
									});	// member.update									
								}	// member
							});	// MemberModel
						});	// 배열값 증가						
					}	// if(err)-else
				});	// activity.save
			});	// postscript.save
		}	// else
	});	// ActivityModel
}


exports.findOnePostscript = function(seq, callback){
	PostscriptModel.findOne({'postscript_seq':seq}, function(err, postscript){
		if(err) callback(statusFail);
		if(!postscript) callback(statusFail);
		else callback(postscript);
	});
}