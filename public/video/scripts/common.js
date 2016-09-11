$(document).ready(function() {
	common.api_url = document.location.origin;
	if (common.api_url == "http://localhost:3000") {
		common.api_url = common.api_url + "/video";
	}
	$.ajax({
		url: common.api_url + '/video_list',
		type: 'GET',
		success: function(rslt) {
			$("#vidlist").html(rslt.html);
			$(".vidlist_row").click(function(event) {
				var lnk = $(event.currentTarget).find('span').text();
				common.change_video(lnk);
				$("#lnk_vid_player").click();
			});
		},
		error: function(err) {
			console.error(err);
		}
	});
	$(".aside_link").click(function(event) {
		common.change_page(event);
	});
});

var common = {
	api_url: null,
	toggle_aside: function() {
		$("#cpk_aside").toggle('slide');
	},
	change_page: function(event) {
		var page = $(event.currentTarget).attr('link-page');
		$(".full-page").hide();
		$('div[cpk-page="' + page + '"]').show();
	},
	change_video(new_src) {
		var player = document.getElementById('vid_player');
		var video = document.getElementById('vid_src');
		player.pause();
		video.src = new_src;
		player.load();
	}
}