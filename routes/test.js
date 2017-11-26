var express = require('express');
var router = express.Router();

var fs = require('fs');

var mbti = JSON.parse(fs.readFileSync('./public/jsondata/mbti.json','utf8'));
for (var i = 0; i < mbti.questions.length; i++) {
	mbti.questions[i].id = i;
}

var convert_binary_to_index = function(binary_array) {
	var index = 0;
	for(var i = 0; i < binary_array.length; i++) {
		index += binary_array[i] * Math.pow(2, i);
	}
	return index;
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
	var binary_results = new Array(test.metrics.length),
		adj_results = new Array(test.metrics.length);
	for(var i = 0; i < results.length; i++) {
		binary_results[i] = Math.floor(2 * results[i]);
		adj_results[i] = Math.abs(1 - binary_results[i] - results[i]);
	}

	return {
		'headline_result' : test.types[convert_binary_to_index(binary_results)],
		'binary_results' : binary_results,
		'results': adj_results
	};
}

var produce_weights2 = function(test, results) {
	var PARAMETER_SKEW = 8;
	var weights = new Array(test.types.length).fill(0);
	for(var j = 0; j < results.length; j++){
		var is_j_lit = Math.floor(2 * results[j]);
		for(var i = 0; i < weights.length; i++) {
			var is_j_used = (i & (1 << j)) / Math.pow(2, j);
			if(is_j_lit + is_j_used == 1) {
				weights[i] += Math.pow(results[j] - 0.5, 2);
			}
		}
	}
	var max = weights.reduce(function(a,b) { return Math.max(a,b); });
	var sum = 0;
	for(var i = 0; i < weights.length; i++) { 
		weights[i] /= max;
		weights[i] = Math.pow(1 - weights[i], PARAMETER_SKEW);
		sum += weights[i];
	}
	for(var i = 0; i < weights.length; i++) {
		weights[i] = weights[i] / sum;
	}
	return weights;
}

var produce_weights = function(test, results) {
	var PARAMETER_SKEW = 2;
	var skewed_results = Array(results.length);
	for(var i = 0; i < results.length; i++) {
		if(Math.floor(2 * results[i]) > 0) {
			skewed_results[i] = 1 - Math.pow(1 - results[i], PARAMETER_SKEW)
		} else {
			skewed_results[i] = Math.pow(results[i], PARAMETER_SKEW);
		}
	}

	var weights = new Array(test.types.length).fill(1);
	for(var i = 0; i < weights.length; i++) {
		for(var j = 0; j < skewed_results.length; j++) {
			// Checks if jth bit is used in i
			if(i & (1 << j)) {
				weights[i] *= skewed_results[j]
			} else {
				weights[i] *= 1 - skewed_results[j]
			}
		}
	}
	return weights;
}

var calculate_compatibility = function(test, results1, results2) {
	var resultsObj1 = clean_results(test, results1),
		resultsObj2 = clean_results(test, results2);
	var type1Index = convert_binary_to_index(resultsObj1.binary_results),
		type2Index = convert_binary_to_index(resultsObj2.binary_results);
	var weights1v1 = produce_weights(test, results1),
		weights2v1 = produce_weights(test, results2);
	var weights1v2 = produce_weights2(test, results1),
		weights2v2 = produce_weights2(test, results2);

	var compatibility11 = compatibility21 = 0;
	var compatibility12 = compatibility22 = 0;
	for(var i = 0; i < weights1v2.length; i++) {
		compatibility11 += weights1v1[i] * test.matches.compatibility.key[i][type2Index];
		compatibility21 += weights2v1[i] * test.matches.compatibility.key[i][type1Index];
		compatibility12 += weights1v2[i] * test.matches.compatibility.key[i][type2Index];
		compatibility22 += weights2v2[i] * test.matches.compatibility.key[i][type1Index];
	}

	return {
		"result" : (compatibility11 + compatibility12 + compatibility21 + compatibility22) * 5,
		"one-1" : compatibility11 * 20,
		"one-2" : compatibility12 * 20,
		"two-1" : compatibility21 * 20,
		"two-2" : compatibility21 * 20,
	};
}

var run_compatibilities = function(test, inputs) {
	var results = [Array(test.metrics.length), Array(test.metrics.length)];
	for(var i = 1; i <= 2; i++) {
		for(var j = 0; j < test.metrics.length; j++) {
			var input_value = (inputs[i + '' + j][1].match(/\d/g).join('')) / 100;
			if(inputs[i + '' + j][0] == 1) {
				results[i-1][j] = input_value;
			} else {
				results[i-1][j] = 1 - input_value;
			}
		}
	}
	return calculate_compatibility(test, results[0], results[1]);
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

router.get('/compatibility', function(req, res, next) {
	res.render('compatibility', {test : mbti });
});

router.post('/compatibility/run', function(req, res, next) {
	res.send(run_compatibilities(mbti, req.body));
});

module.exports = router;
