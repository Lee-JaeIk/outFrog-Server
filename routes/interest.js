var express = require('express');
var router = express.Router();

var interest = require('../models/interestModel');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('web_index', { title: 'OutFrog' });
});



/* ----- 찜한 대외활동 -----
	1. 대외활동 찜하기 ( 취소포함 ) / 대외활동 상세페이지
	2. 대외활동 리스트 ( 내가 찜한 대외활동 리스트 ) / 마이페이지
-----------------------*/

// 1. 대외활동 찜하기 ( 취소포함 ) 
router.get('/addInterestActivity/:activity_seq', function(req, res, next){
	var seq = req.params.activity_seq;
	interest.addInterestActivity(req, seq, function(result){ res.json(result); });
});	// addInterestActivity


// 2. 대외활동 리스트 ( 마이페이지 )
router.get('/interestList', function(req, res, next){
	interest.interestActivityList(req, function(result){ res.json(result); });
});






module.exports = router;
