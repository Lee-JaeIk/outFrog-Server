var express = require('express');
var router = express.Router();

var interest = require('../models/interestModel');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('web_index', { title: 'OutFrog' });
});


module.exports = router;
