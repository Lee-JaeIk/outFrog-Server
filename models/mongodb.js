var mongoose = require('mongoose');
var uri = 'mongodb://localhost/outFrog';

var options = { servre: {poolSize:100 }};	// db동시 접속자수
var db = mongoose.createConnection(uri, options);


// on : 디비 이벤트가 발생했을때
db.on('error', function(err){
	if(err) console.log('mongodb err', error);
});

// once : 딱 한번만 실행
db.once('open', function callback(){
	console.info('Mongo db connected successfully');
});

module.exports = db;