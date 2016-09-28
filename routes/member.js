var express = require('express');
var router = express.Router();

var member = require('../models/memberModel');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* ----- 임의회원 생성 ----- */
router.get('/createMember', function(req, res, next){
	member.createMember(function(result){ res.json(result); });
});






/* ---- 회원가입 및 로그인 ----
  1. 회원가입
  2. 로그인 이메일 인증
  3. 약관동의
  4. 대학교 이메일 발송
  4-1. 대학교 이메일 인증
  5. Facebook 로그인
  6. 로그인
  7. 세션확인( 자동로그인 )
------------------------*/


router.get('/signUpPage', function(req, res, next){
  // signUpPage로 넘기고,
  res.render('web_signUpPage', { title: '회원가입 페이지' }); 
});

// 1. 회원가입
router.post('/signUp', function(req, res, next){  
  // sessionCheck
  /* ---------- 회원가입 --------- */
  member.signUp(req, function(result){ 
    res.render('web_index', { title: 'OutFrog' }); 
  });
});

// 2. 로그인 이메일 인증
router.get('/provisionCheck/:mail/:num', function(req, res, next){
  var member_loginEmail = req.params.mail;
  var member_provision_num = req.params.num;
  
  /* ------------ 이메일 인증 --------------
      1. 발생시킨 난수가 일치하면 회원가입 완료!
      2. 아니면 이메일 인증을 다시하도록!
      3. 고민해보기! - alert후 페이지 전환
  -------------------------------------*/
  member.provisionCheck(member_loginEmail, member_provision_num, function(result){ 
    if(true) res.send('<script>alert("로그인 이메일 인증완료!");</script>');      
    else res.send('<script>alert("이메일 인증을 다시해주세요!!");</script>');   
    // res.render('web_index', { title: 'OutFrog' }); 
  });
}); // checkMail

// 3. 약관동의
router.post('/quotationCheck', function(req, res, next){
  member.quotationCheck(req, function(result){ res.json(result); });
});

// 4. 대학교 이메일 발송
router.get('/sendUnivEmail', function(req, res, next){
  member.sendUnivEmail(req, function(result){ res.json(result); });
});

// 4-1. 대학교 이메일 인증
router.get('/univEmail_provisionCheck/:univEmail', function(req, res, next){
  var member_univEmail = req.params.univEmail;
  // var member_loginEmail = req.session.loginEmail;
  var member_loginEmail = 'jjgorl@hanmail.net';
  member.univEmail_provisionCheck(member_loginEmail, member_univEmail, function(result){ res.json(result); });
});

// 5. Facebook 로그인
router.post('/facebookLogin', function(req, res, next){
  member.facebookLogin(req, function(result){ res.json(result); });
});

// 6. 로그인
router.post('/login', function(req, res, next){  

  /* --------- 로그인 ------------
    1. 세션확인 후, 이리러 넘어온거니까
    2. 로그인할때, 세션등록
  ----------------------------*/
  member.login(req, function(result){ res.json(result); });
});

// 7. 세션확인( 자동로그인 )
router.get('/checkSession', function(req, res, next){

  /* -------- 세션확인 -------------
    1. 세션이 존재하면 메인페이지 (자동로그인)
    2. 세션이 없으면 로그인페이지
  ------------------------------*/

  // var member_loginEmail = req.session.loginEmail;
  // if(!member_loginEmail) loginPage
  // else mainPage
});









/* ---------- UserPage ----------------
  1. 나의개굴 확인
  2. 내가 찜한 대외활동 3개
    1. 찜한 대외활동 더보기
  3. 활동내역
    1. 내가 작성한 활동후기
    2. 내가 작성한 면접후기
  4. 여러개 더 있음.
    1. 회원탈퇴
    2. 로그아웃
    3. 관심활동군 선택
    4. 관심산업군 선택
-------------------------------------*/

// 1. 나의개굴 확인
router.get('/myPoint', function(req, res, next){
  member.myPoint(req, function(result){ res.json(result); });
});

// 2. 내가 찜한 대외활동 3개 --> interest에서 처리
// 2-1. 찜한 대외활동 더보기 --> interest에서 처리

// 3-1. 내가 작성한 활동후기 --> postscript
// 3-2. 내가 작성한 면접후기 --> interview

router.get('/findOneMember/:seq', function(req, res, next){
  var seq = req.params.seq;
  member.findOneMember(seq, function(result){ res.json(result); });
});
module.exports = router;
