var express = require('express');
var router = express.Router();


var activity = require('../models/activityModel');
var member = require('../models/memberModel');


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('web_index', { title: 'OutFrog' });
});




























module.exports = router;