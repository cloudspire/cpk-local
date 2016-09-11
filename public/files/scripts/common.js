$(document).ready(function() {
	common.api_url = document.location.origin;
	if (common.api_url == "http://localhost:3000") {
		common.api_url = common.api_url + "/video";
	}
	fserve.init();
	$(".aside_link").click(function(event) {
		common.change_page(event);
	});
});

var common = {
	api_url: null,
	current_page: 'videos',
	toggle_aside: function() {
		$("#cpk_aside").toggle('slide');
	},
	change_page: function(event, override) {
		var pg = $(event.currentTarget).attr('link-page');
		common.current_page = pg;
		$("#lbl_page").text(pg);
		fserve.current_dir = pg;
		fserve.current_path = "/" + pg;
		fserve.load_dir();
		$(".full-page").hide();
		$('div[cpk-page="' + pg + '"]').show();
		if (override == null || !override) {
			common.toggle_aside();
		}
	}
}