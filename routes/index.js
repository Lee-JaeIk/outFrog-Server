var express = require('express');
var router = express.Router();

var db = require('../models/mongodb');
require('../models/activityModel');
var ActivityModel = db.model('Activity');

require('../models/memberModel');
var MemberModel = db.model('Member');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('web_index', { title: 'OutFrog' });
});



module.exports = router;
