$(function() {
	var controller = new ScrollMagic.Controller({
		globalSceneOptions: {
			triggerHook : 'onLeave'
		}
	});

	var slides = document.querySelectorAll('section.panel');

	for (var i = 0; i < slides.length; i++) {
		new ScrollMagic.Scene({
			triggerElement: slides[i]
		})
		.setPin(slides[i])
		.addIndicators()
		.addTo(controller);
	} 
})

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
		console.log('hi')
		var classes = ['small', 'med', 'max'];
		$(radio_labels[i]).addClass(classes[Math.abs(radio_value) - 1]);
	}
}