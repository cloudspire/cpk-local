$(document).ready(function() {
	$('.upload-btn').on('click', function () {
    	$('#upload-input').click();
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