var express = require('express');
var router = express.Router();

var interview = require('../models/interviewModel');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('web_index', { title: 'OutFrog' });
});




// 1-2. 면접후기 작성
router.get('/writeInterviewPage', function(req, res, next){
  res.render('web_writeFormInterview');
});

router.post('/insertInterview', function(req, res, next){
  interview.insertInterview(req, function(result){ res.json(result); });
  // interviewModel.insertInterview(req, function(result){ res.json(result); });
});


module.exports = router;
