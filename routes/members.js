var express = require('express');
var router = express.Router();

var member = require('../models/memberModel');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


router.get('/createMember', function(req, res, next){
	member.createMember(function(result){ res.json(result); });
});



module.exports = router;
