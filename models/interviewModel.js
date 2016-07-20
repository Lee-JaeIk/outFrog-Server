var db = require('../models/mongodb');
var moment = require('moment');

var mongoose = require('mongoose'),
Schema = mongoose.Schema,
autoIncrement = require('mongoose-auto-increment');

var connection = mongoose.createConnection('mongodb://localhost/outFrog');
autoIncrement.initialize(connection);

var InterviewSchema = new mongoose.Schema({
	'interview_seq': Number,
	'interview_writer': String,
	'interview_origin_writeDate': { type:Date, default:Date.now },
	'interview_writeDate': String,
	'interview_level': { type:Number, default:0 },
	'interview_result': String,
	'interview_question': String,
	'interview_answer': String,
	'interview_way': String,
	'interview_goodCount': { type:Number, default:0 },
	'interview_activity_seq': Number,	
	'interview_activity_compnayName': String,
	'interview_activity_companyLogo': String,
	'interview_activity_actClass' : { type:String, default:"전체" }
});

InterviewSchema.plugin(autoIncrement.plugin, { model: 'Interview', field: 'activity_seq' });
mongoose.model('Interview', InterviewSchema);



require('./activityModel');
var ActivityModel = db.model('Activity');

require('./memberModel');
var MemberModel = db.model('Member');

require('./interviewModel');
var interviewModel = db.model('Interview');
var userException = require('./userException');

var statusOk = { "status":"OK" }
var statusFail = { "status":"Fail" }
var additionalPoint = 100;


/* ----- 면접후기 -----
	1. 활동후기와 동일
	2. activity_totalInterCount
	3. activity_totalInterLevel
-------------------*/

// 3. 면접후기 작성
exports.insertInterview = function(req, callback){
	// var activity_seq = req.body.activity_seq;
	var activity_seq = 0;
	// var interview_writer = req.session.loginEmail;
	var interview_writer = 'jjgorl@hanmail.net';

	var level = (req.body.level)*1;
	var now = moment(new Date());
	var writeDate = now.format('YYYY-MM-DD');

	ActivityModel.findOne({'activity_seq':activity_seq}, function(err, activity){
		if(err) callback(statusFail);
		if(!activity) callback(statusFail);
		else{
			var interview = new interviewModel({
				'interview_writer': interview_writer,
				'interview_origin_writeDate': now,
				'interview_writeDate': writeDate,
				'interview_level': level,
				'interview_result': req.body.result,
				'interview_question': req.body.question,
				'interview_answer': req.body.answer,
				'interview_way': req.body.way,
				'interview_goodCount': 0,
				'interview_activity_seq': activity_seq,
				'interview_activity_companyName': activity.activity_companyName,
				'interview_activity_companyLogo': activity.activity_companyLogo,
				'interview_activity_actClass': activity.activity_actClass
			}).save(function(err, doc){
				console.log('interview.save err = ', err);
				if(err) callback(statusFail);

				var totalLevel = activity.activity_totalInterLevel *activity.activity_totalInterCount;
				activity.activity_totalInterLevel = Math.round((totalLevel + level) / ++activity.activity_totalInterCount);

				activity.save(function(err){
					if(err) callback(statusFail);
					else {

						/* ----- point 증가 -----
							1. interview_writer point
							2. 100증가 ( 기획자 의도 )
						----------------------*/
						MemberModel.findOne({'member_loginEmail':interview_writer	}, function(err, member){
							if(err) callback(statusFail);
							if(!member) callback(statusFail);
							else{
								member.member_point += additionalPoint;
								member.update({$set:{'member_point': member.member_point}}, function(err){
									if(err) callback(statusFail);
									else callback(interview);	
								});	// member.update			
							}	// else
						});	// MemberModel
					}	// if(err)-else
				});	// activity.save
			});
		}	// else 
	});	// ActivityModel
}