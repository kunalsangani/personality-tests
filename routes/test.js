var express = require('express');
var router = express.Router();

var fs = require('fs');

var mbti = JSON.parse(fs.readFileSync('./public/jsondata/mbti.json','utf8'));
for (var i = 0; i < mbti.questions.length; i++) {
	mbti.questions[i].id = i;
}

var process_results = function(test, submission) {
	var result = new Array(test.metrics.length).fill(0);
	var totals = new Array(test.metrics.length).fill(0);
	for (var i = 0; i < test.questions.length; i++) {
		if(!submission[test.questions[i].id]) submission[test.questions[i].id] = 0;
		result[test.questions[i].indicator] += (test.questions[i].direction * submission[test.questions[i].id]) + 3;
		totals[test.questions[i].indicator] += 6;
	}
	for (var i = 0; i < result.length; i++) result[i] = result[i] / totals[i];
	return result;
}

var clean_results = function(test, results) {
	var headline_result = "";
	var binary_options = ["no", "yes"];
	var binary_results = new Array(test.metrics.length);
	for(var i = 0; i < results.length; i++) {
		var result_index = Math.floor(2 * results[i]);
		binary_results[i] = binary_options[result_index];
		headline_result += test.metrics[i][binary_results[i]].short;
		if(result_index == 0) 
			results[i] = 1 - results[i];
	}

	return {
		'headline_result' : headline_result,
		'binary_results' : binary_results,
		'results': results
	};
}

/* GET home page. */
router.get('/mbti', function(req, res, next) {
	mbti.questions.sort(function() { return 0.5 - Math.random();});
	res.render('test', { test : mbti });
});

router.post('/mbti/result', function(req, res, next) {
	var results_obj = clean_results(mbti, process_results(mbti, req.body));
	res.render('result', { 
		test : mbti, 
		headline_result : results_obj.headline_result,
		binary_results : results_obj.binary_results,
		results : results_obj.results 
	});
});

module.exports = router;
