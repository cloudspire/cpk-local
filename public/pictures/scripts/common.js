$(document).ready(function() {
	common.api_url = document.location.origin;
	if (!common.api_url.includes('cpk')) {
		common.api_url = common.api_url + "/pictures";
	}
	$.ajax({
		url: common.api_url + '/pictures_list',
		type: 'GET',
		success: function(rslt) {
			$("#piclist").html(rslt.html);
			$("#gallery").unitegallery();
		},
		error: function(err) {
			console.error(err);
		}
	});
});

var common = {
	api_url: null
}