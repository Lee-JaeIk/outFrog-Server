var express = require('express');
var router = express.Router();

var db = require('../models/mongodb');
require('../models/activityModel');
var ActivityModel = db.model('Activity');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/getActivity', function(req, res, next){
	ActivityModel.find(function(err, activity){
		if(err) console.log('/index err ', err);
		res.json(activity);
	});
});
module.exports = router;
