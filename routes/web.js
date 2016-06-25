var express = require('express');
var router = express.Router();

var db = require('../models/mongodb');
require('../models/activityModel');
var ActivityModel = db.model('Activity');

var exception = require('../models/userException');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('web_login', { title: 'Login Page' });
});

router.post('/login', function(req, res, next){
	var loginEmail = req.body.email;
	var pwd = req.body.pwd;
	
	console.log('loginEmail / pwd / ', loginEmail, pwd);
	if( loginEmail == 'admin' && pwd == 'admin' ){
		console.log('login success');
		req.session.loginEmail = loginEmail;
		res.redirect('/web/activityList');
	}
});

router.get('/activityList', function(req, res, next){
	console.log('1----------------------------------------------------1 /web/activityList req.session.loginEmail', req.session.loginEmail);
	if(!req.session.loginEmail) res.redirect('/');
	else res.json('/web/activityList');
});




module.exports = router;
