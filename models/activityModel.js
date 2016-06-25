var db = require('../models/mongodb');

var mongoose = require('mongoose');
Schema = mongoose.Schema,
	autoIncrement = require('mongoose-auto-increment');

var connection = mongoose.createConnection('mongodb://localhost/outFrog');
autoIncrement.initialize(connection);

var ActivitySchema = new mongoose.Schema({
	'activity_seq': Number,
	'activity_name': String,
	'activity_hit': Number,
	'activity_origin_startDate': { type:Date, default: Date.now },
	'activity_startDate': { type:Date, default: Date.now },
	'activity_origin_endDate': { type:Date, default: Date.now },
	'activity_endDate': { type:Date, default: Date.now },
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
	'postscript':[
		{
			'postscript_seq': Number,
			'postscript_writer': String,
			'postscript_origin_writeDate': { type:Date, default:Date.now },
			'postscript_writeDate': String,
			'postscript_rate': { type:Number, default:0 },
			'postscript_term': String,
			'postscript_comment': String,
			'postscript_goodComment': String,
			'postscript_badComment': String,
			'postscript_goodCount': { type:Number, default:0 }
		}
	],
	'interview':[
		{
			'interview_seq': Number,
			'interview_writer': String,
			'interview_origin_writeDate': { type:Date, default:Date.now },
			'interview_writeDate': String,
			'interview_level': { type:Number, default:0 },
			'interview_result': String,
			'interview_question': String,
			'interview_answer': String,
			'interview_way': String,
			'interview_goodCount': { type:Number, default:0 }
		}
	]
});

ActivitySchema.plugin(autoIncrement.plugin, { model: 'Activity', field: 'activity_seq' });
mongoose.model('Activity', ActivitySchema);