var radio_labels = $('input[type="radio"] + label');
radio_labels.on('click', function(event) {
	$(event.target).prev().prop('checked', true);
});

for (var i = 0; i < radio_labels.length; i++) {
	var radio_value = $(radio_labels[i]).attr('radio_value');
	if(radio_value < 0) {
		$(radio_labels[i]).addClass('disagree')
	} else if(radio_value > 0) {
		$(radio_labels[i]).addClass('agree');
	} 
	if(Math.abs(radio_value) > 0 && Math.abs(radio_value) < 4) {
		var classes = ['small', 'med', 'max'];
		$(radio_labels[i]).addClass(classes[Math.abs(radio_value) - 1]);
	}
}

$('.slider').on('change', function(e) {
	if(e.target.value >= 0) {
		$(e.target).removeClass('disagree')
		if(e.target.value > 0) {
			$(e.target).addClass('agree')
		}
	}
	if(e.target.value <= 0) {
		$(e.target).removeClass('agree')
		if(e.target.value < 0) {
			$(e.target).addClass('disagree')
		}
	}
	console.log(e.target.value)
})

$(document).ready(function() {
	$('#submit-form').hide();

	var owl = $('.owl-carousel');

	owl.owlCarousel({
		items:1,
		mouseDrag:false
	});

	$('#next-page').click(function() {
		owl.trigger('next.owl.carousel');
		$('html,body').animate({
		 	scrollTop: $('#test-container').offset().top
		}, 400)
	})

	owl.on('changed.owl.carousel', function(event) {
		if(event.page.index === event.page.count - 1) {
			$('#next-page').hide();
			$('#submit-form').show();
		}
	})
})