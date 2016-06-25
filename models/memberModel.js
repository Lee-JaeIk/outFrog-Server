var db = require('../models/mongodb');

var mongoose = require('mongoose');
Schema = mongoose.Schema,
	autoIncrement = require('mongoose-auto-increment');

var connection = mongoose.createConnection('mongodb://localhost/outFrog');
autoIncrement.initialize(connection);

var MemberSchema = new mongoose.Schema({
	'member_seq': Number,
	'member_loginEmail': String,
	'member_loginEmail_provisionCehck': { type:Number, default:0 },
	'member_provision_num': { type:Number, default:0 },
	'member_pwd': String,
	'member_univEmail': String,
	'member_univEmail_provisionCheck': { type:Number, default:0 },
	'member_point': { type:Number, default:100 },		
	'member_quotationCheck': { type:Number, default:0 },
	'member_pushAlram': { type:Number, default:0 },
	'member_recommandAlram': { type:Number, default:0 },
	'member_interestAlram': { type:Number, default:0 },
	'member_gcmToken': String,
	'member_actClass': { type:Array , default:[0,0,0,0,0,0,0,0,0,0,0,0] },
	'member_likeActClass': { type:Array , default:[0,0,0,0,0,0,0,0,0,0,0,0] },
	'member_indus': { type:Array, default:[0,0,0,0,0,0,0,0,0,0,0] },
	'member_adminCheck': { type:Number, default:0 },
	'interestActivity':[
		{
			'interest_seq': Number,
			'interest_activitySeq': Number,
			'interest_check': { type:Number, default: 1}
		}
	],
	'notification':[
		{
			'notification_seq': Number,
			'notification_writeDate': { type:Date, default:Date.now },
			'notification_content': String
		}
	]
});

MemberSchema.plugin(autoIncrement.plugin, { model: 'Member', field: 'member_seq' });
mongoose.model('Member', MemberSchema);

require('./memberModel');
var MemberModel = db.model('Member');

















































//  ******************* End Project ******************* //
//  *******************             ******************* //
//  *******************             ******************* //
//  *******************             ******************* //
//  *******************             ******************* //
//  *******************             ******************* //
//  *******************             ******************* //
//  *******************             ******************* //
//  *******************             ******************* //
//  *******************             ******************* //
//  *******************             ******************* //
//  *******************             ******************* //
//  *******************             ******************* //
//  ******************* End Project ******************* //

exports.createMember = function(callback){
	
	var member = new MemberModel({
		'loginEmail' : 'admin',
		'pwd' : 'admin',		
		'provisionCheck' : 1,
		'quotationCheck' : 1,
	});
	member.save(function(err, result){
		if(err) callback({error:'database error member'});
		callback(result);
	});
}