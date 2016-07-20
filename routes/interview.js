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


/* ----- 면접후기 리스트 -----
	1. 면접후기 리스트
	2. 면접후기 상세보기
------------------------*/

// 1. 면접후기 리스트
router.get('/interviewList/:activity_seq', function(req, res, next){
	var seq = req.params.activity_seq;
	interview.interviewList(seq, function(result){ res.json(result); });
});

// 2. 면접후기 상세보기
router.get('/detailInterview/:interview_seq', function(req, res, next){
	var seq = req.params.interview_seq;
	interview.detailInterview(seq, function(result){ res.json(result); });
});
















module.exports = router;
