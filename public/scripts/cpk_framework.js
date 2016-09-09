var api_url = 'http://cpk-api.herokuapp.com/';
//var api_url = 'http://localhost:3000/';
var cpk = {};

//entry point for framework
cpk.init = function(config) {
	if (config != null) {
		load_user_config(config);
	}
	load_event_handlers();
	load_parameters();
	return cpk;
}

//post event handlers
cpk.post_events = {
	onSearchResults: function(data) {
		var elements = cpk.controllers.format_search(data);
		$('div[cpk-control="search_results"]').prepend(elements);
		cpk.container.display('search_results');
		if (cpk.config.onSearchResults != null) {
			cpk.config.onSearchResults(data);
		}
	},
	onShowResults: function(data) {
		cpk.cache.current_show_data = data;
		var elements = cpk.controllers.format_show(data);
		$('div[cpk-control="show_results"]').html(elements);
		cpk.container.display('show_results');
		if (sessionStorage.token != null) {
			var show = data.data, found = false;
			if (cpk.cache.recently_watched != null) {
				found = cpk.cache.recently_watched.videos.filter(function(vid) {
					return vid.show_name == show.title;
				}).length > 0;
			}
			if (!found && cpk.cache.recently_watched != null) {
				cpk.api.update_rc(data.data);
				cpk.cache.recently_watched.videos.push({
					show_name: show.title,
					links_href: cpk.cache.current_detail_link,
					description: show.desc,
					img_url: show.img,
					year: show.year,
					genres: show.genres
				});
			}
		}
		if (cpk.config.onShowResults != null) {
			cpk.config.onShowResults(data);
		}
	},
	onEpisodeResults: function(data) {
		cpk.cache.current_episode_data = data;
		var elements = cpk.controllers.format_episode(data);
		$('div[cpk-control="episode_results"]').html(elements);
		cpk.container.display('episode_results');
		if (cpk.config.onEpisodeResults != null) {
			cpk.config.onEpisodeResults(data);
		}
	},
	onLinkSelected: function(data) {
		cpk.cache.current_selected_episode = data;
		if ((data.source == 'theVideo.me' || data.source == 'Vidup' || data.source == 'Vodlocker') && cpk.cache.parameters.plugin == 'primewire') {
			cpk.api.no_captcha(data.href, data.source, function(info) {
				$('iframe', $('div[cpk-control="external_link"]')).attr('src', (info.href));
			});
		} else {
			$('iframe', $('div[cpk-control="external_link"]')).attr('src', (cpk.cache.parameters.root + data.href));
		}
		cpk.container.display('external_link');
		if (cpk.config.onLinkSelected != null) {
			cpk.config.onLinkSelected(data);
		}
	}
}

//temporary variable storage
cpk.cache = {};

//dynamic configuration storage
cpk.config = {
	onSearchResults: null,
	onShowResults: null,
	onEpisodeResults: null,
	onLinkSelected: null
};

cpk.controllers = {
	format_search: function(data) {
		var container = $('<div class="cpk_search_container"></div>');
		var pad_container = $('<div class="pad_results"></div>');
		var sub_container, elem, elem2;
		$(data.data).each(function(i, show) {
			sub_container = $('<div class="cpk_search_item"></div>');
			if (isNotEmpty(show.img)) {
				elem = $('<img src="about:blank" alt="Watch ' + show.title + '" />');
				$(elem).error(function() {
					$(this).attr('src', 'images/no_preview.jpg');
				});
				$(elem).attr('src', show.img);
				$(elem).addClass('cpk_search_image');
				if (show.href != null) {
					var href = show.href;
					if (cpk.cache.parameters.remove_root != null) {
						href = href.replace(cpk.cache.parameters.root, '');
					}
					$(elem).click(function() {
						cpk.api.get_show(
							cpk.cache.parameters.type, 
							href, 
							cpk.cache.parameters.plugin, 
							cpk.post_events.onShowResults
						);
					});
				}
				$(elem).css('cursor', 'pointer');
				$(sub_container).append(elem);
			}
			var data_container = $('<div class="cpk_search_info" style="display: none;"></div>');			
			if (isNotEmpty(show.title)) {
				elem = $('<div class="cpk_search_title"></div>');
				$(elem).append('<span>' + show.title + '</span>');
				$(data_container).append(elem);
			}
			if (isNotEmpty(show.year)) {
				elem = $('<div class="cpk_search_year"></div>');
				$(elem).append('<span>' + show.year + '</span>');
				$(data_container).append(elem);
			}
			if (isNotEmpty_obj(show.genres)) {
				elem = $('<div class="cpk_search_genres"></div>');
				elem2 = "";
				$(show.genres).each(function(i2, genre) {
					elem2 += genre + ",";
				});
				elem2 = elem2.substring(0, elem2.length - 1);
				$(elem).append('<span>' + elem2 + '</span>');
				$(data_container).append(elem);
			}
			$(sub_container).append(data_container);
			$(pad_container).append(sub_container);
		});
		var scontainer = $('<div class="x-scroll"></div>');
		$(scontainer).append(pad_container);
		$(container).append($('<div class="search_rslt_header">Search: ' + '<span>' + $("#search_mixed").val() + '</span></div>'));
		$(container).append(scontainer);
		return container;
	},
	format_show: function(data) {
		var parent_container = $('<div class="cpk_show_container container"></div>');
		var container = $('<div class="row"></div>');
		var show = data.data;
		var elem, elem2;
		if (isNotEmpty(show.img)) {
			var img_container = $('<div class="cpk_img_container col-sm-2"></div>');
			elem = $('<img src="about:blank" alt="' + show.title + '" />');
			$(elem).error(function() {
				$(this).attr('src', 'images/no_preview.jpg');
			});
			$(elem).attr('src', show.img);
			$(elem).addClass('cpk_show_image');
			$(img_container).append(elem);
			$(container).append(img_container);
		}
		
		var showdata_container = $('<div class="cpk_data_container col-sm-10"></div>');
		var showdata_info_container, showdata_list_container, video_group_container;
		if (show.type == "movie") {
			showdata_info_container = $('<div class="cpk_show_info_container"></div>');
			showdata_list_container = $('<div class="cpk_show_list_container" style="display: none;"></div>');
			video_group_container = $('<div class="add_video_to_group_container" style="display: none;"></div>');
		} else {
			showdata_info_container = $('<div class="cpk_show_info_container" style="display: none;"></div>');
			showdata_list_container = $('<div class="cpk_show_list_container"></div>');
			video_group_container = $('<div class="add_video_to_group_container" style="display: none;"></div>');
		}
		
		if (isNotEmpty(show.title)) {
			elem = $('<div class="cpk_show_title"></div>');
			$(elem).append('<span>' + show.title + '</span>');
			$(showdata_container).append(elem);
		}
		if (isNotEmpty(show.desc)) {
			elem = $('<div class="cpk_show_desc"></div>');
			$(elem).append('<span>' + show.desc + '</span>');
			$(showdata_info_container).append(elem);
		}
		if (isNotEmpty(show.air_date)) {
			elem = $('<div class="cpk_show_airdate"></div>');
			$(elem).append('<span>Air date: ' + show.air_date + '</span>');
			$(showdata_info_container).append(elem);
		}
		if (isNotEmpty(show.runtime)) {
			elem = $('<div class="cpk_show_runtime"></div>');
			$(elem).append('<span>Runtime: ' + show.runtime + '</span>');
			$(showdata_info_container).append(elem);
		}
		if (isNotEmpty_obj(show.actors)) {
			elem = $('<div class="cpk_show_actors"></div>');
			elem2 = "";
			$(show.actors).each(function(i, actor) {
				elem2 += actor + ",";
			});
			elem2 = elem2.substring(0, elem2.length - 1);
			$(elem).append('<span>' + elem2 + '</span>');
			$(showdata_info_container).append(elem);
		}
		if (isNotEmpty_obj(show.genres)) {
			elem = $('<div class="cpk_show_genres"></div>');
			elem2 = "";
			$(show.genres).each(function(i, genre) {
				elem2 += genre + ",";
			});
			elem2 = elem2.substring(0, elem2.length - 1);
			$(elem).append('<span>' + elem2 + '</span>');
			$(showdata_info_container).append(elem);
		}
		$(showdata_container).append(showdata_info_container);
		
		if (isNotEmpty_obj(show.episodes)) {
			show.episodes = show.episodes.reverse();
			elem = $('<div class="cpk_show_episodes"></div>');
			elem2 = $('<div></div>');
			var item, list, sub_item, season_tab;
			$(show.episodes).each(function(i, season) {
				item = $('<div class="season"></div>');		
				season_tab = $('<div class="season_tab"><span>Season: ' + (show.episodes.length - i) + '</span></div>');
				$(season_tab).click(function() { 
					$(".season ul").hide();
					$(this).next().toggle(); 
				});
				$(item).append(season_tab);
				list = $('<ul style="display: ' + (i == 0 ? 'block' : 'none') + ';"></ul>');
				$(season.episodes).each(function(i2, ep) {
					sub_item = $('<li class="episode" sindex="' + i + '" eindex="' + i2 + '">Episode ' + (i2 + 1) + ': ' + ep.title + ' (' + ep.air_date + ')</li>');
					if (isNotEmpty(ep.href)) {
						var href = ep.href;
						if (cpk.cache.parameters.remove_root != null) {
							href = href.replace(cpk.cache.parameters.root, '');
						}
						$(sub_item).click(function() {
							var cache_data = {
								season: i,
								episode: i2,
								title: show.title
							}
							cpk.api.get_episode(
								cpk.cache.parameters.type,
								href,
								cache_data,
								cpk.cache.parameters.plugin,
								cpk.post_events.onEpisodeResults
							);
							cpk.cache.episode_index = {
								season: parseInt($(this).attr('sindex')),
								episode: parseInt($(this).attr('eindex'))
							}
						});
						$(sub_item).css('cursor', 'pointer');
					}
					$(list).append(sub_item);
				});
				$(item).append(list);
				$(elem2).append(item);
			});
			$(elem).append(elem2);
			$(showdata_list_container).append(elem);
		}
		$(showdata_container).append(showdata_list_container);
		
		var vid_groups = cpk.cache.video_groups;
		if (vid_groups != null) {
			elem = $('<div class="cpk_atg_box"></div>');
			elem2 = $('<ul></ul>');
			var li, link, link2, video, drop_vid;
			$(vid_groups.groups).each(function(i, vid_group) {
				li = $('<li vid-group="' + vid_group.group_name + '"></li>');
				if (i % 2 == 0) {
					$(li).addClass("even");
				} else {
					$(li).addClass("odd");
				}
				$(li).append($('<span>' + vid_group.group_name + '</span>'));
				
				link = $('<button type="button" class="btn btn-success btn_atg">Add <i class="fa fa-plus"></i></button>');				
				$(link).click(function() {
					video = {
						show_name: show.title,
						links_href: cpk.cache.current_detail_link,
						description: show.desc,
						img_url: show.img,
						year: '',
						genres: show.genres,
						day_of_week: 0
					}
					cpk.api.add_video_to_group(vid_group._id, video, function(rslt) {
						vid_group.videos.push(video);
						$('.btn_atg', 'li[vid-group="' + vid_group.group_name + '"]').hide();
						$('.btn_dfg', 'li[vid-group="' + vid_group.group_name + '"]').show();
					}, function(err) {
						console.log(err);
						alert(err.responseText);
					});
				});
				
				link2 = $('<button type="button" class="btn btn-danger btn_dfg">Drop <i class="fa fa-times"></i></button>');
				$(link2).click(function() {
					cpk.api.drop_video_from_group(vid_group._id, show.title, function(rslt) {
						$(vid_group.videos).each(function(i2, vids) {
							if (show.title == vids.show_name) {
								vid_group.videos.splice(i2, 1);
								return;
							}
						});
						$('.btn_atg', 'li[vid-group="' + vid_group.group_name + '"]').show();
						$('.btn_dfg', 'li[vid-group="' + vid_group.group_name + '"]').hide();
					}, function(err) {
						console.log(err);
						alert(err.responseText);
					});
				});				
				
				cpk.event_handlers.check_video_in_group(vid_group.videos, show.title, link, link2);
				$(li).append(link);
				$(li).append(link2);
				$(elem2).append(li);
			});
			$(elem).append(elem2);
			$(video_group_container).append(elem);
		}
		$(showdata_container).append(video_group_container);
		
		$(container).append(showdata_container);
		$(parent_container).append(container);
		return parent_container;
	},
	format_episode: function(data) {
		
	},
	format_user_dashboard: function(data) {
	
	},
	format_video_group: function(group) {
		var page = $("<div></div");
		var container, pad_container, sub_container, elem, elem2;
		container = $('<div class="cpk_search_container"></div>');
		pad_container = $('<div class="pad_results"></div>');
		$(group.videos).each(function(i, show) {
			sub_container = $('<div class="cpk_search_item"></div>');
			if (isNotEmpty(show.img_url)) {
				elem = $('<img src="about:blank" alt="Watch ' + show.show_name + '" />');
				$(elem).error(function() {
					$(this).attr('src', 'images/no_preview.jpg');
				});
				$(elem).attr('src', show.img_url);
				$(elem).addClass('cpk_search_image');
				if (show.links_href != null) {
					$(elem).click(function() {
						cpk.api.get_show(
							cpk.cache.parameters.type, 
							show.links_href, 
							cpk.cache.parameters.plugin, 
							cpk.post_events.onShowResults
						);
					});
				}
				$(elem).css('cursor', 'pointer');
				$(sub_container).append(elem);
			}
			var data_container = $('<div class="cpk_search_info" style="display: none;"></div>');			
			if (isNotEmpty(show.show_name)) {
				elem = $('<div class="cpk_search_title"></div>');
				$(elem).append('<span>' + show.show_name + '</span>');
				$(data_container).append(elem);
			}
			if (isNotEmpty(show.year)) {
				elem = $('<div class="cpk_search_year"></div>');
				$(elem).append('<span>' + show.year + '</span>');
				$(data_container).append(elem);
			}
			if (isNotEmpty_obj(show.genres)) {
				elem = $('<div class="cpk_search_genres"></div>');
				elem2 = "";
				$(show.genres).each(function(i2, genre) {
					elem2 += genre + ",";
				});
				elem2 = elem2.substring(0, elem2.length - 1);
				$(elem).append('<span>' + elem2 + '</span>');
				$(data_container).append(elem);
			}
			$(sub_container).append(data_container);
			$(pad_container).append(sub_container);
		});
		var grp_header = $('<div class="search_rslt_header">Video Group: ' + '<span>' + group.group_name + '</span></div>');
		var attrs = 'grp-name="' + group.group_name + '" grp-id="' + group._id + '"';
		var del_btn = $('<div title="Remove Group" class="del_vid_grp_box"><i class="fa fa-times del_vid_grp" ' + attrs + ' onclick="cpk.event_handlers.delete_video_group(this);"></i></div>');
		$(grp_header).append(del_btn);
		$(container).append(grp_header);
		
		var scontainer = $('<div class="x-scroll"></div>');
		$(scontainer).append(pad_container);
		$(container).append(scontainer);
		return container;
	}
}

//methods for retrieving data
cpk.api = {
	login: function() {
		$.ajax({
			url: api_url + "login",
			type: "POST",
			data: {
				email: $("#usr").val(),
				password: $("#pwd").val()
			},
			contentType: 'application/x-www-form-urlencoded',
			dataType: 'json',
			success: function (rslt) {
				$("#login_form").hide();
				cpk.event_handlers.post_login(rslt);
			},
			error: function (err) {
				loadErrorModal(err);
			}
		});	
	},
	top_shows: function(callback, error) {
		$.ajax({
			type: 'GET',
			url: api_url + 'top_shows',
			success: function(rslt) {
				if (callback != null) {
					callback(rslt);
				}
			},
			error: function(err) {
				console.log(err);
				if (error != null) {
					error(err);
				}
			}
		});
	},
	search: function(type, keywords, source, callback, error) {
		pgbr.start();
		$.ajax({
			type: 'GET',
			url: api_url + 'search/' + type + '?srch_key=' + keywords + '&plugin=' + source,
			success: function(rslt) {
				if (callback != null) {
					callback(rslt);
				}
			},
			error: function(err) {
				console.log(err);
				if (error != null) {
					error(err);
				}
			}
		});
	},
	get_show: function(type, link, source, callback, error) {
		pgbr.start();
		cpk.cache.current_detail_link = link;
		$.ajax({
			type: 'GET',
			url: api_url + 'get_show/' + type + '?link=' + link + '&plugin=' + source,
			success: function(rslt) {
				if (callback != null) {
					callback(rslt);
				}
			},
			error: function(err) {
				console.log(err);
				if (error != null) {
					error(err);
				}
			}
		});
	},
	get_episode: function(type, link, cache_data, source, callback, error) {
		pgbr.start();
		localStorage.setItem('cpk - ' + cache_data.title, JSON.stringify(cache_data));
		var url = api_url + 'get_episode/' + type + '?link=' + link + '&plugin=' + source;
		$.ajax({
			type: 'GET',
			url: api_url + 'get_episode/' + type + '?link=' + link + '&plugin=' + source,
			success: function(rslt) {
				if (callback != null) {
					callback(rslt);
				}
			},
			error: function(err) {
				console.log(err);
				if (error != null) {
					error(err);
				}
			}
		});
	},
	no_captcha: function(link, source, callback) {
		$.ajax({
			url: api_url + 'no_captcha',
			type: 'POST',
			data: { 
				to_url: 'http://www.primewire.ag' + link,
				plugin: cpk.cache.parameters.plugin,
				source: source
			},
			success: function(data) {
				callback(data);
			},
			error: function(err) {
				console.log(err);
			}
		});
	},
	get_video_groups: function(override, callback, error) {
		if (cpk.cache.video_groups != null && !override) {
			callback(cpk.cache.video_groups);
		} else {
			$.ajax({
				type: 'POST',
				url: api_url + 'user_content/get_user_videos',
				data: {
					user_id: sessionStorage.user_id,
					username: sessionStorage.username,
					token: sessionStorage.token,
					nonce: sessionStorage.nonce
				},
				success: function(rslt) {
					cpk.cache.video_groups = rslt;
					if (callback != null) {
						callback(rslt);
					}
				},
				error: function(err) {
					console.log(err);
					if (error != null) {
						error(err);
					}
				}
			});
		}
	},
	add_video_to_group: function(id, video, callback, error) {
		$.ajax({
			type: 'POST',
			url: api_url + 'user_content/add_video_to_group',
			data: {
				user_id: sessionStorage.user_id,
				username: sessionStorage.username,
				token: sessionStorage.token,
				nonce: sessionStorage.nonce,
				group_id: id,
				show_name: video.show_name,
				links_href: video.links_href,
				description: video.description,
				img_url: video.img_url,
				year: '',
				genres: video.genres,
				day_of_week: 0
			},
			success: function(rslt) {
				if (callback != null) {
					callback(rslt);
				}
			},
			error: function(err) {
				console.log(err);
				if (error != null) {
					error(err);
				}
			}
		});
	},
	drop_video_from_group: function(id, show_name, callback, error) {
		$.ajax({
			type: 'POST',
			url: api_url + 'user_content/drop_video_from_group',
			data: {
				user_id: sessionStorage.user_id,
				username: sessionStorage.username,
				token: sessionStorage.token,
				nonce: sessionStorage.nonce,
				group_id: id,
				show_name: show_name
			},
			success: function(rslt) {
				if (callback != null) {
					callback(rslt);
				}
			},
			error: function(err) {
				console.log(err);
				if (error != null) {
					error(err);
				}
			}
		});
	},
	new_video_group: function(name, desc, callback, error) {
		$.ajax({
			type: 'POST',
			url: api_url + 'user_content/add_video_group',
			data: {
				user_id: sessionStorage.user_id,
				username: sessionStorage.username,
				token: sessionStorage.token,
				nonce: sessionStorage.nonce,
				group_name: name,
				description: desc
			},
			success: function(rslt) {
				if (callback != null) {
					callback(rslt);
				}
			},
			error: function(err) {
				console.log(err);
				if (error != null) {
					error(err);
				}
			}
		});
	},
	drop_video_group: function(id, callback, error) {
		$.ajax({
			type: 'POST',
			url: api_url + 'user_content/remove_video_group',
			data: {
				user_id: sessionStorage.user_id,
				username: sessionStorage.username,
				token: sessionStorage.token,
				nonce: sessionStorage.nonce,
				group_id: id
			},
			success: function(rslt) {
				if (callback != null) {
					callback(rslt);
				}
			},
			error: function(err) {
				console.log(err);
				if (error != null) {
					error(err);
				}
			}
		});
	},
	update_rc: function(show, callback, error) {
		$.ajax({
			type: 'POST',
			url: api_url + 'user_content/update_recent',
			data: {
				user_id: sessionStorage.user_id,
				username: sessionStorage.username,
				token: sessionStorage.token,
				nonce: sessionStorage.nonce,
				show_name: show.title,
				links_href: cpk.cache.current_detail_link,
				description: show.desc,
				img_url: show.img,
				year: show.year,
				genres: show.genres
			},
			success: function(rslt) {
				if (callback != null) {
					callback(rslt);
				}
			},
			error: function(err) {
				console.log(err);
				if (error != null) {
					error(err);
				}
			}
		});
	},
	get_recently_watched: function(override, callback, error) {
		if (cpk.cache.recently_watched != null && !override) {
			callback(cpk.cache.recently_watched);
		} else {
			$.ajax({
				type: 'POST',
				url: api_url + 'user_content/get_recent',
				data: {
					user_id: sessionStorage.user_id,
					username: sessionStorage.username,
					token: sessionStorage.token,
					nonce: sessionStorage.nonce
				},
				success: function(rslt) {
					cpk.cache.recently_watched = rslt;
					if (callback != null) {
						callback(rslt);
					}
				},
				error: function(err) {
					console.log(err);
					if (error != null) {
						error(err);
					}
				}
			});
		}
	}
}

//internal functions
function load_user_config(config) {
	if (config.overrides != null) {
		if (config.overrides.onSearchResults != null) {
			cpk.post_events.onSearchResults = config.overrides.onSearchResults;
		}
		if (config.overrides.onShowResults) {
			cpk.post_events.onShowResults = config.overrides.onShowResults;
		}
		if (config.overrides.onEpisodeResults) {
			cpk.post_events.onEpisodeResults = config.overrides.onEpisodeResults;
		}
		if (config.overrides.onLinkSelected) {
			cpk.post_events.onLinkSelected = config.overrides.onLinkSelected;
		}
		if (config.overrides.format_search != null) {
			cpk.controllers.format_search = config.overrides.format_search;
		}
		if (config.overrides.format_show != null) {
			cpk.controllers.format_show = config.overrides.format_show;
		}
		if (config.overrides.format_episode != null) {
			cpk.controllers.format_episode = config.overrides.format_episode;
		}
	}
	if (config.onSearchResults != null) {
		cpk.config.onSearchResults = config.onSearchResults;
	}
	if (config.onShowResults) {
		cpk.config.onShowResults = config.onShowResults;
	}
	if (config.onEpisodeResults) {
		cpk.config.onEpisodeResults = config.onEpisodeResults;
	}
	if (config.onLinkSelected) {
		cpk.config.onLinkSelected = config.onLinkSelected;
	}	
}

function load_event_handlers() {
	var config, target;
	$('button[cpk-control="search"], div[cpk-control="search"]').each(function(i, srch) {
		config = parse_control_data($(srch).attr("cpk-config"));
		target = $("#" + config.source);
		$(srch).click(function() {
			cpk.api.search(
				cpk.cache.parameters.type, 
				target.val(), 
				cpk.cache.parameters.plugin, 
				cpk.post_events.onSearchResults
			);
			target.blur();
			//videoClosed();
		});
	});
}

cpk.event_handlers = {
	post_login: function(user_data) {
		sessionStorage.user_info = JSON.stringify(user_data.user);
		sessionStorage.token = user_data.token;
		sessionStorage.nonce = user_data.nonce;
		sessionStorage.username = user_data.user.username;
		sessionStorage.user_id = user_data.user._id;
		sessionStorage.act_type = user_data.user.account_type;
		$("#login_form").hide();
		$("#partner_buttons").show();
		$("#user_name").text("User: " + user_data.user.username);
		//$("#show_user_dashboard").show();
		$("#show_video_groups").show();
		$("#show_recently_watched").show();
		cpk.api.get_video_groups(true);
		cpk.api.get_recently_watched(true);
		if (localStorage.device_name != null) {
			cpk_sockets.fn.init(user_data.user.account_type);
		}
	},
	search: function() {
		cpk.api.search(
			cpk.cache.parameters.type, 
			$("#search_mixed").val(), 
			cpk.cache.parameters.plugin, 
			cpk.post_events.onSearchResults
		);
		$("#search_mixed").blur();
		//videoClosed();
	},
	open_partner_interface: function() {
		if ($('#partner_form').css('display') == 'none') {
			if (localStorage.device_name != null) {
				$("#device_name").hide();
				$("#partner_devices").hide();
				if (cpk_sockets.data.status == 'disconnected') {
					cpk_sockets.fn.init(sessionStorage.act_type);
				} else {
					$("#partner_form").show();
					$("#partner_devices").show();
				}
			} else {
				$("#partner_devices").hide();
				$("#partner_form").show();
				$("#device_name").show();
			}
		} else {
			$('#partner_form').hide();
		}
	},
	choose_device_name: function() {
		if ($("#dvcnm").val() == "") {
			alert('Please choose a name for this device');
		} else {
			localStorage.device_name = $("#dvcnm").val();
			$("#device_name").hide();
			cpk_sockets.fn.init(sessionStorage.act_type);
		}
	},
	show_srch_results: function() {
		cpk.container.display('search_results');
		$(".x-scroll").mCustomScrollbar("scrollTo", "left", {
			scrollInertia: 0
		});
		cpk.event_handlers.close_aside_onclick();
	},
	show_show_results: function() {
		cpk.container.display('show_results');
		cpk.event_handlers.close_aside_onclick();
	},
	show_video_player: function() {
		cpk.container.display('external_link');
		cpk.event_handlers.close_aside_onclick();
	},
	close_aside_onclick: function() {
		if ($(window).width() <= 992) {
			toggleAside();
		}
	},
	confirm_modal: function(header, body, callback) {
		$(".modal-header", "#confirm_modal").html(header);
		$(".modal-body", "#confirm_modal").html(body);
		$(".btn-success", "#confirm_modal .modal-footer").unbind('click');
		$(".btn-success", "#confirm_modal .modal-footer").click(callback);
		$(".btn-danger", "#confirm_modal .modal-footer").click(function() { $("#confirm_modal").modal('toggle'); });
		$("#confirm_modal").modal({backdrop: 'static'});
	},
	show_user_dashboard: function() {
		cpk.container.display('user_dashboard');
		cpk.event_handlers.close_aside_onclick();
	},
	show_video_groups: function() {
		cpk.user_forms.video_groups();
		cpk.container.display('video_groups');
		cpk.event_handlers.close_aside_onclick();
		cpk.cache.content_page = 'video_groups';
		$('.add_content_bin').show();
	},
	show_recently_watched: function() {
		cpk.user_forms.recently_watched();
		cpk.container.display('recently_watched');
		cpk.event_handlers.close_aside_onclick();
		cpk.cache.content_page = 'recently_watched';
	},
	check_video_in_group: function(videos, name, link1, link2) {
		var vid_groups = cpk.cache.video_groups;
		var fltr = videos.filter(function(vid) {
			return vid.show_name == name;
		});
		if (fltr.length > 0) {
			$(link1).hide();
			$(link2).show();
		} else {
			$(link1).show();
			$(link2).hide();
		}
	},
	add_content_bin: function() {
		if (cpk.cache.content_page = 'video_groups') {
			$('input[in-type="grp_name"]', '#new_video_group').val("");
			$('input[in-type="grp_desc"]', '#new_video_group').val("");
			$('#new_video_group').modal({backdrop: 'static'});			
		}
	},
	add_video_group: function() {
		var name = $('input[in-type="grp_name"]', '#new_video_group').val();
		var desc = $('input[in-type="grp_desc"]', '#new_video_group').val();
		if (name != "") {
			cpk.api.new_video_group(name, desc, function(rslt) {
				cpk.cache.video_groups.groups.push(rslt.group);
				cpk.event_handlers.show_video_groups();
				$('#new_video_group').modal('toggle');
			});
		}
	},
	delete_video_group: function(obj) {
		var grp_name = $(obj).attr('grp-name');
		var grp_id = $(obj).attr('grp-id');
		if (grp_name != "" && grp_id != "") {
			cpk.event_handlers.confirm_modal('Confirm Delete', 'Are you sure you want to delete the video group "' + grp_name + '"?', function() {
				cpk.api.drop_video_group(grp_id, function() {
					$("#confirm_modal").modal('toggle');
					$(cpk.cache.video_groups.groups).each(function(i, grp) {
						if (grp.group_name == grp_name) {
							cpk.cache.video_groups.groups.splice(i, 1);
							return;
						}
					});
					cpk.event_handlers.show_video_groups();
				});
			});
		}
	}
}

cpk.top_shows = {
	init: function() {
		if (cpk.cache.top_shows_loaded == null) {
			pgbr.start();
			cpk.api.top_shows(function(data) {
				pgbr.stop();
				var div, img, desc, pb;
				$("#ls_theater").html("");
				$(data.theater).each(function(i, item) {
					div = $('<div class="ts_theater_item"></div>');
					if (i > 0) {
						$(div).css('display', 'none');
					}
					img = $('<div class="ts_img"></div>').append($('<img class="img img-responsive" src="' + item.img + '" data-title="' + item.title + '" />'));
					desc = $('<div class="ts_desc">' + item.title + '<br /><hr/>' + item.desc + '</div>');
					$(div).append(img).append(desc);
					$("#ls_theater").append(div);
					pb = $('<li><a href="#">' + (i + 1) + '</a></li>');
					$("#ls_theater_pager").append(pb);
				});
				$('li:first', "#ls_theater_pager").addClass('active');
				$("#ls_theater_pager").css('width', (40 * data.theater.length) + 20 + 'px');
				$(data.dvd).each(function(i, item) {
					div = $('<div class="ts_dvd_item"></div>');
					if (i > 0) {
						$(div).css('display', 'none');
					}
					img = $('<div class="ts_img"></div>').append($('<img class="img img-responsive" src="' + item.img + '" data-title="' + item.title + '" />'));
					desc = $('<div class="ts_desc">' + item.title + '<br /><hr/>' + item.desc + '</div>');
					$(div).append(img).append(desc);
					$("#ls_dvd").append(div);
					pb = $('<li><a href="#">' + (i + 1) + '</a></li>');
					$("#ls_dvd_pager").append(pb);
				});
				$('li:first', "#ls_dvd_pager").addClass('active');
				$("#ls_dvd_pager").css('width', (40 * data.dvd.length) + 20 + 'px');
				$(data.tv_shows).each(function(i, item) {
					img = $('<img class="img img-responsive" src="' + item.img + '" data-title="' + item.title + '" />');
					div = $('<div class="ts_tv_item"></div>').append(img);
					$("#ls_tv").append(div);
				});
				cpk.cache.top_shows_html = $('div[cpk-control="top_shows"]').html();
				cpk.cache.top_shows_loaded = true;
				cpk.top_shows.show();
			});
		} else {
			cpk.top_shows.show();
		}
		cpk.event_handlers.close_aside_onclick();
	},
	search: function(title) {
		cpk.api.search(
			cpk.cache.parameters.type, 
			title, 
			cpk.cache.parameters.plugin, 
			function(data) {
				var shows = data.data;
				var found = shows.filter(function(show) {
					if (show.title.toLowerCase() == title.toLowerCase()) {
						return true;
					}
				});
				if (found.length > 0) {
					pgbr.stop();
					cpk.api.get_show(
						cpk.cache.parameters.type, 
						found[0].href, 
						cpk.cache.parameters.plugin, 
						cpk.post_events.onShowResults
					);
				} else {
					$("#search_mixed").val(title);
					cpk.post_events.onSearchResults(data);
				}
			}
		);
	},
	show: function() {
		cpk.container.display('top_shows');
		$(".ts_desc").mCustomScrollbar();
		$("#ls_theater_pager li").each(function(i, pb) {
			$(pb).click(function() {
				$('li[class="active"]', "#ls_theater_pager").removeClass('active');
				$(this).addClass('active');
				$(".ts_theater_item").hide();
				$($(".ts_theater_item")[i]).fadeIn();
			});
		});
		$("#ls_dvd_pager li").each(function(i, pb) {
			$(pb).click(function() {
				$('li[class="active"]', "#ls_dvd_pager").removeClass('active');
				$(this).addClass('active');
				$(".ts_dvd_item").hide();
				$($(".ts_dvd_item")[i]).fadeIn();
			});
		});
		$("img", ".ts_img").click(function() {
			var title = $(this).attr('data-title');
			cpk.top_shows.search(title);
		});
		$("img", ".ts_tv_item").click(function() {
			var title = $(this).attr('data-title');
			cpk.top_shows.search(title);
		});
		cpk.top_shows.auto_page.start('theater');
		cpk.top_shows.auto_page.start('dvd');
		marqueeInit({
			uniqueid: 'ls_tv',
			inc: 2, 
			mouse: 'pause',
			moveatleast: 1,
			neutral: 150,
			savedirection: true,
			random: false
		});
	},
	hide: function() {
		var isOpen = $('div[cpk-control="top_shows"]').css('display');
		if (isOpen != 'none') {
			$('div[cpk-control="top_shows"]').html(cpk.cache.top_shows_html);
			cpk.top_shows.auto_page.stopAll();
		}
		$('div[cpk-control="top_shows"]').hide();
	},
	auto_page: {
		theater_timer: null,
		dvd_timer: null,
		tv_timer: null,
		start: function(target) {
			var item = "#ls_" + target;
			var pager = "#ls_" + target + "_pager";
			var obj = target + "_timer";
			var length = $(pager + " li").length;
			var pager_obj = $(pager + " li");
			var i = 1;
			var isHover;
			cpk.top_shows.auto_page[obj] = setInterval(function() {
				if (i == length) {
					i = 0;
				}
				isHover = $(item).mouseIsOver();
				if (!isHover) {
					$(pager_obj[i]).click();
					i++;
				}
			}, 5000);
		},
		stop: function(target) {
			var obj = target + "_timer";
			clearInterval(cpk.top_shows.auto_page[obj]);
		},
		stopAll: function() {
			clearInterval(cpk.top_shows.auto_page.theater_timer);
			clearInterval(cpk.top_shows.auto_page.dvd_timer);
			clearInterval(cpk.top_shows.auto_page.tv_timer);
		}
	}
}

cpk.container = {
	display: function(page) {
		var ts_display = $('div[cpk-control="top_shows"]').css('display');
		if (page != 'top_shows' && ts_display != 'none') {
			cpk.top_shows.hide();
		}
		cpk.container.hide_all();
		$('div[cpk-control="' + page + '"]').show();
	},
	hide_all: function() {
		window.onbeforeunload = null;
		$('div[cpk-control="top_shows"]').hide();
		$('div[cpk-control="search_results"]').hide();
		$('div[cpk-control="show_results"]').hide();
		$('div[cpk-control="episode_results"]').hide();
		$('div[cpk-control="external_link"]').hide();
		$('div[cpk-control="user_dashboard"]').hide();
		$('div[cpk-control="video_groups"]').hide();
		$('div[cpk-control="recently_watched"]').hide();
		$('.add_content_bin').hide();
	}
}

cpk.user_forms = {
	video_groups: function() {
		if (sessionStorage.token != null) {
			cpk.api.get_video_groups(false, function(data) {
				$('div[cpk-control="video_groups"]').html("");
				var html;
				var parent = $('div[cpk-control="video_groups"]');
				$(data.groups).each(function(i, group) {
					if (group.videos != null) {
						var order_vids = jQuery.extend(true, {}, group);
						order_vids.videos = order_vids.videos.reverse();
						html = cpk.controllers.format_video_group(order_vids);
						$('div[cpk-control="video_groups"]').append(html);
						if (group.videos.length > 0) {
							$(".pad_results:last", parent).css('width', group.videos.length * 156 + 'px');
						} else {
							$(".pad_results:last").text("Please search for a show to add to group.");
							$(".pad_results:last").addClass('new_vid_group');
						}
					} 
				});
				$(".cpk_search_item", parent).addClass('pull-left');
				$(".x-scroll", parent).mCustomScrollbar({
					axis: "x"
				});
				$(".x-scroll", parent).mCustomScrollbar("scrollTo", "left", {
					scrollInertia: 0
				});
				cpk.container.display('video_groups');				
			});
		}
	},
	recently_watched: function() {
		if (sessionStorage.token != null) {
			cpk.api.get_recently_watched(false, function(data) {
				$('div[cpk-control="recently_watched"]').html("");
				var html;
				var parent = $('div[cpk-control="recently_watched"]');
				if (data.videos != null) {
					var order_vids = jQuery.extend(true, {}, data);
					order_vids.videos = order_vids.videos.reverse()
					html = cpk.controllers.format_video_group(order_vids);
					$('div[cpk-control="recently_watched"]').append(html);
					if (data.videos.length > 0) {
						$(".pad_results:last", parent).css('width', data.videos.length * 156 + 'px');
					} else {
						$(".pad_results:last").text("This group will automatically get updated as you watch shows on CPK Browser.");
						$(".pad_results:last").addClass('new_vid_group');
					}
				} 
				$(".cpk_search_item", parent).addClass('pull-left');
				$(".x-scroll", parent).mCustomScrollbar({
					axis: "x"
				});
				$(".x-scroll", parent).mCustomScrollbar("scrollTo", "left", {
					scrollInertia: 0
				});
				$(".search_rslt_header", parent).html('Recently Watched');
				cpk.container.display('recently_watched');				
			});
		}
	}
}

function videoClosed() {
	$('div[cpk-control="external_link"]').html($('<iframe class="cpk_external_source" src="about:blank"></iframe>'));
	$("#show_controller").hide();
}

function load_parameters() {
	var data = $('input[cpk-control="config"]').attr('cpk-config');
	cpk.cache.parameters = parse_control_data(data);
}

function parse_control_data(data) {
	var rslt = {};
	data = data.split(',');
	var tmp;
	$(data).each(function(i, parm) {
		tmp = parm.split('=');
		rslt[tmp[0]] = tmp[1].trim();
	});
	return rslt;
}

function isNotEmpty(obj) {
	if (obj != null && obj != "") {
		return true;
	}
	return false;
}

function isNotEmpty_obj(obj) {
	if (obj != null) {
		if (obj.length != null) {
			if (obj.length > 0) {
				return true;
			}
		}
	}
	return false;
}