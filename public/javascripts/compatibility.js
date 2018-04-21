var control_input_text = function() {
	$('.percentage-input').on('focus', function(e) {
		console.log(e.target)
		$(e.target).attr('value', '%');
		$(e.target)[0].setSelectionRange(0, 0);
	})

	$('.percentage-input').keydown(function(e) {
		// Don't allow any backspace or typing after the % sign
		var perc_char_index = e.target.value.indexOf('%')
		if(e.target.selectionStart > perc_char_index) {
			// Allow home, end, left, right
			if($.inArray(e.keyCode, [35, 36, 37, 38]) !== -1) {
				return;
			}
			e.preventDefault();
		}

		if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
             // Allow: Ctrl/cmd+A
            (e.keyCode == 65 && (e.ctrlKey === true || e.metaKey === true)) ||
             // Allow: Ctrl/cmd+C
            (e.keyCode == 67 && (e.ctrlKey === true || e.metaKey === true)) ||
             // Allow: Ctrl/cmd+X
            (e.keyCode == 88 && (e.ctrlKey === true || e.metaKey === true)) ||
             // Allow: home, end, left, right
            (e.keyCode >= 35 && e.keyCode <= 39)) {
                 // let it happen, don't do anything
                 return;
        }
        // Ensure that it is a number and stop the keypress
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
        //Ensure that the input form does not have more than two digits
        console.log(e.target)
        if(e.target.value.length > 2) {
        	e.preventDefault();
        }
	})
}

var setup_metric_toggles = function() {
	var toggle_if_label_clicked = function(e) {
		e.preventDefault();
		if(!$(e.target).hasClass('selected')) {
			console.log($(e.target).attr('name'));
			$('input[name=' + $(e.target).attr('name') + ']').click();
		}
	}
	$('p.left-label').on('click', toggle_if_label_clicked);
	$('p.right-label').on('click', toggle_if_label_clicked);
	$('input').on('change', function(e) {
		console.log($(e.target).attr('name'));
		var left_label = $('p.left-label[name=' + $(e.target).attr('name') + ']');
		var right_label = $('p.right-label[name=' + $(e.target).attr('name') + ']');
		console.log(left_label)
		if($(e.target).prop('checked')) {
			console.log("Removing class")
			left_label.removeClass('selected');
			right_label.addClass('selected');
		} else {
			right_label.removeClass('selected');
			left_label.addClass('selected');
		}
	});
}

var setupCarousel = function() {
	var owl = $('.owl-carousel');
	var submit_ready = false;

	owl.owlCarousel({
		items:1,
		mouseDrag:false,
		touchDrag: false
	});

	$('#next-page').click(function() {
		if(submit_ready) {
			$('#test_form').submit();
		} else {
			owl.trigger('next.owl.carousel');
			$('html,body').animate({
			 	scrollTop: $('#test-container').offset().top
			}, 400)
		}
	})

	owl.on('changed.owl.carousel', function(event) {
		if(event.page.index === event.page.count - 1) {
			$('#next-page').text("Submit")
			submit_ready = true;
		}
	})
}

setup_metric_toggles();
setupCarousel();

$(document).ready(function() { 
	$('#result-wrapper').hide();

	$('form').submit(function() {
		$.post($(this).attr('action'), $(this).serialize(), function(response) {
			$('#result-percentage').text(Math.round(response.result) + "% compatible");
			$('#result-wrapper').slideDown();
		}, 'json');
		return false;
	});

	// $('.metric-button').on('change', function(event) {
	// 	$(".dimension-name[name='" + event.target.name + "']")
	// 		.text($(event.currentTarget).text())
	// });

	control_input_text();
})