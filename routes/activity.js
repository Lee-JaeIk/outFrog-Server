var express = require('express');
var router = express.Router();

var activity = require('../models/activityModel');
var easyimg = require('easyimage');
var multer = require('multer');
var _storage = multer.diskStorage({
  destination: function (req, file, cb) { // 어느 디렉토리에 저장할 것인가
    // if( 파일의 형식이 이미지 )
    cb(null, './public/images/');     // /public/images에 업로드
    // else if ( 파일의 형식이 텍스트 ) cb(null, './public/texts');
  },
  filename: function (req, file, cb) {  // 디렉토리에 저장할 파일의 이름을 어떻게 할것인가

    var originalname = file.originalname;
    var tmp = file.mimetype; // 'image/jpeg', 'image/png', 'image/gif'
    tmp = tmp.split('/')[1];
    if(tmp == 'jpeg' || tmp == 'JPG' ) { tmp = 'jpg' };

    var ext = "." + tmp;
    var filename = originalname.substring(0, originalname.lastIndexOf('.'));

    cb(null, filename + ext);       // 디렉토리에 filenmae+ext로 업로드
  }
});
var upload = multer({ 'storage': _storage });
// var path = "http://52.79.179.176:3000/images/";
var path = "http://localhost:3000/images/";



/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


/* ------ 대외활동 작성 -----
	1. 대외활동 작성 Page 불러오기
	2. 대외활동 입력
-----------------------*/

// 1. 대외활동 작성 Page 불러오기
router.get('/writeActivityPage', function(req, res, next){
  res.render('web_writeActivity');
});


// 2. 대외활동 입력
router.post('/insertActivity', upload.array('activityImage', 3), function(req, res, next){
  
  var guideFile = req.files[0];
  var recruitFile = req.files[1];
  var logoFile = req.files[2];

  var guidePath = path + guideFile.originalname;
  var recruitPath = path + recruitFile.originalname;
  var logoPath = path + logoFile.originalname;

  activity.insertActivity(req, guidePath, recruitPath, logoPath, function(result){ res.json(result); });
});




/* ---------- 메인페이지 ----------
  1. 대외활동 + 면접후기 + 활동후기
  2. 대외활동명 검색
  3. 조건별 대외활동검색
    1. 활동군
    2. 산업군
    3. 지역별
    4. 기간별
    5. 별점순
    6. 후기순
------------------------------*/

// 1. 대외활동(2) + 면접후기 + 활동후기
router.get('/mainPage', function(req, res, next){
  activity.mainPage(function(result){ res.json(result); });
});

// 2. 대외활동명 검색
// 3-1. 활동군별 조건검색
router.post('/conditionsSearch', function(req, res, next){
  activity.conditionsSearch(req, function(result){ res.json(result); });
});
// 3-2. 산업군별 조건검색
// 3-3. 지역별 조건검색
// 3-4. 기간별 조건검색
// 3-5. 별점순 조건검색
// 3-6. 후기순 조건검색


router.get('/findOneActivity/:seq', function(req, res, next){
  var seq = req.params.seq;
  activity.findOneActivity(seq, function(result){ res.json(result); });
});
module.exports = router;