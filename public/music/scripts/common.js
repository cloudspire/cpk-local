$(document).ready(function() {
	common.api_url = document.location.origin;
	if (!common.api_url.includes('cpk')) {
		common.api_url = common.api_url + "/music";
	}
	$.ajax({
		url: common.api_url + '/music_list',
		type: 'GET',
		success: function(rslt) {
			$("#mp_container").html(rslt.html);
			music_player.init();
			$(".tracklist_row").click(function(event) {
				var name = $("span", event.currentTarget).text();
				music_player.change_track(name);
			});
		},
		error: function(err) {
			console.error(err);
		}
	});
	$(".aside_link").click(function(event) {
		common.change_page(event);
	});
	$("#search_mixed").keydown(function(event) {
		if (event.which == 13) {
			common.find_music();
		}
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
		$(".full-page").hide();
		$('div[cpk-page="' + pg + '"]').show();
		if (override == null || !override) {
			common.toggle_aside();
		}
	},
	find_music: function() {
		var val = $("#search_mixed").val().trim();
		if (val != "") {
			var count = 0;
			$(".tracklist_row").each(function(i, item) {
				var title = $(item).attr('song-title');
				if (title.indexOf(val) == -1) {
					$(item).hide();
				} else {
					$(item).show();
					count++;
				}
			});
			if (count == 0) {
				common.search_youtube(val);
				$(".tracklist_row").show();
			} else {				
				$(".full-page").hide();
				$('div[cpk-page="listen"]').show();
			}
		} else {
			$(".tracklist_row").show();
		}

	},
	search_youtube: function(val) {
		$.ajax({
			type: 'GET',
			url: common.api_url + '/youtube/keywords?phrase=' + val,
			success: function(rslt) {
				$("#search_results").html(rslt);
				$(".full-page").hide();
				$('div[cpk-page="download"]').show();
				$(".icon-block").click(function(event) {
					var id = $(event.currentTarget).attr('icon-id');
					var title = $(event.currentTarget).attr('yt-title');
					common.download_song(id, title);
				});
			}, 
			error: function(err) {
				console.log(err);
			}
		});
	},
	download_song: function(id, title) {
		$.ajax({
			type: 'GET',
			url: "http://www.youtubeinmp3.com/fetch/?format=JSON&video=http://www.youtube.com/watch?v=" + id,
			success: function(rslt) {
				rslt = JSON.parse(rslt);
				if (rslt.link != null) {
					alert(rslt.link);
					$.ajax({
						type: 'POST',
						url: common.api_url + '/youtube/download',
						data: {
							to_url: rslt.link,
							fname: title
						},
						success: function(rslt) {
							common.add_song('tracks/' + title + '.mp3');
						}, 
						error: function(err) {
							console.log(err);
						}
					});
				} else {
					alert('Video not available for download');
				}
			}, 
			error: function(err) {
				console.log(err);
			}
		});
	},
	add_song: function(title) {
		var col = $('<div class="col-xs-12" style="padding-top: 15px;"></div>');
		col.append($('<span>' + title + '</span>'));
		var row = $('<div class="row tracklist_row" song-title="' + title + '"></div>');
		row.append(col);
		$(row).click(function() {
			music_player.change_track(title);
		});
		$("#mp_container").prepend(row);
		$(".full-page").hide();
		$('div[cpk-page="listen"]').show();
	}
}

var music_player = {
	player: null,
	init: function() {
		music_player.player = WaveSurfer.create({
  			container: '#waveform',
  			waveColor: 'red',
  			progressColor: 'purple'
		});
		music_player.player.on("ready", function() {
			$("#waveform_loader").hide();
		});
		var tmp = $(".tracklist_row")[0];
		var name = $("span", tmp).text();
		music_player.player.load(name);
		var slider = document.querySelector('#slider');
		slider.oninput = function () {
		  	var zoomLevel = Number(slider.value);
		  	music_player.player.zoom(zoomLevel);
		};
	},
	change_track: function(track) {
		$("#waveform_loader").show();		
		music_player.player.load(track);
	}
}