exports.convert_binary_to_index = function(binary_array) {
	var index = 0;
	for(var i = 0; i < binary_array.length; i++) {
		index += binary_array[i] * Math.pow(2, i);
	}
	return index;
}

exports.encode_percentages_as_string = function(percentages) {
	var encoded = '';
	for(var i = 0; i < percentages.length; i++) {
		console.log(percentages[i])
		console.log(String.fromCharCode(parseInt(percentages[i])))
		encoded += String.fromCharCode(parseInt(200 * percentages[i],10))
	}
	return encodeURIComponent(encoded);
}

exports.decode_to_percentages = function(test, encoded) {
	var decoded = decodeURIComponent(encoded)
	var percentages = new Array(test.metrics.length).fill(0);
	console.log(decoded.length)
	console.log(percentages.length)
	if(decoded.length != percentages.length) {
		return null;
	}
	for(var i = 0; i < percentages.length; i++) {
		percentages[i] = decoded.charCodeAt(i) / 200;
		console.log(percentages[i]);
		if(percentages[i] < 0 || percentages[i] > 1) return null;
	}
	return percentages;
}

exports.convert_submission_to_percentages = function(test, submission) {
	var result = new Array(test.metrics.length).fill(0);
	var totals = new Array(test.metrics.length).fill(0);
	for (var i = 0; i < test.questions.length; i++) {
		if(!submission[test.questions[i].id]) submission[test.questions[i].id] = 0;
		
		totals[test.questions[i].indicator] += (test.scale.high - test.scale.low);
		if(test.questions[i].direction > 0) {
			result[test.questions[i].indicator] += submission[test.questions[i].id] - test.scale.low
		} else {
			result[test.questions[i].indicator] += -1 * submission[test.questions[i].id] + test.scale.high
		}
	}
	for (var i = 0; i < result.length; i++) result[i] = result[i] / totals[i];
	return result;
}

exports.process_percentages = function(test, percentages) {
	console.log(percentages)

	var binary_results = new Array(test.metrics.length),
		displayed_percentages = new Array(test.metrics.length);
	
	for(var i = 0; i < percentages.length; i++) {
		binary_results[i] = Math.floor(2 * percentages[i]);
		displayed_percentages[i] = 100 * Math.abs(2 * percentages[i] - 1)
		//displayed_percentages[i] = Math.abs(1 - binary_results[i] - results[i]);
	}

	console.log(binary_results)
	console.log(displayed_percentages)

	return {
		'headline_result' : test.types[this.convert_binary_to_index(binary_results)],
		'binary_results' : binary_results,
		'display_percentages': displayed_percentages
	};
}