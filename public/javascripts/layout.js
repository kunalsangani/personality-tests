$(document).ready(function() {
	$(window).scroll(function() {
		var position = $(window).scrollTop();
		if(position >= 50) {
			$('.menu').addClass('menu-fixed')
		} else {
			$('.menu').removeClass('menu-fixed')
		}
	})
})