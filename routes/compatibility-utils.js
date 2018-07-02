var utils = require('./test-utils.js');

var convert_form_input = function(test, req_object) {
	var binary_results = [Array(test.metrics.length).fill(0), Array(test.metrics.length).fill(0)]
	var percentages = [Array(test.metrics.length).fill(0), Array(test.metrics.length).fill(0)]
	for(var i = 1; i <= 2; i++) {
		for(var metric = 0; metric < test.metrics.length; metric++) {
			binary_results[i-1][metric] = req_object[i + "" + metric] ? 1 : 0
			var submitted_percentage = req_object[JSON.stringify({key : i + "" + metric})]
			percentages[i-1][metric] = parseInt(submitted_percentage) / 100;
		}
	}
	return {
		'binary_results' : binary_results,
		'percentages' : percentages
	};
}

var produce_weights = function(test, binary_results, percentages) {
	var PARAMETER_SKEW = 0.05;
	var skewed_percentages = Array(percentages.length);
	for(var i = 0; i < percentages.length; i++) {
		skewed_percentages[i] = Math.pow(percentages[i] + 0.001, PARAMETER_SKEW);
	}

	var weights = new Array(test.types.length).fill(1);
	for(var i = 0; i < weights.length; i++) {
		for(var j = 0; j < skewed_percentages.length; j++) {
			// Checks if jth bit is used in i
			if(i & (1 << j)) {
				if(binary_results[j]) {
					weights[i] *= skewed_percentages[j]
				} else {
					weights[i] *= 1 - skewed_percentages[j]
				}
			} else {
				if(binary_results[j]) {
					weights[i] *= 1 - skewed_percentages[j]
				} else {
					weights[i] *= skewed_percentages[j]
				}
			}
		}
	}
	return weights;
}

var calculate_compatibility = function(test, binary_results, percentages) {
	var type1Index = utils.convert_binary_to_index(binary_results[0]),
		type2Index = utils.convert_binary_to_index(binary_results[1]);
	var weights1 = produce_weights(test, binary_results[0], percentages[0]),
		weights2 = produce_weights(test, binary_results[1], percentages[1]);
	console.log(weights1);
	console.log(weights2);

	var compatibility1 = 0;
	var compatibility2 = 0;
	for(var i = 0; i < weights1.length; i++) {
		compatibility1 += weights1[i] * test.matches.compatibility.key[i][type2Index];
		compatibility2 += weights2[i] * test.matches.compatibility.key[i][type1Index];
	}

	console.log(compatibility1)
	console.log(compatibility2)

	return {
		"headline" : (compatibility1 + compatibility2) * 10,
		"twoforone" : compatibility1 * 20,
		"onefortwo" : compatibility2 * 20
	};
}

exports.run_compatibilities = function(test, req_object) {
	input_obj = convert_form_input(test, req_object)
	return {
		binary_results : input_obj.binary_results,
		types : [
			test.types[utils.convert_binary_to_index(input_obj.binary_results[0])],
			test.types[utils.convert_binary_to_index(input_obj.binary_results[1])]
		],
		percentages : input_obj.percentages,
		compatibility : calculate_compatibility(test, input_obj.binary_results, input_obj.percentages)
	};
}