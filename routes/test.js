var express = require('express');
var router = express.Router();

var fs = require('fs');
var url = require('url');
var utils = require('./test-utils.js');

var mbti = JSON.parse(fs.readFileSync('./public/jsondata/mbti.json','utf8'));
for (var i = 0; i < mbti.questions.length; i++) {
	mbti.questions[i].id = i;
}

/* GET home page. */
router.get('/mbti', function(req, res, next) {
	mbti.questions.sort(function() { return 0.5 - Math.random(); });
	res.render('test', { test : mbti });
});

router.post('/mbti/result', function(req, res, next) {
	var result_percentages = utils.convert_submission_to_percentages(mbti, req.body);
	res.redirect(url.format({
		pathname: '/test/mbti/result',
		query: {
			'percentages' : utils.encode_percentages_as_string(result_percentages)
		}
	}));
});

router.get('/mbti/result', function(req, res, next) {
	console.log(req.query)
	console.log(req.query.percentages)
	console.log(req.query.requesttype)

	if(req.query.requesttype == 'json') {
		res.json(utils.decode_to_percentages(mbti, req.query.percentages));
		return;
	}

	var percentages = utils.decode_to_percentages(mbti, req.query.percentages)
	var results_obj = utils.process_percentages(mbti, percentages);
	res.render('result', { 
		test : mbti, 
		headline_result : results_obj.headline_result,
		binary_results : results_obj.binary_results,
		results : results_obj.display_percentages 
	});
});

router.get('/compatibility', function(req, res, next) {
	res.render('compatibility', {test : mbti});
});

router.post('/compatibility/run', function(req, res, next) {
	res.send(run_compatibilities(mbti, req.body));
});

module.exports = router;
