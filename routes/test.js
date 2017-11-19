var express = require('express');
var router = express.Router();

var fs = require('fs');

var mbti = JSON.parse(fs.readFileSync('./public/jsondata/mbti.json','utf8'));
for (var i = 0; i < mbti.questions.length; i++) {
	mbti.questions[i].id = i;
}

var process_results = function(test, submission) {
	var result = new Array(mbti.metrics.length).fill(0);
	var totals = new Array(mbti.metrics.length).fill(0);
	for (var i = 0; i < test.questions.length; i++) {
		if(!submission[test.questions[i].id]) submission[test.questions[i].id] = 0;
		result[test.questions[i].indicator] += (test.questions[i].direction * submission[test.questions[i].id]) + 3;
		totals[test.questions[i].indicator] += 6;
	}
	for (var i = 0; i < result.length; i++) result[i] = result[i] / totals[i];
	return result;
}

/* GET home page. */
router.get('/mbti', function(req, res, next) {
	mbti.questions.sort(function() { return 0.5 - Math.random();});
	res.render('test', { test : mbti });
});

router.post('/mbti', function(req, res, next) {
	res.render('result', { 
		metrics : mbti.metrics, 
		results : process_results(mbti, req.body) 
	});
});

module.exports = router;
