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
	'interest_member': Number,
	'interest_check': { type:Number, default:0 }
});

InterestSchema.plugin(autoIncrement.plugin, { model: 'Interest', field: 'interest_seq' });
mongoose.model('Interest', InterestSchema);

var statusOk = { "status":"OK" }
var statusFail = { "status":"Fail" }



/* ----- 찜한 대외활동 -----
	1. member_loginEmail로 interestActivity가져온다.
	2. interestActivity를 eachSeries돌려서 Activity를 가져온다.
-------------------------*/
var interestActivityValue = 1;
var interestActivityMoreValue = 2;
var interestActivityCount = 2;
