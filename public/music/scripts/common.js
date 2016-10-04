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
			music_player.song_map = rslt.data;
			music_player.init();
			$(".tracklist_row").click(function(event) {
				var name = $(event.currentTarget).attr('song-title');
				music_player.change_track(name);
			});
			$.ajax({
				url: common.api_url + '/song_map',
				type: 'GET',
				success: function(rslt) {
					$("#mp_container").html(rslt.html);
					$("#col_shuffle").show();
					music_player.song_map = rslt.data;
					$(".tracklist_row").click(function(event) {
						var name = $(event.currentTarget).attr('song-title');
						music_player.change_track(name);
					});
				},
				error: function(err) {
					console.error(err);
				}
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
		$(".full-page").hide();
		$('div[cpk-page="processing"]').show();
		$.ajax({
			type: 'GET',
			url: "http://www.youtubeinmp3.com/fetch/?format=JSON&video=http://www.youtube.com/watch?v=" + id,
			success: function(rslt) {
				rslt = JSON.parse(rslt);
				if (rslt.link != null) {
					$.ajax({
						type: 'POST',
						url: common.api_url + '/youtube/download',
						data: {
							to_url: rslt.link,
							fname: title
						},
						success: function(rslt) {
							common.add_song(rslt);
							common.download_complete();
						}, 
						error: function(err) {
							console.log(err);
							alert('Error downloading song, please try again or find another version.');
							common.download_complete();
						}
					});
				} else {
					alert('Video not available for download');
					common.download_complete();
				}
			}, 
			error: function(err) {
				console.log(err);
				alert('Error downloading song, please try again or find another version.');
				common.download_complete();
			}
		});
	},
	add_song: function(data) {
		var col = $('<div class="col-xs-12" style="padding-top: 15px;"></div>');
		col.append($('<span>' + data.artist + ' - ' + data.title + '</span>'));
		var row = $('<div class="row tracklist_row" song-title="' + data.path + '"></div>');
		row.append(col);
		$(row).click(function() {
			music_player.change_track(title);
		});
		$("#mp_container").prepend(row);
		common.reset_song_index();
		if (music_player.song_map != null) {
			music_player.song_map[data.path] = data;
		}
	},
	download_complete: function() {
		$(".full-page").hide();
		$('div[cpk-page="listen"]').show();
		var first = $($(".tracklist_row")[0]).attr('song-title');
		music_player.change_track(first);
	},
	reset_song_index: function() {
		$(".tracklist_row").each(function(i, row) {
			$(row).attr('song-index', i);
		});
	}
}

var music_player = {
	song_map: null,
	player: null,
	muted: false,
	shuffle: false,
	continuous: false,
	song_index: 0,
	song_max: 0,
	current_song: null,
	shuffle_list: [],
	shuffle_pending: false,
	artist_dist: {},
	init: function() {
		music_player.player = WaveSurfer.create({
  			container: '#waveform',
  			waveColor: 'red',
  			progressColor: 'purple'
		});
		music_player.player.on("ready", function() {
			$("#waveform_loader").hide();
			if (music_player.continuous) {
				music_player.play();
			}
		});
		music_player.player.on("finish", function() {
			if (music_player.continuous) {
				music_player.next_song();
			} else {
				$("#play-btn").removeClass('icon_selected');
			}
		});
		music_player.song_max = $(".tracklist_row").length;
		var tmp = $(".tracklist_row")[0];
		var name = $(tmp).attr('song-title');
		music_player.player.load(name);
		music_player.current_song = music_player.song_map[name];
		var slider = document.querySelector('#slider');
		slider.oninput = function () {
		  	var vol = Number(slider.value) / 100;
		  	music_player.player.setVolume(vol);
		};
	},
	change_track: function(track) {
		$("#waveform_loader").show();
		music_player.player.load(track);
		music_player.song_index = parseInt($('div[song-title="' + track + '"]').attr('song-index'));
		music_player.current_song = music_player.song_map[track];
	},
	play: function() {
		music_player.player.play();
		$("#pause-btn").removeClass('icon_selected');
		$("#play-btn").addClass('icon_selected');
	},
	pause: function() {
		music_player.player.pause();
		$("#play-btn").removeClass('icon_selected');
		$("#pause-btn").addClass('icon_selected');
	},
	next_song: function() {
		if (music_player.shuffle) {
			music_player.random_song();
		} else {
			if (music_player.song_index < music_player.song_max - 1) {
				music_player.song_index++;
			} else {
				music_player.song_index = 0;
			}
			var track = $('div[song-index="' + music_player.song_index + '"]').attr('song-title');
			music_player.change_track(track);
		}
	},
	random_song: function() {
		if (music_player.shuffle_pending) {
			music_player.song_index = 0;
			music_player.shuffle_pending = false;
		}
		if (music_player.shuffle_list.length == music_player.song_index) {
			music_player.song_index = 0;
			music_player.generate_shuffle();
		}
		var track = music_player.shuffle_list[music_player.song_index];
		if (track.artist == music_player.current_song.artist) {
			music_player.song_index++;
			music_player.random_song();
		} else {
			$("#waveform_loader").show();
			music_player.player.load(track.path);
			music_player.current_song = track;
			music_player.song_index++;
		}
	},
	toggle_mute: function() {
		if (music_player.muted) {
			$("#vol-btn").removeClass('fa-volume-off');
			$("#vol-btn").addClass('fa-volume-up');
			$("#vol-btn").removeClass('icon_selected');
			music_player.muted = false;
		} else {
			$("#vol-btn").removeClass('fa-volume-up');
			$("#vol-btn").addClass('fa-volume-off');
			$("#vol-btn").addClass('icon_selected');
			music_player.muted = true;
		}
		music_player.player.toggleMute();
	},
	toggle_shuffle: function() {
		if (music_player.song_map == null) {
			alert('Shuffle not available. Please reload page and try again.');
			$("#random-btn").removeClass('icon_selected');
			music_player.shuffle = false;
		} else {
			if (music_player.shuffle) {
				$("#random-btn").removeClass('icon_selected');
				music_player.shuffle = false;
			} else {
				music_player.shuffle_pending = true;
				if (music_player.generate_shuffle()) {
					$("#random-btn").addClass('icon_selected');
					music_player.shuffle = true;
					music_player.shuffle_pending = true;
				} else {
					music_player.shuffle = false;
				}
			}
		}
	},
	toggle_continuous: function() {
		if (music_player.continuous) {
			$("#continue-btn").removeClass('icon_selected');
			music_player.continuous = false;
		} else {
			$("#continue-btn").addClass('icon_selected');
			music_player.continuous = true;
		}
	},
	generate_shuffle: function() {
		var keys = Object.keys(music_player.song_map);
		var count = 0, a = [], tmp;
		var dist = {};
		//preliminary shuffle
		while (keys.length > 0) {
			if (count % 2 == 0) {
				tmp = keys.shift();
			} else {
				tmp = keys.pop();
			}
			a.push(music_player.song_map[tmp]);
			if (dist[music_player.song_map[tmp].artist] == null) {
				dist[music_player.song_map[tmp].artist] = 1;
			} else {
				dist[music_player.song_map[tmp].artist]++;
			}
			count++;
		}
		music_player.artist_dist = dist;
		//random shuffle
		var j, x, i;
	    for (i = a.length; i; i--) {
	        j = Math.floor(Math.random() * i);
	        x = a[i - 1];
	        a[i - 1] = a[j];
	        a[j] = x;
	    }
	    if (Object.keys(dist).length > 1) {
	    	music_player.shuffle_list = a;
	    	return true;
	    } else {
	    	return false;
	    }
	}
}