var express = require('express');
var router = express.Router();

var postscript = require('../models/postscriptModel');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('web_index', { title: 'OutFrog' });
});



// 1-1. 활동후기 작성
router.get('/writePostscriptPage', function(req, res, next){
  res.render('web_writeFormPostscript');
});

router.post('/insertPostscript', function(req, res, next){
  postscript.insertPostscript(req, function(result){ res.json(result); });
  // postscriptModel.insertPostscript(req, function(result){ res.json(result); });
});




router.get('/findOnePostscript/:seq', function(req, res, next){
	var seq = req.params.seq;
	postscript.findOnePostscript(seq, function(result){ res.json(result); });
});
module.exports = router;
