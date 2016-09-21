var fserve = {
	files: null,
	html: null,
	directory: {},
	current_dir: "videos",
	current_path: "/videos",
	selected_files: [],
	init: function() {
		$.ajax({
			url: common.api_url + '/files_list',
			type: 'GET',
			success: function(data){
				fserve.html = data.html;				
				$('.folder-btn').on('click', function () {
		    		toggle_mdl_new_folder();
				});		
				$('.download-btn').click(function(event) {
					var test = fserve.selected_files;
					var stp = "";
				});
			 	fserve.load(data.files);
			 	fserve.load_dir();
			},
			error: function(data) {
				console.error(data.responseText);
			}
		});
	},
	load: function(data) {
		fserve.files = data;
		var str_i, str_j, tmp, dir, fname;
		for (var i = 0; i < data.length; i++) {
			str_i = data[i];
			tmp = str_i.split('/');
			if (tmp.length > 0) {
				dir = fserve.directory;
				for (var j = 0; j < tmp.length - 1; j++) {
					str_j = tmp[j];
					if (dir[str_j] == null) {
						if (j > 0) {
							dir[str_j] = {'...': {}};
						} else {
							dir[str_j] = {};
						}
					}
					dir = dir[str_j];
				}
				fname = tmp[tmp.length - 1];
				if (dir['_files_'] == null) {
					dir['_files_'] = [];
				}
				if (fname != "") {
					dir['_files_'].push(fname);
				}
			}
		}
		var stp = 1;
	},
	load_dir: function() {
		var files = [], folders = [];
		var dir = fserve.get_directory();
		if (dir != null) {
			if (dir['_files_'] != null) { files = dir['_files_']; }
			for (var obj in dir) {
				if (obj != '_files_') {
					folders.push(obj);
				}
			}
		}
		fserve.render_view({
			files: files,
			folders: folders
		});
		fserve.register_buttons();
		fserve.selected_files = [];
		fserve.toggle_file_buttons(false);
		fserve.register_drag_drop();
	},
	render_view: function(data) {
		var html = compileTemplate(fserve.html, data);
		var pg = common.current_page;
		$('div[cpk-page="' + pg + '"]').html(html);
	},
	register_buttons: function() {
		$('.fa-folder').dblclick(function(event) {
			var name = $(event.currentTarget).attr('name');
			if (name == "...") {
				fserve.step_back();
			} else {
				fserve.step_into(name);
			}
		});
		$('.fa-file-o').click(function(event) {
			var name = $(event.currentTarget).attr('name');
			var multiple = select_manager.select_file(event.currentTarget);
			var selected = fserve.toggle_file_buttons();
			if (multiple) {
				var index = fserve.selected_files.indexOf(name);
				if (index == -1) {
					fserve.selected_files.push(name);
				} else {					
					fserve.selected_files.splice(index, 1);
				}
			} else {
				if (selected) {
					fserve.selected_files = [];
					fserve.selected_files.push(name);
				} else {
					fserve.selected_files = [];
				}
			}
		});
	},
	register_drag_drop: function() {
		$(".drag_me").draggable({revert: "invalid"});
		$(".drop_here").droppable({
			classes: {
				"ui-droppable-active": "ui-state-active",
				"ui-droppable-hover": "ui-state-hover"
			},
			drop: function(event, ui) {
				var from = $("i", ui.draggable).attr('name');
				var to = $("i", this).attr('name');
				var is_folder = $("i", ui.draggable).hasClass('fa-folder');
				fserve.move_object(from, to, is_folder);
			}
		});
	},
	get_directory: function() {
		var dir = fserve.directory;
		var tmp = fserve.current_path.split('/');
		var path;
		for (var i = 1; i < tmp.length; i++) {
			path = tmp[i];
			dir = dir[path];
		}
		return dir;
	},
	step_into: function(folder) {
		fserve.current_path += "/" + folder;
		fserve.load_dir();
	},
	step_back: function() {
		var tmp = fserve.current_path.split('/');
		var path = "";
		for (var i = 1; i < tmp.length - 1; i++) {
			path += "/" + tmp[i];
		}
		fserve.current_path = path;
		fserve.load_dir();
	},
	insert_folder: function(folder) {
		var dir = fserve.get_directory();
		dir[folder] = {'...': {}, '_files_': []};
		fserve.load_dir();
	},
	insert_files: function(files) {
		var dir = fserve.get_directory();
		if (dir['_files_'] == null) {
			dir['_files_'] = [];
		}
		for(var i = 0; i < files.length; i++) {
			dir['_files_'].push(files[i]);
		}
		fserve.load_dir();
	},
	toggle_file_buttons(override) {
		if (override != null) {
			if (override) {
				$('button[cpk-flag="when_selected"]').show();
			} else {
				$('button[cpk-flag="when_selected"]').hide();
			}
		} else {
			if ($(".selected_block").length > 0) {
				$('button[cpk-flag="when_selected"]').show();
				return true;
			} else {
				$('button[cpk-flag="when_selected"]').hide();
				return false;
			}
		}
	},
	delete_files: function() {
		$.ajax({
			url: common.api_url + '/delete_files',
			type: 'POST',
			data: {
				files: fserve.selected_files,
				path: fserve.current_path
			},
			success: function(data){
				var items = fserve.selected_files;
				var directory = fserve.get_directory();
				var dir_files = directory['_files_'];
				var file, indexes = [];
				for(var i = 0; i < items.length; i++) {
					file = $('div[icon-file="' + items[i] + '"]').remove();
					indexes.push(dir_files.indexOf(items[i]));
				}
				for (var i = 0; i < indexes.length; i++) {
					dir_files.splice(indexes[i], 1);
				}
			},
			error: function(data) {
				console.error(data.responseText);
			}
		});
	},
	download_files: function() {
		var items = fserve.selected_files;
		if (items.length > 1) {
			alert('Only 1 file at a time allowed for downloads');
		}
		var rt = fserve.current_path + '/';
		var file = rt + items[0];
		window.open(common.api_url + '/download_files?file=' + file);
	},
	rename_file: function(old_name) {
		var new_name = $("#in_new_name").val();
		$.ajax({
			url: common.api_url +  '/rename',
			type: 'POST',
			data: {
				old_name: fserve.current_path + '/' + old_name,
				new_name: fserve.current_path + '/' + new_name
			},
			success: function(data){
			 	fserve.update_file_name(old_name, new_name);
			 	toggle_mdl_rename_file(true);

			},
			error: function(data) {
				console.error(data.responseText);
			}
		});
	},
	update_file_name: function(old_name, new_name) {
		$('div[icon-file="' + old_name + '"]').attr('icon-file', new_name);
		$('i[name="' + old_name + '"]').attr('name', new_name);
		$('span[name="' + old_name + '"]').attr('name', new_name);
		$('span[name="' + new_name + '"]').text(new_name);
	},
	move_object: function(obj, folder, is_folder) {
		var old_path = fserve.current_path + '/' + obj;
		var dest;
		if (folder == "...") {
			var tmp = fserve.current_path.split('/');
			dest = "";
			for (var i = 1; i < tmp.length - 1; i++) {
				dest += "/" + tmp[i];
			}
			dest += ("/" + obj);
		} else {
			dest = fserve.current_path + "/" + folder + "/" + obj;
		}
		$.ajax({
			url: common.api_url +  '/rename',
			type: 'POST',
			data: {
				old_name: old_path,
				new_name: dest
			},
			success: function(data){
			 	fserve.post_move(obj, folder, is_folder);
			},
			error: function(data) {
				console.error(data.responseText);
			}
		});
	},
	post_move: function(obj, folder, is_folder) {
		var old_directory = fserve.get_directory();
		if (folder != "...") {
			fserve.step_into(folder);
		} else {
			fserve.step_back();
		}
		var new_directory = fserve.get_directory();
		if (is_folder) {
			var copy_obj = $.extend({}, old_directory[obj]);
			delete old_directory[obj];
			new_directory[obj] = copy_obj;
		} else {
			var index = old_directory['_files_'].indexOf(obj);
			old_directory['_files_'].splice(index, 1);
			new_directory['_files_'].push(obj);
		}
		fserve.load_dir();
	}
}

function toggle_mdl_new_folder() {
	$("#mdl_new_folder").modal('toggle');
}

function add_folder() {
	var val = $("#in_new_folder").val();
	$.ajax({
		url: common.api_url +  '/new_folder',
		type: 'POST',
		data: {
			path: fserve.current_path + '/' + val
		},
		success: function(data){
		 	console.log('new folder created successfully!');
		 	toggle_mdl_new_folder();
		 	fserve.insert_folder(val);
		},
		error: function(data) {
			console.error(data.responseText);
		}
	});
}

function toggle_mdl_rename_file(override) {
	if (override == null) {
		var selected = $(".selected_block");
		if (selected.length == 1) {
			var name = $("i", selected).attr('name');
			$("#submit_rename").click(function() {
				fserve.rename_file(name);
			});
			$("#in_new_name").val(name);
			$("#mdl_rename_file").modal('toggle');
		} else {
			alert('You can only rename 1 file at a time.');
		}
	} else {
		$("#mdl_rename_file").modal('toggle');
	}
}