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
		fserve.selected_files = []
	},
	render_view: function(data) {
		var html = compileTemplate(fserve.html, data);
		var pg = common.current_page;
		$('div[cpk-page="' + pg + '"]').html(html);
	},
	register_buttons: function() {
		$('.fa-folder').click(function(event) {
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
		$('.download-btn').click(function(event) {
			var test = fserve.selected_files;
			var stp = "";
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
		dir[folder] = {'...': {}};
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
	toggle_file_buttons() {
		if ($(".selected_block").length > 0) {
			$('button[cpk-flag="when_selected"]').show();
			return true;
		} else {
			$('button[cpk-flag="when_selected"]').hide();
			return false;
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
		var rt = fserve.current_path + '/';
		for (var i = 0; i < items.length; i++) {
			fserve.download_file(rt + items[i]);
		}
	},
	download_file: function(file) {
		window.open(common.api_url + '/download_files?file=' + file);
	}
}