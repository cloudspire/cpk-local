$(document).ready(function() {
	$('.upload-btn').on('click', function () {
    	$('#upload-input').click();
	});
	$('.folder-btn').on('click', function () {
    	toggle_mdl_new_folder();
	});
	$('#upload-input').on('change', function() {
	  	var files = $(this).get(0).files;
	  	if (files.length > 0) {
	    	var formData = new FormData();
	    	for (var i = 0; i < files.length; i++) {
	      		var file = files[i];
	      		formData.append('uploads[]', file, file.name);
	    	}
	    	post_files(formData);
	  	}
	});
});

function post_files(formData) {
	$.ajax({
		url: common.api_url +  '/upload',
		type: 'POST',
		headers: {
			'x-path': fserve.current_path
		},
		data: formData,
		processData: false,
		contentType: false,
		success: function(data){
		 	console.log('upload successful!');
		 	fserve.insert_files(data);
		},
		error: function(data) {
			console.error(data.responseText);
		}
	});
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