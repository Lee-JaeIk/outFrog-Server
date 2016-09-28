var db = require('../models/mongodb');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport('smtps://testfrog2@gmail.com:dlworwor2@smtp.gmail.com');
var FB = require('FB');

var mongoose = require('mongoose'),
Schema = mongoose.Schema,
autoIncrement = require('mongoose-auto-increment');

var connection = mongoose.createConnection('mongodb://localhost/outFrog');
autoIncrement.initialize(connection);

var MemberSchema = new mongoose.Schema({
	'member_seq': Number,
	'member_loginEmail': String,
	'member_loginEmail_provisionCheck': { type:Number, default:0 },
	'member_provision_num': { type:Number, default:0 },
	'member_password': String,
	'member_univEmail': { type:String, default:null },
	'member_univEmail_provisionCheck': { type:Number, default:0 },
	'member_point': { type:Number, default:100 },		
	'member_quotationCheck': { type:Number, default:0 },
	'member_pushAlram': { type:Number, default:0 },
	'member_recommandAlram': { type:Number, default:0 },
	'member_interestAlram': { type:Number, default:0 },							// 찜한 대외활동 알림정보를 받을 것인지.
	'member_gcmToken': { type:String, default:null },
	'member_actClass': { type:Array , default:[0,0,0,0,0,0,0,0,0,0,0,0] },		// 관심 활동군
//	'member_likeActClass': { type:Array , default:[0,0,0,0,0,0,0,0,0,0,0,0] },	// likeActClass가 뭐지?
	'member_indus': { type:Array, default:[0,0,0,0,0,0,0,0,0,0,0] },			// 관심 산업군
	'member_adminCheck': { type:Number, default:0 },
	'notification':[
		{
			'notification_seq': { type:Number, default:0 },
			'notification_writeDate': { type:Date, default:Date.now },
			'notification_content': { type:String, default:null }
		}
	]
});

var statusOk = { "status":"OK" }
var statusFail = { "status":"Fail" }
var statusNotFound = { "status":"NotFound" }

MemberSchema.plugin(autoIncrement.plugin, { model: 'Member', field: 'member_seq' });
mongoose.model('Member', MemberSchema);

require('./memberModel');
var MemberModel = db.model('Member');

// UserSingUp / UserLogin / UserPage 
/* --------- UserSingUp ---------------
	1. 이메일 인증
	2. 가입완료
	3. 약관동의
	4. 대학교 이메일 인증(건너뛰기 가능)	
-------------------------------------*/


// 1. 회원가입
/* -------- Provision_loginEmail ------------
	1. 난수발생
	2. 난수와 함께 url 생성하여 메일 발송
	3. 난수와 loginEmail을 db에 저장
-------------------------------------------*/
exports.signUp = function(req, callback){
	console.log('memberModel-provision_loginEmail');

	var loginEmail = req.body.loginEmail;
	var password = req.body.password;

	MemberModel.findOne({'member_loginEmail': loginEmail}, function(err, member){
		if(err) callback(statusFail);
		if(!member){	
			console.log('!not found member');		
			var num = Math.floor(Math.random()*100000);
			var mailTitle = "[우물밖개구리] 메일을 인증해주세요!";
			var htmlText = '<a href="http://localhost:3000/member/provisionCheck/'+loginEmail+'/'+num+'">회원가입 완료!! Click!!</b>';
			// var htmlText = '<a href="http://52.79.179.176:3000/web/provisionCheck/'+loginEmail+'/'+num+'">회원가입 완료!! Click!!</b>';


			/* ---------- MailOptions ----------
				1. from : 발신자
				2. to : 수신자
				3. subject : 메일제목
				4. html : 메일 내용!
			-----------------------------------*/
			var mailOptions = {
				title: '"[우물밖 개구리]" <sixhustle@gmail.com>', 
				to: loginEmail, 
				subject: mailTitle, 
				html: htmlText
			};

			transporter.sendMail(mailOptions, function(err, info){
				// if(err) console.log('memberModel-provision_loginEmail trnasporter.sendMail err = ', err);
				if(err) callback(statusFail);

				var tmpMember = new MemberModel({
					'member_loginEmail': loginEmail,
					'member_password': password,
					'member_provision_num': num
				}).save(function(err){
					// if(err) console.log('memberModel-provision_loginEmail-member.save err = ', err);
					if(err) callback(statusFail);
					else callback(statusOk);
				});				
			}); // transporter.snedMail
		}else {			
			// exist member			
			// 인증이 되어있는지 안되어있는지 판단
			if( member.member_loginEmail_provisionCheck == 0){
				var num = Math.floor(Math.random()*100000);
				var mailTitle = "[우물밖개구리] 메일을 인증해주세요!";
				var htmlText = '<a href="http://localhost:3000/member/provisionCheck/'+loginEmail+'/'+num+'">회원가입 완료!! Click!!</b>';
				// var htmlText = '<a href="http://52.79.179.176:3000/checkMail/'+loginEmail+'/'+num+'">회원가입 완료!! Click!!</b>';

				var mailOptions = {
					from: '"[우물밖 개구리]" <testfrog2@gmail.com>', 
					to: loginEmail, 
					subject: mailTitle, 
					html: htmlText
				};

				transporter.sendMail(mailOptions, function(err, info){
					// if(err) console.log('memberModel-provision_loginEmail trnasporter.sendMail err = ', err);
					if(err) callback(statusFail);

					member.member_loginEmail = loginEmail;
					member.member_password = password;
					member.member_provision_num = num;

					member.save(function(err){
						// if(err) console.log('memberModel-provision_loginEmail-member.save err = ', err);
						if(err) callback(statusFail);
						else callback(statusOk);
					});	// member.save					
				}); // transporter.snedMail
			}else{ // if(member_loginEmail_provisionCheck == 0)
				// 이미 인증까지 완료되어있는 회원
				// return 이미 회원가입되어 있음.
			}	
		}	// if(!member)-else
	});	// MemberModel
}	// provision_loginEmail

// 2. 로그인 이메일 인증
exports.provisionCheck = function(loginEmail, num, callback){
	console.log('memberModel-provisionCheck');

	/* ----------- 이메일 인증 ----------------
		1. 회원가입이 안된 고객이면 return Fail
		2. else - 발생시킨 난수가 일치하면 회원가입 완료!
		3. 아니면 이메일 인증을 다시하도록!
	--------------------------------------*/
	MemberModel.findOne({'member_loginEmail': loginEmail}, function(err, member){
		// if(err) console.log('index-/checkMail/loginEmail/num MemberModel.findOne err = ', err);
		if(err) callback(statusFail);
		if(!member) callback(statusFail);
		else{
			if( num == member.member_provision_num ) {				
				member.update({$set:{'member_loginEmail_provisionCheck': 1}}, function(err){
					if(err) callback(false);
					else callback(true);
				});
			}
			else {				
				callback(false);
			}	// if(num)-else
		}	// if(!member)-else
	}); // MemberModel
}

// 3. 약관동의
exports.quotationCheck = function(req, callback){
	// var member_loginEmail = req.session.loginEmail;
	var member_loginEmail = 'jjgorl@hanmail.net';
	member.findOne({'member_loginEmail':member_loginEmail}, function(err, member){
		if(err) callback(statusFail);
		if(!member) callback(statusFail);
		else{
			member.update({$set:{'member_quotationCheck':1}});
			callback(statusOk);
		}
	});	// member.findOne
}	// quotationCheck

// 4. 대학교 이메일 발송
exports.sendUnivEmail = function(req, callback){
	var member_univEmail = req.body.member_univEmail;

	var mailTitle = "[우물밖개구리] 대학메일을 인증해주세요!";
	var htmlText = '<a href="http://localhost:3000/member/univEmail_provisionCheck/'+member_univEmail+'">대학메일 인증완료!! Click!!</b>';
	// var htmlText = '<a href="http://52.79.179.176:3000/web/provisionCheck/'+loginEmail+'/'+num+'">회원가입 완료!! Click!!</b>';

	var mailOptions = {
		from: '"[우물밖 개구리]" <testfrog2@gmail.com>', 
		to: member_univEmail, 
		subject: mailTitle, 
		html: htmlText
	};

	transporter.sendMail(mailOptions, function(err, info){
		// if(err) console.log('memberModel-provision_loginEmail trnasporter.sendMail err = ', err);
		if(err) callback(statusFail);
		else callback(statusOk);		
	}); // transporter.snedMail
}

// 4-1. 대학교 이메일 인증
exports.univEmail_provisionCheck = function(member_loginEmail, member_univEmail, callback){
	MemberModel.findOne({'member_loginEmail': member_loginEmail}, function(err, member){
		if(err) callback(statusFail);
		if(!member) callback(statusFail);
		else{
			member.update({$set:{'member_univEmail_provisionCheck':1}});
			callback(statusOk);
		}
	});
}

// 5. Facebook 로그인
exports.facebookLogin = function(req, callback){
	// gcmToken 저장
	var gcm_token = req.body.gcmToken;
	var access_token = req.body.accessToken;

	// 수정필요
	FB.setAccessToken(access_token);
	FB.api('me', { fields: ['id', 'name', 'email'] }, function (res) {
		if(!res || res.error)
			callback(statusFail);
		else{
			var member_loginEmail = res.email;
			MemberModel.findOne({'member_loginEmail': member_loginEmail}, function(err, member){
				if(err) callback(statusFail);
				if(!member){
					
					var member = new MemberModel({ 
						'member_loginEmail': loginEmail,
						'member_gcmToken': gcmToken
					});	
					member.save(function(err, result){ if(err) callback(statusFail); });
				}

				// 세션처리
				req.session.loginEmail = member_loginEmail;
				// 아이디 등록하거나 아이디 확인 후 다음화면으로 넘길 결과값 callback
				if(member.quotationCheck == 0 ) {
					var quotationResult = {
						"status": "notApproval",
						"facebookId": res.id
					}
					callback(quotationResult);
				}
				else if(member.provisionCheck == 0 ){
					var provisionResult = {
						"status": "notConfirm",
						"facebookId": res.id
					}
					callback(provisionResult); 
				}
				else{
					var result = {
						"status": "OK",
						"facebookId": res.id
					}
					callback(result);	
				} 
			});	// MemberModel
		}	// if( !res... )
	});	// FB.api	
}


// 6. 로그인
exports.login = function(req, callback){	
	
	/* ---------- UserLogin ---------------
		0. 세션확인
		1. 회원여부 확인
		2. 비밀번호 확인
		3. 약관동의 확인
		4. 대학교 이메일 인증 확인
		5. 페이지 이동
		6. gcm_token 저장
	-------------------------------------*/	
	var loginEmail = req.body.loginEmail;
	var password = req.body.password;

	MemberModel.findOne({'member_loginEmail': loginEmail}, function(err, member){
		if(err) callback(statusFail);
		if(!member) callback(statusFail);
		else{
			if( member.member_loginEmail_provisionCheck == 0 )
				callback(statusFail);
			else{
				if( !password == member.member_password )
					callback(statusFail);
				else{

					// 약관동의 확인
					if(member.member_quotationCheck == 0) console.log('member_quotationCheck == 0');

					// 대학교 이메일 인증 확인					
					if(member.member_univEmail_provisionCheck ==0) console.log('member_univEmail_provisionCheck == 0');
					
					// 세션등록
					callback(statusOk);
				}	// !password-else					
			}	// if(member_provision)-else
		}	// 회원가입이 된 경우
	});
}


/* ---------- UserPage ----------------
	1. 나의개굴 확인
	2. 내가 찜한 대외활동 3개
		1. 찜한 대외활동 더보기
	3. 활동내역
		1. 내가 작성한 활동후기
		2. 내가 작성한 면접후기
	4. 여러개 더 있음.
		1. 회원탈퇴
		2. 로그아웃
		3. 관심활동군 선택
		4. 관심산업군 선택
		5. 나의 관심활동군 가져오기
		6. 나의 관심산업군 가져오기
-------------------------------------*/


// 1. 나의개굴 확인
exports.myPoint = function(req, callback){
	
	// var member_loginEmail = req.session.loginEmail;
	var member_loginEmail = "jjgorl@hanmail.net";
	MemberModel.findOne({'member_loginEmail': member_loginEmail}, function(err, member){
		if(err) callback(statusFail);
		if(!member) callback(statusFail);
		else callback(member);
	});
}	// myPoint

// 2. 내가 찜한대외활동 3개	[interestModel]
// 2-1. 찜한 대외활동 더보기	[interestModel]

// 3-1. 내가 작성한 활동후기 리스트 [postscriptModel]
// 3-2. 내가 작성한 면저후기 리스트 [interviewModel]

// 4-1. 회원탈퇴
// 4-2. 로그아웃

// 4-3. 관심활동군 선택
exports.selectActClass = function(req, callback){
	
}
// 4-4. 관심산업군 선택
// 4-5. 나의 관심활동군 가져오기.
// 4-6. 나의 관심산업군 가져오기











/* ---------- Notification ----------------
	1. 찜한 대외활동 알림 보내기
	2. Notification 목록 확인하기
-------------------------------------*/






























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

exports.findOneMember = function(seq, callback){
	MemberModel.findOne({'member_seq': seq}, function(err, member){
		if(err) callback(statusFail);
		if(!member) callback(statusFail);
		else callback(member);
	});
}

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