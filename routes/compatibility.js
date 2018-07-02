var express = require('express');
var router = express.Router();

var fs = require('fs');
var url = require('url');

var utils = require('./test-utils.js')
var comp_utils = require('./compatibility-utils.js');

var mbti = JSON.parse(fs.readFileSync('./public/jsondata/mbti.json','utf8'));
for (var i = 0; i < mbti.questions.length; i++) {
	mbti.questions[i].id = i;
}

/* GET home page. */
router.get('/mbti', function(req, res, next) {
	mbti.questions.sort(function() { return 0.5 - Math.random(); });
	res.render('compatibility', { test : mbti });
});

router.post('/mbti/result', function(req, res, next) {
	var result = comp_utils.run_compatibilities(mbti, req.body);
	res.redirect(url.format({
		pathname: '/compatibility/mbti/result',
		query: {
			r : utils.encrypt(result)
		}
	}));
});

router.get('/mbti/result', function(req, res, next) {
	res.render('compatibility-result', {
		test : mbti, 
		result : utils.decrypt(req.query.r)
	});
});

module.exports = router;
