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
});

var common = {
	api_url: null
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