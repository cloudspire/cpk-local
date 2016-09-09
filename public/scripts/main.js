var cpk_data;
$(document).ready(function() {

	$("#toggleMinimal").click(function() {
		toggleAside();
		toggleHeader();
	});

	var no_pgbr = false;;
	cpk_data = cpk.init({
		onSearchResults: function(data) {
			if (!no_pgbr) {
				pgbr.stop();
			} else {
				no_pgbr = false;
			}
			var parent = $('div[cpk-control="search_results"]');
			$("#show_srch_results").show();
			$(".cpk_search_item", parent).addClass('pull-left');		
			$(".pad_results:first", parent).css('width', data.data.length * 156 + 'px');
			$(".x-scroll:first", parent).mCustomScrollbar({
				axis: "x"
			});
			$(".x-scroll", parent).mCustomScrollbar("scrollTo", "left", {
				scrollInertia: 0
			});
			if ($('.cpk_search_container', parent).length == 2) {
				$('.search_rslt_header:last', parent).css('margin-top', '20px');
			}
			if ($('.cpk_search_container', parent).length == 3) {
				$('.cpk_search_container:last', parent).remove();
				$('.search_rslt_header:last', parent).css('margin-top', '20px');
			}
		},
		onShowResults: function(data) {
			pgbr.stop();
			$(".cpk_show_container").addClass("container");
			$(".cpk_img_container").addClass("col-sm-2");
			$(".cpk_data_container").addClass("col-sm-10");
			$("#show_show_results").show();
			$(".menu_value", "#show_show_results").text("Show Info: " + data.data.title);
			if (data.data.type == 'movie') {
				var img = $('<button class="btn btn-primary btn_play_movie">Play Video<span class="play-mov-btn"><i class="fa fa-play-circle"></i></span></button>');
				$(img).click(function() {
					var info = {
						helper: data.data.links[0].helper,
						href: data.data.links[0].href,
						source: data.data.links[0].source
					}
					cpk.cache.link_index = 0;
					pgbr.start();
					cpk.post_events.onLinkSelected(info);
					loadRemoteButtons(data);
				});
				$(".cpk_img_container").append(img);
				if (cpk.cache.video_groups != null) {
					var tablist = $('<ul id="showtabs" class="nav nav-tabs"></ul>');
					var tab1 = $('<li class="active"><a href="#">Details</a></li>');
					$(tab1).click(function() {
						$(".cpk_show_info_container").show();
						$(".cpk_show_list_container").hide();
						$(".add_video_to_group_container").hide();
						$("#showtabs .active").removeClass("active");
						$($("#showtabs li")[0]).addClass("active");
					});
					$(tablist).append(tab1);
					var tab2 = $('<li><a href="#">Groups</a></li>');
					$(tab2).click(function() {
						$(".cpk_show_info_container").hide();
						$(".cpk_show_list_container").hide();
						$(".add_video_to_group_container").show();
						$("#showtabs .active").removeClass("active");
						$($("#showtabs li")[1]).addClass("active");
					});
					$(tablist).append(tab2);
					$(".cpk_show_title").after(tablist);
				}
			} else {
				var tmp_cache = localStorage.getItem('cpk - ' + data.data.title);
				if (tmp_cache != null) {
					var cache_data = JSON.parse(tmp_cache);
					var img = $('<button class="btn btn-primary btn_play_movie" title="Play the next episode.">Continue...<span class="play-mov-btn"><i class="fa fa-ellipsis-h"></i></span></button>');
					$(img).click(function() {
						keep_watching(cache_data);
					});
					$(".cpk_img_container").append(img);
				}
				var tablist = $('<ul id="showtabs" class="nav nav-tabs"></ul>');
				var tab1 = $('<li><a href="#">Details</a></li>');
				$(tab1).click(function() {
					$(".cpk_show_info_container").show();
					$(".cpk_show_list_container").hide();
					$(".add_video_to_group_container").hide();
					$("#showtabs .active").removeClass("active");
					$($("#showtabs li")[0]).addClass("active");
				});
				var tab2 = $('<li class="active"><a href="#">Links</a></li>');
				$(tab2).click(function() {
					$(".cpk_show_info_container").hide();
					$(".cpk_show_list_container").show();
					$(".add_video_to_group_container").hide();
					$("#showtabs .active").removeClass("active");
					$($("#showtabs li")[1]).addClass("active");
				});
				$(tablist).append(tab1).append(tab2);
				if (cpk.cache.video_groups != null) {
					var tab3 = $('<li><a href="#">Groups</a></li>');
					$(tab3).click(function() {
						$(".cpk_show_info_container").hide();
						$(".cpk_show_list_container").hide();
						$(".add_video_to_group_container").show();
						$("#showtabs .active").removeClass("active");
						$($("#showtabs li")[2]).addClass("active");
					});
					$(tablist).append(tab3)
				}
				$(".cpk_show_title").after(tablist);
			}
		},
		onLinkSelected: function(data) {
			pgbr.stop();
			$("#show_controller").show();
			$("#show_video_player").show();
			var title = cpk.cache.current_show_data.data.title;
			$(".menu_value", "#show_video_player").text("Video: " + title);
			aside_tabs.video();
			window.onbeforeunload = function() {
				return "Are you sure you want to leave the video?";
			}
		},
		overrides: {
			onEpisodeResults: function(info) {
				loadLinkPager(info.data);
				var data = {
					helper: info.data.links[0].helper,
					href: info.data.links[0].href,
					source: info.data.links[0].source
				}
				cpk.cache.link_index = 0;
				pgbr.start();
				cpk.post_events.onLinkSelected(data);
				loadRemoteButtons(info);
			}
		}
	});
	$("#search_mixed").keydown(function(e) {
		if (e.which === 13) {
			cpk.event_handlers.search();
		}
	});
	$("#pwd").keydown(function(e) {
		if (e.which === 13) {
			cpk.api.login();
		}
	});
	aside_tabs.init();
	if (sessionStorage.auto_login_data != null) {
		var auto_login_data = JSON.parse(sessionStorage.auto_login_data);
		sessionStorage.removeItem('auto_login_data');
		cpk.event_handlers.post_login(auto_login_data);
		aside_tabs.navigate();
	} else if (sessionStorage.auto_search != null) {
		no_pgbr = true;
		var auto_search = JSON.parse(sessionStorage.auto_search);
		sessionStorage.removeItem('auto_search');
		$("#search_mixed").val(auto_search.phrase);
		cpk.post_events.onSearchResults(auto_search.srch);
	}
});

function loadRemoteButtons(info) {
	$(".fa-step-forward, .fa-step-backward, .fa-fast-forward, .fa-fast-backward").unbind('click');
	$(".fa-step-forward").click(function() {
		var index = ++cpk.cache.link_index;
		var data = {
			helper: info.data.links[index].helper,
			href: info.data.links[index].href,
			source: info.data.links[index].source
		}
		pgbr.start();
		cpk.post_events.onLinkSelected(data);
	});
	$(".fa-step-backward").click(function() {
		var index = --cpk.cache.link_index;
		var data = {
			helper: info.data.links[index].helper,
			href: info.data.links[index].href,
			source: info.data.links[index].source
		}
		cpk.post_events.onLinkSelected(data);
	});
	if (info.data.type == 'tv_episode') {
		$(".fa-fast-forward").click(function() {
			var show = cpk.cache.current_show_data;
			updateEpisodeIndex('next');
			var ep = cpk.cache.episode_index;
			var href = show.data.episodes[ep.season].episodes[ep.episode].href;
			getEpisode(href, ep.season, ep.episode);
		});
		$(".fa-fast-backward").click(function() {
			var show = cpk.cache.current_show_data;
			updateEpisodeIndex('prev');
			var ep = cpk.cache.episode_index;
			var href = show.data.episodes[ep.season].episodes[ep.episode].href;
			getEpisode(href, ep.season, ep.episode);
		});
		$("#next_episode_container").show();
	} else {
		$("#next_episode_container").hide();
	}
	if (cpk_sockets.data.partner_id != null) {
		$("#btn_send_partner").show();
		$(".menu_value", "#btn_send_partner").click(cpk_sockets.fn.send_to_partner);
	} else {
		$(".menu_value", "#btn_send_partner").unbind('click');
		$("#btn_send_partner").hide();
	}
}

function loadLinkPager(data) {
	$(".source_pager").html('');
	if (data != null && data.links != null && data.links.length > 0) {
		var exists = {}, li;
		for (i = 0; i < data.links.length; i++) {
			if (exists[data.links[i].source] == null) {
				li = $('<li class="sort-item" element-index="' + i + '">' + data.links[i].source + '</li>');
				li.click(function(event) {
					var index = parseInt($(event.target).attr('element-index'));
					cpk.cache.link_index = index;
					var src = data.links[index];
					var nxt = {
						helper: src.helper,
						href: src.href,
						source: src.source
					}
					cpk.post_events.onLinkSelected(nxt);
				});
				$(".source_pager").append(li);
				exists[data.links[i].source] = 1;
			}
			if (data.links[i].source == "unknown") { 
				break; 
			} 
		}
	}
}

function updateEpisodeIndex(dir) {
	var show = cpk.cache.current_show_data;
	var ep = cpk.cache.episode_index;
	if (dir == 'next') {
		var slength = show.data.episodes.length - 1;
		var elength = show.data.episodes[ep.season].episodes.length - 1;
		if (ep.episode < elength) {
			++cpk.cache.episode_index.episode;
		} else {
			if (ep.season > 0) {
				--cpk.cache.episode_index.season;
				cpk.cache.episode_index.episode = 0;
			} else {
				alert('You have finished the series');
			}
		}
	} else {
		var slength = show.data.episodes.length - 1;
		if (ep.episode > 0) {
			--cpk.cache.episode_index.episode;
		} else {
			if (ep.season < slength) {
				++cpk.cache.episode_index.season;
				var elength = show.data.episodes[cpk.cache.episode_index.season].episodes.length - 1;
				cpk.cache.episode_index.episode = elength;
			} else {
				alert('You are at the beginning of the series');
			}
		}
	}
}

function getEpisode(href, s, e) {
	var cache_data = {
		season: s,
		episode: e,
		title: cpk.cache.current_show_data.data.title
	}
	cpk.api.get_episode(
		cpk.cache.parameters.type,
		href,
		cache_data,
		cpk.cache.parameters.plugin,
		cpk.post_events.onEpisodeResults
	);
	cpk.cache.episode_index = {
		season: s,
		episode: e
	}
}

function keep_watching(data) {
	var show = cpk.cache.current_show_data;
	var slength = show.data.episodes.length - 1;
	var elength = show.data.episodes[data.season].episodes.length - 1;
	var stp = false;
	if (data.episode < elength) {
		data.episode++;
	} else {
		if (data.season > 0) {
			data.season--;
			data.episode = 0;
		} else {
			alert('You have finished the series');
			stp = true;
		}
	}
	if (!stp) {
		var href = show.data.episodes[data.season].episodes[data.episode].href;	
		$(".btn_play_movie").click(function() {
			keep_watching(data);
		});
		getEpisode(href, data.season, data.episode);
	}
	
}

var pgbr = {
	semaphore: 0,
	timer: null,
	start: function() {
		if ($("#progressbar").attr("role") != null) {
			$("#progressbar").progressbar("destroy");
		}
		if (pgbr.timer != null) {
			clearInterval(pgbr.timer);
		}
		$("#progressbar").progressbar();
		var value = 0;
		pgbr.timer = setInterval(function () {
			try {
				$("#progressbar").progressbar("value", value);
			} catch (ex) {
				clearInterval(pgbr.timer);
				pgbr.semaphore++;
			}
			value++;
			if(value > 100) value = 0;
		}, 10);
		pgbr.timeout(pgbr.semaphore);
	},
	stop: function() {
		clearInterval(pgbr.timer);
		$("#progressbar").progressbar("destroy");
		pgbr.semaphore++;
	},
	timeout: function(sem) {
		setTimeout(function() {
			if (sem == pgbr.semaphore) {
				clearInterval(pgbr.timer);
				$("#progressbar").progressbar("destroy");
				pgbr.semaphore++;
			}
		}, 30000);
	}
}
var startProgress = function() {
	$("#progressbar").progressbar();
	var value = 0;
	var timer = setInterval(function () {
		$("#progressbar").progressbar("value", value);
		value++;
		if(value > 100) value = 0;
	}, 10);setTimeout(function() {
		clearInterval(timer);
		$("#progressbar").progressbar("destroy");
	}, 5000);
}

jQuery.fn.mouseIsOver = function () {
    return $(this).parent().find($(this).selector + ":hover").length > 0;
};

function toggleAside() {
	if ($("header.header-two-bars").hasClass("hide-me")) {
		toggleHeader();
	}
	$("aside").toggle('slide');
	$("#btn-opts").toggleClass("fa-bars fa-close");	
}

function toggleHeader(flag) {
	if ($(window).width() > 769) {
		$("header.header-two-bars").toggleClass("hide-me");
		$("#toggleMenuSide").toggleClass("fixed");
		$(".admin-panel").toggleClass("full-hieght");		
	}
}

var aside_tabs = {
	init: function() {
		$('div[element-type="aside_tab"]').click(aside_tabs.click);
	},
	click: function() {
		$(".selected", "nav").removeClass("selected");
		$(this).parent().addClass("selected");
		var index = parseInt($(this).attr('element-index'));
		$('div[element-type="aside_block"]').hide();
		$($('div[element-type="aside_block"]')[index]).show();
	},
	navigate: function() {
		$(".selected", "nav").removeClass("selected");
		$($('nav').children()[0]).addClass("selected");
		$('div[element-type="aside_block"]').hide();
		$($('div[element-type="aside_block"]')[0]).show();
	},
	user: function() {
		$(".selected", "nav").removeClass("selected");
		$($('nav').children()[1]).addClass("selected");
		$('div[element-type="aside_block"]').hide();
		$($('div[element-type="aside_block"]')[1]).show();
	},
	video: function() {
		$(".selected", "nav").removeClass("selected");
		$($('nav').children()[2]).addClass("selected");
		$('div[element-type="aside_block"]').hide();
		$($('div[element-type="aside_block"]')[2]).show();
	}
}