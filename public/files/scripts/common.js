$(document).ready(function() {
	$(".aside_link").click(function(event) {
		common.change_page(event);
	});
});

var common = {
	current_page: 'videos',
	toggle_aside: function() {
		$("#cpk_aside").toggle('slide');
	},
	change_page: function(event, override) {
		var pg = $(event.currentTarget).attr('link-page');
		common.current_page = pg;
		$(".full-page").hide();
		$('div[cpk-page="' + pg + '"]').show();
		if (override == null || !override) {
			common.toggle_aside();
		}
	}
}