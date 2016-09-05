$(document).ready(function() {
	$(".aside_link").click(function(event) {
		common.change_page(event);
	})
});

var common = {
	toggle_aside: function() {
		$("#cpk_aside").toggle('slide');
	},
	change_page: function(event) {
		var page = $(event.currentTarget).attr('link-page');
		$(".full-page").hide();
		$('div[cpk-page="' + page + '"]').show();
	}
}